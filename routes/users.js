const auth = require('../middeware/auth');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const express = require('express');
const router = express.Router();
const { Product } = require('../models/product');
const { Country } = require("../models/country");
const { User, validate, validateFollow, validateId, validateUpdate } = require('../models/user');
const { UserPlanb } = require('../models/userplanb');
const { UserKyc, validateUserKyc } = require('../models/userkyc');
const { indexOf } = require('lodash');
const admin = require('../middeware/admin');
const { baseUrl } = require('../util/constants');
var base64ToImage = require('base64-to-image');
const { UserWallet } = require('../models/userwallet');
const { UserPaymentWallet } = require('../models/userpaymentwallet');
const { UserPaymentWalletActivityLog } = require('../models/userpaymentwalletactivity');
const { UserPaymentWalletForB } = require('../models/userpaymentwalletforb');
const { UserPaymentWalletActivityForbLog } = require('../models/userpaymentwalletactivityforb');
const { UserTotalWallet } = require('../models/usertotalwallet');
const { UserTotalWalletLog } = require('../models/usertotalwalletlog');
const { PlanMaster } = require('../models/planmaster');
const { PinMaster } = require('../models/pinmaster');
const multer = require('multer');
const { KycMaster } = require('../models/kycmaster');
const { level } = require('winston');
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads/userkyc/')
    },
    filename: (req, file, callback) => {
        if (file) {
            const filename = file.originalname.replace(/\s/g, '');
            callback(null, `el${filename}`);
        }
    }
})
const upload = multer({ storage: storage });

// Register a player
router.post('/register', async (req, res) => {
    //console.log(req.body)

    const { error } = validate(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    // let user = await User.findOne({ phone: req.body.phone });
    // if (user) return res.status(409).send({ message: "User already registered." });

    let name = req.body.name ? req.body.name : 'Guest' + (Math.floor(1000 + Math.random() * 9000));
    let newname = name.substring(0, 3).trim();
    let phone = req.body.phone.substring(2, 6);

    let uniqueid = 'EL' + phone + Math.floor(1000 + Math.random() * 90000)

    newuser = new User({
        name: name,
        phone: req.body.phone,
        country: req.body.country,
        uniqueId: uniqueid,
        password: Math.floor(1000 + Math.random() * 90000)
    });

    if (await newuser.save()) {
        let playerWallet = new UserWallet({ userId: newuser._id })
        await playerWallet.save();
    }

    res.status(200).send({ data: newuser, message: "User successfully registered." });
});

// Login a player
router.post('/login', async (req, res) => {
    // const { error } = validate(req.body);
    // if (error) return res.status(400).send({ message: error.details[0].message });

    let user = await User.findOne({ uniqueId: req.body.userId });
    if (!user) return res.status(400).send({ "message": "User Not Found!" });

    if (user.password != req.body.password) return res.status(400).send({ "message": "Invalid Password" });

    const token = user.generateAuthToken();
    res.status(200).header('Authorization', token).send({ data: user, message: "User successfully loggedin.", imageUrl: `${baseUrl}/users/` });

});
// Validate OTP
router.post('/validate-otp', async (req, res) => {
    console.log(req);
    if (!req.body.otp) return res.status(400).send({ message: "OTP is required." });

    let user = await User.findOne({ phone: req.body.phone, otp: req.body.otp });
    console.log(user);
    if (!user) return res.status(400).send({ message: "Invalid OTP" });

    const token = user.generateAuthToken();
    return res.status(200).header('Authorization', token).send({ data: user, message: "OTP validation successful", imageUrl: `${baseUrl}/users/` })
})

// Register a player from admin
router.post('/register-admin', async (req, res) => {
    console.log(req.body)

    // const { error } = validateUpdate(req.body);
    // if (error) return res.status(400).send({ message: error.details[0].message });

    // let user = await User.findOne({ phone: req.body.phone });
    // if (user) return res.status(409).send({ message: "User already registered." });

    let name = req.body.name ? req.body.name : 'Guest' + (Math.floor(1000 + Math.random() * 9000));
    let newname = name.substring(0, 3);
    let phone = req.body.phone.substring(3, 6);
    let uniqueid = 'EL' + phone + Math.floor(1000 + Math.random() * 90000)

    let pincheck = await PinMaster.findOne({ pinNumber: req.body.joiningPin });

    if (!pincheck)
        return res.send({ status: "400", message: "Invalid Pin !" });

    if (pincheck.usedBy)
        return res.send({ status: "400", message: "Pin Expired !" });

    newuser = new User({
        name: name,
        phone: req.body.phone,
        address: req.body.address,
        country: req.body.country,
        introducerId: req.body.introducerId,
        sponsorId: req.body.sponsorId,
        joiningPin: req.body.joiningPin,
        uniqueId: uniqueid,
        password: Math.floor(1000 + Math.random() * 90000)
    });

    if (req.body.image) {
        var base64Str = req.body.image;
        var path = 'uploads/users/';
        var imageFileName = Math.floor(Math.random() * 899999 + 100000);
        var imageName = imageFileName.toString();
        var optionalObj = { 'fileName': imageName, 'type': 'png' };
        var conversion = base64ToImage(base64Str, path, optionalObj);
        newuser.image = conversion.fileName;
    }

    if (await newuser.save()) {
        let playerWallet = new UserWallet({ userId: newuser._id })
        await playerWallet.save();
    }

    res.status(200).send({ data: newuser, message: "User successfully registered." });
});

// Update user by admin
router.put('/userupdatebyid/:id', [auth, admin], async (req, res) => {
    let { error } = validateUpdate(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    let obj = _.pick(req.body, ['name', 'phone', 'address', 'address', 'introducerId', 'sponsorId', 'uniqueId', 'password'])
    obj.modifiedBy = req.user._id;

    const user = await User.findByIdAndUpdate(
        req.params.id,
        obj
    )

    if (!user)
        return res.status(404).send({ message: "User with following id not found !" });

    res.status(200).send({ message: "User Updated Successfully" });
});

// Admin searching user
router.post('/searchingwithuserid', [auth, admin], async (req, res) => {
    const userid = req.body.userId;

    const userlist = await User.findOne({ uniqueId: userid })
                            .populate('country', 'countryName');
    console.log(userlist);

    if (!userlist) return res.send({ status: "400",data: [], message: "No user found" });

    res.send({ status: "200", data: [userlist] });
})

// User List for admin
router.get('/list-admin', [auth, admin], async (req, res) => {
    let pageIndex = parseInt(req.query.pageIndex);
    let pageSize = parseInt(req.query.pageSize);
    let sort = req.query.sort;
    const count = await User.countDocuments({ softDelete: '0' });
    const users = await User.find({ softDelete: '0' })
        .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
        .sort(sort)
        .populate('country', 'countryName')
        .select("name email validateEmail phone password image uniqueId introducerId sponsorId joiningPin address city pincode state  createdDate isActive")
    res.status(200).send({ data: users, count: count, imageUrl: `${baseUrl}/users/` });
});

// User List for admin
router.get('/listfordropdown', [auth, admin], async (req, res) => {
    const users = await User.find({ softDelete: '0' })
        .select("_id name uniqueId createdDate isActive")
    res.status(200).send({ data: users });
});

// User Details
router.get('/userbyid/:id', [auth, admin], async (req, res) => {
    const user = await User.findById(req.params.id)
        .populate('country', 'countryName')
        .select("name email validateEmail phone image uniqueId introducerId sponsorId joiningPin address city pincode state  createdDate isActive");
    if (!user) return res.status(404).send({ message: "User With following Id not found" });
    res.status(200).send({ data: user, imageUrl: `${baseUrl}/users/` });
})

// Pin List user
router.get('/pinlistbyuser-admin/:userId', [auth, admin], async (req, res) => {
    let pageIndex = parseInt(req.query.pageIndex);
    let pageSize = parseInt(req.query.pageSize);
    let sort = req.query.sort;
    const count = await PinMaster.countDocuments({ softDelete: '0', purchasedBy: req.params.userId });
    const pinList = await PinMaster.find({ purchasedBy: req.params.userId })
        .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
        .sort(sort)
        .populate('purchasedBy', 'name')
        .populate('usedBy', 'name')
        .select("pinNumber createdDate isActive");

    if (!pinList) return res.send({ status: "400", message: "No pin available" });

    res.status(200).send({ count: count, pinList: pinList });

})

// join a User
router.put('/joininguser', auth, async (req, res) => {
    const { error } = validateUpdate(req.body);
    if (error) return res.send({ status: "400", message: error.details[0].message });

    let obj = _.pick(req.body, ['name', 'phone', 'address', 'introducerId', 'sponsorId', 'joiningPin'])

    let pincheck = await PinMaster.findOne({ pinNumber: req.body.joiningPin });

    if (!pincheck)
        return res.send({ status: "400", message: "Invalid Pin !" });

    if (pincheck.usedBy)
        return res.send({ status: "400", message: "Pin Expired !" });

    if (req.body.image) {
        var base64Str = req.body.image;
        var path = 'uploads/users/';
        var imageFileName = Math.floor(Math.random() * 899999 + 100000);
        var imageName = imageFileName.toString();
        var optionalObj = { 'fileName': imageName, 'type': 'png' };
        var conversion = base64ToImage(base64Str, path, optionalObj);
        obj.image = conversion.fileName;
    }

    obj.password = Math.floor(1000 + Math.random() * 90000);

    const user = await User.findByIdAndUpdate(
        req.user._id,
        obj,
        { new: true }
    ).select('name phone address password uniqueId image introducerId sponsorId joiningPin')

    if (!user)
        return res.send({ status: "400", message: "The User with following id not found !" });

    await PinMaster.findOneAndUpdate({ pinNumber: req.body.joiningPin }, { usedBy: req.user._id });

    res.send({ status: "200", data: user, message: "Successfully joined" });
});

// Check join
router.get('/check-join', auth, async (req, res) => {
    const userid = req.user._id;
    if (!userid) return res.send({ status: "404", message: "User not found" });

    const user = await User.findOne({ _id: req.user._id });
    console.log(user.joiningPin);
    const userusedpin = user.joiningPin;
    if (!userusedpin) return res.send({ status: "400", message: "User not joined" });

    res.send({ status: "200", data: user, message: "User already joined" });
})

// Pin List user
router.get('/pinlist', auth, async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate('country', 'countryName')
        .select("name email phone  uniqueId introducerId sponsorId joiningPin");


    const ids = {
        "sponserid": user.uniqueId,
        "introducerid": user.sponsorId
    }
    const pinList = await PinMaster.find({ purchasedBy: req.user._id, suggestStatus: 0 })
        .populate({
            path: 'usedBy purchasedBy',
            model: 'User'
        })

    if (!pinList) return res.send({ status: "400", message: "No pin available" });

    res.status(200).send({ status: "200", data: pinList, sharedid: ids });

})

// Pending Pin List user
router.get('/pendingpinlist', auth, async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate('country', 'countryName')
        .select("name email phone  uniqueId introducerId sponsorId joiningPin");
        
    const pinList = await PinMaster.find({ suggestFormUser: user._id, suggestStatus: 1 })
        .populate('purchasedBy', 'name')
        .populate('usedBy', 'name')
        .populate('suggestFormUser', 'name')
        .populate('suggestToUser', 'name')
        .select('pinNumber suggestStatus')
    console.log(pinList);
    if (!pinList) return res.send({ status: "400", message: "No pin available" });

    res.status(200).send({ status: "200", data: pinList });

})

