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

function parseCurrentCalendar(currentEventsReqs: CurrentCalendarElementRequest[]): ExistingEvent[] {
    return currentEventsReqs.map(singleReq => {
        return {
            eventId: singleReq.eventId,
            startingDateTime: LocalDateTime.parse(singleReq.startingDateTime),
            endingDateTime: LocalDateTime.parse(singleReq.endingDateTime),
            location: singleReq.location,
            changeable: singleReq.changeable,
            availableAlongside: singleReq.availableAlongside
        }
    })
}