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
const { UserPaymentWalletForB } = require('../models/userpaymentwalletforb');
const { UserPaymentWalletActivityForbLog } = require('../models/userpaymentwalletactivityforb');
const { level } = require('winston');

// user payment wallet by userid in admin
router.get('/userpaymentwallet-admin/:id', [auth, admin], async (req, res) => {

    const userpaymentwallet = await UserPaymentWalletForB.findOne({ userId: req.params.id })
                                        .populate('userId', 'uniqueIdPlanB')
    if (!userpaymentwallet) return res.status(200).send({ data: userpaymentwallet, message: "No User wallet available" });

    res.status(200).send({ data: userpaymentwallet });

})

// user payment wallet Activity log by userid in admin
router.get('/userpaymentwalletlog/:id', [auth, admin], async (req, res) => {
    let pageIndex = parseInt(req.query.pageIndex);
    let pageSize = parseInt(req.query.pageSize);
    let sort = req.query.sort;
    const count = await UserPaymentWalletActivityForbLog.countDocuments({  userId: req.params.id,softDelete: '0' });
    const userspaylog = await UserPaymentWalletActivityForbLog.find({ userId: req.params.id, softDelete: '0' })
        .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
        .sort(sort)
        .populate('userId', 'uniqueIdPlanB')
    res.status(200).send({ data: userspaylog, count: count });

})

// user payment wallet Activity log search in admin
router.get('/userpaymentwalletloglist', [auth, admin], async (req, res) => {
    let pageIndex = parseInt(req.query.pageIndex);
    let pageSize = parseInt(req.query.pageSize);
    let sort = req.query.sort;
    const count = await UserPaymentWalletActivityForbLog.countDocuments({  softDelete: '0' });
    const userspaylog = await UserPaymentWalletActivityForbLog.find({ softDelete: '0' })
        .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
        .sort(sort)
        .populate('userId', 'uniqueIdPlanB')
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
        const count = await UserPaymentWalletActivityForbLog.countDocuments({userId: userid,createdDate:{$gte: fromdate, $lt: todate}});
        const userspaylog = await UserPaymentWalletActivityForbLog.find({userId: userid,createdDate:{$gte: fromdate, $lt: todate}})
            .skip((pageIndex - 1) * pageSize)
            .limit(pageSize)
            .sort(sort)
            .populate('userId', 'uniqueIdPlanB')
        res.status(200).send({ data: userspaylog, count: count });
    }else{
        let pageIndex = parseInt(req.query.pageIndex);
        let pageSize = parseInt(req.query.pageSize);
        let sort = req.query.sort;
        const count = await UserPaymentWalletActivityForbLog.countDocuments({createdDate:{$gte: fromdate, $lt: todate} });
        const userspaylog = await UserPaymentWalletActivityForbLog.find({createdDate:{$gte: fromdate, $lt: todate} })
            .skip((pageIndex - 1) * pageSize)
            .limit(pageSize)
            .sort(sort)
            .populate('userId', 'uniqueIdPlanB')
        res.status(200).send({ data: userspaylog, count: count });
    }

})


// user payment wallet by userid in App
router.get('/planbuserswallets/:id', auth, async (req, res) => {
    const userid = req.user._id;
    if (!userid) return res.send({ status: "404", message: "User not found" });

    let planBuserwallet = await UserPaymentWalletForB.findOne({ userId: req.params.id });
    if (!planBuserwallet) return res.status(400).send({ data: planBuserwallet, message: "No User wallet available" });
    
    res.send({ status: "200", data: planBuserwallet });
});

// user payment wallet level bonus
router.get('/userlevelpayout/:id', auth, async (req, res) => {
    const userid = req.user._id;
    if (!userid) return res.send({ status: "404", message: "User not found" });

    let paymentlogs = await UserPaymentWalletActivityForbLog.find({ userId: req.params.id });
    if (!paymentlogs) return res.send({ status: "400", message: "No User wallet log available" });

    res.send({ status: "200", data: paymentlogs });
 
})

module.exports = router; 