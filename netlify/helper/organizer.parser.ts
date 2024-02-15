import {
    CalendarRequest,
    CurrentCalendarElementRequest,
    DayPreferencesConfigRequest, GeneralConstraintsRequest
} from "../model/calendar-request.model";
import {
    CalendarInput,
    ExistingEvent,
    DayPreferencesConfig,
    GeneralConstraints
} from "../model/calendar.model";
import {LocalDate, LocalDateTime, LocalTime} from "@js-joda/core";
import {TodoistEvent} from "../model/todoist.calendar.model";

export function parseRequest(request: CalendarRequest): CalendarInput {
    return {
        currentCalendar: parseCurrentCalendar(request.currentCalendar),
        dayPreferencesConfig: parseDayPreferencesConfig(request.dayPreferencesConfig),
        generalConstraints: parseGeneralConstraints(request.generalConstraints),
        newCalendarElements: request.newCalendarElements
    }
}

function parseGeneralConstraints(generalConstraints: GeneralConstraintsRequest): GeneralConstraints {
    return {
        breakBetweenElements: generalConstraints.breakBetweenElements,
        changingAllowed: generalConstraints.changingAllowed,
        maxEndDate: LocalDate.parse(generalConstraints.maxEndDate),
        minStartDate: LocalDate.parse(generalConstraints.minStartDate),
        preferencesStartTime: LocalTime.parse(generalConstraints.preferencesStartTime),
        preferencesEndTime: LocalTime.parse(generalConstraints.preferencesEndTime)
    };
}

function parseDayPreferencesConfig(dayPreferencesConfig: DayPreferencesConfigRequest): DayPreferencesConfig {
    if (!dayPreferencesConfig) {
        return null;
    }

    return {
        startTime: LocalTime.parse(dayPreferencesConfig.startTime),
        endTime: LocalTime.parse(dayPreferencesConfig.endTime)
    };
}

export function parseCurrentCalendar(currentEventsReqs: CurrentCalendarElementRequest[] | TodoistEvent[]): ExistingEvent[] {
    if (!currentEventsReqs) {
        return [];
    }

    return currentEventsReqs.map(singleReq => {
        if ('id' in singleReq) {
            return mapSingleTodoistElement(singleReq);
        } else {
            return mapSingleCalendarElement(singleReq);
        }
    })
}

function mapSingleCalendarElement(singleReq: CurrentCalendarElementRequest): ExistingEvent {
    return {
        eventId: singleReq.eventId,
        startingDateTime: LocalDateTime.parse(singleReq.startingDateTime),
        endingDateTime: LocalDateTime.parse(singleReq.endingDateTime),
        location: singleReq.location,
        changeable: singleReq.changeable,
        availableAlongside: singleReq.availableAlongside
    }
}

function mapSingleTodoistElement(singleReq: TodoistEvent): ExistingEvent {
    const startingTime = parseDateTimeOrDateWithDefaultTime(singleReq.due.datetime, singleReq.due.date, '00:00:00');
    const durationTime = singleReq.duration?.amount;
    const endingTime = durationTime ? startingTime.plusMinutes(durationTime) : startingTime.plusMinutes(30);

    return {
        eventId: singleReq.id,
        startingDateTime: startingTime,
        endingDateTime: endingTime,
        location: null,
        changeable: false,
        availableAlongside: false
    }
}

function parseDateTimeOrDateWithDefaultTime(datetime: string, date: string, defaultTime?: string) {
    if (datetime) {
        return LocalDateTime.parse(datetime);
    }

    const localDate = LocalDate.parse(date);
    const localTime = LocalTime.parse(defaultTime);
    return LocalDateTime.of(localDate, localTime);
}