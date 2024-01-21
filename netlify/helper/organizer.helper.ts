import {CurrentCalendarElement, DayPreferencesConfig, TimeSlot} from "../model/calendar.model";
import {DateTime} from "luxon";
import {PlannedDay} from "../model/calendar-algorithm.model";

export function groupEventsByDays(
    calendarElements: CurrentCalendarElement[],
    minStartDate: DateTime,
    maxEndDate: DateTime
): PlannedDay[] {
    const groupedDays: PlannedDay[] = [];

    let currentDate = minStartDate;
    while (currentDate <= maxEndDate) {
        const currentDayElements: CurrentCalendarElement[] = [];

        for (const calendarElement of calendarElements) {
            if (
                calendarElement.startingDateTime >= currentDate &&
                calendarElement.endingDateTime <= currentDate
            ) {
                currentDayElements.push(calendarElement);
            }
        }

        groupedDays.push({
            date: currentDate,
            currentElements: currentDayElements,
            plannedElements: []
        });
        currentDate = currentDate.plus({days: 1});
    }
    return groupedDays;
}

export function findAvailableTimeSlots(plannedDay: PlannedDay, dayPreferencesConfig: DayPreferencesConfig): TimeSlot[] {
    const orderedEvents = plannedDay.currentElements
        .sort((a1, a2) =>
            a1.startingDateTime.toMillis() - a2.startingDateTime.toMillis()
        );

    if (orderedEvents.length === 0) {
        return [TimeSlot.create(dayPreferencesConfig.startTime, dayPreferencesConfig.endTime)]
    }
    const timeSlots: TimeSlot[] = [];
    let lastEndingTime = dayPreferencesConfig.startTime;

    for (const singleEvent of orderedEvents) {
        if (lastEndingTime.toMillis() !== singleEvent.startingDateTime.toMillis()) {
            timeSlots.push(TimeSlot.create(lastEndingTime, singleEvent.startingDateTime));
        }
        lastEndingTime = singleEvent.endingDateTime;
    }

    if (lastEndingTime.toMillis() !== dayPreferencesConfig.endTime.toMillis()) {
        timeSlots.push(TimeSlot.create(lastEndingTime, dayPreferencesConfig.endTime));
    }
    return timeSlots;
}