-- 1️⃣ Tạo database nếu chưa tồn tại và chọn database
CREATE DATABASE IF NOT EXISTS hoidanit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hoidanit;

-- 2️⃣ Tắt kiểm tra khóa ngoại để xóa bảng dễ dàng
SET FOREIGN_KEY_CHECKS = 0;

-- 3️⃣ Xóa tất cả bảng cũ (nếu có)
DROP TABLE IF EXISTS violation_tags, moderation_actions, moderation_queue, comments, media_files, content_tags, tags, contents, livestream_reactions, livestream_chats, livestreams, usersessions, users;

-- 4️⃣ Tạo bảng chính: users
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(100) UNIQUE DEFAULT NULL,
    password VARCHAR(255) NOT NULL,
    social_provider ENUM('google','facebook','none') NOT NULL DEFAULT 'none',
    role ENUM('Customer','Moderator','Admin') NOT NULL DEFAULT 'Customer',
    status ENUM('active','banned') NOT NULL DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    login_type VARCHAR(20) DEFAULT 'local'
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 5️⃣ Tạo bảng liên quan đến users
CREATE TABLE usersessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 6️⃣ Livestreams và liên quan
CREATE TABLE livestreams (
    livestream_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    start_time DATETIME,
    end_time DATETIME,
    status ENUM('upcoming','live','ended') DEFAULT 'upcoming',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE livestream_chats (
    chat_id INT AUTO_INCREMENT PRIMARY KEY,
    livestream_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (livestream_id) REFERENCES livestreams(livestream_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE livestream_reactions (
    reaction_id INT AUTO_INCREMENT PRIMARY KEY,
    livestream_id INT NOT NULL,
    user_id INT NOT NULL,
    reaction_type ENUM('like','love','wow','angry','sad'),
    reacted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (livestream_id) REFERENCES livestreams(livestream_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 7️⃣ Contents, tags và liên kết
CREATE TABLE contents (
    content_id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL,
    title VARCHAR(255),
    body TEXT,
    type ENUM('article','image','video') DEFAULT 'article',
    status ENUM('draft','published','archived') DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    FOREIGN KEY (author_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE tags (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE
);

CREATE TABLE content_tags (
    content_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (content_id, tag_id),
    FOREIGN KEY (content_id) REFERENCES contents(content_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
);

CREATE TABLE media_files (
    media_id INT AUTO_INCREMENT PRIMARY KEY,
    content_id INT,
    file_url VARCHAR(255),
    media_type ENUM('image','video'),
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (content_id) REFERENCES contents(content_id) ON DELETE SET NULL
);

-- 8️⃣ Comments và moderation
CREATE TABLE comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    content_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_id INT NULL,
    text TEXT,
    status ENUM('pending','approved','rejected','deleted') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    FOREIGN KEY (content_id) REFERENCES contents(content_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(comment_id) ON DELETE CASCADE
);

CREATE TABLE moderation_queue (
    queue_id INT AUTO_INCREMENT PRIMARY KEY,
    comment_id INT NOT NULL,
    assigned_to INT,
    status ENUM('waiting','reviewed') DEFAULT 'waiting',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE moderation_actions (
    action_id INT AUTO_INCREMENT PRIMARY KEY,
    moderator_id INT NOT NULL,
    comment_id INT NOT NULL,
    action_type ENUM('approve','reject','flag'),
    reason TEXT,
    action_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (moderator_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE
);

-- 9️⃣ Auto filters và violation tags
CREATE TABLE auto_filters (
    filter_id INT AUTO_INCREMENT PRIMARY KEY,
    keyword VARCHAR(100),
    violation_type VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE violation_tags (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    comment_id INT NOT NULL,
    filter_id INT NOT NULL,
    tag_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE,
    FOREIGN KEY (filter_id) REFERENCES auto_filters(filter_id) ON DELETE CASCADE
);

-- 🔟 Policies
CREATE TABLE policies (
    policy_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    title VARCHAR(100),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 11️⃣ Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;