//Used Pin List By User 
router.get('/usedpinlist', auth, async (req, res) => {
    const pinList = await PinMaster.find({ purchasedBy: req.user._id, softDelete: '0' }).populate('usedBy', 'name').select('pinNumber')
    if (!pinList)
        return res.status(404).send({ message: "The User with following id not found !" });
    console.log(pinList)

    var blankArr = []
    for (var i of pinList) {
        var blankObj = {}
        if (i.usedBy) {
            blankObj["_id"] = i._id,
            blankObj["pinNumber"] = i.pinNumber,
            blankObj["usedBy"] = i.usedBy,
            blankArr.push(blankObj)
        }
    }
    res.status(200).send({ data: blankArr });
})

// Change password
router.post('/updatepassword', auth, async (req, res) => {
    const userid = req.user._id;
    if (!userid) return res.send({ status: "404", message: "User not found" });
    const oldpwd = req.body.oldpwd;
    const newpwd = req.body.newpwd;

    user = await User.findOne({'_id':userid,'password':oldpwd});
    console.log(user);

    if (!user)
        return res.send({ status: "404", message: "Sorry old password not matched" });

    user.password = newpwd;
    user.save();

    res.send({  status: "200",message: "Password Change Successfully", data:user });
});

// Register a player from admin
router.post('/registerbyUser', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    let name = req.body.name ? req.body.name : 'Guest' + (Math.floor(1000 + Math.random() * 9000));
    let phone = req.body.phone.substring(3, 6);
    let uniqueid = 'EL' + phone + Math.floor(1000 + Math.random() * 90000)

    let pincheck = await PinMaster.findOne({ pinNumber: req.body.joiningPin });
    if (!pincheck)
        return res.send({ status: "400", message: "Invalid Pin !" });

    if (pincheck.usedBy)
        return res.send({ status: "400", message: "Pin Expired !" });

    pincheck.useStatus = 1;
    pincheck.save();
      
    let sponsor = await User.findOne({uniqueId:req.body.sponsorId});
    let levels = {}
    levels.upperLevel1 = sponsor._id;
    // return console.log(sponsor.planALevels);

    if(sponsor.planALevels){
        levels.upperLevel2 = sponsor.planALevels.upperLevel1;
        levels.upperLevel3 = sponsor.planALevels.upperLevel2;
        levels.upperLevel4 = sponsor.planALevels.upperLevel3;
        levels.upperLevel5 = sponsor.planALevels.upperLevel4;
        levels.upperLevel6 = sponsor.planALevels.upperLevel5;
        levels.upperLevel7 = sponsor.planALevels.upperLevel6;
        levels.upperLevel8 = sponsor.planALevels.upperLevel7;
        levels.upperLevel9 = sponsor.planALevels.upperLevel8;
        levels.upperLevel10 = sponsor.planALevels.upperLevel9;
        levels.upperLevel11 = sponsor.planALevels.upperLevel10;
        levels.upperLevel12 = sponsor.planALevels.upperLevel11;
    }

    let newuser = new User({
        name: name,
        phone: req.body.phone,
        address: req.body.address,
        identificationNo: req.body.identificationNo,
        gender: req.body.gender,
        country: req.body.country,
        introducerId: req.body.introducerId,
        sponsorId: req.body.sponsorId,
        joiningPin: req.body.joiningPin,
        uniqueId: uniqueid,
        password: Math.floor(1000 + Math.random() * 90000),
        planALevels: levels
    });

    if (req.body.image) {
        var base64Str = req.body.image;
        var path = 'uploads/users/';
        var imageFileName = Math.floor(Math.random() * 899999 + 100000);
        var imageName = imageFileName.toString();
        var optionalObj = { 'fileName': imageName, 'type': 'png' };
        var conversion = base64ToImage(base64Str, path, optionalObj);
        newuser.image = conversion.fileName;
    }

    country = await Country.findById(req.body.country);
    console.log(country.countryName);
    var productpercentage = 0;
    let productIndiaPrice;
    let productBDPrice;
    if(country.countryCode == 'IND'){
        productIndiaPrice = await Product.findOne({  _id: pincheck.productId }).select("priceIndia");
        console.log(productIndiaPrice);
        productpercentage = (10 / 100) * productIndiaPrice.priceIndia;
    }
    if(country.countryCode == 'BD'){
        productBDPrice = await Product.findOne({  _id: pincheck.productId }).select("priceBangladesh");
        productpercentage = (10 / 100) * productBDPrice.priceBangladesh;
    }

    if (await newuser.save()) {
        let playerWallet = new UserWallet({ userId: newuser._id })
        await playerWallet.save();
        let userPaymentWallet = new UserPaymentWallet({ userId: newuser._id })
        await userPaymentWallet.save();
        let userTotalPaymentWallet = new UserTotalWallet({ userId: newuser._id })
        await userTotalPaymentWallet.save();

        const rankplan1 = await PlanMaster.findOne({ planType: 'A', rank: 1 });
        const rankplan2 = await PlanMaster.findOne({ planType: 'A', rank: 2 });
        const rankplan3 = await PlanMaster.findOne({ planType: 'A', rank: 3 });
        const rankplan4 = await PlanMaster.findOne({ planType: 'A', rank: 4 });
        const rankplan5 = await PlanMaster.findOne({ planType: 'A', rank: 5 });
        const rankplan6 = await PlanMaster.findOne({ planType: 'A', rank: 6 });
        const rankplan7 = await PlanMaster.findOne({ planType: 'A', rank: 7 });
        const rankplan8 = await PlanMaster.findOne({ planType: 'A', rank: 8 });
        const rankplan9 = await PlanMaster.findOne({ planType: 'A', rank: 9 });
        const rankplan10 = await PlanMaster.findOne({ planType: 'A', rank: 10 });
        const rankplan11 = await PlanMaster.findOne({ planType: 'A', rank: 11 });
        const rankplan12 = await PlanMaster.findOne({ planType: 'A', rank: 12 });

        let upperLevel1Wallet = await UserPaymentWallet.findOne({ userId: newuser.planALevels.upperLevel1 })
        upperLevel1Wallet.totalAmount = (upperLevel1Wallet.totalAmount + rankplan1.payout + productpercentage);
        upperLevel1Wallet.balancedAmount = upperLevel1Wallet.totalAmount - upperLevel1Wallet.withdralAmount;
        upperLevel1Wallet.planArank = 1;
        await upperLevel1Wallet.save();
        let userpayactivity = new UserPaymentWalletActivityLog({
            userId: newuser.planALevels.upperLevel1,
            credit: rankplan1.payout,
            rewardForUser: newuser._id,
            rank:1,
            description: newuser.uniqueId + '(' + newuser.name + ')'+ ' added by ' + sponsor.uniqueId + '(' + sponsor.name + ' ) - at rank 1, Reward Bonus added ' + rankplan1.payout  
        });
        userpayactivity.save();
        let userpayactivity1 = new UserPaymentWalletActivityLog({
            userId: newuser.planALevels.upperLevel1,
            credit: productpercentage,
            rewardForUser: newuser._id,
            rank:1,
            rewardType:1,
            description: newuser.uniqueId + '(' + newuser.name + ')'+ ' added by ' + sponsor.uniqueId + '(' + sponsor.name + ' ) - at rank 1, Product Bonus added ' + productpercentage  
        });
        userpayactivity1.save();
        let userTotalWallet = await UserTotalWallet.findOne({ userId: newuser.planALevels.upperLevel1 })
        userTotalWallet.totalAmount = (userTotalWallet.totalAmount + rankplan1.payout + productpercentage);
        userTotalWallet.balancedAmount = userTotalWallet.totalAmount - userTotalWallet.withdralAmount;
        userTotalWallet.save();

        let upperLevel2Wallet = await UserPaymentWallet.findOne({ userId: newuser.planALevels.upperLevel2 })
        if(upperLevel2Wallet){
            upperLevel2Wallet.totalAmount = upperLevel2Wallet.totalAmount + rankplan2.payout;
            upperLevel2Wallet.balancedAmount = upperLevel2Wallet.totalAmount - upperLevel2Wallet.withdralAmount;
            upperLevel1Wallet.planArank = 2;
            await upperLevel2Wallet.save();
            let userpayactivity = new UserPaymentWalletActivityLog({
                userId: newuser.planALevels.upperLevel2,
                credit: rankplan2.payout,
                rewardForUser: newuser._id,
                rank:2,
                description: newuser.uniqueId + '(' + newuser.name + ')'+ ' added by ' + sponsor.uniqueId + '(' + sponsor.name + ' ) - at rank 2, Reward Bonus added ' + rankplan2.payout  
            });
            userpayactivity.save();
            let userTotalWallet = await UserTotalWallet.findOne({ userId: newuser.planALevels.upperLevel2 })
            userTotalWallet.totalAmount = (userTotalWallet.totalAmount + rankplan2.payout);
            userTotalWallet.balancedAmount = userTotalWallet.totalAmount - userTotalWallet.withdralAmount;
            userTotalWallet.save();
        }
        let upperLevel3Wallet = await UserPaymentWallet.findOne({ userId: newuser.planALevels.upperLevel3 })
        if(upperLevel3Wallet){
            upperLevel3Wallet.totalAmount += rankplan3.payout;
            upperLevel3Wallet.balancedAmount = upperLevel3Wallet.totalAmount - upperLevel3Wallet.withdralAmount;
            upperLevel1Wallet.planArank = 3;
            await upperLevel3Wallet.save(); 
            let userpayactivity = new UserPaymentWalletActivityLog({
                userId: newuser.planALevels.upperLevel3,
                credit: rankplan3.payout,
                rewardForUser: newuser._id,
                rank:3,
                description: newuser.uniqueId + '(' + newuser.name + ')'+ ' added by ' + sponsor.uniqueId + '(' + sponsor.name + ' ) - at rank 3, Reward Bonus added ' + rankplan3.payout  
            });
            userpayactivity.save();
            let userTotalWallet = await UserTotalWallet.findOne({ userId: newuser.planALevels.upperLevel3 })
            userTotalWallet.totalAmount = (userTotalWallet.totalAmount + rankplan3.payout);
            userTotalWallet.balancedAmount = userTotalWallet.totalAmount - userTotalWallet.withdralAmount;
            userTotalWallet.save();
        }
        let upperLevel4Wallet = await UserPaymentWallet.findOne({ userId: newuser.planALevels.upperLevel4 })
        if(upperLevel4Wallet){
            upperLevel4Wallet.totalAmount = upperLevel4Wallet.totalAmount + rankplan4.payout;
            upperLevel4Wallet.balancedAmount = upperLevel4Wallet.totalAmount - upperLevel4Wallet.withdralAmount;
            upperLevel1Wallet.planArank = 4;
            await upperLevel4Wallet.save();
            userpayactivity = new UserPaymentWalletActivityLog({
                userId: newuser.planALevels.upperLevel4,
                credit: rankplan4.payout,
                rewardForUser: newuser._id,
                rank:4,
                description: newuser.uniqueId + '(' + newuser.name + ')'+ ' added by ' + sponsor.uniqueId + '(' + sponsor.name + ' ) - at rank 4, Reward Bonus added ' + rankplan4.payout  
            });
            userpayactivity.save();
            let userTotalWallet = await UserTotalWallet.findOne({ userId: newuser.planALevels.upperLevel4 })
            userTotalWallet.totalAmount = (userTotalWallet.totalAmount + rankplan4.payout);
            userTotalWallet.balancedAmount = userTotalWallet.totalAmount - userTotalWallet.withdralAmount;
            userTotalWallet.save();
        }
        let upperLevel5Wallet = await UserPaymentWallet.findOne({ userId: newuser.planALevels.upperLevel5 })
        if(upperLevel5Wallet){
            upperLevel5Wallet.totalAmount = upperLevel5Wallet.totalAmount + rankplan5.payout;
            upperLevel5Wallet.balancedAmount = upperLevel5Wallet.totalAmount - upperLevel5Wallet.withdralAmount;
            upperLevel1Wallet.planArank = 5;
            await upperLevel5Wallet.save();
            userpayactivity = new UserPaymentWalletActivityLog({
                userId: newuser.planALevels.upperLevel5,
                credit: rankplan5.payout,
                rewardForUser: newuser._id,
                rank:5,
                description: newuser.uniqueId + '(' + newuser.name + ')'+ ' added by ' + sponsor.uniqueId + '(' + sponsor.name + ' ) - at rank 5, Reward Bonus added ' + rankplan5.payout  
            });
            userpayactivity.save();
            let userTotalWallet = await UserTotalWallet.findOne({ userId: newuser.planALevels.upperLevel5 })
            userTotalWallet.totalAmount = (userTotalWallet.totalAmount + rankplan5.payout);
            userTotalWallet.balancedAmount = userTotalWallet.totalAmount - userTotalWallet.withdralAmount;
            userTotalWallet.save();
        }
        let upperLevel6Wallet = await UserPaymentWallet.findOne({ userId: newuser.planALevels.upperLevel6 })
        if(upperLevel6Wallet){
            upperLevel6Wallet.totalAmount = upperLevel6Wallet.totalAmount + rankplan6.payout;
            upperLevel6Wallet.balancedAmount = upperLevel6Wallet.totalAmount - upperLevel6Wallet.withdralAmount;
            upperLevel1Wallet.planArank = 6;
            await upperLevel6Wallet.save(); 
            userpayactivity = new UserPaymentWalletActivityLog({
                userId: newuser.planALevels.upperLevel6,
                credit: rankplan6.payout,
                rewardForUser: newuser._id,
                rank:6,
                description: newuser.uniqueId + '(' + newuser.name + ')'+ ' added by ' + sponsor.uniqueId + '(' + sponsor.name + ' ) - at rank 6, Reward Bonus added ' + rankplan6.payout  
            });
            userpayactivity.save();
            let userTotalWallet = await UserTotalWallet.findOne({ userId: newuser.planALevels.upperLevel6 })
            userTotalWallet.totalAmount = (userTotalWallet.totalAmount + rankplan6.payout);
            userTotalWallet.balancedAmount = userTotalWallet.totalAmount - userTotalWallet.withdralAmount;
            userTotalWallet.save();
        }
        let upperLevel7Wallet = await UserPaymentWallet.findOne({ userId: newuser.planALevels.upperLevel7 })
        if(upperLevel7Wallet){
            upperLevel7Wallet.totalAmount = upperLevel7Wallet.totalAmount + rankplan7.payout;
            upperLevel7Wallet.balancedAmount = upperLevel7Wallet.totalAmount - upperLevel7Wallet.withdralAmount;
            upperLevel1Wallet.planArank = 7;
            await upperLevel7Wallet.save();
            userpayactivity = new UserPaymentWalletActivityLog({
                userId: newuser.planALevels.upperLevel7,
                credit: rankplan7.payout,
                rewardForUser: newuser._id,
                rank:7,
                description: newuser.uniqueId + '(' + newuser.name + ')'+ ' added by ' + sponsor.uniqueId + '(' + sponsor.name + ' ) - at rank 7, Reward Bonus added ' + rankplan7.payout  
            });
            userpayactivity.save();
            let userTotalWallet = await UserTotalWallet.findOne({ userId: newuser.planALevels.upperLevel7 })
            userTotalWallet.totalAmount = (userTotalWallet.totalAmount + rankplan7.payout);
            userTotalWallet.balancedAmount = userTotalWallet.totalAmount - userTotalWallet.withdralAmount;
            userTotalWallet.save();
        }
        let upperLevel8Wallet = await UserPaymentWallet.findOne({ userId: newuser.planALevels.upperLevel8 })
        if(upperLevel8Wallet){
            upperLevel8Wallet.totalAmount = upperLevel8Wallet.totalAmount + rankplan8.payout;
            upperLevel8Wallet.balancedAmount = upperLevel8Wallet.totalAmount - upperLevel8Wallet.withdralAmount;
            upperLevel1Wallet.planArank = 8;
            await upperLevel8Wallet.save();
            userpayactivity = new UserPaymentWalletActivityLog({
                userId: newuser.planALevels.upperLevel8,
                credit: rankplan8.payout,
                rewardForUser: newuser._id,
                rank:8,
                description: newuser.uniqueId + '(' + newuser.name + ')'+ ' added by ' + sponsor.uniqueId + '(' + sponsor.name + ' ) - at rank 8, Reward Bonus added ' + rankplan8.payout  
            });
            userpayactivity.save();
            let userTotalWallet = await UserTotalWallet.findOne({ userId: newuser.planALevels.upperLevel8 })
            userTotalWallet.totalAmount = (userTotalWallet.totalAmount + rankplan8.payout);
            userTotalWallet.balancedAmount = userTotalWallet.totalAmount - userTotalWallet.withdralAmount;
            userTotalWallet.save();
        }
        let upperLevel9Wallet = await UserPaymentWallet.findOne({ userId: newuser.planALevels.upperLevel9 })
        if(upperLevel9Wallet){
            upperLevel9Wallet.totalAmount = upperLevel9Wallet.totalAmount + rankplan9.payout;
            upperLevel9Wallet.balancedAmount = upperLevel9Wallet.totalAmount - upperLevel9Wallet.withdralAmount;
            upperLevel1Wallet.planArank = 9;
            await upperLevel9Wallet.save();
            userpayactivity = new UserPaymentWalletActivityLog({
                userId: newuser.planALevels.upperLevel9,
                credit: rankplan9.payout,
                rewardForUser: newuser._id,
                rank:9,
                description: newuser.uniqueId + '(' + newuser.name + ')'+ ' added by ' + sponsor.uniqueId + '(' + sponsor.name + ' ) - at rank 9, Reward Bonus added ' + rankplan9.payout  
            });
            userpayactivity.save();
            let userTotalWallet = await UserTotalWallet.findOne({ userId: newuser.planALevels.upperLevel9 })
            userTotalWallet.totalAmount = (userTotalWallet.totalAmount + rankplan9.payout);
            userTotalWallet.balancedAmount = userTotalWallet.totalAmount - userTotalWallet.withdralAmount;
            userTotalWallet.save();
        }
        let upperLevel10Wallet = await UserPaymentWallet.findOne({ userId: newuser.planALevels.upperLevel10 })
        if(upperLevel10Wallet){
            upperLevel10Wallet.totalAmount = upperLevel10Wallet.totalAmount + rankplan10.payout;
            upperLevel10Wallet.balancedAmount = upperLevel10Wallet.totalAmount - upperLevel10Wallet.withdralAmount;
            upperLevel1Wallet.planArank = 10;
            await upperLevel10Wallet.save();
            userpayactivity = new UserPaymentWalletActivityLog({
                userId: newuser.planALevels.upperLevel10,
                credit: rankplan10.payout,
                rewardForUser: newuser._id,
                rank:10,
                description: newuser.uniqueId + '(' + newuser.name + ')'+ ' added by ' + sponsor.uniqueId + '(' + sponsor.name + ' ) - at rank 10, Reward Bonus added ' + rankplan10.payout  
            });
            userpayactivity.save();
            let userTotalWallet = await UserTotalWallet.findOne({ userId: newuser.planALevels.upperLevel10 })
            userTotalWallet.totalAmount = (userTotalWallet.totalAmount + rankplan10.payout);
            userTotalWallet.balancedAmount = userTotalWallet.totalAmount - userTotalWallet.withdralAmount;
            userTotalWallet.save();
        }
        let upperLevel11Wallet = await UserPaymentWallet.findOne({ userId: newuser.planALevels.upperLevel11 })
        if(upperLevel11Wallet){
            upperLevel11Wallet.totalAmount = upperLevel11Wallet.totalAmount + rankplan11.payout;
            upperLevel11Wallet.balancedAmount = upperLevel11Wallet.totalAmount - upperLevel11Wallet.withdralAmount;
            upperLevel1Wallet.planArank = 11;
            await upperLevel11Wallet.save();
            userpayactivity = new UserPaymentWalletActivityLog({
                userId: newuser.planALevels.upperLevel11,
                credit: rankplan11.payout,
                rewardForUser: newuser._id,
                rank:11,
                description: newuser.uniqueId + '(' + newuser.name + ')'+ ' added by ' + sponsor.uniqueId + '(' + sponsor.name + ' ) - at rank 11, Reward Bonus added ' + rankplan11.payout  
            });
            userpayactivity.save();
            let userTotalWallet = await UserTotalWallet.findOne({ userId: newuser.planALevels.upperLevel11 })
            userTotalWallet.totalAmount = (userTotalWallet.totalAmount + rankplan11.payout);
            userTotalWallet.balancedAmount = userTotalWallet.totalAmount - userTotalWallet.withdralAmount;
            userTotalWallet.save();
        }
        let upperLevel12Wallet = await UserPaymentWallet.findOne({ userId: newuser.planALevels.upperLevel12 })
        if(upperLevel12Wallet){
            upperLevel12Wallet.totalAmount = upperLevel12Wallet.totalAmount + rankplan12.payout;
            upperLevel12Wallet.balancedAmount = upperLevel12Wallet.totalAmount - upperLevel12Wallet.withdralAmount;
            upperLevel1Wallet.planArank = 12;
            await upperLevel12Wallet.save();
            userpayactivity = new UserPaymentWalletActivityLog({
                userId: newuser.planALevels.upperLevel12,
                credit: rankplan12.payout,
                rewardForUser: newuser._id,
                rank:12,
                description: newuser.uniqueId + '(' + newuser.name + ')'+ ' added by ' + sponsor.uniqueId + '(' + sponsor.name + ' ) - at rank 12, Reward Bonus added ' + rankplan12.payout  
            });
            userpayactivity.save();
            let userTotalWallet = await UserTotalWallet.findOne({ userId: newuser.planALevels.upperLevel12 })
            userTotalWallet.totalAmount = (userTotalWallet.totalAmount + rankplan12.payout);
            userTotalWallet.balancedAmount = userTotalWallet.totalAmount - userTotalWallet.withdralAmount;
            userTotalWallet.save();
        }

        
        let downusercount = await User.find({sponsorId : sponsor.uniqueId, planBStatus: "0"});
        if(downusercount.length === 3){
            let planbusers = await UserPlanb.findOne();
            if(planbusers){
                console.log("if one user here in plan b");
                let newuserPlanB = new UserPlanb({
                    userId: sponsor._id,
                    level:1,
                    clusterSize:1
                });
                await newuserPlanB.save();
                for(i of downusercount){
                    var docs = await User.findById(i._id);
                    docs.planBStatus = "1";
                    docs.save();
                }
                const planbrankplan1 = await PlanMaster.findOne({ planType: 'B', rank: 1 });
                let UserPaymentForB = new UserPaymentWalletForB({ userId: newuserPlanB._id })
                UserPaymentForB.totalAmount = UserPaymentForB.totalAmount + planbrankplan1.globalMatrixRupee;
                UserPaymentForB.balancedAmount = UserPaymentForB.totalAmount - UserPaymentForB.withdralAmount;
                await UserPaymentForB.save();
                userpayactivityforb = new UserPaymentWalletActivityForbLog({
                    userId: newuserPlanB._id,
                    credit: planbrankplan1.globalMatrixRupee,
                    rank:1,
                    description: newuserPlanB.uniqueIdPlanB + ' - at rank 1, Reward Bonus added ' + planbrankplan1.globalMatrixRupee  
                });
                userpayactivityforb.save();
                let userTotalWallet = await UserTotalWallet.findOne({ userId: newuserPlanB.userId })
                userTotalWallet.totalAmount = (userTotalWallet.totalAmount + planbrankplan1.globalMatrixRupee);
                userTotalWallet.balancedAmount = userTotalWallet.totalAmount - userTotalWallet.withdralAmount;
                userTotalWallet.save();
                console.log("new user create");
                console.log("new user wallet cretae");

                let userb = await UserPlanb.findOne({$or: [{leftUser: {$exists: false}}, {rightUser: {$exists: false}}]}).sort('_id');

                userb.leftUser ? userb.rightUser = newuserPlanB._id : userb.leftUser = newuserPlanB._id;
                userb.clusterSize = userb.clusterSize+1;
                let grandParent = await UserPlanb.findOne({$or: [{leftUser: userb._id}, {rightUser: userb._id}]});

                console.log("user left right",userb);
                console.log("check grand parent",grandParent);
                if(grandParent) {
                    console.log("grandparent exists ",grandParent);
                    grandParent.clusterSize++
                    if(grandParent.clusterSize > 6){
                        console.log("grandparent greater then 6 ");
                        grandParent.level++
                        grandParent.clusterSize = 1;
                        grandParent.leftUser = null;
                        grandParent.rightUser = null;
                        incrementLevel(grandParent);
                        planbreward(grandParent);
                    }
                    grandParent.save();
                    console.log("grandparent changed ",grandParent.level);
                }
                await userb.save();

            }else{
                console.log("if one user not here in plan b");
                let newuserPlanB = new UserPlanb({
                    userId: sponsor._id,
                    level:1,
                    clusterSize:1
                });
                await newuserPlanB.save()
                for(i of downusercount){
                    var docs = await User.findById(i._id);
                    docs.planBStatus = "1";
                    docs.save();
                }
                const planbrankplan1 = await PlanMaster.findOne({ planType: 'B', rank: 1 });
                let UserPaymentForB = new UserPaymentWalletForB({ userId: newuserPlanB._id })
                UserPaymentForB.totalAmount = UserPaymentForB.totalAmount + planbrankplan1.globalMatrixRupee;
                UserPaymentForB.balancedAmount = UserPaymentForB.totalAmount - UserPaymentForB.withdralAmount;
                await UserPaymentForB.save();
                userpayactivityforb = new UserPaymentWalletActivityForbLog({
                    userId: newuserPlanB._id,
                    credit: planbrankplan1.globalMatrixRupee,
                    rank:1,
                    description: newuserPlanB.uniqueIdPlanB + ' - at rank 1, Reward Bonus added ' + planbrankplan1.globalMatrixRupee  
                });
                userpayactivityforb.save();
                let userTotalWallet = await UserTotalWallet.findOne({ userId: newuserPlanB.userId })
                userTotalWallet.totalAmount = (userTotalWallet.totalAmount + planbrankplan1.globalMatrixRupee);
                userTotalWallet.balancedAmount = userTotalWallet.totalAmount - userTotalWallet.withdralAmount;
                userTotalWallet.save();

            }
        }
    }

    // await PinMaster.findOneAndUpdate({ pinNumber: req.body.joiningPin }, { usedBy: req.user._id });

    res.status(200).send({
        status: "200",
        data: newuser,
        message: name + " successfully registered.User Id : " + newuser.uniqueId + " And Password : " + newuser.password
    });
});
async function incrementLevel(shiftedUser){
    console.log("I am from incremental function",shiftedUser);
    let nextLevel = await UserPlanb.findOne({$or: [{leftUser: null}, {rightUser: null}], level: shiftedUser.level}).sort('_id');
    if (!nextLevel) return;
    nextLevel.leftUser ? nextLevel.rightUser = shiftedUser._id : nextLevel.leftUser = shiftedUser._id;
    nextLevel.clusterSize = nextLevel.clusterSize+1;
    let grandParent = await UserPlanb.findOne({$or: [{leftUser: nextLevel._id}, {rightUser: nextLevel._id}]});

    if(grandParent) {
        grandParent.clusterSize++
        if(grandParent.clusterSize > 6){
            grandParent.level++
            grandParent.clusterSize = 1;
            grandParent.leftUser = null;
            grandParent.rightUser = null;
            if(grandParent.level <= 12) {
                incrementLevel(grandParent);
                planbreward(grandParent);
            }
        }
        grandParent.save();
    }
    await nextLevel.save();
}
async function planbreward(planBuser){
    console.log("entered in planbreward");
    console.log("planbuser ",planBuser);
    let planBuserwallet = await UserPaymentWalletForB.findOne({userId: planBuser._id});
    console.log("planbuser wallet ",planBuserwallet);
    
    const planbrankplan = await PlanMaster.findOne({ planType: 'B', rank: planBuser.level });
    console.log("reward lebel ",planbrankplan);
    planBuserwallet.totalAmount = planBuserwallet.totalAmount + planbrankplan.globalMatrixRupee;
    planBuserwallet.balancedAmount = planBuserwallet.totalAmount - planBuserwallet.withdralAmount;
    planBuserwallet.planBrank = planBuser.level;
    await planBuserwallet.save();

    userpayactivityforb = new UserPaymentWalletActivityForbLog({
        userId: planBuser._id,
        credit: planbrankplan.globalMatrixRupee,
        rank:planBuser.level,
        description: planBuser.uniqueIdPlanB + ' - at rank ' +  planBuser.level + ', Reward Bonus added ' + planbrankplan.globalMatrixRupee  
    });
    userpayactivityforb.save();
    let userTotalWallet = await UserTotalWallet.findOne({ userId: planBuser.userId })
    userTotalWallet.totalAmount = (userTotalWallet.totalAmount + planbrankplan.globalMatrixRupee);
    userTotalWallet.balancedAmount = userTotalWallet.totalAmount - userTotalWallet.withdralAmount;
    userTotalWallet.save();
}

