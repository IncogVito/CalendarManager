import {DayPreferencesConfig, ExistingEvent} from "../../model/calendar.model";
import {LocalDateTime, LocalTime} from "@js-joda/core";
import {calculateScore, createPlanSlotsBySectors, placeItems} from "../organizer-v2";
import {CountFitScore, PlanSlot} from "../../model/calendar-v2.model";

test('Should test creating plan slots', () => {
// given
    const existingEvents: ExistingEvent[] = [{
        startingDateTime: LocalDateTime.of(2000, 1, 1, 8, 0),
        endingDateTime: LocalDateTime.of(2000, 1, 1, 9, 0),
        location: "location",
        changeable: true,
        availableAlongside: true,
        eventId: "1"
    }, {
        startingDateTime: LocalDateTime.of(2000, 1, 1, 12, 0),
        endingDateTime: LocalDateTime.of(2000, 1, 1, 15, 0),
        location: "location",
        changeable: true,
        availableAlongside: true,
        eventId: "2"
    }];

    const slotOffsetMinutes = 30;
    const slotDurationMinutes = 60;
    const preferencesConfig: DayPreferencesConfig = {
        startTime: LocalTime.of(8, 0),
        endTime: LocalTime.of(20, 0)
    }

// when
    const planSlotsBySectors = createPlanSlotsBySectors(existingEvents, slotOffsetMinutes, slotDurationMinutes, preferencesConfig);
    const planSlots = planSlotsBySectors.flatMap(slot => slot);

// then
    expect(planSlotsBySectors.length).toBe(2);
    expect(planSlots.length).toBe(14);
    expect(planSlots[0].from).toEqual(LocalTime.of(9, 0));
    expect(planSlots[0].to).toEqual(LocalTime.of(10, 0));
    expect(planSlots[1].from).toEqual(LocalTime.of(9, 30));
    expect(planSlots[1].to).toEqual(LocalTime.of(10, 30));
    expect(planSlots[13].from).toEqual(LocalTime.of(19, 0));
    expect(planSlots[13].to).toEqual(LocalTime.of(20, 0));
});

test('Should test creating plan slots before, in the middle and after events', () => {
// given
    const existingEvents: ExistingEvent[] = [{
        startingDateTime: LocalDateTime.of(2000, 1, 1, 8, 0),
        endingDateTime: LocalDateTime.of(2000, 1, 1, 9, 0),
        location: "location",
        changeable: true,
        availableAlongside: true,
        eventId: "1"
    }, {
        startingDateTime: LocalDateTime.of(2000, 1, 1, 12, 0),
        endingDateTime: LocalDateTime.of(2000, 1, 1, 15, 0),
        location: "location",
        changeable: true,
        availableAlongside: true,
        eventId: "2"
    }];

    const slotOffsetMinutes = 30;
    const slotDurationMinutes = 60;
    const preferencesConfig: DayPreferencesConfig = {
        startTime: LocalTime.of(6, 0),
        endTime: LocalTime.of(20, 0)
    }

// when
    const planSlotsBySectors = createPlanSlotsBySectors(existingEvents, slotOffsetMinutes, slotDurationMinutes, preferencesConfig);
    const planSlots = planSlotsBySectors.flatMap(slot => slot);

// then
    expect(planSlotsBySectors.length).toBe(3);
    expect(planSlots.length).toBe(17);
    expect(planSlots[0].from).toEqual(LocalTime.of(6, 0));
    expect(planSlots[0].to).toEqual(LocalTime.of(7, 0));
    expect(planSlots[2].from).toEqual(LocalTime.of(7, 0));
    expect(planSlots[2].to).toEqual(LocalTime.of(8, 0));
    expect(planSlots[3].from).toEqual(LocalTime.of(9, 0));
    expect(planSlots[3].to).toEqual(LocalTime.of(10, 0));
    expect(planSlots[16].from).toEqual(LocalTime.of(19, 0));
    expect(planSlots[16].to).toEqual(LocalTime.of(20, 0));
});


