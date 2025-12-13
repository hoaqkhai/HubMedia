// controllers/chatController.js
const db = require("../config/database");

exports.sendMessage = async (req, res) => {
    const { stream_id, user_id, author, text, avatar } = req.body;

    try {
        const [result] = await db.execute(
            `INSERT INTO chat_messages (stream_id, user_id, author_name, text, is_system, is_approved)
             VALUES (?, ?, ?, ?, 0, 1)`,
            [stream_id, user_id || null, author, text]
        );

        res.json({
            message_id: result.insertId,
            stream_id,
            author,
            text,
            avatar: avatar || "/default-avatar.png"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Cannot send message" });
    }
};

// Optional simulation
exports.simulateChat = (req, res) => {
    const users = [
        { name: "Sarah J.", avatar: "https://ui-avatars.com/api/?name=Sarah+J&background=random" },
        { name: "Mike Tech", avatar: "https://ui-avatars.com/api/?name=Mike+T&background=random" }
    ];
    const messages = ["Hello!", "Nice stream!", "Cool setup!", "🔥🔥🔥"];

    const u = users[Math.floor(Math.random() * users.length)];

    const msg = {
        author: u.name,
        text: messages[Math.floor(Math.random() * messages.length)],
        avatar: u.avatar
    };

    res.json(msg);
};