// App dashboard
router.get('/dashboard', auth, async (req, res) => {
    const filteruserId = req.user._id;
    const loggedusers = await User.findOne({ _id: filteruserId});
    if (!loggedusers) return res.send({ status: "404", message: "User not found" });

    const arr=[];
    const tree=[];
    const users = await User.find({ softDelete: '0'});
    for(var i=0; i<users.length; i++){
        var blankObj = {}
        blankObj.userId = users[i]._id;
        blankObj.uniqueId = users[i].uniqueId;
        blankObj.sponsorId = users[i].sponsorId;
        blankObj.name = users[i].name;
        blankObj.childnode = null;
        arr.push(blankObj);
    }
    const listToTree = (arr = []) => {
        let map = {}, node, res = {}, i;
        for (i = 0; i < arr.length; i += 1) {
           map[arr[i].uniqueId] = i;
           arr[i].childnode = [];
        };
        for (i = 0; i < arr.length; i += 1) {
           node = arr[i];
            //  console.log(node);
           if (node.sponsorId !== '0') {
              arr[map[node.sponsorId]].childnode.push(node);
           } else {
              res=node;
           };
        };
        return res;
    };
    tree.push(listToTree(arr));
    
    let counter = 0;
    if(loggedusers.sponsorId == '0'){
        let rootlevel = tree.filter(function(x){return x.userId==filteruserId});
        counter = await leaves(rootlevel[0]);
    }else{
        let output1 = listToTree(arr).childnode.filter(function(x){return x.userId==filteruserId});
        counter = await leaves(output1[0]);
    }

    let planAuserwallet = await UserPaymentWallet.findOne({ userId: filteruserId })

    const purchasePinCount = await PinMaster.find({ purchasedBy: filteruserId })
    const sharedPinCount = await PinMaster.find({ transferBy: filteruserId })
    const pinList = await PinMaster.find({ purchasedBy: req.user._id, softDelete: '0' }).populate('usedBy', 'name').select('pinNumber')
    if (!pinList)
        return res.status(404).send({ message: "The User with following id not found !" });

    var blankArr = []
    for (var i of pinList) {
        var blankObj = {}
        if (!i.usedBy) {
            blankObj["_id"] = i._id,
            blankObj["pinNumber"] = i.pinNumber,
            blankObj["usedBy"] = i.usedBy,
            blankArr.push(blankObj)
        }
    }

    const dashboardarr=[];
    var blankObj = {}
    blankObj.totaldownlinecount = counter;
    blankObj.totalpayout = planAuserwallet.totalAmount;
    blankObj.purchasePinCount = purchasePinCount.length;
    blankObj.pendingPinCount = blankArr.length;
    blankObj.sharedPinCount = sharedPinCount.length;
    dashboardarr.push(blankObj);

    res.send({ status: "200", data: dashboardarr });
})
async function leaves(node){
    let count=0;
    count_leaves(node);
    async function count_leaves(node){
        if(node.childnode){
            for(let i = 0; i<node.childnode.length; i++){
                if (node.childnode[i].childnode){
                    count_leaves(node.childnode[i]);
                    count = count+1;
                }
            }
        }
    }
    return count;
}

