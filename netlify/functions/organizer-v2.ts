import {
    CalculateScoreConfig,
    CreatedEvent,
    DayPreferencesConfig,
    ExistingEvent,
    GeneralConstraints,
    NewCalendarElement,
    TimeSlot,
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
import {DateTimeFormatter, Duration, LocalDate, LocalDateTime, LocalTime, Period} from "@js-joda/core";
import {drop, first, isEmpty} from "lodash";
import {CountFitScore, DailyPlanScoreSummaryResult, PlanSlot} from "../model/calendar-v2.model";
import {trimNestedArray} from "../helper/array.util";


export function organizeCalendar(
    existingEvents: ExistingEvent[],
    newCalendarElements: NewCalendarElement[],
    generalConstraints: GeneralConstraints
): { updatedEvents: UpdatedEvent[], createdEvents: CreatedEvent[], success: boolean } {

    const plannedDays: PlannedDay[] = groupEventsByDays(existingEvents, generalConstraints.minStartDate, generalConstraints.maxEndDate);
    const calendarElementsLeftToBeInserted = [...newCalendarElements];

    return null;
}


function placeWithinEmptySlots(currentDay: PlannedDay,
                               eventToBePlaced: NewCalendarElement,
                               generalConstraints: GeneralConstraints): PlannedDay | undefined {
    const timeSlots: TimeSlot[] = findAvailableTimeSlots(currentDay,
        {
            startTime: generalConstraints.preferencesStartTime,
            endTime: generalConstraints.preferencesEndTime
        });

    const slotStartTime = findAvailableSlotForElement(eventToBePlaced, timeSlots, generalConstraints.breakBetweenElements);

    if (!slotStartTime) {
        return undefined;
    }

    const createdEvent: CreatedEvent = {
        name: eventToBePlaced.name,
        location: eventToBePlaced.location,
        startingDateTime: slotStartTime,
        endingDateTime: slotStartTime.plusMinutes(eventToBePlaced.durationTime)
    }

    return {...currentDay, plannedNewElements: [...currentDay.plannedNewElements, createdEvent]}
}

function addUnavailableDay(planningResult: PlanningResult, date: LocalDate) {
    const unavailableDays = planningResult.unavailableDays;
    if (!unavailableDays.includes(date)) {
        unavailableDays.push(date);
    }
    return {...planningResult, unavailableDays: unavailableDays}
}

function combinePlannedDays(plannedDays: PlannedDay[], updatedPlannedDay: PlannedDay) {
    const index = plannedDays.findIndex(singleDay => singleDay.date === updatedPlannedDay.date);

    if (index >= 0) {
        return [...plannedDays.slice(0, index), updatedPlannedDay, ...plannedDays.slice(index + 1)];
    }
    return [...plannedDays, updatedPlannedDay];
}

function findAvailableSlotForElement(
    newElement: NewCalendarElement,
    availableTimeSlots: TimeSlot[],
    breakBetweenEventsMinutes: number
): LocalDateTime {

    for (let i = 0; i < availableTimeSlots.length; i++) {
        const potentialSlotStart = availableTimeSlots[i].start.plusMinutes(breakBetweenEventsMinutes)
        const potentialSlotEnd = potentialSlotStart.plusMinutes(newElement.durationTime + breakBetweenEventsMinutes);

        if (isSlotWithinBounds(potentialSlotEnd, availableTimeSlots[i]) && isSlotAvailable(potentialSlotStart, potentialSlotEnd, newElement)) {
            return potentialSlotStart;
        }
    }

    return null;
}


function isSlotWithinBounds(slotEnd: LocalDateTime, availableTimeSlots: TimeSlot): boolean {
    return slotEnd.compareTo(availableTimeSlots.end) <= 0;
}

function isSlotAvailable(slotStart: LocalDateTime, slotEnd: LocalDateTime, newElement: NewCalendarElement): boolean {
    return true;
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

    const timeSlots: TimeSlot[] = findAvailableTimeSlots(plannedDay, dayPreferencesConfig);
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
    return allSlotsFound;
}

function createDailyPlanScore(existingEvents: ExistingEvent[],
                              calendarElement: NewCalendarElement,
                              constraints: GeneralConstraints,
                              maxElementsToFit: number
): DailyPlanScoreSummaryResult {

    let currentElementsToFit = 1;
    let maxFitsSizeReached = false;
    const countFitToScoreResult: Map<number, CountFitScore> = new Map();
    const planSlotsBySectors: PlanSlot[][] = createPlanSlotsBySectors(
        existingEvents,
        constraints.slotOffsetMinutes,
        calendarElement.durationTime,
        {
            startTime: constraints.preferencesStartTime,
            endTime: constraints.preferencesEndTime
        })

    const eventPoints = existingEvents.flatMap(singleEvent => [singleEvent.startingDateTime, singleEvent.endingDateTime])
        .map(dateTime => dateTime.toLocalTime());

    while (currentElementsToFit <= maxElementsToFit && !maxFitsSizeReached) {

    }
    return null;
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
                    calculateScoreFn: (singleSlot: PlanSlot, eventPoints: LocalTime[]) => number): CountFitScore {

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