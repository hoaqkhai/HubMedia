const express = require("express");
const router = express.Router();
const connection = require("../config/database");

// =======================
// GET ALL CONTENTS
// =======================
router.get("/contents", async (req, res) => {
    try {
        const [rows] = await connection.execute("SELECT * FROM contents");
        res.json({ error: 0, data: rows });
    } catch (err) {
        console.error(err);
        res.json({ error: 1, message: "Database error" });
    }
});

// =======================
// GET CONTENT BY ID
// =======================
router.get("/contents/:id", async (req, res) => {
    try {
        const [rows] = await connection.execute(
            "SELECT * FROM contents WHERE content_id = ?",
            [req.params.id]
        );

        res.json({ error: 0, data: rows[0] || null });
    } catch (err) {
        console.error(err);
        res.json({ error: 1, message: "Database error" });
    }
});

// =======================
// CREATE CONTENT
// =======================
router.post("/contents", async (req, res) => {
    const { author_id, title, body, type } = req.body;

    if (!author_id || !title) {
        return res.json({ error: 1, message: "Missing required fields" });
    }

    try {
        await connection.execute(
            "INSERT INTO contents (author_id, title, body, type) VALUES (?, ?, ?, ?)",
            [author_id, title, body, type || "article"]
        );

        res.json({ error: 0, message: "Created successfully" });
    } catch (err) {
        console.error(err);
        res.json({ error: 1, message: "Database error" });
    }
});

// =======================
// UPDATE CONTENT
// =======================
router.put("/contents/:id", async (req, res) => {
    const { title, body, type, status } = req.body;

    try {
        await connection.execute(
            `UPDATE contents 
             SET title=?, body=?, type=?, status=?, updated_at=NOW() 
             WHERE content_id=?`,
            [title, body, type, status, req.params.id]
        );

        res.json({ error: 0, message: "Updated successfully" });
    } catch (err) {
        console.error(err);
        res.json({ error: 1, message: "Database error" });
    }
});

// =======================
// DELETE CONTENT
// =======================
router.delete("/contents/:id", async (req, res) => {
    try {
        await connection.execute(
            "DELETE FROM contents WHERE content_id = ?",
            [req.params.id]
        );

        res.json({ error: 0, message: "Deleted successfully" });
    } catch (err) {
        console.error(err);
        res.json({ error: 1, message: "Database error" });
    }
});


module.exports = router;
