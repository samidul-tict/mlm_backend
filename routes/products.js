const express = require('express');
const router = express.Router();
const { Product, Validate } = require('../models/product');
const { PinMaster } = require('../models/pinmaster');
const { User, validate, validateFollow, validateId, validateUpdate } = require('../models/user');
const _ = require('lodash');
const auth = require('../middeware/auth');
const multer = require('multer');
const { baseUrl } = require('../util/constants');
const admin = require('../middeware/admin');
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads/products/')
    },
    filename: (req, file, callback) => {
        if (file) {
            const filename = file.originalname.replace(/\s/g, '');
            callback(null, `el${filename}`);
        }
    }
})
const upload = multer({ storage: storage });

// Add Product
router.post('/add', [auth, admin], upload.single('filename'), async (req, res) => {
    const { error } = Validate(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    let product = await Product.findOne({ name: req.body.name });
    if (product) return res.status(409).send({ message: "Product already Exist." });

    const filename = req.file ? req.file.filename.replace(/\s/g, '') : "productogo.png";

    product = new Product(_.pick(req.body, ['name', 'priceBangladesh', 'priceIndia']));
    product.filename = filename;
    product.createdBy = req.user._id;
    await product.save();
    
    res.status(200).send({ message: "Product Saved Successfully" });
});

// Product List
router.get('/list-admin', [auth, admin], async (req, res) => {
    let pageIndex = parseInt(req.query.pageIndex);
    let pageSize = parseInt(req.query.pageSize);
    let sort = req.query.sort;
    const count = await Product.countDocuments({ softDelete: '0' });
    const product = await Product.find({ softDelete: '0' })
        .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
        .sort(sort)
        .select("name filename pins priceBangladesh priceIndia createdDate isActive")

    // return res.send({ match: computeStocksPoint(match[0]._id) });
    res.status(200).send({ product: product, count: count, imageUrl: `${baseUrl}/products/` });
})
// Product details By Product
router.get('/details-admin/:productId', [auth, admin], async (req, res) => {

    let pageIndex = parseInt(req.query.pageIndex);
    let pageSize = parseInt(req.query.pageSize);
    let sort = req.query.sort;
    const count = await PinMaster.countDocuments({ softDelete: '0', productId: req.params.productId });
    const pinList = await PinMaster.find({ softDelete: '0', productId: req.params.productId })
    .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
        .sort(sort)
        .populate('purchasedBy', 'name')
        .populate('usedBy', 'name')
        .select("pinNumber createdDate isActive");

    res.status(200).send({ pinList: pinList, count: count });
})

// Product List
router.get('/list', auth, async (req, res) => {
    console.log(req.user._id);
    user = await User
            .findById(req.user._id)
            .populate('country', 'countryName');
    console.log(user.country.countryName);
    if(user.country.countryName == 'INDIA'){
        product = await Product.find({ softDelete: '0' }).select("_id name filename priceIndia createdDate isActive")
        var dataArrBlank = []
        for(var productNew of product){
            var dataObjBlank = {}
            console.log(productNew)
            dataObjBlank["id"] = productNew._id
            dataObjBlank["name"] = productNew.name
            dataObjBlank["filename"] = productNew.filename
            dataObjBlank["productprice"] = productNew.priceIndia
            dataObjBlank["createdDate"] = productNew.createdDate
            dataObjBlank["isActive"] = productNew.isActive
            dataArrBlank.push(dataObjBlank)
        }
    }
    
    if(user.country.countryName == 'BANGLADESH'){
        product = await Product.find({ softDelete: '0' }).select("_id name filename priceBangladesh createdDate isActive")
        var dataArrBlank = []
        for(var productNew of product){
            var dataObjBlank = {}
            console.log(productNew)
            dataObjBlank["id"] = productNew._id
            dataObjBlank["name"] = productNew.name
            dataObjBlank["filename"] = productNew.filename
            dataObjBlank["productprice"] = productNew.priceBangladesh
            dataObjBlank["createdDate"] = productNew.createdDate
            dataObjBlank["isActive"] = productNew.isActive
            dataArrBlank.push(dataObjBlank)
        }
    }
    
    res.status(200).send({ status:"200",data: dataArrBlank, imageUrl: `${baseUrl}/products/` });
})

// Product details By id
router.get('/details', auth, async (req, res) => {
    user = await User
            .findById(req.user._id)
            .populate('country', 'countryName');
    console.log(user.country.countryName);
    
    if(user.country.countryName == 'INDIA'){
        product = await Product.find({  _id: req.body.productId }).select("name filename priceIndia createdDate isActive")
        var dataArrBlank = []
        for(var productNew of product){
            var dataObjBlank = {}
            console.log(productNew)
            dataObjBlank["name"] = productNew.name
            dataObjBlank["filename"] = productNew.filename
            dataObjBlank["productprice"] = productNew.priceIndia
            dataObjBlank["createdDate"] = productNew.createdDate
            dataObjBlank["isActive"] = productNew.isActive
            dataArrBlank.push(dataObjBlank)
        }
    }

    if(user.country.countryName == 'BANGLADESH'){
        product = await Product.find({ _id: req.body.productId }).select("name filename priceBangladesh createdDate isActive")
        var dataArrBlank = []
        for(var productNew of product){
            var dataObjBlank = {}
            console.log(productNew)
            dataObjBlank["name"] = productNew.name
            dataObjBlank["filename"] = productNew.filename
            dataObjBlank["productprice"] = productNew.priceBangladesh
            dataObjBlank["createdDate"] = productNew.createdDate
            dataObjBlank["isActive"] = productNew.isActive
            dataArrBlank.push(dataObjBlank)
        }
    }

    res.status(200).send({  status:"200",data: dataArrBlank, imageUrl: `${baseUrl}/products/` });
})


module.exports = router;