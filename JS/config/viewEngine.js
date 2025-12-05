const path = require('path');
const express = require('express');

const configViewEngine = (app) => {
<<<<<<< HEAD
    // config template engine
    console.log(">> check_dirname:", path.join('./JS', 'views'))
    app.set('views', path.join('./JS', 'views'));
    app.set('view engine', 'ejs');

    // config static files (image/css/js/html)
    app.use(express.static(path.join('./JS', 'public')));
}
module.exports = configViewEngine;
=======
    app.set('views', path.join(__dirname, '..', 'views'));
    app.set('view engine', 'ejs');

    app.use(express.static(path.join(__dirname, '..', 'public')));
};

module.exports = configViewEngine;
>>>>>>> 5247a51d76e8a77a7e757084e5f84ee459ae7d98
