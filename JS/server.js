require('dotenv').config();

const express = require('express');
const path = require('path');
const configViewEngine = require('./config/viewEngine.js');
const webRoutes = require('./routes/web.js');
const authRoutes = require('./routes/auth.js');
const apiRoutes = require('./routes/api.js');
const livestreamRoutes = require('./routes/livestream');
const settingsRoutes = require('./routes/settings.js');
const apiUserRoutes = require('./routes/apiUser');
const session = require('express-session');
const passport = require('./config/passport');
const MySQLStore = require('express-mysql-session')(session);
const authMiddleware = require("./middleware/auth");
const logger = require("./utils/logger");

const app = express();
const port = process.env.PORT || 8081;

// --------------------------------
// GLOBAL ERROR CATCHER (no crash)
// --------------------------------
process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception:", err);
});

// --------------------------------
// PARSERS
// --------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------------------
// LOG ALL REQUESTS
// --------------------------------
app.use((req, res, next) => {
    logger.route(`${req.method} ${req.originalUrl}`);
    next();
});

// --------------------------------
// STATIC FILES
// --------------------------------
app.use(express.static(path.join(__dirname, 'public')));

// --------------------------------
// SESSION STORE
// --------------------------------
const sessionStore = new MySQLStore({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: '123456',
    database: 'hoidanit'
});

app.use(
    session({
        key: "session_cookie",
        secret: process.env.SESSION_SECRET || "supersecretkey",
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);

// --------------------------------
// PASSPORT
// --------------------------------
app.use(passport.initialize());
app.use(passport.session());

// --------------------------------
// VIEW ENGINE
// --------------------------------
configViewEngine(app);

// --------------------------------
// ROUTES
// --------------------------------
app.use('/', webRoutes);
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api', livestreamRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);
app.use('/api/user', apiUserRoutes);
// --------------------------------
// GLOBAL EXPRESS ERROR HANDLER
// --------------------------------
app.use((err, req, res, next) => {
    logger.error("ERROR:", err.stack);
    res.status(500).json({ error: "Server error", detail: err.message });
});

// --------------------------------
// START SERVER
// --------------------------------
app.listen(port, () => {
    logger.info(`Server running at http://localhost:${port}`);
});
