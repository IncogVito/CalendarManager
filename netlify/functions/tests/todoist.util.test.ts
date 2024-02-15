import {LocalDate} from "@js-joda/core";
import {createDueFilterBetweenDates} from "../../helper/todoist.util";

test('Should correctly transform into url', () => {
    const givenDateFrom =  LocalDate.parse("2024-02-21");
    const givenDateTo =  LocalDate.parse("2024-02-26");

    const createdUrl = createDueFilterBetweenDates(givenDateFrom, givenDateTo);
    expect(createdUrl).toEqual("due after: 2024-02-21 0am & due before: 2024-02-27 0am");
})