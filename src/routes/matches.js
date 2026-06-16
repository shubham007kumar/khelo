import { Router } from "express";
import { createMatchSchema, listMatchsQuerySchema } from "../validation/matchs";
import { db } from "../db/db";
import { matches } from "../db/schema";
import { getMatchStatus } from "../utils/match-status";
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
        const data = await db.select().from(matches).orderBy(desc(matches.createdAt)).limit(parsed.data.limit)
        return res.status(200).json({
            data
        })
    } catch (err) {
        return res.status(500).json({
            error: "Failed to list matches",
            details: JSON.stringify(err)
        })
    }
})

matchRouter.post("/", async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body);
    const { data: { startTime, endTime, homeScore, awayScore } } = parsed
    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid payload",
            details: JSON.stringify(parsed.error)
        })

    }
    try {
        const [event] = await db.insert(matches).values({
            ...parsed.data,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            homeScore: homeScore ?? 0,
            awayScore: awayScore ?? 0,
            status: getMatchStatus(startTime, endTime)
        }).returning();

        res.status(200).json({
            data: event
        })
    } catch (err) {
        return res.status(500).json({
            error: "Failded to create match",
            details: JSON.stringify(err)
        })
    }
})