// Suggesst pin
router.post('/suggestpin', auth, async (req, res) => {
    // const { error } = validateUpdate(req.body);
    // if (error) return res.send({ status: "400", message: error.details[0].message });
    var reqbody = req.body.data;
    console.log(reqbody);
    var pin = [];
    for (var i of reqbody) {
        let user = await User.findOne({ uniqueId: i.suggestFormUser });
        let userto = await User.findOne({ uniqueId: i.suggestToUser });

        let obj = { 'suggestFormUser': user._id, 'suggestToUser': userto._id }
        let pincheck = await PinMaster.findOne({ pinNumber: i.pinnumber });

        console.log(obj);
        console.log(pincheck);

        if (!pincheck)
            return res.send({ status: "400", message: "Invalid Pin !" });

        if (pincheck.usedBy)
            return res.send({ status: "400", message: "Pin Expired !" });

        pincheck.suggestStatus = 1;
        pincheck.save();

        var objnew = await PinMaster.findByIdAndUpdate(
            pincheck._id,
            obj,
            { new: true }
        ).populate('purchasedBy', 'name')
            .populate('usedBy', 'name')
            .populate('suggestFormUser', 'name')
            .populate('suggestToUser', 'name')
            .select('pinNumber suggestStatus')
        // console.log(objnew);
        pin.push(objnew);
    }
    res.send({ status: "200", data: pin, message: "Successfully shared" });
});

