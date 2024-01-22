import {DateTime} from "luxon";


export function combineDateAndTime(date: DateTime, time: DateTime) {
    return DateTime.local(
        date.year, date.month, date.day, time.hour, time.minute, time.second
    )
}