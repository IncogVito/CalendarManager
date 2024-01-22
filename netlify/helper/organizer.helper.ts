import {CurrentCalendarElement, DayPreferencesConfig, NewCalendarElement, TimeSlot} from "../model/calendar.model";
import {DateTime} from "luxon";
import {PlannedDay} from "../model/calendar-algorithm.model";
import {combineDateAndTime} from "./time.util";

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
    const mappedExistingEvents = plannedDay.currentElements.map(e => {
        return {
            element: undefined,
            startingDateTime: e.startingDateTime,
            endingDateTime: e.endingDateTime
        }
    })


    const orderedEvents = [...mappedExistingEvents, ...plannedDay.plannedElements]
        .sort((a1, a2) =>
            a1.startingDateTime.toMillis() - a2.startingDateTime.toMillis()
        );

    if (orderedEvents.length === 0) {
        return [TimeSlot.create(
            combineDateAndTime(plannedDay.date, dayPreferencesConfig.startTime),
            combineDateAndTime(plannedDay.date, dayPreferencesConfig.endTime)
        )
        ]
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