import {CalendarRequest} from "../model/calendar-request.model";
import {parseRequest} from "../helper/organizer.parser";
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
    const requestBody: CalendarRequest = JSON.parse(event.body);
    const parsedInput = parseRequest(requestBody);

    const organizationResult = organizeCalendar(
        parsedInput.currentCalendar,
        parsedInput.newCalendarElements,
        parsedInput.generalConstraints
    );

    return {
        statusCode: 200,
        body: JSON.stringify(organizationResult),
        headers: {'Content-Type': 'application/json'},
    };

};
