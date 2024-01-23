import {
    ExistingEvent,
    DayPreferencesConfig,
    GeneralConstraints,
    NewCalendarElement
} from "../../model/calendar.model";
import {findAvailableTimeSlots, groupEventsByDays} from "../../helper/organizer.helper";
import {handler, organizeCalendar} from "../organizer";
import {LocalDate, LocalDateTime, LocalTime} from "@js-joda/core";

test('Should correctly grouped days', () => {
    const calendarElements: ExistingEvent[] = [
        {
            eventId: 1,
            startingDateTime: LocalDateTime.parse("2024-01-21T08:00:00"),
            endingDateTime: LocalDateTime.parse("2024-01-21T09:00:00"),
            location: 'Location1',
            changeable: true,
            availableAlongside: false,
        }
    ];


    const result = groupEventsByDays(
        calendarElements,
        LocalDate.parse("2024-01-20"),
        LocalDate.parse("2024-01-22")
    );


    expect(result.length).toEqual(3);
});

test('Should find available slots when 1 event', () => {
    const calendarElements: ExistingEvent[] = [
        {
            eventId: 1,
            startingDateTime: LocalDateTime.parse("2024-01-21T08:00:00"),
            endingDateTime: LocalDateTime.parse("2024-01-21T09:00:00"),
            location: 'Location1',
            changeable: true,
            availableAlongside: false,
        }
    ];

    const availableTimeSlots = findAvailableTimeSlots(
        {
            date: LocalDate.parse("2024-01-21"),
            currentElements: calendarElements,
            plannedNewElements: [],
            plannedUpdatedElements: [],
        },
        {
            startTime: LocalTime.parse("06:00:00"),
            endTime: LocalTime.parse("21:00:00"),
        }
    );

    expect(availableTimeSlots.length).toEqual(2);
    expect(availableTimeSlots[0].start).toEqual(LocalDateTime.parse("2024-01-21T06:00:00"));
    expect(availableTimeSlots[0].end).toEqual(LocalDateTime.parse("2024-01-21T08:00:00"));
    expect(availableTimeSlots[1].start).toEqual(LocalDateTime.parse("2024-01-21T09:00:00"));
    expect(availableTimeSlots[1].end).toEqual(LocalDateTime.parse("2024-01-21T21:00:00"));
});

test('Should find available one slot when day occupied from the beginning', () => {
    const calendarElements: ExistingEvent[] = [
        {
            eventId: 1,
            startingDateTime: LocalDateTime.parse("2024-01-21T08:00:00"),
            endingDateTime: LocalDateTime.parse("2024-01-21T09:00:00"),
            location: 'Location1',
            changeable: true,
            availableAlongside: false,
        }
    ];

    const availableTimeSlots = findAvailableTimeSlots(
        {
            date: LocalDate.parse("2024-01-21"),
            currentElements: calendarElements,
            plannedNewElements: [],
            plannedUpdatedElements: []
        },
        {
            startTime: LocalTime.parse("08:00:00"),
            endTime: LocalTime.parse("21:00:00"),
        }
    );

    expect(availableTimeSlots.length).toEqual(1);
    expect(availableTimeSlots[0].start).toEqual(LocalDateTime.parse("2024-01-21T09:00:00"));
    expect(availableTimeSlots[0].end).toEqual(LocalDateTime.parse("2024-01-21T21:00:00"));
});

test('Should find available one slot when day occupied until the end', () => {
    const calendarElements: ExistingEvent[] = [
        {
            eventId: 1,
            startingDateTime: LocalDateTime.parse("2024-01-21T10:00:00"),
            endingDateTime: LocalDateTime.parse("2024-01-21T21:00:00"),
            location: 'Location1',
            changeable: true,
            availableAlongside: false,
        }
    ];

    const availableTimeSlots = findAvailableTimeSlots(
        {
            date: LocalDate.parse("2024-01-21"),
            currentElements: calendarElements,
            plannedNewElements: [],
            plannedUpdatedElements: []
        },
        {
            startTime: LocalTime.parse("08:00:00"),
            endTime: LocalTime.parse("21:00:00"),
        }
    );

    expect(availableTimeSlots.length).toEqual(1);
    expect(availableTimeSlots[0].start).toEqual(LocalDateTime.parse("2024-01-21T08:00:00"));
    expect(availableTimeSlots[0].end).toEqual(LocalDateTime.parse("2024-01-21T10:00:00"));
});


