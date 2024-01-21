const {RecursiveCharacterTextSplitter} = require("langchain/text_splitter");
exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
            headers: { 'Content-Type': 'application/json' },
        };
    }

    const body = JSON.parse(event.body);

    const text = body.content;
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: body.chunkSize ?? 1500,
        chunkOverlap: body.chunkOverlap ?? 100,
    });

    const docs = await splitter.createDocuments([text]);

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Success!", data: docs }),
        headers: { 'Content-Type': 'application/json' },
    };
};