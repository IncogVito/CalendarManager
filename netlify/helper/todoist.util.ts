import {DateTimeFormatter, Duration, LocalDate, Period} from "@js-joda/core";
import {ExistingEvent} from "../model/calendar.model";

export function createDueFilterBetweenDates(dateFrom: LocalDate, dateTo: LocalDate) {
    return `due after: ${dateFrom.format(DateTimeFormatter.ISO_LOCAL_DATE)} 0am & due before: ${dateTo.plusDays(1).format(DateTimeFormatter.ISO_LOCAL_DATE)} 0am`
}

export function filterObject<T>(obj: T, allowedFields: (keyof T)[]): Partial<T> {
    const filteredObject: Partial<T> = {};
    Object.keys(obj).forEach(key => {
        if (allowedFields.includes(key as keyof T)) {
            filteredObject[key as keyof T] = obj[key as keyof T];
        }
    });
    return filteredObject;
}


function formatEventIntoSimplifiedString(event: ExistingEvent): string {
    const duration: Duration = Duration.between(event.startingDateTime, event.endingDateTime);

    let formattedEvent = `${event.startingDateTime.format(DateTimeFormatter.ofPattern("HH:mm"))}-${event.endingDateTime.format(DateTimeFormatter.ofPattern("HH:mm"))} (${duration.toMinutes()} mins)\n`;
    if (event.content) {
        formattedEvent += `${event.content}\n`;
    }
    formattedEvent += `EventId: ${event.eventId}\n\n`;
    return formattedEvent;
}

export function convertExistingEventsToSimplifiedString(events: ExistingEvent[]): string {
    let formattedEvents = '';
    let currentDate = '';

    const sortedEvents = [...events].sort((a1, a2) => a1.startingDateTime.compareTo(a2.startingDateTime))

    sortedEvents.forEach(event => {
        const eventDate: string = event.startingDateTime.format(DateTimeFormatter.ISO_DATE);
        if (eventDate !== currentDate) {
            formattedEvents += `${eventDate}\n`;
            currentDate = eventDate;
        }
        formattedEvents += `${formatEventIntoSimplifiedString(event)}`;
    });
    return formattedEvents;
}