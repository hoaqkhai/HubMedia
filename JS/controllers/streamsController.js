// controllers/streamsController.js
const db = require("../config/database");

// START STREAM
exports.startStream = async (req, res) => {
    try {
        const { user_id, title } = req.body;

        const [result] = await db.execute(
            `INSERT INTO streams (user_id, title, is_live, started_at)
             VALUES (?, ?, 1, NOW())`,
            [user_id, title || "Untitled Stream"]
        );

        return res.json({
            status: "ok",
            stream_id: result.insertId,
            message: "Stream started!"
        });

    } catch (err) {
        console.error("startStream error:", err);
        res.status(500).json({ status: "error", message: err.message });
    }
};

// END STREAM
exports.endStream = async (req, res) => {
    try {
        const { stream_id } = req.body;

        await db.execute(
            `UPDATE streams SET is_live=0, ended_at=NOW() WHERE stream_id=?`,
            [stream_id]
        );

        return res.json({ status: "ok", message: "Stream ended!" });

    } catch (err) {
        console.error("endStream error:", err);
        res.status(500).json({ status: "error", message: err.message });
    }
};

// GET STREAM STATUS
exports.getStatus = async (req, res) => {
    try {
        const { stream_id } = req.query;

        const [rows] = await db.execute(
            `SELECT is_live, viewer_count FROM streams WHERE stream_id=?`,
            [stream_id]
        );

        return res.json(rows[0] || { isLive: false, viewerCount: 0 });

    } catch (err) {
        console.error("getStatus error:", err);
        res.status(500).json({ status: "error", message: err.message });
    }
};