// Check join
router.get('/doublelineuserlist', auth, async (req, res) => {
    const userid = req.user.uniqueId;
    if (!userid) return res.send({ status: "404", message: "User not found" });

    const userlist = await User.find({ sponsorId: userid });
    console.log(userlist);

    if (!userlist) return res.send({ status: "400", message: "No user found" });

    res.send({ status: "200", data: userlist });
})

// Downline list for plan A
router.post('/downlinelist', auth, async (req, res) => {
    // const userid = req.user.uniqueId;

    const userid = req.body.userId;

    const userlist = await User.find({ sponsorId: userid });
    console.log(userlist);
    if (!userlist) return res.send({ status: "400", message: "No user found" });

    const arr=[];
    const users = await User.find({ softDelete: '0'});
    for(var i=0; i<users.length; i++){
        var blankObj = {}
        blankObj.userId = users[i]._id;
        blankObj.uniqueId = users[i].uniqueId;
        blankObj.sponsorId = users[i].sponsorId;
        blankObj.name = users[i].name;
        blankObj.childnode = null;
        arr.push(blankObj);
    }
    let totaldownlinecount = 0;
    const listToTree = (arr = []) => {
        let map = {}, node, res = [], i;
        for (i = 0; i < arr.length; i += 1) {
           map[arr[i].uniqueId] = i;
           arr[i].childnode = [];
        };
        for (i = 1; i < arr.length; i += 1) {
           node = arr[i];console.log(node);
           if (node.sponsorId !== '0') {
              arr[map[node.sponsorId]].childnode.push(node);
              totaldownlinecount = i;
           } else {
              res.push(node);
           };
        };
        return res;
    };

    res.send({ status: "200", "totalcount" : totaldownlinecount, data: userlist });
})

