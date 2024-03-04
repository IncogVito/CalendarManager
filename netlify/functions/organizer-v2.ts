import {
    CalculateScoreConfig,
    CreatedEvent,
    DayPreferencesConfig,
    ExistingEvent,
    GeneralConstraints,
    NewCalendarElement,
    DateTimeSlot,
    UpdatedEvent
} from "../model/calendar.model";
import {PlannedDay, PlanningResult} from "../model/calendar-algorithm.model";
import {
    findAvailableTimeSlots,
    groupEventsByDays,
    placeEventPoints,
    removeCollidingSlots
} from "../helper/organizer.helper";
import {CalendarRequest} from "../model/calendar-request.model";
import {parseRequest} from "../helper/organizer.parser";
import {DateTimeFormatter, DayOfWeek, Duration, LocalDate, LocalDateTime, LocalTime, Period} from "@js-joda/core";
import {drop, first, isEmpty} from "lodash";
import {
    ScoredPlan,
    DailyCountFitScoreSequence,
    DailyPlanScoreSummaryResult,
    PlanSlot, DailyOccupancyResult, OptimalSolutionsResults
} from "../model/calendar-v2.model";
import {trimNestedArray} from "../helper/array.util";
import {Plan} from "langchain/dist/experimental/plan_and_execute";


function findAllDailyPlanSummaryResults(plannedDays: PlannedDay[],
                                        generalConstraints: GeneralConstraints,
                                        calendarElementsLeftToBeInserted: NewCalendarElement[]): DailyPlanScoreSummaryResult[] {
    const dailyPlanScoreSummaryResults: Map<LocalDate, DailyPlanScoreSummaryResult> = new Map();

    const newElementsLength = calendarElementsLeftToBeInserted.length;
    const allDaysLength = plannedDays.length;
    let maxFitElementsCountEachDay = Math.ceil(newElementsLength / allDaysLength) + 1;
    let existsAnyDayToInsertData = true;
    let foundSpaceToInsertedElements = false;
    let currentFitCount = 0;
    let lastIterationMaxFitElementsCountEachDay = maxFitElementsCountEachDay;

    let daysToBeProcessed = [...plannedDays];

    // do until we find space to insert elements or there is no any day to insert more data
    while (!(foundSpaceToInsertedElements || !existsAnyDayToInsertData)) {
        existsAnyDayToInsertData = false;

        for (const singlePlannedDay of daysToBeProcessed) {
            if (dailyPlanScoreSummaryResults.has(singlePlannedDay.date)) {
                const lastCountFit = dailyPlanScoreSummaryResults.get(singlePlannedDay.date).maxCountFit;

                // At this point we know that previous result was not enough to fit all elements. So
                // there is no point on again processing it for bigger number.
                if (lastCountFit < lastIterationMaxFitElementsCountEachDay) {
                    currentFitCount = currentFitCount + lastCountFit;
                    continue;
                }
            }

            const result = createDailyPlanScore(
                singlePlannedDay.currentElements,
                first(calendarElementsLeftToBeInserted),
                generalConstraints,
                maxFitElementsCountEachDay,
                singlePlannedDay.date
            );

            dailyPlanScoreSummaryResults.set(singlePlannedDay.date, result);
            currentFitCount = currentFitCount + result.maxCountFit;
            existsAnyDayToInsertData = true;
        }

        if (currentFitCount >= newElementsLength) {
            foundSpaceToInsertedElements = true;
        } else {
            lastIterationMaxFitElementsCountEachDay = maxFitElementsCountEachDay;
            maxFitElementsCountEachDay++;
        }
    }
    return Array.from(dailyPlanScoreSummaryResults.values());
}

const WEEKEND_DAYS = [DayOfWeek.SATURDAY, DayOfWeek.SUNDAY];

function sequencePenaltyScore(sequence: [LocalDate, number][]): number {
    let fullScore = 0;

    const averageOccupation = sequence.map(elem => elem[1])
        .reduce((a, b) => a + b, 0) / sequence.length;

    const newestElementsHandicap = 3 / sequence.length;
    let counter = 0;

    for (const singleElement of sequence) {
        const date: LocalDate = singleElement[0];
        const fitCount: number = singleElement[1];

        if (fitCount == 0) {
            continue;
        }

        if (WEEKEND_DAYS.includes(date.dayOfWeek()) && fitCount > 0) {
            fullScore += 2.5;
        }

        if (averageOccupation < fitCount) {
            fullScore += 1;
        }

        fullScore += (counter * newestElementsHandicap * fitCount);
        counter++;
    }
    return fullScore;
}

