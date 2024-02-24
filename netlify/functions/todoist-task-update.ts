import {TodoistApi} from "@doist/todoist-api-typescript";
import {TodoistUpdateModel} from "../model/todoist.update.model";

export const handler = async (event: any, context: any) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
            headers: {'Content-Type': 'application/json'},
        };
    }

    const api = new TodoistApi(process.env.TODOIST_API_KEY)

    if (!event.body) {
        throw new Error('Request body is missing.');
    }

    let requestBody: TodoistUpdateModel[];
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

    const updatedEvents = [];
    for (const updateModel of requestBody) {
        const result = await api.updateTask(String(updateModel.eventId),
            {
                content: updateModel.content,
                dueDatetime: updateModel.dateTimeFrom,
                duration: updateModel.duration,
                durationUnit: "minute"
            });

        updatedEvents.push(result.id);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            updated: requestBody
        }),
        headers: {'Content-Type': 'application/json'},
    };

};
