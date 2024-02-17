import {ExistingEvent, CreatedEvent, UpdatedEvent} from "./calendar.model";
import {LocalDate, LocalDateTime} from "@js-joda/core";


export interface PlannedDay {
    date: LocalDate;
    currentElements: ExistingEvent[];
    plannedNewElements: CreatedEvent[];
    plannedUpdatedElements: UpdatedEvent[];
}



export class PlanningResult {
    success: boolean;
    plannedDays?: PlannedDay[];
    score?: number;
    unavailableDays: LocalDate[];
}