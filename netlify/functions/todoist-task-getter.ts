import {LocalDate} from "@js-joda/core";
import {TodoistEvent} from "../model/todoist.calendar.model";
import {TodoistApi} from "@doist/todoist-api-typescript";
import {createDueFilterBetweenDates} from "../helper/todoist.util";
import {parseCurrentCalendar} from "../helper/organizer.parser";
import {ExistingEvent} from "../model/calendar.model";

export const handler = async (event: any, context: any) => {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
            headers: {'Content-Type': 'application/json'},
        };
    }

    const {startDate, endDate, simplifiedResponse} = event.queryStringParameters;
    if (!startDate || !endDate) {
        return {
            statusCode: 400,
            body: 'Both startDate and endDate parameters are required',
            headers: {'Content-Type': 'application/json'},
        };
    }

    const parsedStartDate = LocalDate.parse(startDate);
    const parsedEndDate = LocalDate.parse(endDate);

    const api = new TodoistApi(process.env.TODOIST_API_KEY)
    const todoistFilter = createDueFilterBetweenDates(parsedStartDate, parsedEndDate);
    const tasks: TodoistEvent[] = await api.getTasks({filter: todoistFilter});
    const existingElements: ExistingEvent[] = parseCurrentCalendar(tasks);

    if (simplifiedResponse) {

    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            tasks: existingElements
        }),
        headers: {'Content-Type': 'application/json'},
    };

};
