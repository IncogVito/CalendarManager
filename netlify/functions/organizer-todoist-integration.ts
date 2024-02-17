import {TodoistApi} from '@doist/todoist-api-typescript'
import {CalendarRequest} from "../model/calendar-request.model";
import {parseCurrentCalendar, parseRequest} from "../helper/organizer.parser";
import {createDueFilterBetweenDates} from "../helper/todoist.util";
import {TodoistEvent} from "../model/todoist.calendar.model";
import {organizeCalendar} from "./organizer";

export const handler = async (event: any, context: any) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
            headers: {'Content-Type': 'application/json'},
        };
    }

    if (!event.body) {
        throw new Error('Request body is missing.');
    }

    const api = new TodoistApi(process.env.TODOIST_API_KEY)

    let requestBody: CalendarRequest;
    try {
        requestBody = JSON.parse(event.body);
    } catch (e) {
        console.error("Invalid JSON: " + event.body);
        return {
            statusCode: 400,
            body: "Couldn't parse json. Error: " + e,
            headers: {'Content-Type': 'application/json'},
        };
    }

    const parsedInput = parseRequest(requestBody);

    const todoistFilter = createDueFilterBetweenDates(
        parsedInput.generalConstraints.minStartDate,
        parsedInput.generalConstraints.maxEndDate
    );

    const tasks: TodoistEvent[] = await api.getTasks({filter: todoistFilter});
    console.log(`Found ${tasks?.length} tasks`);
    const parsedCurrentCalendar = parseCurrentCalendar(tasks);

    const organizationResult = organizeCalendar(
        parsedCurrentCalendar,
        parsedInput.newCalendarElements,
        parsedInput.generalConstraints
    );

    return {
        statusCode: 200,
        body: JSON.stringify(organizationResult),
        headers: {'Content-Type': 'application/json'},
    };
}
