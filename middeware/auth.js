
const jwt = require('jsonwebtoken');
const config = require('config');

function auth(req, res, next) {
    if (!req.header('Authorization') || req.header('Authorization') == 'undefined')
        return res.status(401).send({ message: "Access denied. No token provided" });

    const token = req.header('Authorization').split(' ')[1];

    if (!token) return res.status(401).send({ message: 'Access denied. No token provided' });

    // var verifyOptions = {
    //     expiresIn: "1h"
    // };


    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(401).send({ message: 'Invalid token.' })
    }
}

module.exports = auth;