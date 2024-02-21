import {DateTimeFormatter, LocalDate} from "@js-joda/core";

export function createDueFilterBetweenDates(dateFrom: LocalDate, dateTo: LocalDate) {
    return `due after: ${dateFrom.format(DateTimeFormatter.ISO_LOCAL_DATE)} 0am & due before: ${dateTo.plusDays(1).format(DateTimeFormatter.ISO_LOCAL_DATE)} 0am`
}

export function filterObject<T>(obj: T, allowedFields: (keyof T)[]): Partial<T> {
    const filteredObject: Partial<T> = {};
    Object.keys(obj).forEach(key => {
        if (allowedFields.includes(key as keyof T)) {
            filteredObject[key as keyof T] = obj[key as keyof T];
        }
    });
    return filteredObject;
}