function convertResultsIntoCreatedEvents(newCalendarElements: NewCalendarElement[],
                                         result: DailyOccupancyResult,
                                         allDailyPlanSummaryResults: DailyPlanScoreSummaryResult[]): CreatedEvent[] {
    if (!result) {
        return [];
    }

    const leftCalendarElements = [...newCalendarElements];
    const createdEvents: CreatedEvent[] = []

    for (const singleDay of result.items) {
        const currentDay: LocalDate = singleDay[0];
        const dailyFitCount: number = singleDay[1];

        if (dailyFitCount == 0) {
            continue;
        }
        const dailyPlanDetails: DailyPlanScoreSummaryResult = allDailyPlanSummaryResults.find(elem => elem.date.equals(currentDay));
        const scoredPlan: ScoredPlan = dailyPlanDetails.countFitToScore.get(dailyFitCount);

        for (const singleSlot of scoredPlan.slots) {
            const currentCalendarElement = leftCalendarElements.shift();
            const startingDateTime = LocalDateTime.of(currentDay, singleSlot.from);
            const endingDateTime = LocalDateTime.of(currentDay, singleSlot.to);

            createdEvents.push({
                name: currentCalendarElement.name,
                location: currentCalendarElement.location,
                startingDateTime: startingDateTime,
                endingDateTime: endingDateTime
            });
        }
    }
    return createdEvents;
}

export function organizeCalendar(
    existingEvents: ExistingEvent[],
    newCalendarElements: NewCalendarElement[],
    generalConstraints: GeneralConstraints
): { updatedEvents: UpdatedEvent[], createdEvents: CreatedEvent[], success: boolean } {

    const plannedDays: PlannedDay[] = groupEventsByDays(existingEvents, generalConstraints.minStartDate, generalConstraints.maxEndDate);
    const calendarElementsLeftToBeInserted = [...newCalendarElements];

    const allDailyPlanSummaryResults: DailyPlanScoreSummaryResult[] = findAllDailyPlanSummaryResults(
        plannedDays,
        generalConstraints,
        calendarElementsLeftToBeInserted
    );

    const allDaysCapacity = allDailyPlanSummaryResults.map(elem => elem.maxCountFit).reduce((a, b) => a + b, 0);
    const result = chooseOptimalDailyOccupancy(
        first(allDailyPlanSummaryResults),
        drop(allDailyPlanSummaryResults),
        calendarElementsLeftToBeInserted.length,
        allDaysCapacity,
        [],
        new OptimalSolutionsResults(),
        sequencePenaltyScore
    );

    return {
        updatedEvents: [],
        createdEvents: convertResultsIntoCreatedEvents(newCalendarElements, result, allDailyPlanSummaryResults),
        success: result != null
    };
}


export function createPlanSlotsBySectors(existingEvents: ExistingEvent[],
                                         slotOffsetMinutes: number,
                                         slotDurationMinutes: number,
                                         dayPreferencesConfig: DayPreferencesConfig): PlanSlot[][] {
    const plannedDay: PlannedDay = {
        currentElements: existingEvents,
        date: LocalDate.of(2000, 1, 1),
        plannedNewElements: [],
        plannedUpdatedElements: []
    }

    const timeSlots: DateTimeSlot[] = findAvailableTimeSlots(plannedDay, dayPreferencesConfig);
    const allSlotsFound: PlanSlot[][] = [];

    for (const singleTimeSlot of timeSlots) {
        const timeSlotDuration = Duration.between(singleTimeSlot.start, singleTimeSlot.end).toMinutes();
        const slotCount = Math.floor(timeSlotDuration / slotOffsetMinutes);
        const slots: PlanSlot[] = [];
        for (let i = 0; i < slotCount; i++) {
            const slotStart = singleTimeSlot.start.plusMinutes(i * slotOffsetMinutes).toLocalTime()
            const slotEnd = slotStart.plusMinutes(slotDurationMinutes);

            if (slotEnd.compareTo(singleTimeSlot.end.toLocalTime()) > 0) {
                continue;
            }
            slots.push({
                from: slotStart,
                to: slotEnd
            });
        }
        allSlotsFound.push([...slots]);
    }
    return allSlotsFound.filter(elem => elem.length > 0);
}

