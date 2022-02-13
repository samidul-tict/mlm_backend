const winston = require('winston');
const express = require("express");
const app = new express();
const compression = require('compression');
const shouldCompress = (req, res) => {
    if (req.headers['x-no-compression']) {
        // Will not compress responses, if this header is present
        return false;
    }
    // Resort to standard compression
    return compression.filter(req, res);
}
app.use(compression({
    filter: shouldCompress,
    threshold: 0
}
)) 

require('./startup/routes')(app);
require('./startup/db')();
require('./startup/logging')();
require('./startup/config')();
require('./startup/validation')();
require('./startup/prod')(app);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => winston.info(`Listening to port ${port} at ${new Date()}`));

module.exports = server;
