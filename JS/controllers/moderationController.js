// controllers/moderationController.js
const db = require("../config/database");

exports.add = async (req, res) => {
    const { stream_id, author, text } = req.body;

    try {
        await db.execute(
            `INSERT INTO chat_messages (stream_id, author_name, text, is_approved)
             VALUES (?, ?, ?, 0)`,
            [stream_id, author, text]
        );

        res.json({ ok: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Cannot add message" });
    }
};

exports.list = async (req, res) => {
    const { stream_id } = req.query;

    try {
        const [rows] = await db.execute(
            `SELECT message_id AS id, author_name AS author, text, created_at AS timestamp 
             FROM chat_messages 
             WHERE stream_id=? AND is_approved=0`,
            [stream_id]
        );

        res.json(rows);

    } catch (err) {
        res.status(500).json({ error: "Cannot fetch moderation queue" });
    }
};

exports.approve = async (req, res) => {
    const { id } = req.params;

    try {
        await db.execute(
            `UPDATE chat_messages SET is_approved=1 WHERE message_id=?`,
            [id]
        );

        res.json({ ok: true });

    } catch (err) {
        res.status(500).json({ error: "Cannot approve" });
    }
};

exports.reject = async (req, res) => {
    const { id } = req.params;

    try {
        await db.execute(
            `DELETE FROM chat_messages WHERE message_id=?`,
            [id]
        );

        res.json({ ok: true });

    } catch (err) {
        res.status(500).json({ error: "Cannot reject" });
    }
};
