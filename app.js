const express = require('express');
const { WebPubSubServiceClient } = require('@azure/web-pubsub-client');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Web PubSub Service connection string and Hub name
const pubSubConnectionString = process.env.WEB_PUBSUB_CONNECTION_STRING;
const hubName = 'chatHub';
const serviceClient = new WebPubSubServiceClient(pubSubConnectionString, hubName);

// Function to send a message to OpenAI's real-time API
async function sendToOpenAI(message) {
    try {
        const response = await axios.post('https://api.openai.com/v1/completions', {
            prompt: message,
            max_tokens: 50
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error with OpenAI API:', error.message);
        return { error: 'OpenAI API error' };
    }
}

// Handle WebSocket connections
app.post('/api/messages', express.json(), async (req, res) => {
    const { message } = req.body;
    console.log(`Received: ${message}`);

    // Send the message to OpenAI and get a response
    const aiResponse = await sendToOpenAI(message);

    // Broadcast the response to all WebSocket clients connected to the hub
    await serviceClient.sendToAll({
        data: aiResponse
    });
    
    res.json({ status: 'Message broadcasted', aiResponse });
});

const port = process.env.PORT || 3000;  // Use the port Azure assigns or default to 3000 locally
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


