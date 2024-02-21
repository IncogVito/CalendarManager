import {
    CreatedEvent,
    DayPreferencesConfig,
    ExistingEvent,
    GeneralConstraints,
    NewCalendarElement,
    TimeSlot,
    UpdatedEvent
} from "../model/calendar.model";
import {PlannedDay, PlanningResult} from "../model/calendar-algorithm.model";
import {findAvailableTimeSlots, groupEventsByDays} from "../helper/organizer.helper";
import {CalendarRequest} from "../model/calendar-request.model";
import {parseCurrentCalendar, parseRequest} from "../helper/organizer.parser";
import {DateTimeFormatter, LocalDate, LocalDateTime, LocalTime} from "@js-joda/core";
import {drop, first, isEmpty} from "lodash";
import {TodoistEvent} from "../model/todoist.calendar.model";
import {TodoistApi} from "@doist/todoist-api-typescript";
import {createDueFilterBetweenDates} from "../helper/todoist.util";

export const handler = async (event: any, context: any) => {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
            headers: {'Content-Type': 'application/json'},
        };
    }


    const {startDate, endDate} = event.queryStringParameters;
    if (!startDate || !endDate) {
        return {
            statusCode: 400,
            body: 'Both startDate and endDate parameters are required',
            headers: {'Content-Type': 'application/json'},
        };
    }

    const api = new TodoistApi(process.env.TODOIST_API_KEY)
    const todoistFilter = createDueFilterBetweenDates(startDate, endDate);
    const tasks: TodoistEvent[] = await api.getTasks({filter: todoistFilter});

    return {
        statusCode: 200,
        body: JSON.stringify({
            tasks: tasks
        }),
        headers: {'Content-Type': 'application/json'},
    };

};