export function createDailyPlanScore(existingEvents: ExistingEvent[],
                                     calendarElement: NewCalendarElement,
                                     constraints: GeneralConstraints,
                                     maxElementsToFit: number,
                                     currentDate: LocalDate
): DailyPlanScoreSummaryResult {

    let currentElementsToFit = 1;
    let maxCountFit = 0;
    let maxFitsSizeReached = false;
    const countFitToScoreResult: Map<number, ScoredPlan> = new Map();
    const planSlotsBySectors: PlanSlot[][] = createPlanSlotsBySectors(
        existingEvents,
        constraints.slotOffsetMinutes,
        calendarElement.durationTime,
        {
            startTime: constraints.preferencesStartTime,
            endTime: constraints.preferencesEndTime
        })

    const calculateScoreFn = (singleSlot: PlanSlot, eventPoints: LocalTime[]) => calculateScore(singleSlot, eventPoints, constraints);
    const eventPoints = existingEvents.flatMap(singleEvent => [singleEvent.startingDateTime, singleEvent.endingDateTime])
        .map(dateTime => dateTime.toLocalTime());

    while (currentElementsToFit <= maxElementsToFit && !maxFitsSizeReached) {
        const fitScore = placeItems(planSlotsBySectors, eventPoints, currentElementsToFit, 0, calculateScoreFn);
        if (!fitScore) {
            maxFitsSizeReached = true;
        } else {
            countFitToScoreResult.set(currentElementsToFit, fitScore);
            maxCountFit = currentElementsToFit;
            currentElementsToFit++;
        }
    }
    return {
        maxCountFit: maxCountFit,
        countFitToScore: countFitToScoreResult,
        date: currentDate
    }
}


export function calculateScore(singleSlot: PlanSlot, eventPoints: LocalTime[], config: CalculateScoreConfig) {
    let score = 0;

    // Szukamy najblizszych punktów
    let closestToStartingPoint: number = Number.MAX_VALUE;
    let closestToEndingPoint: number = Number.MAX_VALUE;
    let lookingForStartingPoint = true;

    for (let i = 0; i < eventPoints.length; i++) {
        if (lookingForStartingPoint && eventPoints[i].compareTo(singleSlot.from) > 0) {
            lookingForStartingPoint = false;
        }

        if (lookingForStartingPoint) {
            closestToStartingPoint = Duration.between(eventPoints[i], singleSlot.from).toMinutes();
        } else {
            closestToEndingPoint = Duration.between(singleSlot.to, eventPoints[i]).toMinutes();
            break;
        }
    }

    if (closestToStartingPoint < 2 * config.slotOffsetMinutes) {
        const exponentValue = Math.abs(2 * config.slotOffsetMinutes - closestToStartingPoint);
        score += 0.2 * Math.pow(1.15, exponentValue);
    }

    if (closestToEndingPoint < 2 * config.slotOffsetMinutes) {
        const exponentValue = Math.abs(2 * config.slotOffsetMinutes - closestToEndingPoint);
        score += 0.2 * Math.pow(1.15, exponentValue);
    }

    // Krok 2: Obliczanie punktów na podstawie ilości punktów w eventPoints
    const exponentialScore = Math.pow(2, eventPoints.length);
    score += exponentialScore;

    return score;
}

