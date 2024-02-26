import {ExistingEvent, DayPreferencesConfig, TimeSlot} from "../model/calendar.model";
import {PlannedDay} from "../model/calendar-algorithm.model";
import {LocalDate, LocalDateTime, LocalTime} from "@js-joda/core";
import {PlanSlot} from "../model/calendar-v2.model";

export function groupEventsByDays(
    calendarElements: ExistingEvent[],
    minStartDate: LocalDate,
    maxEndDate: LocalDate
): PlannedDay[] {
    const groupedDays: PlannedDay[] = [];

    let currentDate = minStartDate;
    while (currentDate.compareTo(maxEndDate) <= 0) {
        const currentDayElements: ExistingEvent[] = [];

        for (const calendarElement of calendarElements) {
            if (
                calendarElement.startingDateTime.toLocalDate().compareTo(currentDate) >= 0 &&
                calendarElement.endingDateTime.toLocalDate().compareTo(currentDate) <= 0
            ) {
                currentDayElements.push(calendarElement);
            }
        }

        groupedDays.push({
            date: currentDate,
            currentElements: currentDayElements,
            plannedNewElements: [],
            plannedUpdatedElements: []
        });
        currentDate = currentDate.plusDays(1);
    }
    return groupedDays;
}

export function findAvailableTimeSlots(plannedDay: PlannedDay, dayPreferencesConfig: DayPreferencesConfig): TimeSlot[] {
    const prefStartTime = LocalDateTime.of(plannedDay.date, dayPreferencesConfig.startTime);
    const prefEndTime = LocalDateTime.of(plannedDay.date, dayPreferencesConfig.endTime);

    const mappedExistingEvents = plannedDay.currentElements.map(e => {
        return {
            element: undefined,
            startingDateTime: e.startingDateTime,
            endingDateTime: e.endingDateTime
        }
    })

    const orderedEvents = [...mappedExistingEvents, ...plannedDay.plannedNewElements]
        .sort((a1, a2) =>
            a1.startingDateTime.compareTo(a2.startingDateTime)
        );

    if (orderedEvents.length === 0) {
        return [TimeSlot.create(
            LocalDateTime.of(plannedDay.date, dayPreferencesConfig.startTime),
            LocalDateTime.of(plannedDay.date, dayPreferencesConfig.endTime)
        )
        ]
    }
    const timeSlots: TimeSlot[] = [];
    let lastEndingTime = LocalDateTime.of(plannedDay.date, dayPreferencesConfig.startTime);

    for (const singleEvent of orderedEvents) {
        if (lastEndingTime.compareTo(singleEvent.startingDateTime) < 0
            && lastEndingTime.compareTo(prefStartTime) >= 0
            && lastEndingTime.compareTo(prefEndTime) < 0
        ) {
            const minEnding = prefEndTime.compareTo(singleEvent.startingDateTime) < 0 ? prefEndTime : singleEvent.startingDateTime;
            timeSlots.push(TimeSlot.create(lastEndingTime, minEnding));
        }

        if (lastEndingTime.compareTo(singleEvent.endingDateTime) < 0) {
            lastEndingTime = singleEvent.endingDateTime;
        }
    }

    if (lastEndingTime.compareTo(LocalDateTime.of(plannedDay.date, dayPreferencesConfig.endTime)) < 0
        && lastEndingTime.compareTo(prefStartTime) >= 0
    ) {
        timeSlots.push(TimeSlot.create(lastEndingTime, LocalDateTime.of(plannedDay.date, dayPreferencesConfig.endTime)));
    }
    return timeSlots;
}


/**
 * Funkcja umieszcza punkty zdarzeń z planSlot w odpowiednich miejscach w tablicy eventPoints
 *
 * TODO - optimize this function
 *
 * @param eventPoints
 * @param planSlot
 */
export function placeEventPoints(eventPoints: LocalTime[], planSlot: PlanSlot) {
    const updatedEventPoints: LocalTime[] = [...eventPoints];
    updatedEventPoints.push(planSlot.to, planSlot.from);
    return updatedEventPoints.sort((a, b) => a.compareTo(b));
}

export function removeCollidingSlots(planSlotsBySector: PlanSlot[][], collidingTimeSlot: PlanSlot) {
    return planSlotsBySector.map(singleSector => singleSector.filter(singleSlot => {
        return singleSlot.from.compareTo(collidingTimeSlot.to) >= 0 || singleSlot.to.compareTo(collidingTimeSlot.from) <= 0
    }))
}