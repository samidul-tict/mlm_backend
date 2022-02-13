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
const { level } = require('winston');

// user payment wallet by userid in admin
router.get('/userpaymentwallet-admin/:id', [auth, admin], async (req, res) => {

    const userpaymentwallet = await UserPaymentWallet.findOne({ userId: req.params.id })
                                        .populate('userId', 'name uniqueId')
    if (!userpaymentwallet) return res.status(200).send({ data: userpaymentwallet, message: "No User wallet available" });

    res.status(200).send({ data: userpaymentwallet });

})

// user payment wallet Activity log by userid in admin
router.get('/userpaymentwalletlog/:id', [auth, admin], async (req, res) => {
    let pageIndex = parseInt(req.query.pageIndex);
    let pageSize = parseInt(req.query.pageSize);
    let sort = req.query.sort;
    const count = await UserPaymentWalletActivityLog.countDocuments({  userId: req.params.id,softDelete: '0' });
    const userspaylog = await UserPaymentWalletActivityLog.find({ userId: req.params.id, softDelete: '0' })
        .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
        .sort(sort)
        .populate('userId', 'name uniqueId')
    res.status(200).send({ data: userspaylog, count: count });

})

// user payment wallet Activity log search in admin
router.get('/userpaymentwalletlog', [auth, admin], async (req, res) => {
    let pageIndex = parseInt(req.query.pageIndex);
    let pageSize = parseInt(req.query.pageSize);
    let sort = req.query.sort;
    const count = await UserPaymentWalletActivityLog.countDocuments({softDelete: '0' });
    const userspaylog = await UserPaymentWalletActivityLog.find({softDelete: '0' })
        .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
        .sort(sort)
        .populate('userId', 'name uniqueId')
        .populate('rewardForUser', 'name uniqueId')
    res.status(200).send({ data: userspaylog, count: count });

})
router.post('/searchuserpaymentwalletloglist', [auth, admin], async (req, res) => {
    const userid = req.body.userid;
    const fromdate = req.body.fromdate;
    const todate = req.body.todate;

    if(userid){
        let pageIndex = parseInt(req.query.pageIndex);
        let pageSize = parseInt(req.query.pageSize);
        let sort = req.query.sort;
        const count = await UserPaymentWalletActivityLog.countDocuments({userId: userid,createdDate:{$gte: fromdate, $lt: todate}});
        const userspaylog = await UserPaymentWalletActivityLog.find({userId: userid,createdDate:{$gte: fromdate, $lt: todate}})
            .skip((pageIndex - 1) * pageSize)
            .limit(pageSize)
            .sort(sort)
            .populate('userId', 'name uniqueId')
            .populate('rewardForUser', 'name uniqueId')
        res.status(200).send({ data: userspaylog, count: count });
    }else{
        let pageIndex = parseInt(req.query.pageIndex);
        let pageSize = parseInt(req.query.pageSize);
        let sort = req.query.sort;
        const count = await UserPaymentWalletActivityLog.countDocuments({createdDate:{$gte: fromdate, $lt: todate} });
        const userspaylog = await UserPaymentWalletActivityLog.find({createdDate:{$gte: fromdate, $lt: todate} })
            .skip((pageIndex - 1) * pageSize)
            .limit(pageSize)
            .sort(sort)
            .populate('userId', 'name uniqueId')
            .populate('rewardForUser', 'name uniqueId')
        res.status(200).send({ data: userspaylog, count: count });
    }

})

// user payment wallet by userid in App
router.get('/userpaymentwallet', auth, async (req, res) => {
    const userid = req.user._id;
    if (!userid) return res.send({ status: "404", message: "User not found" });
    const userpaymentwallet = await UserPaymentWallet.findOne({ userId: userid })
    if (!userpaymentwallet) return res.send({ status: "400", message: "No User wallet available" });

    res.send({ status: "200", data: userpaymentwallet });

})

// user payment wallet joining bonus
router.get('/userjoiningpayout', auth, async (req, res) => {
    const userid = req.user._id;
    if (!userid) return res.send({ status: "404", message: "User not found" });

    const paymentlogs = await UserPaymentWalletActivityLog.find({ userId: userid,rewardType:1 })
                            .populate('rewardForUser', 'uniqueId')
    if (!paymentlogs) return res.send({ status: "400", message: "No User wallet log available" });

    res.send({ status: "200", data: paymentlogs });

})

// user payment wallet level bonus
router.get('/userlevelpayout', auth, async (req, res) => {
    const userid = req.user._id;
    if (!userid) return res.send({ status: "404", message: "User not found" });

    const paymentlogs = await UserPaymentWalletActivityLog.find({ userId: userid,rewardType:0 })
                            .populate('rewardForUser', 'uniqueId')
    if (!paymentlogs) return res.send({ status: "400", message: "No User wallet log available" });

    res.send({ status: "200", data: paymentlogs });

})

module.exports = router; 