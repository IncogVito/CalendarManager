import {
    BundledPlan,
    CalendarRequest,
    CurrentCalendarElementRequest,
    DayPreferencesConfigRequest,
    GeneralConstraintsRequest
} from "../model/calendar-request.model";
import {
    CalendarInput,
    DayPreferencesConfig,
    ExistingEvent,
    GeneralConstraints,
    NewCalendarElement
} from "../model/calendar.model";
import {LocalDate, LocalDateTime, LocalTime, ZonedDateTime, ZoneId} from "@js-joda/core";
import {TodoistEvent} from "../model/todoist.calendar.model";
import '@js-joda/timezone'

export function parseRequest(request: CalendarRequest): CalendarInput {
    return {
        currentCalendar: parseCurrentCalendar(request.currentCalendar),
        dayPreferencesConfig: parseDayPreferencesConfig(request.dayPreferencesConfig),
        generalConstraints: parseGeneralConstraints(request.generalConstraints),
        newCalendarElements: request.newCalendarElements
    }
}
export function createNewCalendarElements(bundledPlan: BundledPlan): NewCalendarElement[] {
    const { name, timeOnProject, singleSessionTime } = bundledPlan;
    const sessionsCount = Math.ceil(timeOnProject / singleSessionTime);
    const sessions: NewCalendarElement[] = [];
    for (let i = 0; i < sessionsCount; i++) {
        const sessionName = `${name} - Session ${i + 1} / ${sessionsCount}`;
        const sessionDuration = Math.min(singleSessionTime, timeOnProject - (i * singleSessionTime));
        const newSession: NewCalendarElement = {
            name: sessionName,
            index: i + 1,
            durationTime: sessionDuration,
            location: ""
        };
        sessions.push(newSession);
    }

    return sessions;
}

export function parseGeneralConstraints(generalConstraints: GeneralConstraintsRequest): GeneralConstraints {
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
    const startingTime = parseDateTimeOrDateWithDefaultTime(singleReq.due.datetime, singleReq.due.date, '00:00:00', singleReq.due.timezone);
    const durationTime = singleReq.duration?.amount;
    const endingTime = durationTime ? startingTime.plusMinutes(durationTime) : startingTime.plusMinutes(30);

    return {
        eventId: singleReq.id,
        content: singleReq.content,
        startingDateTime: startingTime,
        endingDateTime: endingTime,
        location: null,
        changeable: false,
        availableAlongside: false
    }
}

function parseDateTimeOrDateWithDefaultTime(datetime: string, date: string, defaultTime: string = "00:00:00", timezone?: string): LocalDateTime {
    if (datetime) {
        if (timezone) {
            const zonedDateTime = ZonedDateTime.parse(datetime);
            const zone = ZoneId.of(timezone);
            const convertedTime = zonedDateTime.withZoneSameInstant(zone);
            return convertedTime.toLocalDateTime();
        }
        return LocalDateTime.parse(datetime);
    }

    const localDate = LocalDate.parse(date);
    const localTime = LocalTime.parse(defaultTime);
    return LocalDateTime.of(localDate, localTime);
}