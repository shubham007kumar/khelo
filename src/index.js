import express from 'express';
import { matchRouter } from "./routes/matches.js";
import http from 'http'
import { initWsServer } from './ws/server.js';

const PORT = 8000;
const app = express();
const server = http.createServer(app)
const {broadcastMatchUpdate} = initWsServer(server)

// JSON middleware
app.use(express.json());

// GET route returning a short message
app.get('/', (req, res) => {
    res.json({ message: 'Hello from the Express server!' });
});

app.use('/matches', matchRouter)
app.locals.broadcastMatchUpdate = broadcastMatchUpdate
// Start the server and log the URL
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
