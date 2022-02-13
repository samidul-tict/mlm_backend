const winston = require('winston');
require("express-async-errors");
require('winston-mongodb');
// const config = require("config");

module.exports = function () {

    // process.on("uncaughtException", (ex) => {
    //     winston.error(ex.message, ex);
    //     process.exit(1);
    // });

    winston.exceptions.handle(new winston.transports.File({ filename: 'uncaughtExceptions.log' }));
    winston.exceptions.handle(new winston.transports.Console());

    process.on("unhandledRejection", (ex) => {
        throw (ex);
    });

    const files = new winston.transports.File({ filename: "logfile.log" });
    const myconsole = new winston.transports.Console();
    winston.add(myconsole);
    winston.add(files);
    /* const db = config.get('db');
    winston.add(
        new winston.transports.MongoDB({
            db: db,
            level: "info",
            options: {
                useUnifiedTopology: true,
            },
        })
    ); */
}