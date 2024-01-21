export interface CalendarRequest {
    currentCalendar: CurrentCalendarElementRequest[],
    newCalendarElements: NewCalendarElementRequest[],
    dayPreferencesConfig: DayPreferencesConfigRequest,
    generalConstraints: GeneralConstraintsRequest
}

export interface CurrentCalendarElementRequest {
    eventId: number;
    startingDateTime: string;
    endingDateTime: string;
    location: string;
    changeable: boolean;
    availableAlongside: boolean;
}

export interface NewCalendarElementRequest {
    name: string;
    index: number;
    durationTime: number;
    location: string;
}

export interface DayPreferencesConfigRequest {
    startTime: string;
    endTime: string;
}

export interface GeneralConstraintsRequest {
    minStartDate: string;
    maxEndDate: string;
    breakBetweenElements: number;
    changingAllowed: boolean;
}