// User details for name
router.post('/userdetailsbyuniqueid', auth, async (req, res) => {
    const userid = req.body.userId;

    const user = await User.findOne({ uniqueId: userid });
    console.log(user);

    res.send({ status: "200", data: user });
})

// User tree api for name
router.get('/treestructure/:id', [auth, admin], async (req, res) => {
    const filteruserId = req.params.id;

    const user = await User.findOne({ _id: filteruserId });
    if (!user) return res.send({ status: "400", message: "No user found" });
    
    const arr=[];
    const tree=[];
    const users = await User.find({ softDelete: '0'});
    for(var i=0; i<users.length; i++){
        var blankObj = {}
        blankObj.userId = users[i]._id;
        blankObj.uniqueId = users[i].uniqueId;
        blankObj.sponsorId = users[i].sponsorId;
        blankObj.name = users[i].name;
        blankObj.childnode = null;
        arr.push(blankObj);
    }
    const listToTree = (arr = []) => {
        let map = {}, node, res = {}, i;
        for (i = 0; i < arr.length; i += 1) {
           map[arr[i].uniqueId] = i;
           arr[i].childnode = [];
        };
        for (i = 0; i < arr.length; i += 1) {
           node = arr[i];
            //  console.log(node);
           if (node.sponsorId !== '0') {
              arr[map[node.sponsorId]].childnode.push(node);
           } else {
              res=node;
           };
        };
        return res;
    };
    tree.push(listToTree(arr));
    
    let counter = 0;
    if(user.sponsorId == '0'){
        let rootlevel = tree.filter(function(x){return x.userId==filteruserId});
        counter = await leaves(rootlevel[0]);
        res.send({ status: "200", data: rootlevel, count:counter });
    }else{
        let output1 = listToTree(arr).childnode.filter(function(x){return x.userId==filteruserId});
        counter = await leaves(output1[0]);
        res.send({ status: "200", data: output1, count:counter });
    }
})

