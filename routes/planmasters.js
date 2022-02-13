const express = require('express');
const router = express.Router();
const auth = require('../middeware/auth');
const admin = require('../middeware/admin');
const { PlanMaster, Validate, ValidateObjectId, } = require('../models/planmaster');
const _ = require('lodash');


// Plan List By products
router.get('/plana', [auth, admin], async (req, res) => {

    let pageIndex = parseInt(req.query.pageIndex);
    let pageSize = parseInt(req.query.pageSize);
    let sort = req.query.sort;
    const count = await PlanMaster.countDocuments({ planType: 'A', softDelete: '0' });
    const planList = await PlanMaster.find({ planType: 'A', softDelete: '0' })
        .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
        .sort(sort)
        .select("planType rank teamSize payout totalIncome createdDate ")
    res.status(200).send({ planList: planList, count: count });

})

// Plan List By products
router.get('/planb', [auth, admin], async (req, res) => {

    let pageIndex = parseInt(req.query.pageIndex);
    let pageSize = parseInt(req.query.pageSize);
    let sort = req.query.sort;
    const count = await PlanMaster.countDocuments({ planType: 'B', softDelete: '0' });
    const planList = await PlanMaster.find({ planType: 'B', softDelete: '0' })
        .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
        .sort(sort)
        .select("planType rank globalMatrixRupee globalMatrixDoller globalMatrixRewards createdDate ")
    res.status(200).send({ planList: planList, count: count });

})


// Add Plan
router.post('/', [auth, admin], async (req, res) => {

    const { error } = Validate(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    let planmaster = await PlanMaster.findOne({ planType: req.body.planType, rank: req.body.rank });
    if (planmaster) return res.status(409).send({ message: "Plan already Exist." });

    planmaster = new PlanMaster(_.pick(req.body, ['planType', 'rank', 'teamSize', 'payout', 'totalIncome', 'globalMatrixRupee', 'globalMatrixDoller', 'globalMatrixRewards']));
    planmaster.createdBy = req.user._id;

    planmaster.save()


    res.send({ message: "Plan Saved Successfully" });
})

//Update Rank
router.put('/rank/:id', [auth, admin], async (req, res) => {
    const { error } = ValidateObjectId(req.params);
    if (error) return res.status(400).send({ message: error.details[0].message });

    if (!req.body.rank) return res.status(400).send({ message: 'Enter Rank' });

    await PlanMaster.findByIdAndUpdate(req.params.id, { rank: req.body.rank });
    res.send({ message: 'Rank Updated Successfully' });
})

//Update Team Size
router.put('/teamsize/:id', [auth, admin], async (req, res) => {
    const { error } = ValidateObjectId(req.params);
    if (error) return res.status(400).send({ message: error.details[0].message });
    if (!req.body.teamSize) return res.status(400).send({ message: 'Enter Team Size' });

    await PlanMaster.findByIdAndUpdate(req.params.id, { teamSize: req.body.teamSize });
    res.send({ message: 'Team Size Updated Successfully' });
})


//Update Payout
router.put('/payout/:id', [auth, admin], async (req, res) => {
    const { error } = ValidateObjectId(req.params);
    if (error) return res.status(400).send({ message: error.details[0].message });
    if (!req.body.payout) return res.status(400).send({ message: 'Enter Payout' });

    await PlanMaster.findByIdAndUpdate(req.params.id, { payout: req.body.payout });
    res.send({ message: 'Payout Updated Successfully' });
})


//Update Income
router.put('/income/:id', [auth, admin], async (req, res) => {
    const { error } = ValidateObjectId(req.params);
    if (error) return res.status(400).send({ message: error.details[0].message });
    if (!req.body.totalIncome) return res.status(400).send({ message: 'Enter Income' });

    await PlanMaster.findByIdAndUpdate(req.params.id, { totalIncome: req.body.totalIncome });
    res.send({ message: 'Income Updated Successfully' });
})

//Update Matrix INR
router.put('/inrmatrix/:id', [auth, admin], async (req, res) => {
    const { error } = ValidateObjectId(req.params);
    if (error) return res.status(400).send({ message: error.details[0].message });
    if (!req.body.globalMatrixRupee) return res.status(400).send({ message: 'Enter Price' });

    await PlanMaster.findByIdAndUpdate(req.params.id, { globalMatrixRupee: req.body.globalMatrixRupee });
    res.send({ message: 'Price Updated Successfully' });
})

//Update Matrix USD
router.put('/usmatrix/:id', [auth, admin], async (req, res) => {
    const { error } = ValidateObjectId(req.params);
    if (error) return res.status(400).send({ message: error.details[0].message });
    if (!req.body.globalMatrixDoller) return res.status(400).send({ message: 'Enter Payout' });

    await PlanMaster.findByIdAndUpdate(req.params.id, { globalMatrixDoller: req.body.globalMatrixDoller });
    res.send({ message: 'Payout Updated Successfully' });
})





//Update Matrix Rewards
router.put('/reward/:id', [auth, admin], async (req, res) => {
    const { error } = ValidateObjectId(req.params);
    if (error) return res.status(400).send({ message: error.details[0].message });
    if (!req.body.globalMatrixRewards) return res.status(400).send({ message: 'Enter Rewards' });

    await PlanMaster.findByIdAndUpdate(req.params.id, { globalMatrixRewards: req.body.globalMatrixRewards });
    res.send({ message: 'Rewards Updated Successfully' });
})


// Delete Plan
router.delete('/:id', [auth, admin], async (req, res) => {
    const { error } = ValidateObjectId(req.params);
    if (error) return res.status(400).send({ message: error.details[0].message });
    const planmaster = await PlanMaster.findById(req.params.id)

    if (!planmaster)
        return res.status(404).send({ message: "The Plan with following id not found !" });

    planmaster.softDelete = '1';
    planmaster.save();



    res.send({ message: "Plan Deleted Successfully" });
});

module.exports = router;