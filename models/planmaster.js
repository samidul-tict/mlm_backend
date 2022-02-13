const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require('joi');
const mongoose = require('mongoose');
const { baseUrl } = require('../util/constants');

const planMasterSchema = new mongoose.Schema({
    planType: String,
    rank: Number,
    teamSize: Number,
    payout: Number,
    totalIncome: Number,
    globalMatrixRupee: Number,
    globalMatrixDoller: Number,
    globalMatrixRewards: String,
    createdDate: { type: Date, default: Date.now },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    modifiedDate: Date,
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    isActive: {
        type: String,
        enum: ['0', '1'],
        default: '1'
    },
    softDelete: {
        type: String,
        enum: ['0', '1'],
        default: '0'
    }
})

const PlanMaster = mongoose.model('PlanMaster', planMasterSchema);

function validate(planmaster) {
    const schema = {
        planType: Joi.string().required(),
        rank: Joi.number().required(),
        teamSize: Joi.number().allow(''),
        payout: Joi.number().allow(''),
        totalIncome: Joi.number().allow(''),
        globalMatrixRupee: Joi.number().allow(''),
        globalMatrixDoller: Joi.number().allow(''),
        globalMatrixRewards: Joi.string().allow(''),
    }
    return Joi.validate(planmaster, schema);
}

function validateObjectId(object) {
    return Joi.validate(object, { id: Joi.objectId() });
}

exports.PlanMaster = PlanMaster;
exports.Validate = validate;
exports.ValidateObjectId = validateObjectId;