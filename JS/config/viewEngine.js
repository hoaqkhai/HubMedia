const path = require('path');
const express = require('express');

const configViewEngine = (app) => {
    // config template engine
    console.log(">> check_dirname:", path.join('./JS', 'views'))
    app.set('views', path.join('./JS', 'views'));
    app.set('view engine', 'ejs');

    // config static files (image/css/js/html)
    app.use(express.static(path.join('./JS', 'public')));
}
module.exports = configViewEngine;