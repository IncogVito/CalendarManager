import {LocalDate, LocalTime} from "@js-joda/core";

export interface PlanSlot {
    from: LocalTime,
    to: LocalTime
}

export interface CountFitScore {
    slots: PlanSlot[],
    penaltyScore: number
}

export interface DailyPlanScoreSummaryResult {
    date: LocalDate,
    maxCountFit: number,
    countFitToScore: Map<number, CountFitScore>
}