test('Should find some slots of new calendar', () => {
    const currentCalendar: ExistingEvent[] = [
        {
            eventId: 1,
            startingDateTime: LocalDateTime.parse('2024-01-21T08:00:00'),
            endingDateTime: LocalDateTime.parse('2024-01-21T12:00:00'),
            location: 'Office A',
            changeable: true,
            availableAlongside: false
        }
    ];

    const eventDuration = 55;
    const newCalendarElements: NewCalendarElement[] = [
        {
            name: 'Meeting',
            index: 1,
            durationTime: eventDuration,
            location: 'Conference Room B',
        }
    ];

    const dayPreferencesConfig: DayPreferencesConfig = {
        startTime: LocalTime.parse('08:00:00'),
        endTime: LocalTime.parse('21:00:00'),
    };

    const generalConstraints: GeneralConstraints = {
        minStartDate: LocalDate.parse('2024-01-21'),
        maxEndDate: LocalDate.parse('2024-01-21'),
        breakBetweenElements: 10,
        changingAllowed: true,
        preferencesStartTime: LocalTime.parse("08:00:00"),
        preferencesEndTime: LocalTime.parse("17:00:00"),
    };

    const result = organizeCalendar(currentCalendar, newCalendarElements, dayPreferencesConfig, generalConstraints);
    expect(result.success).toBeTruthy();

    //
    // const newEventStartingTime = result.newEventsToBeAdded[0].startingDateTime;
    // const newEventEndingTime = result.newEventsToBeAdded[0].endingDateTime;
    // const realDuration = Duration.between(newEventEndingTime, newEventStartingTime)
    //
    // expect(realDuration).toEqual(Duration.ofMinutes(eventDuration));
});

test('Should find slots for 2 new items of new calendar', () => {
    const currentCalendar: ExistingEvent[] = [
        {
            eventId: 1,
            startingDateTime: LocalDateTime.parse('2024-01-21T10:00:00'),
            endingDateTime: LocalDateTime.parse('2024-01-21T12:00:00'),
            location: 'Office A',
            changeable: true,
            availableAlongside: false
        }
    ];

    const eventDuration = 60;
    const newCalendarElements: NewCalendarElement[] = [
        {
            name: 'Meeting',
            index: 1,
            durationTime: eventDuration,
            location: 'Conference Room B',
        },
        {
            name: 'Meeting 2',
            index: 2,
            durationTime: eventDuration,
            location: 'Conference Room B',
        },
        {
            name: 'Meeting 3',
            index: 3,
            durationTime: eventDuration,
            location: 'Conference Room B',
        }
    ];

    const dayPreferencesConfig: DayPreferencesConfig = {
        startTime: LocalTime.parse('08:00:00'),
        endTime: LocalTime.parse('21:00:00'),
    };

    const generalConstraints: GeneralConstraints = {
        minStartDate: LocalDate.parse('2024-01-21'),
        maxEndDate: LocalDate.parse('2024-01-21'),
        breakBetweenElements: 10,
        changingAllowed: true,
        preferencesStartTime: LocalTime.parse("08:00:00"),
        preferencesEndTime: LocalTime.parse("21:00:00"),
    };

    const result = organizeCalendar(currentCalendar, newCalendarElements, dayPreferencesConfig, generalConstraints);
    expect(result.success).toBeTruthy();

    // expect(result.newEventsToBeAdded.length).toEqual(3);
    //
    // let lastStartingTime = null;
    // let lastEndingTime = null;
    // for (const singleAddedItem of result.newEventsToBeAdded) {
    //     const newEventStartingTime = singleAddedItem.startingDateTime;
    //     const newEventEndingTime = singleAddedItem.endingDateTime;
    //     const realDuration = Duration.between(newEventEndingTime, newEventStartingTime);
    //     expect(realDuration).toEqual(Duration.ofMinutes(eventDuration));
    //
    //     expect(lastStartingTime).not.toEqual(singleAddedItem.startingDateTime)
    //     expect(lastEndingTime).not.toEqual(singleAddedItem.endingDateTime)
    //
    //     lastStartingTime = singleAddedItem.startingDateTime;
    //     lastEndingTime = singleAddedItem.endingDateTime;
    // }
});

