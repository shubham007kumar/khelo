import { z } from 'zod';

// Helper to validate ISO Date string formats
const isIsoDateString = (val) => {
  // Regex to match ISO 8601 formats (e.g. YYYY-MM-DD, YYYY-MM-DDTHH:mm:ssZ, YYYY-MM-DDTHH:mm:ss.sssZ, etc.)
  const isoRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,})?(Z|[+-]\d{2}:?\d{2})?)?$/;
  return isoRegex.test(val) && !isNaN(Date.parse(val));
};

// 1. listMatchsQuerySchema: validates optional limit as coerced positive integer max 100
export const listMatchsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

// 2. Match_status constant with key-value pairs in lowercase
export const Match_status = {
  scheduled: 'schedules',
  live: 'lives',
  finished: 'finisned',
};

// 3. matchIdParamSchema: validates required ID as coerced positive integer
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// 4. createMatchSchema with validations and refinements
export const createMatchSchema = z.object({
  sport: z.string().trim().min(1, 'Sport is required and cannot be empty'),
  homeTeam: z.string().trim().min(1, 'Home team is required and cannot be empty'),
  awayTeam: z.string().trim().min(1, 'Away team is required and cannot be empty'),
  startTime: z.string().refine(isIsoDateString, {
    message: 'startTime must be a valid ISO date string',
  }),
  endTime: z.string().refine(isIsoDateString, {
    message: 'endTime must be a valid ISO date string',
  }),
  homeScore: z.coerce.number().int().nonnegative().optional(),
  awayScore: z.coerce.number().int().nonnegative().optional(),
})
.superRefine((data, ctx) => {
  const start = Date.parse(data.startTime);
  const end = Date.parse(data.endTime);
  
  if (!isNaN(start) && !isNaN(end) && end <= start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'endTime must be chronologically after startTime',
      path: ['endTime'],
    });
  }
});

// 5. updateScoreSchema: requires homeScore and awayScore as coerced non-negative integers
export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
});
