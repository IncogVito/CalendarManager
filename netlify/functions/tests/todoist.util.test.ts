import {LocalDate, LocalDateTime} from "@js-joda/core";
import {createDueFilterBetweenDates} from "../../helper/todoist.util";

test('Should correctly transform into url', () => {
    const givenDateFrom =  LocalDate.parse("2024-02-21");
    const givenDateTo =  LocalDate.parse("2024-02-26");

    const createdUrl = createDueFilterBetweenDates(givenDateFrom, givenDateTo);
    expect(createdUrl).toEqual("due%20after%3A%202024-02-21%200am%20%26%20due%20before%3A%202024-02-27%2000am");
})