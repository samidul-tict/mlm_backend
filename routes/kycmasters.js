const express = require('express');
const router = express.Router();
const _ = require('lodash');
const { KycMaster, validateKycMaster } = require("../models/kycmaster");
const auth = require('../middeware/auth');
const admin = require('../middeware/admin');
const { baseUrl } = require('../util/constants');
const { User, validate, validateFollow, validateId, validateUpdate } = require('../models/user');

// Add  kycmasters
router.post('/add', [auth, admin], async (req, res) => {
    let { error } = validateKycMaster(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    let kycmaster = await KycMaster.findOne({ countryid: req.body.countryid });
    if (kycmaster) return res.status(409).send({ message: "Kyc already Exist." });

    kycmaster = new KycMaster(_.pick(req.body, 'countryid', 'kycfields'));
    kycmaster.createdBy = req.user._id;

    await kycmaster.save()
    res.send({ message: "Kyc Fields Saved Successfully" });
});

// kycmaster List for admin
router.get('/list-admin', [auth, admin], async (req, res) => {

    let pageIndex = parseInt(req.query.pageIndex);
    let pageSize = parseInt(req.query.pageSize);
    let sort = req.query.sort;
    const count = await KycMaster.countDocuments({ softDelete: '0' });
    const kycmaster = await KycMaster.find({ softDelete: '0' })
        .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
        .sort(sort)
        .populate('countryid', 'countryName')
        .select("countryid kycfields isActive")
    res.send({ kycmaster: kycmaster, count: count });
});

// kycmaster Details by id
router.get('/detailsbyid/:id', [auth, admin], async (req, res) => {

    const kycmaster = await KycMaster.findById(req.params.id).populate('countryid', 'countryName');
    if (!kycmaster) return res.status(404).send({ message: "kycmaster With following Id not found" });
    res.send({ kycmaster: kycmaster });
});

// Update a kycmaster
router.put('/updatebyid/:id', [auth, admin], async (req, res) => {
    let { error } = validateKycMaster(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    let obj = _.pick(req.body, ['countryid', 'kycfields'])
    obj.modifiedBy = req.user._id;

    const kyc = await KycMaster.findById(req.params.id).select("kycfields")
    var existkyc = kyc.kycfields;
    var newkyc = req.body.kycfields;

    const same = JSON.stringify(existkyc) === JSON.stringify(newkyc);

    if (same)
        return res.status(409).send({ message: "Kycmaster Already Exist !" });
    const kycmaster = await KycMaster.findByIdAndUpdate(
        req.params.id,
        obj
    )

    if (!kycmaster)
        return res.status(404).send({ message: "Kycmaster with following id not found !" });

    res.send({ message: "Kycmaster Updated Successfully" });
});

// kycfield List for App
router.get('/kycfieldbycountry', auth, async (req, res) => {
    console.log(req.user._id);
    user = await User
            .findById(req.user._id)
            .select('country');
    console.log(user.country);
    const kycMaster = await KycMaster.find({ countryid:user.country,softDelete: '0' }).populate('countryid', 'countryName').select("countryid kycfields isActive")
    res.status(200).send({ data: kycMaster });
});

// kycmaster Details by id
router.get('/kycfieldbycountry/:id', [auth, admin], async (req, res) => {
    console.log(req.params.id);
    const kycMaster = await KycMaster.find({ countryid:req.params.id,softDelete: '0' }).populate('countryid', 'countryName').select("countryid kycfields isActive")
    res.status(200).send({ data: kycMaster });
});


module.exports = router;