// Add User KYC Update from admin
router.post('/adduserkyc', [auth, admin], upload.single('filename'), async (req, res) => {

    const filename = req.file ? req.file.filename.replace(/\s/g, '') : "";

    userkyc = new UserKyc(_.pick(req.body, ['kyc', 'userId']));
    userkyc.filename = filename;
    userkyc.createdBy = req.user._id;
    await userkyc.save();

    res.status(200).send({ message: "User Kyc Saved Successfully" });
});

// Add User KYC Update 
router.post('/userkyc', auth, async (req, res) => {
    const userid = req.user._id;
    if (!userid) return res.send({ status: "404", message: "User not found" });

    user = await User
            .findById(req.user._id)
            .select('country');
    console.log(user.country);

    const { error } = validateUserKyc(req.body);
    if (error) return res.send({ status: "400", message: error.details[0].message });

    const userkyc = new UserKyc;

    userkyc.userId = userid;
    userkyc.kyc = req.body.kyc;
    if (req.body.accountImage) {
        var base64Str = req.body.accountImage;
        var path = 'uploads/userkyc/';
        var imageFileName = Math.floor(Math.random() * 899999 + 100000);
        var imageName = imageFileName.toString();
        var optionalObj = { 'fileName': imageName, 'type': 'png' };
        var conversion = base64ToImage(base64Str, path, optionalObj);
        userkyc.accountImage = conversion.fileName;
    }

    await userkyc.save();

    res.send({ status: "200", data: userkyc, imageUrl: `${baseUrl}/userkyc/`, message: "User KYC Successfully Updated" });
});

router.get('/userkycdetails', auth, async (req, res) => {
    const userid = req.user._id;
    if (!userid) return res.send({ status: "404", message: "User not found" });

    user = await User.findById(req.user._id).select('country');

    const userkyc = await UserKyc.findOne({ userId: userid })

    const kycfiel=[];
    for(var i=0; i<userkyc.kyc.length; i++){
        var blankObj = {}
        const kycmaster = await KycMaster.findOne({countryid:user.country})
        
        const finalkyc =  userkyc.kyc.filter(kycdet => kycdet.kycId.equals(kycmaster.kycfields[i]._id))
        console.log(finalkyc);

        blankObj.id = finalkyc[i]._id;
        blankObj.kycId = finalkyc[i].kycId;
        blankObj.value = finalkyc[i].value;
        blankObj.fieldName = kycmaster.kycfields[i].kyc;
        
        kycfiel.push(blankObj);
    }
    console.log(kycfiel);return;
});

// Check kyc
router.get('/check-kyc', auth, async (req, res) => {
    const userid = req.user._id;
    if (!userid) return res.send({ status: "404", message: "User not found" });

    const user = await UserKyc.findOne({ userId: req.user._id });
    console.log(user);
    if (!user) return res.send({ status: "400", data: user, message: "User kyc not done" });
    res.send({ status: "200", data: user, message: "User KYC done", imageUrl: `${baseUrl}/userkyc/` });
})

// user kyc by id for update
router.get('/userkycbyuser-admin/:id', [auth, admin], async (req, res) => {

    const userkyc = await UserKyc.findOne({ userId: req.params.id })
    if (!userkyc) return res.send({ status: "400", message: "No kyc available" });

    res.status(200).send({ data: userkyc });

})
// Add User KYC Update by admin
router.post('/userkycupdte',  [auth, admin], async (req, res) => {
    const userid = req.body.userId;
    if (!userid) return res.send({ status: "404", message: "User not found" });

    user = await User
            .findById(req.user._id)
            .select('country');
    console.log(user.country);

    const { error } = validateUserKyc(req.body);
    if (error) return res.send({ status: "400", message: error.details[0].message });

    const userkyc = await UserKyc.findOne({ _id: userid });

    userkyc.userId = userid;
    userkyc.kyc = req.body.kyc;
    if (req.body.accountImage) {
        var base64Str = req.body.accountImage;
        var path = 'uploads/userkyc/';
        var imageFileName = Math.floor(Math.random() * 899999 + 100000);
        var imageName = imageFileName.toString();
        var optionalObj = { 'fileName': imageName, 'type': 'png' };
        var conversion = base64ToImage(base64Str, path, optionalObj);
        userkyc.accountImage = conversion.fileName;
    }

    await userkyc.save();

    res.send({ status: "200", data: userkyc, imageUrl: `${baseUrl}/users/`, message: "User KYC Successfully Updated" });
});

