const auth = require('../middeware/auth');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const express = require('express');
const router = express.Router();
const { Product } = require('../models/product');
const { Country } = require("../models/country");
const { User, validate, validateFollow, validateId, validateUpdate } = require('../models/user');
const { indexOf } = require('lodash');
const admin = require('../middeware/admin');
const { baseUrl } = require('../util/constants');
var base64ToImage = require('base64-to-image');
const { UserWallet } = require('../models/userwallet');
const { UserPaymentWallet } = require('../models/userpaymentwallet');
const { UserPaymentWalletActivityLog } = require('../models/userpaymentwalletactivity');
const { UserTotalWallet } = require('../models/usertotalwallet');
const { UserTotalWalletLog } = require('../models/usertotalwalletlog');
const { level } = require('winston');

// user payment wallet by userid in admin
router.get('/usertotalwallet-admin', [auth, admin], async (req, res) => {

    let pageIndex = parseInt(req.query.pageIndex);
    let pageSize = parseInt(req.query.pageSize);
    let sort = req.query.sort;
    const count = await UserTotalWallet.countDocuments({  softDelete: '0' });
    const userspaylog = await UserTotalWallet.find({ softDelete: '0' })
        .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
        .sort(sort)
        .populate('userId', 'name uniqueId')
    res.status(200).send({ data: userspaylog, count: count });

})

// user payment wallet Activity log by userid in admin
router.get('/usertotalwalletlog', [auth, admin], async (req, res) => {
    let pageIndex = parseInt(req.query.pageIndex);
    let pageSize = parseInt(req.query.pageSize);
    let sort = req.query.sort;
    const count = await UserTotalWalletLog.countDocuments({  softDelete: '0' });
    const userspaylog = await UserTotalWalletLog.find({ softDelete: '0' })
        .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
        .sort(sort)
        .populate('userId', 'name uniqueId')
    res.status(200).send({ data: userspaylog, count: count });

})


module.exports = router; 