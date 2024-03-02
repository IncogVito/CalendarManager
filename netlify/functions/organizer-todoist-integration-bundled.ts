import {TodoistApi} from '@doist/todoist-api-typescript'
import {CalendarRequestBundled} from "../model/calendar-request.model";
import {
    createNewCalendarElements,
    parseCurrentCalendar,
    parseGeneralConstraints
} from "../helper/organizer.parser";
import {createDueFilterBetweenDates} from "../helper/todoist.util";
import {TodoistEvent} from "../model/todoist.calendar.model";
import {organizeCalendar} from "./organizer-v2";

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

    let requestBody: CalendarRequestBundled;
    try {
        requestBody = JSON.parse(event.body);
    } catch (e) {
        console.error("Invalid JSON: " + event.body);
        return {
            statusCode: 400,
            body: `{"error": "Couldn't parse json. Error: " ${e}, "invalidJson": ${event.body}`,
            headers: {'Content-Type': 'application/json'},
        };
    }

    const newCalendarElement = createNewCalendarElements(requestBody.bundledPlan);
    const generalConstraints = parseGeneralConstraints(requestBody.generalConstraints);

    const todoistFilter = createDueFilterBetweenDates(
        generalConstraints.minStartDate,
        generalConstraints.maxEndDate
    );

    const tasks: TodoistEvent[] = await api.getTasks({filter: todoistFilter});
    console.log(`Found ${tasks?.length} tasks`);
    const parsedCurrentCalendar = parseCurrentCalendar(tasks);

    const organizationResult = organizeCalendar(
        parsedCurrentCalendar,
        newCalendarElement,
        generalConstraints
    );

    return {
        statusCode: 200,
        body: JSON.stringify(organizationResult),
        headers: {'Content-Type': 'application/json'},
    };
}
