import {DateTime} from "luxon";
import {Valid} from "luxon/src/_util";
import {DurationOptions} from "luxon/src/duration";

export class TimeSlot {
    start: DateTime;
    end: DateTime;

    private constructor(start: DateTime, end: DateTime) {
        this.start = start;
        this.end = end;
    }

    static create(start: DateTime, end: DateTime): TimeSlot {
        return new TimeSlot(start, end);
    }
}

export interface CurrentCalendarElement {
    eventId: number;
    startingDateTime: DateTime;
    endingDateTime: DateTime;
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
    startTime: DateTime;
    endTime: DateTime;
}

export interface GeneralConstraints {
    minStartDate: DateTime;
    maxEndDate: DateTime;
    breakBetweenElements: number;
    changingAllowed: boolean;
}

export interface EventsToBeUpdated {
    eventId: number;
    newStartingTime: DateTime;
    newEndingTime: DateTime;
}

export interface NewEventsToBeAdded {
    name: string;
    location: string;
    startingTime: DateTime;
    endingTime: DateTime;
}