test('Should place items between existing events', () => {
    // given
    const planSlotsBySectors = [
        [
            {from: LocalTime.of(6, 0), to: LocalTime.of(6, 30)},
            {from: LocalTime.of(6, 15), to: LocalTime.of(6, 45)},
            {from: LocalTime.of(6, 30), to: LocalTime.of(7, 0)}
        ],
        [
            {from: LocalTime.of(10, 0), to: LocalTime.of(10, 30)},
            {from: LocalTime.of(10, 15), to: LocalTime.of(10, 45)},
            {from: LocalTime.of(10, 30), to: LocalTime.of(11, 0)}
        ]
    ]

    const eventPoints: LocalTime[] = [
        LocalTime.of(7, 0),
        LocalTime.of(10, 0)
    ]

    const calculateScoreFn = (singleSlot: PlanSlot, eventPoints: LocalTime[]) => {
        return calculateScore(singleSlot, eventPoints, {
            slotOffsetMinutes: 10
        });
    }

    // when
    const countFitScore: CountFitScore = placeItems(planSlotsBySectors, eventPoints, 2, 0, calculateScoreFn);

    // then
    expect(countFitScore).toBeDefined()
    expect(countFitScore.slots.length).toBe(2);
    expect(countFitScore.slots[0].from).toStrictEqual(LocalTime.of(6, 0));
    expect(countFitScore.slots[0].to).toStrictEqual(LocalTime.of(6, 30));
    expect(countFitScore.slots[1].from).toStrictEqual(LocalTime.of(10, 30));
    expect(countFitScore.slots[1].to).toStrictEqual(LocalTime.of(11, 0));
});

test('Should place items after events no more than 2 times duration time', () => {
    // given
    const planSlotsBySectors = [
        [
            {from: LocalTime.of(10, 0), to: LocalTime.of(10, 30)},
            {from: LocalTime.of(10, 15), to: LocalTime.of(10, 45)},
            {from: LocalTime.of(10, 30), to: LocalTime.of(11, 0)},
            {from: LocalTime.of(10, 45), to: LocalTime.of(11, 15)},
            {from: LocalTime.of(11, 0), to: LocalTime.of(11, 30)}
        ]
    ]

    const eventPoints: LocalTime[] = [
        LocalTime.of(7, 0),
        LocalTime.of(10, 0)
    ]

    const calculateScoreFn = (singleSlot: PlanSlot, eventPoints: LocalTime[]) => {
        return calculateScore(singleSlot, eventPoints, {
            slotOffsetMinutes: 15
        });
    }

    // when
    const countFitScore: CountFitScore = placeItems(planSlotsBySectors, eventPoints, 1, 0, calculateScoreFn);

    // then
    expect(countFitScore).toBeDefined()
    expect(countFitScore.slots.length).toBe(1);
    expect(countFitScore.slots[0].from).toStrictEqual(LocalTime.of(10, 30));
    expect(countFitScore.slots[0].to).toStrictEqual(LocalTime.of(11, 0));
});

test('Should place bigger number of elements', () => {
    // given
    const manySlotsBySingleSector = [[]];

    const startTime = LocalTime.of(6, 0);
    const endTime = LocalTime.of(22, 0);

    let currentTime = startTime;
    while (currentTime.isBefore(endTime)) {
        manySlotsBySingleSector[0].push({ from: currentTime, to: currentTime.plusMinutes(30) });
        currentTime = currentTime.plusMinutes(15);
    }


    const eventPoints: LocalTime[] = [
        LocalTime.of(6, 0),
        LocalTime.of(7, 0),
        LocalTime.of(8, 0),
        LocalTime.of(9, 0),
        LocalTime.of(10, 0),
        LocalTime.of(12, 0),
        LocalTime.of(14, 0),
        LocalTime.of(15, 0),
        LocalTime.of(19, 0)
    ]

    let counterExec = 0;
    const calculateScoreFn = (singleSlot: PlanSlot, eventPoints: LocalTime[]) => {
        counterExec++
        return calculateScore(singleSlot, eventPoints, {
            slotOffsetMinutes: 15
        });
    }

    // when
    const countFitScore: CountFitScore = null;
    placeItems(manySlotsBySingleSector, eventPoints, 10, 0, calculateScoreFn);

    // then
    console.log(counterExec);
    expect(countFitScore).toBeDefined()
    expect(countFitScore.slots.length).toBe(10);
});


test('Should mark next slot as unavailable', () => {
    // given
    const planSlotsBySectors = [
        [
            {from: LocalTime.of(10, 0), to: LocalTime.of(10, 30)},
            {from: LocalTime.of(10, 15), to: LocalTime.of(10, 45)}
        ]
    ]

    const eventPoints: LocalTime[] = [
        LocalTime.of(7, 0),
        LocalTime.of(10, 0)
    ]

    const calculateScoreFn = (singleSlot: PlanSlot, eventPoints: LocalTime[]) => {
        return calculateScore(singleSlot, eventPoints, {
            slotOffsetMinutes: 15
        });
    }

    // when
    const countFitScore: CountFitScore = placeItems(planSlotsBySectors, eventPoints, 2, 0, calculateScoreFn);

    // then
    expect(countFitScore).toBeNull();
});