require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const configViewEngine = require('./config/viewEngine.js');
const webRoutes = require('./routes/web.js');
const authRoutes = require('./routes/auth.js');
const connection = require('./config/database.js');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 8888;

// ===== MIDDLEWARE =====
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// ===== VIEW ENGINE =====
configViewEngine(app);

// ===== ROUTES =====
app.use('/', webRoutes);
app.use('/auth', authRoutes);

// ===== TEST =====
app.get('/abc', (req, res) => {
  res.send('check');
});

// ===== TEST DB QUERY ĐÚNG CÁCH =====


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
