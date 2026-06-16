import { db } from '../db/db.js';
import { matches } from '../db/schema.js';
import { eq } from 'drizzle-orm';

/**
 * JS Enum representation for Match Statuses, aligning with PostgreSQL database enums.
 */
export const MatchStatus = Object.freeze({
  SCHEDULED: 'schedules',
  LIVE: 'lives',
  FINISHED: 'finisned',
});

const VALID_STATUSES = Object.values(MatchStatus);

/**
 * Determines the match status based on startTime, endTime, and a reference time.
 * 
 * Rules:
 * - If reference time (now) is before startTime -> MatchStatus.SCHEDULED ('schedules')
 * - If reference time (now) is between startTime and endTime (inclusive) -> MatchStatus.LIVE ('lives')
 * - If reference time (now) is after endTime -> MatchStatus.FINISHED ('finisned')
 * 
 * @param {string|Date} startTime - The match start time.
 * @param {string|Date} endTime - The match end time.
 * @param {string|Date} [now] - The reference time (defaults to the current date/time).
 * @returns {string} The determined status: 'schedules', 'lives', or 'finisned'.
 */
export function getMatchStatus(startTime, endTime, now = new Date()) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const current = new Date(now);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || isNaN(current.getTime())) {
    throw new Error('Invalid date format provided to getMatchStatus');
  }

  if (current < start) {
    return MatchStatus.SCHEDULED;
  } else if (current <= end) {
    return MatchStatus.LIVE;
  } else {
    return MatchStatus.FINISHED;
  }
}

/**
 * Retrieves the status of a specific match by its ID from the database.
 * @param {number} matchId - The ID of the match.
 * @returns {Promise<string|null>} The match status or null if not found.
 */
export async function getMatchStatusById(matchId) {
  const idNum = Number(matchId);
  if (!matchId || isNaN(idNum) || !Number.isInteger(idNum) || idNum <= 0) {
    throw new Error('A valid positive integer match ID is required');
  }

  try {
    const [match] = await db
      .select({ status: matches.status })
      .from(matches)
      .where(eq(matches.id, Number(matchId)))
      .limit(1);

    return match ? match.status : null;
  } catch (error) {
    console.error(`[getMatchStatusById] Error fetching status for match ${matchId}:`, error);
    throw error;
  }
}

/**
 * Updates/syncs the status of a specific match in the database.
 * @param {number} matchId - The ID of the match.
 * @param {string} status - The new status ('schedules', 'lives', or 'finisned').
 * @returns {Promise<object|null>} The updated match record, or null if not found.
 */
export async function syncMatchStatus(matchId, status) {
  const idNum = Number(matchId);
  if (!matchId || isNaN(idNum) || !Number.isInteger(idNum) || idNum <= 0) {
    throw new Error('A valid positive integer match ID is required');
  }

  if (!status || !VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status: "${status}". Must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  try {
    const [updatedMatch] = await db
      .update(matches)
      .set({ status })
      .where(eq(matches.id, Number(matchId)))
      .returning();

    return updatedMatch || null;
  } catch (error) {
    console.error(`[syncMatchStatus] Error updating status for match ${matchId} to ${status}:`, error);
    throw error;
  }
}
