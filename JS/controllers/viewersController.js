// controllers/viewersController.js
const db = require("../config/database");

exports.getCount = async (req, res) => {
    const { stream_id } = req.query;

    try {
        const [rows] = await db.execute(
            `SELECT viewer_count FROM streams WHERE stream_id=?`,
            [stream_id]
        );

        res.json({ count: rows[0]?.viewer_count || 0 });

    } catch (err) {
        res.status(500).json({ count: 0 });
    }
};
