const express = require('express');
const router = express.Router();
const _ = require('lodash');
const { Country, validate, validateObjectId } = require("../models/country");
const auth = require('../middeware/auth');
const admin = require('../middeware/admin');
const multer = require('multer');
const { baseUrl } = require('../util/constants');
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads/countries/')
    },
    filename: (req, file, callback) => {
        // if (file) {
        //     const filename = file.originalname.replace(/\s/g, '');
        //     callback(null, `mlm_${filename}`);
        // }
        let fileName = '', postName;
        if(typeof req.body.postName !== "undefined") {
            postName = req.body.postName.toLowerCase().replace(/ /g, '-');
            filename += postName;
        }
        fileName += new Date().getTime();
        fileName += ".png";
        callback(null, fileName);
    }
})
const upload = multer({ storage: storage });

// Add Country
router.post('/add', [auth, admin], upload.single('filename'), async (req, res) => {
    
    const countryexists = await Country.findOne({'countryCode':req.body.countryCode});
    if (countryexists)
        return res.status(404).send({ message: "Country with following code already exists" });

    const countryexists1 = await Country.findOne({'countryName':req.body.countryName});
    if (countryexists1)
        return res.status(404).send({ message: "Country with following name already exists" });

    country = new Country(_.pick(req.body, ['countryCode', 'countryName', 'serveAt']));
    country.createdBy = req.user._id;
    const filename = req.file ? req.file.filename.replace(/\s/g, '') : "";
    country.filename = filename;
    await country.save()
    res.send({ message: "Country Saved Successfully" });
});

// Country List for admin
router.get('/list-admin', [auth, admin], async (req, res) => {
    let pageIndex = parseInt(req.query.pageIndex);
    let pageSize = parseInt(req.query.pageSize);
    let sort = req.query.sort;
    const count = await Country.countDocuments({ softDelete: '0' });
    const countries = await Country.find({ softDelete: '0' })
        .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
        .sort(sort)
        .select("countryCode filename countryName serveAt isActive")
    res.send({ countries: countries, count: count, imageUrl: `${baseUrl}/countries/` });
});

// Country Details by id
router.get('/detailsbyid/:id', [auth, admin], async (req, res) => {
    // const { error } = validate(req.params);
    // if (error) return res.status(400).send({ message: error.details[0].message });

    const country = await Country.findById(req.params.id).select("-__v -isActive -_id");
    if (!country) return res.status(404).send({ message: "Country With following Id not found" });
    res.send({ country: country, imageUrl: `${baseUrl}/countries/` });
});

// Update a Country
router.put('/updatebyid/:id', [auth, admin], upload.single('filename'), async (req, res) => {
    // const countryexists = await Country.findOne({'countryCode':req.body.countryCode});
    // if (countryexists)
    //     return res.status(404).send({ message: "Country with following code already exists" });

    // const countryexists1 = await Country.findOne({'countryName':req.body.countryName});
    // if (countryexists1)
    //     return res.status(404).send({ message: "Country with following name already exists" });

    let obj = _.pick(req.body, ['countryCode', 'countryName', 'serveAt'])
    obj.modifiedBy = req.user._id;

    const filename = req.file ? req.file.filename.replace(/\s/g, '') : "";
    if(filename){
        obj.filename = filename;
    }
    const country = await Country.findByIdAndUpdate(
        req.params.id,
        obj
    ) 

    res.send({ message: "Country Updated Successfully" });
});

// Country List for App
router.get('/list', async (req, res) => {
    const countries = await Country.find({ softDelete: '0' }).select("countryCode filename countryName serveAt isActive")
    res.status(200).send({ data: countries });
});

// Country List for Admin
router.get('/listfordropdownadmin', async (req, res) => {
    const countries = await Country.find({ softDelete: '0' }).select("countryCode filename countryName serveAt isActive")
    res.status(200).send({ data: countries });
});
 

module.exports = router;