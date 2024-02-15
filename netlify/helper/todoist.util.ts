import {DateTimeFormatter, LocalDate} from "@js-joda/core";

export function createDueFilterBetweenDates(dateFrom: LocalDate, dateTo: LocalDate) {
    return `due%20after%3A%20${dateFrom.format(DateTimeFormatter.ISO_LOCAL_DATE)}%200am%20%26%20due%20before%3A%20${dateTo.plusDays(1).format(DateTimeFormatter.ISO_LOCAL_DATE)}%2000am`
}