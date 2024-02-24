import {DateTimeFormatter, LocalDate, LocalDateTime, ZonedDateTime, ZoneId} from "@js-joda/core";
import {
    convertExistingEventsToSimplifiedString,
    createDueFilterBetweenDates,
    filterObject
} from "../../helper/todoist.util";
import '@js-joda/timezone'
import {TodoistEvent} from "../../model/todoist.calendar.model";
import {ExistingEvent} from "../../model/calendar.model";


test('Should correctly transform into url', () => {
    const givenDateFrom = LocalDate.parse("2024-02-21");
    const givenDateTo = LocalDate.parse("2024-02-26");

    const createdUrl = createDueFilterBetweenDates(givenDateFrom, givenDateTo);
    expect(createdUrl).toEqual("due after: 2024-02-21 0am & due before: 2024-02-27 0am");
})

test("Should parse datetime zoned", () => {
    const dateTime = "2024-02-15T05:00:00Z";
    const parsedDateTime = LocalDateTime.parse(dateTime, DateTimeFormatter.ISO_ZONED_DATE_TIME);
    expect(parsedDateTime).toBeDefined()
});

test("Should parse datetime zoned with respect to zone", () => {

    const dateTime = "2024-02-15T05:00:00Z";
    const timezone = "Australia/Adelaide";

    const zonedDateTime = ZonedDateTime.parse(dateTime);
    const zone = ZoneId.of(timezone);
    const convertedTime = zonedDateTime.withZoneSameInstant(zone);
    const localDateTime = convertedTime.toLocalDateTime();
    expect(localDateTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)).toEqual("2024-02-15T15:30:00");

});

test("JSON TEST", () => {

    const text = `{   "currentCalendar": [],   "newCalendarElements": [     {       "name": "Nauka Hiszpańskiego",       "index": 1,       "durationTime": 45,       "location": "Mieszkanie Lwowska 2"     },     {       "name": "AI Planner",       "index": 2,       "durationTime": 75,       "location": "MAC Cafe"     }   ],     "generalConstraints": {     "minStartDate": "2024-02-17",     "maxEndDate": "2024-02-24",     "breakBetweenElements": 10,     "preferencesStartTime": "17:00:00",     "preferencesEndTime": "21:00:00",     "changingAllowed": "true"  } }`;
    const requestBody = JSON.parse(text);

    expect(requestBody).toBeDefined()

});


test("Should filter object", () => {

    const todoistEvent: TodoistEvent = {
        assigneeId: "1",
        assignerId: "undefined",
        commentCount: 0,
        content: "1",
        createdAt: "1",
        creatorId: "1",
        description: "1",
        duration: undefined,
        id: "",
        isCompleted: false,
        labels: [],
        order: 0,
        parentId: undefined,
        priority: 0,
        projectId: "",
        sectionId: undefined,
        url: "",
        due: {
            date: "string",
            timezone: "string",
            string: "string",
            lang: "string",
            isRecurring: true,
            datetime: "string"
        }

    }
    const filteredElem = filterObject(todoistEvent, ['order', 'due']);

    expect(filteredElem.due.date).toBeDefined()
    expect(filteredElem.order).toBeDefined()
    expect(filteredElem.description).toBeUndefined()
    expect(filteredElem.creatorId).toBeUndefined()
});



test("Should convert existing events into simplified string", () => {

    const events: ExistingEvent[] = [
        {
            eventId: 1,
            content: 'Breakfast',
            startingDateTime: LocalDateTime.parse('2024-02-24T08:00:00'),
            endingDateTime: LocalDateTime.parse('2024-02-24T08:30:00'),
            location: '',
            changeable: true,
            availableAlongside: true
        },
        {
            eventId: 2,
            content: 'Breakfast 2',
            startingDateTime: LocalDateTime.parse('2024-02-25T08:00:00'),
            endingDateTime: LocalDateTime.parse('2024-02-25T08:30:00'),
            location: '',
            changeable: true,
            availableAlongside: true
        }
        ];
    const simplifiedResponse = convertExistingEventsToSimplifiedString(events);

    expect(simplifiedResponse).toEqual(
        "2024-02-24\n08:00-08:30 (30 mins)\nBreakfast\nEventId: 1\n\n2024-02-25\n08:00-08:30 (30 mins)\nBreakfast 2\nEventId: 2\n\n"
    )
});

