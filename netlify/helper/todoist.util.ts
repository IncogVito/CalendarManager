import {DateTimeFormatter, LocalDate} from "@js-joda/core";

export function createDueFilterBetweenDates(dateFrom: LocalDate, dateTo: LocalDate) {
    return `due after: ${dateFrom.format(DateTimeFormatter.ISO_LOCAL_DATE)} 0am & due before: ${dateTo.plusDays(1).format(DateTimeFormatter.ISO_LOCAL_DATE)} 0am`
}