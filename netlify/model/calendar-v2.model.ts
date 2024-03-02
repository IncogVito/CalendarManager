import {LocalDate, LocalTime} from "@js-joda/core";

export interface PlanSlot {
    from: LocalTime,
    to: LocalTime
}

export interface ScoredPlan {
    slots: PlanSlot[],
    penaltyScore: number
}

export interface DailyPlanScoreSummaryResult {
    date: LocalDate,
    maxCountFit: number,
    countFitToScore: Map<number, ScoredPlan>
}

export interface DailyCountFitScore extends ScoredPlan {
    date: LocalDate;
}

export interface DailyCountFitScoreSequence {
    penaltyScore: number,
    occupancies: DailyCountFitScore[]
}

export interface DailyOccupancyResult {
    items: ([LocalDate, number])[];
    dailyPenaltyScore: number;
    fullPenaltyScore: number;
}

export class OptimalSolutionsResults {
    private dateToOccupationToSolution: Map<LocalDate, Map<number, DailyOccupancyResult>> = new Map();

    getByDateAndOccupancyFit(date: LocalDate, occupancyFit: number): DailyOccupancyResult | null {
        if (this.dateToOccupationToSolution.has(date)) {
            const occupationToSolution = this.dateToOccupationToSolution.get(date);
            if (occupationToSolution.has(occupancyFit)) {
                return occupationToSolution.get(occupancyFit);
            }
        }
        return null
    }

    setResult(date: LocalDate, occupancyFit: number, DailyOccupancyResult) {
        if (this.dateToOccupationToSolution.has(date)) {
            const occupationToSolution = this.dateToOccupationToSolution.get(date);
            occupationToSolution.set(occupancyFit, DailyOccupancyResult);
        } else {
            const occupationToSolution = new Map();
            occupationToSolution.set(occupancyFit, DailyOccupancyResult);
            this.dateToOccupationToSolution.set(date, occupationToSolution);
        }
    }
}