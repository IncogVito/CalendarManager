import {
    ExistingEvent,
    DayPreferencesConfig, UpdatedEvent,
    GeneralConstraints,
    NewCalendarElement,
    CreatedEvent, TimeSlot
} from "../model/calendar.model";
import {PlannedDay, PlanningResult} from "../model/calendar-algorithm.model";
import {findAvailableTimeSlots, groupEventsByDays} from "../helper/organizer.helper";
import {CalendarRequest} from "../model/calendar-request.model";
import {parseRequest} from "../helper/organizer.parser";
import {DateTimeFormatter, LocalDate, LocalDateTime, LocalTime} from "@js-joda/core";
import {drop, first, isEmpty} from "lodash";


export function organizeCalendar(
    existingEvents: ExistingEvent[],
    newCalendarElements: NewCalendarElement[],
    generalConstraints: GeneralConstraints
): { updatedEvents: UpdatedEvent[], createdEvents: CreatedEvent[], success: boolean } {

    const plannedDays: PlannedDay[] = groupEventsByDays(existingEvents, generalConstraints.minStartDate, generalConstraints.maxEndDate);
    const calendarElementsLeftToBeInserted = [...newCalendarElements];

    const planningResult: PlanningResult = planDaysSequentially(
        plannedDays,
        calendarElementsLeftToBeInserted,
        'place',
        generalConstraints,
        {
            success: false,
            plannedDays: []
        }
    );

    return {
        updatedEvents: [],
        createdEvents: planningResult.plannedDays ? planningResult.plannedDays.flatMap(elem => elem.plannedNewElements) : [],
        success: planningResult.success
    }
}


function planDaysSequentially(plannedDaysLeft: PlannedDay[],
                              calendarElementsLeftToBeInserted: NewCalendarElement[],
                              actionType: "place" | "squeeze" | "move",
                              generalConstraints: GeneralConstraints,
                              planningResultSoFar: PlanningResult
): PlanningResult {
    if (isEmpty(calendarElementsLeftToBeInserted)) {
        return {success: true, plannedDays: planningResultSoFar.plannedDays, score: planningResultSoFar.score};
    }
    if (isEmpty(plannedDaysLeft)) {
        return {success: false};
    }
    const currentDay = first(plannedDaysLeft);
    console.log(`Current day: ${currentDay.date.format(DateTimeFormatter.ISO_DATE)}`)

    const nextPlannedDays = drop(plannedDaysLeft, 1);

    const eventToBePlaced = first(calendarElementsLeftToBeInserted);
    const restEvents = drop(calendarElementsLeftToBeInserted, 1);

    const updatedPlannedDay: PlannedDay | undefined = placeWithinEmptySlots(currentDay, eventToBePlaced, generalConstraints);
    console.log("Event placed?: " + !!updatedPlannedDay);

    if (!updatedPlannedDay) {
        return planDaysSequentially(nextPlannedDays, calendarElementsLeftToBeInserted, 'place', generalConstraints, planningResultSoFar);
    }

    const planningResult: PlanningResult = {
        success: false,
        plannedDays: [...planningResultSoFar.plannedDays, updatedPlannedDay]
    }
    const innerResult = planDaysSequentially(nextPlannedDays, restEvents, 'place', generalConstraints, planningResult);
    if (!innerResult.success) {
        console.log('Inner fail. Trying same day.')
        const sameDayPlannedDays = [updatedPlannedDay, ...nextPlannedDays];
        return planDaysSequentially(sameDayPlannedDays, restEvents, 'place', generalConstraints, planningResult);
    }
    return innerResult;
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

const dayConfig: DayPreferencesConfig = {
    startTime: LocalTime.parse("08:00:00"),
    endTime: LocalTime.parse("17:00:00"),
};

const generalConstraints: GeneralConstraints = {
    minStartDate: LocalDate.parse("2024-01-21"),
    maxEndDate: LocalDate.parse("2024-01-21"),
    breakBetweenElements: 15, // in minutes
    changingAllowed: true,
    preferencesStartTime: LocalTime.parse("08:00:00"),
    preferencesEndTime: LocalTime.parse("17:00:00"),
};


export const handler = async (event: any, context: any) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
            headers: {'Content-Type': 'application/json'},
        };
    }

    if (!event.body) {
        throw new Error('Request body is missing.');
    }
    const requestBody: CalendarRequest = JSON.parse(event.body);
    const parsedInput = parseRequest(requestBody);

    const organizationResult = organizeCalendar(
        parsedInput.currentCalendar,
        parsedInput.newCalendarElements,
        parsedInput.generalConstraints
    );

    return {
        statusCode: 200,
        body: JSON.stringify(organizationResult),
        headers: {'Content-Type': 'application/json'},
    };

};
