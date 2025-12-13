const debug = require("debug");

module.exports = {
    info: debug("app:info"),
    warn: debug("app:warn"),
    error: debug("app:error"),
    route: debug("app:route"),
    db: debug("app:db")
};
