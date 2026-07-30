import { query } from "../../db/db.js";
import { BadRequestError, NotFoundError } from "../../lib/errors.js";
import { getThreadById } from "./threads.repository.js";
export async function listRepliesForThread(threadId) {
    if (!Number.isInteger(threadId) || threadId <= 0) {
        throw new BadRequestError("Invalid thread Id");
    }
    const result = await query(`
        SELECT
          r.id,
          r.body,
          r.created_at,
          u.display_name AS author_display_name,
          u.handle AS author_handle
        FROM replies r
        JOIN users u ON u.id = r.author_user_id
        WHERE r.thread_id = $1
        ORDER BY r.created_at ASC
        `, [threadId]);
    return result.rows.map((row) => ({
        id: row.id,
        body: row.body,
        createdAt: row.created_at,
        author: {
            displayName: row.author_display_name ?? null,
            handle: row.author_handle ?? null,
        },
    }));
}
export async function createReply(params) {
    const { body, threadId, authorUserId } = params;
    const result = await query(`
        INSERT INTO replies (thread_id, author_user_id, body)
        VALUES ($1, $2, $3)
        RETURNING id, created_at
        `, [threadId, authorUserId, body]);
    const row = result.rows[0];
    const fullRes = await query(`
        SELECT 
          r.id,
          r.body,
          r.created_at,
          u.display_name AS author_display_name,
          u.handle AS author_handle
        FROM replies r
        JOIN users u ON u.id = r.author_user_id
        WHERE r.id = $1
        LIMIT 1
        `, [row.id]);
    const replyRow = fullRes.rows[0];
    return {
        id: replyRow.id,
        body: replyRow.body,
        createdAt: replyRow.created_at,
        author: {
            displayName: replyRow.author_display_name ?? null,
            handle: replyRow.author_handle ?? null,
        },
    };
}
export async function findReplyAuthor(replyId) {
    const result = await query(`
         SELECT author_user_id
         FROM replies
         WHERE id = $1
         LIMIT 1
         `, [replyId]);
    const row = result.rows[0];
    if (!row) {
        throw new NotFoundError("Reply not found!!!");
    }
    return row.author_user_id;
}
export async function deleteReplyById(replyId) {
    await query(`
        DELETE FROM replies
        WHERE id = $1
        `, [replyId]);
}
export async function likeThreadOnce(params) {
    const { threadId, userId } = params;
    await query(`
    INSERT INTO thread_reactions (thread_id, user_id)
    VALUES ($1, $2)
    ON CONFLICT (thread_id, user_id) DO NOTHING
    `, [threadId, userId]);
}
export async function removeThreadOnce(params) {
    const { threadId, userId } = params;
    await query(`
            DELETE FROM thread_reactions
            WHERE thread_id = $1 AND user_id = $2
            `, [threadId, userId]);
}
export async function getThreadDetailsWithCounts(params) {
    const { threadId, viewerUserId } = params;
    const thread = await getThreadById(threadId);
    console.log(thread, "threadcheck");
    const likeResult = await query(`
        SELECT COUNT(*)::int AS count
        FROM thread_reactions
        WHERE thread_id = $1
        `, [threadId]);
    const likeCount = likeResult.rows[0]?.count ?? 0;
    const replyResult = await query(`
        SELECT COUNT(*)::int AS count
        FROM replies
        WHERE thread_id = $1
        `, [threadId]);
    const replyCount = replyResult.rows[0]?.count ?? 0;
    let viewerHasLikedThisPostOrNot = false;
    if (viewerUserId) {
        const viewerResult = await query(`
                    SELECT 1
                    FROM thread_reactions
                    WHERE thread_id = $1 AND user_id = $2
                    LIMIT 1
                    `, [threadId, viewerUserId]);
        const count = viewerResult.rowCount ?? 0;
        if (count > 0) {
            viewerHasLikedThisPostOrNot = true;
        }
    }
    return {
        ...thread,
        likeCount,
        replyCount,
        viewerHasLikedThisPostOrNot,
    };
}
