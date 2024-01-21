import {
    CalendarRequest,
    CurrentCalendarElementRequest,
    DayPreferencesConfigRequest, GeneralConstraintsRequest, NewCalendarElementRequest
} from "../model/calendar-request.model";
import {
    CalendarInput,
    CurrentCalendarElement,
    DayPreferencesConfig,
    GeneralConstraints,
    NewCalendarElement
} from "../model/calendar.model";
import {DateTime} from "luxon";

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
        maxEndDate: DateTime.fromISO(generalConstraints.minStartDate),
        minStartDate: DateTime.fromISO(generalConstraints.maxEndDate)
    };
}

function parseDayPreferencesConfig(dayPreferencesConfig: DayPreferencesConfigRequest): DayPreferencesConfig {
    return {
        startTime: DateTime.fromISO(dayPreferencesConfig.startTime),
        endTime: DateTime.fromISO(dayPreferencesConfig.endTime)
    };
}

function parseCurrentCalendar(currentEventsReqs: CurrentCalendarElementRequest[]): CurrentCalendarElement[] {
    return currentEventsReqs.map(singleReq => {
        return {
            eventId: singleReq.eventId,
            startingDateTime: DateTime.fromISO(singleReq.startingDateTime),
            endingDateTime: DateTime.fromISO(singleReq.endingDateTime),
            location: singleReq.location,
            changeable: singleReq.changeable,
            availableAlongside: singleReq.availableAlongside
        }
    })
}