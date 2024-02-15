import {DateTimeFormatter, LocalDate, LocalDateTime, ZonedDateTime, ZoneId} from "@js-joda/core";
import {createDueFilterBetweenDates} from "../../helper/todoist.util";
import '@js-joda/timezone'


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