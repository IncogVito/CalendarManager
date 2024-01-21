export const handler = async (event: any, context: any) => {
    if (event.httpMethod === 'GET') {
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "First!", data: "Response" }),
            headers: { 'Content-Type': 'application/json' },
        };
    }
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
            headers: { 'Content-Type': 'application/json' },
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Success!", data: "WORKS" }),
        headers: { 'Content-Type': 'application/json' },
    };
};