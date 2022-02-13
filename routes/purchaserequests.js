const bcrypt = require('bcrypt');
const _ = require('lodash');
const express = require('express');
const router = express.Router();
const { PurchaseRequest, Validatepar } = require('../models/purchaserequest');
const auth = require('../middeware/auth');
const admin = require('../middeware/admin');
const { baseUrl } = require('../util/constants');


var base64ToImage = require('base64-to-image');


// Request List for Admin
router.get('/list', [auth, admin], async (req, res) => {
    let pageIndex = parseInt(req.query.pageIndex);
    let pageSize = parseInt(req.query.pageSize);
    let sort = req.query.sort;
    const count = await PurchaseRequest.countDocuments({ isActive: '1',softDelete: '0' });
    const purchaserequest = await PurchaseRequest.find({ isActive: '1',softDelete: '0' })
        .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
        .sort(sort)
        .populate('userId', 'name')
        .populate("productId", 'name')
        .select("amount quantity transactionFile transactionNumber isActive createdDate");

    res.send({ purchaserequest: purchaserequest, count: count, imageUrl: `${baseUrl}/purchaserequest/` });
});

// Add Purchase Request
router.post('/addrequest', auth, async (req, res) => {
    const { error } = Validatepar(req.body);
    if (error) return res.send({ status:"400", message: error.details[0].message });

    let purchaserequest = new PurchaseRequest(_.pick(req.body, ['productId', 'quantity', 'amount', 'transactionNumber']));
    purchaserequest.userId = req.user._id;

    if (req.body.transactionFile) {
        var base64Str1 = req.body.transactionFile;
        var path1 = 'uploads/purchaserequest/';
        var imageFileName1 = Math.floor(Math.random() * 899999 + 100000);
        var imageName1 = imageFileName1.toString();
        var optionalObj1 = { 'fileName': imageName1, 'type': 'png' };
        var conversion1 = base64ToImage(base64Str1, path1, optionalObj1);
        purchaserequest.transactionFile = conversion1.fileName;
    }
    await purchaserequest.save();
    res.send({ status:"200", data: purchaserequest,message: "Purchase successfully done" });
});




module.exports = router;