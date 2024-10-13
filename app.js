// Import required libraries
const express = require('express');
const { WebSocketServer } = require('ws');
const { Configuration, OpenAIApi } = require('openai');

// Initialize an Express application
const app = express();

// Set the port to the value provided by Azure or default to 3000 for local development
const port = process.env.PORT || 3000;

// Set up OpenAI API configuration
const openai = new OpenAIApi(new Configuration({
    apiKey: process.env.OPENAI_API_KEY,  // Make sure to set this in your Azure App Service environment variables
}));

// Define a basic route for the homepage
app.get('/', (req, res) => {
    res.send('Hello, World! WebSocket with OpenAI is active.');
});

// Start the server and listen on the specified port
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Initialize a WebSocket server
const wss = new WebSocketServer({ server });

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');

    // Listen for messages from the client
    ws.on('message', async (message) => {
        console.log('Received message:', message);

        try {
            // Make a request to OpenAI API to process the message
            const response = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo',  // You can replace this with gpt-4 or another model
                messages: [{ role: 'user', content: message.toString() }],
            });

            // Send the OpenAI API response back to the client
            const aiResponse = response.data.choices[0].message.content;
            ws.send(aiResponse);

        } catch (error) {
            console.error('Error processing OpenAI request:', error);
            ws.send('Error communicating with OpenAI API.');
        }
    });

    // Handle WebSocket closure
    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});


