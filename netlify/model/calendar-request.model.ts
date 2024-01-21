import {CurrentCalendarElement, DayPreferencesConfig, GeneralConstraints, NewCalendarElement} from "./calendar.model";

export interface CalendarRequest {
    currentCalendar: CurrentCalendarElement[],
    newCalendarElements: NewCalendarElement[],
    dayPreferencesConfig: DayPreferencesConfig,
    generalConstraints: GeneralConstraints
}