const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require('joi');
const mongoose = require('mongoose');

const purchaseRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    quantity: Number,
    amount: Number,
    transactionNumber: String,
    transactionFile: String,
    createdDate: { type: Date, default: Date.now },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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

const PurchaseRequest = mongoose.model('PurchaseRequest', purchaseRequestSchema);

function validatepar(purchaseRequest) {
    const schema = {
        userId: Joi.objectId(),
        productId: Joi.objectId().required(),
        quantity: Joi.number().required(),
        amount: Joi.number().required(),
        transactionFile: Joi.string().allow('').optional(),
        transactionNumber: Joi.string().allow('')

    }

    return Joi.validate(purchaseRequest, schema);
}

exports.PurchaseRequest = PurchaseRequest;
exports.Validatepar = validatepar;