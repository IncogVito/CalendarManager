import {
    CurrentCalendarElement,
    DayPreferencesConfig,
    GeneralConstraints,
    NewCalendarElement
} from "../../model/calendar.model";
import {DateTime} from "luxon";
import {findAvailableTimeSlots, groupEventsByDays} from "../../helper/organizer.helper";
import {handler, organizeCalendar} from "../organizer";

test('Should correctly grouped days', () => {
    const calendarElements: CurrentCalendarElement[] = [
        {
            eventId: 1,
            startingDateTime: DateTime.fromISO("2024-01-21T08:00:00"),
            endingDateTime: DateTime.fromISO("2024-01-21T09:00:00"),
            location: 'Location1',
            changeable: true,
            availableAlongside: false,
        }
    ];

    const result = groupEventsByDays(
        calendarElements,
        DateTime.fromISO("2024-01-20T07:00:00"),
        DateTime.fromISO("2024-01-22T09:00:00")
    );

    expect(result.length).toEqual(3);
});

test('Should find available slots when 1 event', () => {
    const calendarElements: CurrentCalendarElement[] = [
        {
            eventId: 1,
            startingDateTime: DateTime.fromISO("2024-01-21T08:00:00"),
            endingDateTime: DateTime.fromISO("2024-01-21T09:00:00"),
            location: 'Location1',
            changeable: true,
            availableAlongside: false,
        }
    ];

    const availableTimeSlots = findAvailableTimeSlots(
        {
            date: DateTime.fromISO("2024-01-21T08:00:00"),
            currentElements: calendarElements,
            plannedElements: []
        },
        {
            startTime: DateTime.fromISO("2024-01-21T06:00:00"),
            endTime: DateTime.fromISO("2024-01-21T21:00:00"),
        }
    );

    expect(availableTimeSlots.length).toEqual(2);
    expect(availableTimeSlots[0].start).toEqual(DateTime.fromISO("2024-01-21T06:00:00"));
    expect(availableTimeSlots[0].end).toEqual(DateTime.fromISO("2024-01-21T08:00:00"));
    expect(availableTimeSlots[1].start).toEqual(DateTime.fromISO("2024-01-21T09:00:00"));
    expect(availableTimeSlots[1].end).toEqual(DateTime.fromISO("2024-01-21T21:00:00"));
});

test('Should find available one slot when day occupied from the beginning', () => {
    const calendarElements: CurrentCalendarElement[] = [
        {
            eventId: 1,
            startingDateTime: DateTime.fromISO("2024-01-21T08:00:00"),
            endingDateTime: DateTime.fromISO("2024-01-21T09:00:00"),
            location: 'Location1',
            changeable: true,
            availableAlongside: false,
        }
    ];

    const availableTimeSlots = findAvailableTimeSlots(
        {
            date: DateTime.fromISO("2024-01-21T08:00:00"),
            currentElements: calendarElements,
            plannedElements: []
        },
        {
            startTime: DateTime.fromISO("2024-01-21T08:00:00"),
            endTime: DateTime.fromISO("2024-01-21T21:00:00"),
        }
    );

    expect(availableTimeSlots.length).toEqual(1);
    expect(availableTimeSlots[0].start).toEqual(DateTime.fromISO("2024-01-21T09:00:00"));
    expect(availableTimeSlots[0].end).toEqual(DateTime.fromISO("2024-01-21T21:00:00"));
});

test('Should find available one slot when day occupied until the end', () => {
    const calendarElements: CurrentCalendarElement[] = [
        {
            eventId: 1,
            startingDateTime: DateTime.fromISO("2024-01-21T10:00:00"),
            endingDateTime: DateTime.fromISO("2024-01-21T21:00:00"),
            location: 'Location1',
            changeable: true,
            availableAlongside: false,
        }
    ];

    const availableTimeSlots = findAvailableTimeSlots(
        {
            date: DateTime.fromISO("2024-01-21T08:00:00"),
            currentElements: calendarElements,
            plannedElements: []
        },
        {
            startTime: DateTime.fromISO("2024-01-21T08:00:00"),
            endTime: DateTime.fromISO("2024-01-21T21:00:00"),
        }
    );

    expect(availableTimeSlots.length).toEqual(1);
    expect(availableTimeSlots[0].start).toEqual(DateTime.fromISO("2024-01-21T08:00:00"));
    expect(availableTimeSlots[0].end).toEqual(DateTime.fromISO("2024-01-21T10:00:00"));
});


test('Should find some slots of new calendar', () => {
    const currentCalendar: CurrentCalendarElement[] = [
        {
            eventId: 1,
            startingDateTime: DateTime.fromISO('2024-01-21T08:00:00'),
            endingDateTime: DateTime.fromISO('2024-01-21T12:00:00'),
            location: 'Office A',
            changeable: true,
            availableAlongside: false
        }
    ];

    const newCalendarElements: NewCalendarElement[] = [
        {
            name: 'Meeting',
            index: 1,
            durationTime: 55,
            location: 'Conference Room B',
        }
    ];

    const dayPreferencesConfig: DayPreferencesConfig = {
        startTime: DateTime.fromISO('2024-01-21T08:00:00'),
        endTime: DateTime.fromISO('2024-01-21T21:00:00'),
    };

    const generalConstraints: GeneralConstraints = {
        minStartDate: DateTime.fromISO('2024-01-21T00:00:00'),
        maxEndDate: DateTime.fromISO('2024-01-21T23:59:00'),
        breakBetweenElements: 10,
        changingAllowed: true,
    };

    const result = organizeCalendar(currentCalendar, newCalendarElements, dayPreferencesConfig, generalConstraints);
    expect(result.newEventsToBeAdded.length).toEqual(1);
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
  "dayPreferencesConfig": {
    "startTime": "2024-01-21T08:00:00",
    "endTime": "2024-01-21T17:00:00"
  },
  "generalConstraints": {
    "minStartDate": "2024-01-21T08:00:00",
    "maxEndDate": "2024-01-21T17:00:00",
    "breakBetweenElements": 1,
    "changingAllowed": true
  }
}`;

    const result = handler({httpMethod: "POST", body: bodyReq}, undefined);
});




