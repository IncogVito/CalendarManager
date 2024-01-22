import {
    CurrentCalendarElement,
    DayPreferencesConfig, EventsToBeUpdated,
    GeneralConstraints,
    NewCalendarElement,
    NewEventsToBeAdded, TimeSlot
} from "../model/calendar.model";
import {DateTime, Duration} from "luxon";
import {PlannedDay} from "../model/calendar-algorithm.model";
import {findAvailableTimeSlots, groupEventsByDays} from "../helper/organizer.helper";
import {CalendarRequest} from "../model/calendar-request.model";
import {parseRequest} from "../helper/organizer.parser";
import {SimpleIterator} from "../model/math-structure.model";


export function organizeCalendar(
    currentCalendar: CurrentCalendarElement[],
    newCalendarElements: NewCalendarElement[],
    dayPreferencesConfig: DayPreferencesConfig,
    generalConstraints: GeneralConstraints
): { eventsToBeUpdated: EventsToBeUpdated[], newEventsToBeAdded: NewEventsToBeAdded[] } {
    const eventsToBeUpdated: EventsToBeUpdated[] = [];
    const newEventsToBeAdded: NewEventsToBeAdded[] = [];

    const breakBetweenEventsMinutes = generalConstraints.breakBetweenElements;
    const plannedDays: PlannedDay[] = groupEventsByDays(currentCalendar, generalConstraints.minStartDate, generalConstraints.maxEndDate);

    const calendarElementsLeftToBeInserted = [...newCalendarElements];

    const daysIterator: SimpleIterator<DateTime> = new SimpleIterator<DateTime>(plannedDays.map(e => e.date));
    const dayToPlannedDay: Map<DateTime, PlannedDay> = new Map<DateTime, PlannedDay>([]);
    plannedDays.forEach(singlePlannedDay => dayToPlannedDay.set(singlePlannedDay.date, singlePlannedDay));

    for (const newElement of calendarElementsLeftToBeInserted) {
        if (!daysIterator.hasNext()) {
            daysIterator.reset();
        }
        daysIterator.next();
        const plannedDay: PlannedDay = dayToPlannedDay.get(daysIterator.getValue());

        const availableTimeSlots = findAvailableTimeSlots(plannedDay, dayPreferencesConfig);
        const availableSlot = findAvailableSlotForElement(newElement, availableTimeSlots, breakBetweenEventsMinutes);
        const eventDuration = Duration.fromMillis(newElement.durationTime * 60 * 1000);

        if (availableSlot) {
            const newEvent: NewEventsToBeAdded = {
                name: newElement.name,
                location: newElement.location,
                startingDateTime: availableSlot,
                endingDateTime: availableSlot.plus(eventDuration),
            };
            newEventsToBeAdded.push(newEvent);
            plannedDay.plannedElements.push(newEvent);
        }
    }

    return {eventsToBeUpdated, newEventsToBeAdded};
}

function findAvailableSlotForElement(
    newElement: NewCalendarElement,
    availableTimeSlots: TimeSlot[],
    breakBetweenEventsMinutes: number
): DateTime {

    for (let i = 0; i < availableTimeSlots.length; i++) {
        const breakDuration = Duration.fromMillis((breakBetweenEventsMinutes) * 60 * 1000);
        const potentialSlotStart = availableTimeSlots[i].start.plus(breakDuration);
        const potentialSlotEnd = potentialSlotStart.plus(Duration.fromMillis((newElement.durationTime + breakBetweenEventsMinutes) * 60 * 1000));

        if (isSlotWithinBounds(potentialSlotEnd, availableTimeSlots[i]) && isSlotAvailable(potentialSlotStart, potentialSlotEnd, newElement)) {
            return potentialSlotStart;
        }
    }

    return null;
}


function isSlotWithinBounds(slotEnd: DateTime, availableTimeSlots: TimeSlot): boolean {
    return slotEnd.toMillis() < availableTimeSlots.end.toMillis();
}

function isSlotAvailable(slotStart: DateTime, slotEnd: DateTime, newElement: NewCalendarElement): boolean {
    return true;
}

const dayConfig: DayPreferencesConfig = {
    startTime: DateTime.fromISO("2024-01-21T08:00:00"),
    endTime: DateTime.fromISO("2024-01-21T17:00:00"),
};

const generalConstraints: GeneralConstraints = {
    minStartDate: DateTime.fromISO("2024-01-21T08:00:00"),
    maxEndDate: DateTime.fromISO("2024-01-21T17:00:00"),
    breakBetweenElements: 15, // in minutes
    changingAllowed: true,
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
        parsedInput.dayPreferencesConfig,
        parsedInput.generalConstraints
    );

    return {
        statusCode: 200,
        body: JSON.stringify(organizationResult),
        headers: {'Content-Type': 'application/json'},
    };
};
