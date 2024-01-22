import {CurrentCalendarElement, NewCalendarElement, NewEventsToBeAdded} from "./calendar.model";
import {DateTime} from "luxon";


export interface PlannedEvent {
    element: NewCalendarElement,
    startingDateTime: DateTime;
    endingDateTime: DateTime;
}

export interface PlannedDay {
    date: DateTime;
    currentElements: CurrentCalendarElement[];
    plannedElements: NewEventsToBeAdded[]
}