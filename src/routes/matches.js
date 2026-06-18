import { Router } from "express";
import { createMatchSchema, listMatchsQuerySchema } from "../validation/matchs.js";
import { db } from "../db/db.js";
import { matches } from "../db/schema.js";
import { getMatchStatus } from "../utils/match-status.js";
import { desc } from "drizzle-orm";

export const matchRouter = Router()

matchRouter.get("/", async (req, res) => {
    const parsed = listMatchsQuerySchema.safeParse(req.query);

    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid query",
            details: JSON.stringify(parsed.error)
        })

    }
    try {
        const limit = parsed.data.limit ?? 50;
        const data = await db.select().from(matches).orderBy(desc(matches.createdAt)).limit(limit);
        return res.status(200).json({
            data
        });
    } catch (err) {
        console.error("Failed to list matches:", err);
        return res.status(500).json({
            error: "Failed to list matches"
        });
    }
})

matchRouter.post("/", async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid payload",
            details: JSON.stringify(parsed.error)
        })

    }
    const { startTime, endTime, homeScore, awayScore } = parsed.data;
    try {
        const [event] = await db.insert(matches).values({
            ...parsed.data,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            homeScore: homeScore ?? 0,
            awayScore: awayScore ?? 0,
            status: getMatchStatus(startTime, endTime)
        }).returning();

        if (res.locals?.broadcastMatchUpdate) {
            res.locals.broadcastMatchUpdate(event)
        }

        res.status(200).json({
            data: event
        })
    } catch (err) {
        console.error("Failed to create match:", err);
        return res.status(500).json({
            error: "Failded to create match"
        });
    }
})
