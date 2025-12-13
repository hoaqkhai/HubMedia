const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const pool = require('./database');

// Serialize Session
passport.serializeUser((user, done) => {
    done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
    const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [id]);
    done(null, rows[0]);
});

// GOOGLE LOGIN
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: "/auth/google/callback"
}, 
async (accessToken, refreshToken, profile, done) => {

    const email = profile.emails[0].value;
    const full_name = profile.displayName;

    const [user] = await pool.query("SELECT * FROM users WHERE email=?", [email]);

    if (user.length > 0) return done(null, user[0]);

    const [result] = await pool.query(
        "INSERT INTO users (full_name, email, login_type) VALUES (?, ?, 'google')",
        [full_name, email]
    );

    const newUser = {
        user_id: result.insertId,
        full_name,
        email
    };

    return done(null, newUser);
}));

// FACEBOOK LOGIN
passport.use(new FacebookStrategy({
    clientID: process.env.FB_CLIENT_ID,
    clientSecret: process.env.FB_SECRET,
    callbackURL: "/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'emails']
}, 
async (accessToken, refreshToken, profile, done) => {

    const email = profile.emails ? profile.emails[0].value : null;
    const full_name = profile.displayName;

    if (!email) return done(null, false);

    const [user] = await pool.query("SELECT * FROM users WHERE email=?", [email]);

    if (user.length > 0) return done(null, user[0]);

    const [result] = await pool.query(
        "INSERT INTO users (full_name, email, login_type) VALUES (?, ?, 'facebook')",
        [full_name, email]
    );

    return done(null, {
        user_id: result.insertId,
        full_name,
        email
    });
}));

module.exports = passport;
