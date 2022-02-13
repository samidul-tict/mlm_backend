const mongoose = require('mongoose');
const Joi = require('joi');

const pinMasterSchema = new mongoose.Schema({
    pinNumber: {
        type: String,
        default: function () { return Math.random().toString(36).substr(2, 6).toUpperCase(); }
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    purchasedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    usedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    transferBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    suggestFormUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    suggestToUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    useStatus: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
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
        type: Number,
        enum: [0, 1],
        default: 1
    },
    softDelete: {
        type: Number,
        enum: [0, 1],
        default: 0
    }
})


const PinMaster = mongoose.model('PinMaster', pinMasterSchema);

function validate(pinmaster) {
    const schema = {
        pinNumber: Joi.string().required(),
        productId: Joi.objectId().required()
    }

    return Joi.validate(pinmaster, schema);
}

exports.PinMaster = PinMaster;
exports.Validate = validate;