// Purchase Pin List user
router.get('/purchasepinlist', auth, async (req, res) => {
    const pinList = await PinMaster.find({ purchasedBy: req.user._id, softDelete: '0' })
                    .populate({
                        path: 'usedBy purchasedBy',
                        model: 'User'
                    })
    if (!pinList)
        return res.status(404).send({ message: "No pins available" });
    console.log(pinList)

    var blankArr = []
    for (var i of pinList) {
        var blankObj = {}
        if (!i.usedBy) {
            blankObj["_id"] = i._id,
            blankObj["pinNumber"] = i.pinNumber,
            blankObj["purchasedBy"] = i.purchasedBy,
            blankObj["createdDate"] = i.createdDate,
            blankArr.push(blankObj)
        }
    }
    res.status(200).send({ data: blankArr });

})

// plan b user list by plan a user id in app
router.get('/planbusers', auth, async (req, res) => {
    const userid = req.user._id;
    if (!userid) return res.send({ status: "404", message: "User not found" });

    let planBuserList = await UserPlanb.find({ userId: userid });
    if (!planBuserList) return res.send({ status: "404", message: "You are not available in Global Matrix" });
    
    res.send({ status: "200", data: planBuserList });
});

// plan b user wallet by id in app
router.get('/planbuserswallets/:id', auth, async (req, res) => {
    const userid = req.user._id;
    if (!userid) return res.send({ status: "404", message: "User not found" });

    let planBuserwallet = await UserPaymentWalletForB.findOne({ userId: req.params.id });
    
    res.send({ status: "200", data: planBuserwallet });
});

// Downline list for plan B
router.get('/downlinelistplanb/:id', auth, async (req, res) => {
    const userid = req.user._id;
    if (!userid) return res.send({ status: "404", message: "User not found" });

    let planBuserList = await UserPlanb.findOne({ _id: req.params.id });
    if (!planBuserList) return res.send({ status: "404", message: "You are not available in Global Matrix" });
    console.log(planBuserList.clusterSize);

    const arr=[];
    var blankObj = {}
    blankObj.PlanbId = planBuserList.uniqueIdPlanB;
    blankObj.level = planBuserList.level;
    blankObj.downlinecount = planBuserList.clusterSize - 1;
    arr.push(blankObj);
    
    res.send({ status: "200", data: arr });
})

// Downline list for plan B
router.get('/withdrawl', auth, async (req, res) => {
    const userid = req.user._id;
    if (!userid) return res.send({ status: "404", message: "User not found" });

    user = await User.findById(userid);
    console.log(user);

    let userPlanAWallet = await UserPaymentWallet.findOne({ userId: userid })
    console.log(userPlanAWallet);

    let planBuserList = await UserPlanb.find({ userId: userid });
    let totalAmountplanb = 0;
    for (var i of planBuserList) {
        let userPlanBWallet = await UserPaymentWalletForB.findOne({ userId: i._id })
        totalAmountplanb += userPlanBWallet.balancedAmount
        console.log("raw - ",userPlanBWallet.balancedAmount);
        console.log(totalAmountplanb);
    }
    console.log(totalAmountplanb);

    let userTotalWallet = await UserTotalWallet.findOne({ userId: userid })
    console.log(userTotalWallet);

    let tdsAmount = (10 / 100) * userTotalWallet.totalAmount;
    let mainBalance = userTotalWallet.totalAmount - tdsAmount;

    var blankObj = {}
    blankObj.uniqueId = user.uniqueId;
    blankObj.userName = user.name;
    blankObj.userImage = user.image;
    blankObj.planAIncome = userPlanAWallet.balancedAmount;
    blankObj.planBIncome = totalAmountplanb;
    blankObj.totalIncome = userTotalWallet.totalAmount;
    blankObj.tds = 10;
    blankObj.tdsAmount = tdsAmount;
    blankObj.mainBalance = mainBalance;
    blankObj.totalWithdrawl = userTotalWallet.withdralAmount;
    // arr.push(blankObj);
    
    res.send({ status: "200", data: blankObj, imageUrl: `${baseUrl}/users/` });
})

// User details for name
router.post('/withdrawl', auth, async (req, res) => {
    const userid = req.user._id;
    if (!userid) return res.send({ status: "404", message: "User not found" });
    const withdradlAmount = req.body.withdradlAmount;

    user = await User.findById(userid);
    console.log(user);

    let userpayactivity1 = new UserTotalWalletLog({
        userId: req.user._id,
        debit: withdradlAmount,
        description: user.uniqueId + '(' + user.name + ')'+ ' request ' + withdradlAmount + 'rs. for withdrawl.'  
    });
    userpayactivity1.save();

    res.send({ status: "200", "message":"Successfully sent request" });
})

// Add User KYC Update by admin
router.post('/withdrawlprocess',  [auth, admin], async (req, res) => {
    const userid = req.body.userId;
    if (!userid) return res.send({ status: "404", message: "User not found" });
    const withdradlAmount = req.body.withdradlAmount;
    const reqId = req.body.reqId;

    let usermainwallet = await UserTotalWallet.findOne({ userId: userid })
    usermainwallet.withdralAmount += withdradlAmount;
    usermainwallet.balancedAmount = usermainwallet.balancedAmount - withdradlAmount;
    usermainwallet.save();

    let usermainwalletlog = await UserTotalWalletLog.findOne({ _id: reqId })
    usermainwalletlog.statusFlag = 1;
    usermainwalletlog.paymentDate = Date.now();
    usermainwalletlog.save();

    res.send({ status: "200", "message":"Successfully withdrawled" });
});

// transaction report
router.get('/transactionreport', auth, async (req, res) => {
    const userid = req.user._id;
    if (!userid) return res.send({ status: "404", message: "User not found" });
    const withdradlAmount = req.body.withdradlAmount;

    user = await User.findById(userid);
    console.log(user);

    let userpayactivity1 = await UserTotalWalletLog.find({userId: userid});

    res.send({ status: "200", data:userpayactivity1 });
})

// Downline list for plan B in admin by user
router.get('/usersplanblist/:id', [auth, admin], async (req, res) => {

    let planBuserList = await UserPlanb.find({ userId: req.params.id });
    console.log(planBuserList);
    if (!planBuserList) return res.send({ status: "404", message: "You are not available in Global Matrix" });

    // const arr=[];
    // for (var i of planBuserList) {
    //     var blankObj = {}
    //     blankObj.PlanbId = i.uniqueIdPlanB;
    //     blankObj.level = i.level;
    //     blankObj.downlinecount = i.clusterSize - 1;
    //     arr.push(blankObj);
    // }
    
    
    res.send({ status: "200", data: planBuserList });
})

// user payment wallet by userid in admin
router.get('/userpaymenttotalwallet-admin/:id', [auth, admin], async (req, res) => {

    const userpaymentwallet = await UserTotalWallet.findOne({ userId: req.params.id })
                                                    .populate('userId', 'name uniqueId')
    if (!userpaymentwallet) return res.status(200).send({ data: userpaymentwallet, message: "No User wallet available" });

    res.status(200).send({ data: userpaymentwallet });

})

// user payment wallet by userid in admin
router.get('/userwithdrawlrequest-admin', [auth, admin], async (req, res) => {

    const withdrawlreq = await UserTotalWalletLog.find({ 'softDelete': '0' })
                                                    .populate('userId', 'name uniqueId')
    if (!withdrawlreq) return res.status(400).send({ data: withdrawlreq, message: "No request available" });

    res.status(200).send({ data: withdrawlreq });

})

module.exports = router; 