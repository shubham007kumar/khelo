import express from 'express';

const app = express();
const PORT = 8000;

// JSON middleware
app.use(express.json());

// GET route returning a short message
app.get('/', (req, res) => {
  res.json({ message: 'Hello from the Express server!' });
});

// Start the server and log the URL
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
