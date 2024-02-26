import {LocalTime} from "@js-joda/core";
import {PlanSlot} from "../../model/calendar-v2.model";
import {removeCollidingSlots} from "../../helper/organizer.helper";

test('Should test colliding plan slots', () => {
    // given
    const planSlotsBySectors = [
        [
            {
                from: LocalTime.of(6, 0),
                to: LocalTime.of(6, 30)
            },
            {
                from: LocalTime.of(6, 15),
                to: LocalTime.of(6, 45)
            },
        ]];

    const collidingPlanSlot: PlanSlot = {
        from: LocalTime.of(6, 30),
        to: LocalTime.of(7, 0)
    }

    // when
    const nonCollidingPlanSlot: PlanSlot[][] = removeCollidingSlots(planSlotsBySectors, collidingPlanSlot);

    // then
    expect(nonCollidingPlanSlot.length).toBe(1);
    expect(nonCollidingPlanSlot[0].length).toBe(1);
    expect(nonCollidingPlanSlot[0][0].from).toStrictEqual(LocalTime.of(6, 0));
});