export function placeItems(planSlotsBySectors: PlanSlot[][],
                           eventPoints: LocalTime[],
                           elementsToFit: number,
                           initialBaseScore: number,
                           calculateScoreFn: (singleSlot: PlanSlot, eventPoints: LocalTime[]) => number): ScoredPlan {

    let lowestScore = Number.MAX_VALUE;
    let bestSlotsArranged = null;
    let sectorIndex = 0;
    const restElementsToFit = elementsToFit - 1;

    for (const sector of planSlotsBySectors) {
        let slotIndex = 0;
        for (const singleSlot of sector) {
            let currentSlotScore = calculateScoreFn(singleSlot, eventPoints);
            let slotsArranged = [singleSlot];
            if (restElementsToFit > 0) {
                const restSlots: PlanSlot[][] = trimNestedArray(planSlotsBySectors, sectorIndex, slotIndex + 1);
                const nonCollidingSlots = removeCollidingSlots(restSlots, singleSlot);
                const updatedEventPoints = placeEventPoints(eventPoints, singleSlot);
                const restElementsScore = placeItems(nonCollidingSlots, updatedEventPoints, restElementsToFit, initialBaseScore, calculateScoreFn);

                if (!restElementsScore) {
                    continue;
                }

                slotsArranged.push(...restElementsScore.slots);
                currentSlotScore += restElementsScore.penaltyScore;
            }

            if (currentSlotScore < lowestScore) {
                lowestScore = currentSlotScore;
                bestSlotsArranged = slotsArranged;
            } else {
                break;
            }

            slotIndex++;
        }
        sectorIndex++;
    }

    if (isEmpty(bestSlotsArranged)) {
        return null;
    }
    return {slots: bestSlotsArranged, penaltyScore: lowestScore};
}

export function chooseOptimalDailyOccupancy(currentDay: DailyPlanScoreSummaryResult,
                                            nextDays: DailyPlanScoreSummaryResult[],
                                            elementsToBePlaced: number,
                                            nextDaysCapacity: number,
                                            placedItemsByDaysSoFar: ([LocalDate, number])[],
                                            optimalSolutionsResult: OptimalSolutionsResults,
                                            penaltyScoreFn: (elem: ([LocalDate, number])[]) => number): DailyOccupancyResult {
    if (nextDaysCapacity < elementsToBePlaced) {
        return null;
    }

    if (currentDay == null) {
        return null;
    }
    const existingSolution = optimalSolutionsResult.getByDateAndOccupancyFit(currentDay.date, elementsToBePlaced);
    if (existingSolution) {
        return existingSolution;
    }

    const currentDayMaxCountFit = currentDay.maxCountFit;

    let keyValuePair: [number, ScoredPlan][] = [[0, null], ...Array.from(currentDay.countFitToScore.entries())];
    keyValuePair = keyValuePair.filter(pair => pair[0] <= elementsToBePlaced);

    let bestResult: DailyOccupancyResult | undefined = undefined;

    for (const fitWithScore of keyValuePair) {
        const possibleDailyOccupancy: number = fitWithScore[0];
        const currentScoredPlan: ScoredPlan = fitWithScore[1];
        const currentPenaltyScore = currentScoredPlan ? currentScoredPlan.penaltyScore : 0;

        const combinedItems: ([LocalDate, number])[] = [...placedItemsByDaysSoFar, [currentDay.date, possibleDailyOccupancy]];
        let nextDaysResult: DailyOccupancyResult;


        if (possibleDailyOccupancy === elementsToBePlaced) {
            nextDaysResult = {
                items: [],
                dailyPenaltyScore: 0,
                fullPenaltyScore: 0
            }
        } else {
            nextDaysResult = chooseOptimalDailyOccupancy(
                first(nextDays),
                drop(nextDays),
                elementsToBePlaced - possibleDailyOccupancy,
                nextDaysCapacity - currentDayMaxCountFit,
                combinedItems,
                optimalSolutionsResult,
                penaltyScoreFn
            );
        }

        if (nextDaysResult == null) {
            continue;
        }
        const fullSequence = [...combinedItems, ...nextDaysResult.items];
        const dailyCombinedPenaltyScore = nextDaysResult.dailyPenaltyScore + currentPenaltyScore;
        const fullPenaltyScore = dailyCombinedPenaltyScore + penaltyScoreFn(fullSequence);

        if (!bestResult || fullPenaltyScore < bestResult.fullPenaltyScore) {
            bestResult = {
                items: [[currentDay.date, possibleDailyOccupancy], ...nextDaysResult.items],
                dailyPenaltyScore: dailyCombinedPenaltyScore,
                fullPenaltyScore: fullPenaltyScore
            }
        }
    }
    optimalSolutionsResult.setResult(currentDay.date, elementsToBePlaced, bestResult);
    return bestResult;
}
