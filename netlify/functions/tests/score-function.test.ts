import {LocalDate, LocalTime} from "@js-joda/core";
import {PlanSlot} from "../../model/calendar-v2.model";
import {calculateScore} from "../organizer-v2";
import {GeneralConstraints} from "../../model/calendar.model";

test('Should test creating plan slots before, in the middle and after events', () => {
    // given
    const eventsPoints: LocalTime[] = [
        LocalTime.of(7, 0),
        LocalTime.of(8, 0),
        LocalTime.of(9, 0),
        LocalTime.of(10, 0)
    ]

    const planSlot1: PlanSlot = {
        from: LocalTime.of(8, 15),
        to: LocalTime.of(8, 45)
    }
    const planSlot2: PlanSlot = {
        from: LocalTime.of(8, 0),
        to: LocalTime.of(8, 30)
    }
    const planSlot3: PlanSlot = {
        from: LocalTime.of(8, 30),
        to: LocalTime.of(9, 0)
    }

    const generalConstraints: GeneralConstraints = {
        preferencesStartTime: LocalTime.of(6, 0),
        preferencesEndTime: LocalTime.of(12, 0),
        breakBetweenElements: 10,
        changingAllowed: true,
        maxEndDate: LocalDate.of(2000, 1, 1),
        minStartDate: LocalDate.of(2000, 1, 1),
        slotOffsetMinutes: 15
    }
    // when

    const score1 = calculateScore(planSlot1, eventsPoints, generalConstraints);
    const score2 = calculateScore(planSlot2, eventsPoints, generalConstraints);
    const score3 = calculateScore(planSlot3, eventsPoints, generalConstraints);

    // then
    expect(score1 < score2).toBeTruthy();
    expect(score1 < score3).toBeTruthy();
    expect(score2 === score3).toBeTruthy();
});

test('Should test score points on boundaries', () => {
    // given
    const eventsPoints: LocalTime[] = [
        LocalTime.of(7, 0),
        LocalTime.of(10, 0)
    ]

    const planSlot1: PlanSlot = {
        from: LocalTime.of(10, 0),
        to: LocalTime.of(10, 30)
    }
    const planSlot2: PlanSlot = {
        from: LocalTime.of(10, 15),
        to: LocalTime.of(10, 30)
    }

    const generalConstraints: GeneralConstraints = {
        preferencesStartTime: LocalTime.of(6, 0),
        preferencesEndTime: LocalTime.of(12, 0),
        breakBetweenElements: 10,
        changingAllowed: true,
        maxEndDate: LocalDate.of(2000, 1, 1),
        minStartDate: LocalDate.of(2000, 1, 1),
        slotOffsetMinutes: 15
    }
    // when

    const score1 = calculateScore(planSlot1, eventsPoints, generalConstraints);
    const score2 = calculateScore(planSlot2, eventsPoints, generalConstraints);
    // then
    expect(score1 > score2).toBeTruthy();
});