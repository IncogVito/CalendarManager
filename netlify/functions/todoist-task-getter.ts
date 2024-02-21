import {DateTimeFormatter, LocalDate, LocalDateTime, LocalTime} from "@js-joda/core";
import {drop, first, isEmpty} from "lodash";
import {TodoistEvent} from "../model/todoist.calendar.model";
import {TodoistApi} from "@doist/todoist-api-typescript";
import {createDueFilterBetweenDates, filterObject} from "../helper/todoist.util";

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


    const parsedStartDate = LocalDate.parse(startDate);
    const parsedEndDate = LocalDate.parse(endDate);

    const api = new TodoistApi(process.env.TODOIST_API_KEY)
    const todoistFilter = createDueFilterBetweenDates(parsedStartDate, parsedEndDate);
    const tasks: TodoistEvent[] = await api.getTasks({filter: todoistFilter});

    return {
        statusCode: 200,
        body: JSON.stringify({
            tasks: tasks.map(singleElem => filterObject(singleElem, ["content", "due", "duration"]))
        }),
        headers: {'Content-Type': 'application/json'},
    };

};