test('Should place two events over two days', () => {
    const currentCalendar: ExistingEvent[] = [
        {
            eventId: 1,
            startingDateTime: LocalDateTime.parse('2024-01-21T10:00:00'),
            endingDateTime: LocalDateTime.parse('2024-01-21T12:00:00'),
            location: 'Office A',
            changeable: true,
            availableAlongside: false
        },
        {
            eventId: 1,
            startingDateTime: LocalDateTime.parse('2024-01-22T08:00:00'),
            endingDateTime: LocalDateTime.parse('2024-01-22T12:00:00'),
            location: 'Office A',
            changeable: true,
            availableAlongside: false
        }
    ];

    const eventDuration = 60;
    const newCalendarElements: NewCalendarElement[] = [
        {
            name: 'Meeting',
            index: 1,
            durationTime: eventDuration,
            location: 'Conference Room B',
        },
        {
            name: 'Meeting 2',
            index: 2,
            durationTime: eventDuration,
            location: 'Conference Room B',
        }
    ];

    const dayPreferencesConfig: DayPreferencesConfig = {
        startTime: LocalTime.parse('08:00:00'),
        endTime: LocalTime.parse('21:00:00'),
    };

    const generalConstraints: GeneralConstraints = {
        minStartDate: LocalDate.parse('2024-01-21'),
        maxEndDate: LocalDate.parse('2024-01-22'),
        breakBetweenElements: 10,
        changingAllowed: true,
        preferencesStartTime: LocalTime.parse("08:00:00"),
        preferencesEndTime: LocalTime.parse("21:00:00"),
    };

    const result = organizeCalendar(currentCalendar, newCalendarElements, dayPreferencesConfig, generalConstraints);
    expect(result.success).toBeTruthy();

    // expect(result.newEventsToBeAdded.length).toEqual(2);
    //
    // let lastDate = null;
    // for (const singleAddedItem of result.newEventsToBeAdded) {
    //     // const newEventStartingTime = singleAddedItem.startingDateTime.toISODate();
    //     // expect(lastDate).not.toEqual(newEventStartingTime)
    //     // lastDate = singleAddedItem.startingDateTime.toISODate();
    // }
});


test('Should test post request', () => {
    const bodyReq = `{
  "currentCalendar": [
    {
      "eventId": 1,
      "startingDateTime": "2024-01-21T08:00:00",
      "endingDateTime": "2024-01-21T12:00:00",
      "location": "Office A",
      "changeable": true,
      "availableAlongside": false
    }
  ],
  "newCalendarElements": [
    {
      "name": "Meeting",
      "index": 1,
      "durationTime": 2,
      "location": "Conference Room B"
    }
  ],
  "generalConstraints": {
    "minStartDate": "2024-01-21",
    "maxEndDate": "2024-01-21",
    "breakBetweenElements": 1,
    "changingAllowed": true,
    "preferencesStartTime": "08:00:00",
    "preferencesEndTime": "17:00:00"
  }
}`;

    const result = handler({httpMethod: "POST", body: bodyReq}, undefined);
});




