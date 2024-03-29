import {LocalDate, LocalDateTime, LocalTime} from "@js-joda/core";

export class TimeSlot {
    start: LocalTime;
    end: LocalTime;

    private constructor(start: LocalTime, end: LocalTime) {
        this.start = start;
        this.end = end;
    }

    static create(start: LocalTime, end: LocalTime): TimeSlot {
        return new TimeSlot(start, end);
    }
}

export class DateTimeSlot {
    start: LocalDateTime;
    end: LocalDateTime;

    private constructor(start: LocalDateTime, end: LocalDateTime) {
        this.start = start;
        this.end = end;
    }

    static create(start: LocalDateTime, end: LocalDateTime): DateTimeSlot {
        return new DateTimeSlot(start, end);
    }
}

export interface CalendarInput {
    currentCalendar: ExistingEvent[],
    newCalendarElements: NewCalendarElement[],
    dayPreferencesConfig: DayPreferencesConfig,
    generalConstraints: GeneralConstraints
}

export interface ExistingEvent {
    eventId: number | string;
    content?: string;
    startingDateTime: LocalDateTime;
    endingDateTime: LocalDateTime;
    location: string;
    changeable: boolean;
    availableAlongside: boolean;
}

export interface NewCalendarElement {
    name: string;
    index: number;
    durationTime: number;
    location: string;
}

export interface DayPreferencesConfig {
    startTime: LocalTime;
    endTime: LocalTime;
}

export interface CalculateScoreConfig {
    slotOffsetMinutes: number;
}

export interface GeneralConstraints {
    minStartDate: LocalDate;
    maxEndDate: LocalDate;
    breakBetweenElements: number;
    slotOffsetMinutes: number;
    changingAllowed: boolean;
    preferencesStartTime: LocalTime;
    preferencesEndTime: LocalTime;
}

export interface UpdatedEvent {
    eventId: number | string;
    newStartingTime: LocalDateTime;
    newEndingTime: LocalDateTime;
}

export interface CreatedEvent {
    name: string;
    location: string;
    startingDateTime: LocalDateTime;
    endingDateTime: LocalDateTime;
}
