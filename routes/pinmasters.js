const express = require('express');
const router = express.Router();
const auth = require('../middeware/auth');
const admin = require('../middeware/admin');
const { PinMaster } = require('../models/pinmaster');
const { PurchaseRequest, Validatepar } = require('../models/purchaserequest');
const { PinActivityLog } = require('../models/pinactivitylog');
const { User } = require('../models/user');
const { Product } = require('../models/product');
const { UserWallet } = require('../models/userwallet');
var dateFormat = require("dateformat");
// Generate Pins
router.post('/generate', [auth, admin], async (req, res) => {

    noOfPins = req.body.numberOfPins

    let arr = [];
    for (let i = 0; i < noOfPins; i++)
        arr.push({ productId: req.body.productId })

    const generatedPins = await PinMaster.insertMany(arr);
    for (k = 0; k < generatedPins.length; k++) {
        await Product.findByIdAndUpdate(req.body.productId, {
            $push: { 'pins': generatedPins[k]._id }
        });
    }

    res.status(200).send({ message: "Pins Generated" });
})

// Pin List By products
router.post('/pinlist', [auth, admin], async (req, res) => {

    let pageIndex = parseInt(req.query.pageIndex);
    let pageSize = parseInt(req.query.pageSize);
    let sort = req.query.sort;
    const count = await PinMaster.countDocuments({ productId: req.body.productId, softDelete: '0' });
    const pinList = await PinMaster.find({ productId: req.body.productId, softDelete: '0' })
        .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
        .sort(sort)
        .select("pinNumber usedBy purchaseBy createdDate ")

    //a => a.pinList.equals(pinList)

    res.status(200).send({ pinList: pinList, count: count });

})

// Pin List By products 
// router.get('/notassignedpinlist', [auth, admin], async (req, res) => {
//     const pinList = await PinMaster.find({ productId: req.body.productId, softDelete: '0' })
//     if(pinList)
//     res.status(200).send({ data: pinList });
// })

// Pin details
router.get('/details', [auth, admin], async (req, res) => {
    const pin = await PinMaster.findOne({ _id: req.body.pinId });

    if (!pin) return res.send({ status: "400", message: "This pin not exists" });
    res.send({ status: "200", data: pin });

})

// Assign Pins to Users 
router.post('/assign', [auth, admin], async (req, res) => {

    var purchasereqId = req.body.purchasereqId;
    var userId = req.body.userId;
    var pinArray = req.body.pinArray;

    let userwallet = await UserWallet.findOne({ userId: userId });
    userwallet.pinId = pinArray;

    if (await userwallet.save()) {
        pinArray.forEach(async pin => {
            await PinMaster.findByIdAndUpdate(pin, { purchasedBy: userId });
        })

        let purchaseRequest = await PurchaseRequest.findOne({ _id: purchasereqId });
        console.log(purchaseRequest);
        purchaseRequest.isActive = 0;
        await purchaseRequest.save();

        // Generate Transaction ID
        let player = await User.findById(userId).select("phone");
        var playermobile = player.phone;
        var finalnumber = playermobile.substr(-5);
        var day = dateFormat(new Date(), "yyyymmddhhMM");
        var finaltransaction = "MLM" + day + finalnumber;

        pinactivity = new PinActivityLog({
            pinId: pinArray,
            purchasedBy: userId,
            transactionNumber: finaltransaction
        });
        pinactivity.save();
    }

    res.status(200).send({ message: "Pins Assigned Successfully" });
})

// Transfer Pins to Users 
router.post('/transfer', [auth, admin], async (req, res) => {

    var formUserId = req.body.formUserId;
    var toUserId = req.body.toUserId;
    var pinArray = req.body.pinArray;

    let userwallet = await UserWallet.findOne({ userId: toUserId });
    userwallet.pinId = pinArray;

    if (await userwallet.save()) {
        pinArray.forEach(async pin => {
            await PinMaster.findByIdAndUpdate(pin, { purchasedBy: toUserId, transferBy: formUserId });
            let userwallet = await UserWallet.findOneAndUpdate({ userId: formUserId }, { $pull: { pinId: pin } });
        })

        // Generate Transaction ID
        let player = await User.findById(toUserId).select("phone");
        var playermobile = player.phone;
        var finalnumber = playermobile.substr(-5);
        var day = dateFormat(new Date(), "yyyymmddhhMM");
        var finaltransaction = "MLM" + day + finalnumber;


        pinactivity = new PinActivityLog({
            pinId: pinArray,
            purchasedBy: toUserId,
            sellBy: formUserId,
            transactionNumber: finaltransaction
        });
        pinactivity.save();
    }
    res.status(200).send({ message: "Pins Transfered Successfully" });
})


//Pin Logs 
router.get('/logs', [auth, admin], async (req, res) => {
    let pageIndex = parseInt(req.query.pageIndex);
    let pageSize = parseInt(req.query.pageSize);
    let sort = req.query.sort;
    const count = await PinActivityLog.estimatedDocumentCount();
    const audits = await PinActivityLog.find()
        .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
        .sort(sort)
        .populate('purchasedBy', 'name')
        .populate('sellBy', 'name')
        .populate('pinId', 'pinNumber')
        .select("pinId purchasedBy sellBy transactionNumber createdDate");
    res.send({ audits: audits, count: count });
})

//Pin List By User 
router.get('/unusedpinlist/:id', [auth, admin], async (req, res) => {
    const pinList = await PinMaster.find({ purchasedBy: req.params.id, softDelete: '0' })
    if (!pinList)
        return res.status(404).send({ message: "The User with following id not found !" });


    var blankArr = []
    for (var i of pinList) {
        var blankObj = {}
        if (!i.usedBy) {
            blankObj["_id"] = i._id,
                blankObj["pinNumber"] = i.pinNumber,
                blankArr.push(blankObj)
        }
    }
    res.status(200).send({ data: blankArr });
})

//Not use and purchase Pin List of product
router.get('/unusedandpurchasedpinlist/:id', [auth, admin], async (req, res) => {
    const pinList = await PinMaster.find({ productId: req.params.id, softDelete: '0' })
    if (!pinList)
        return res.status(404).send({ message: "Pins with following product id not found !" });

    var blankArr = []
    for (var i of pinList) {
        var blankObj = {}
        if (!i.usedBy & !i.purchasedBy) {
            blankObj["_id"] = i._id,
                blankObj["pinNumber"] = i.pinNumber,
                blankArr.push(blankObj)
        }
    }
    res.status(200).send({ data: blankArr });
})

module.exports = router;
