
const error = require("../middeware/error");
const bodyParser = require('body-parser');
const express = require("express");
const requestIp = require('request-ip');
const path = require('path');
const admin = require("../routes/admins");
const pinmaster = require("../routes/pinmasters");
const country = require("../routes/countries");
const user = require("../routes/users");
const product = require("../routes/products");
const pruchaserequests = require("../routes/purchaserequests")
const planmasters = require("../routes/planmasters")
const kycmasters = require("../routes/kycmasters")
const userpaymentwallets = require("../routes/userpaymentwallets")
const userpaymentwalletforbs = require("../routes/userpaymentwalletforbs")
const usertotalwallet = require("../routes/usertotalwallet")

module.exports = function (app) {

    app.use(function (req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Expose-Headers", "Authorization");
        res.setHeader(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept,Authorization"
        );
        res.setHeader(
            "Access-Control-Allow-Methods",
            "POST, GET, PUT, PATCH, DELETE, OPTIONS"
        );
        res.setHeader("Cache-Control", "no-cache");
        next();
    });

    app.use(function (req, res, next) {
        req.ip = requestIp.getClientIp(req);
        next();
    });

    // app.use(express.static("uploads"));
    app.use(express.static(path.join(__dirname, '../', 'uploads')));
    app.use(express.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    app.use("/api/admin", admin);
    app.use("/api/pinmaster", pinmaster);
    app.use("/api/country", country);
    app.use("/api/user", user);
    app.use("/api/product", product);
    app.use("/api/purchaserequests", pruchaserequests);
    app.use("/api/planmasters", planmasters);
    app.use("/api/kycmasters", kycmasters);
    app.use("/api/userpaymentwallets", userpaymentwallets);
    app.use("/api/userpaymentwalletforbs", userpaymentwalletforbs);
    app.use("/api/usertotalwallet", usertotalwallet);

    app.use((req, res) => {
        res.json("You're lost, check your route !");
    })
    app.use(error);
}