import express from 'express';
import { db } from './db/db.js';
import { matches } from './db/schema.js';

const app = express();
const PORT = 8000;

// JSON middleware
app.use(express.json());

// GET route returning a short message and matches database info
app.get('/', async (req, res) => {
  try {
    // Attempt to select from matches (if table exists)
    const activeMatches = await db.select().from(matches);
    res.json({
      message: 'Hello from the Express server integrated with Drizzle ORM!',
      matchesCount: activeMatches.length,
      matches: activeMatches,
    });
  } catch (error) {
    res.json({
      message: 'Hello from the Express server!',
      dbError: 'Could not fetch matches. Have you run migrations? ' + error.message,
    });
  }
});

// Start the server and log the URL
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
