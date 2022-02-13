const mongoose = require('mongoose');
const Joi = require('joi');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 255
    },
    filename: {
        type: String,
        default: 'pinlogo.png'
    },
    pins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PinMaster'
    }],
    priceBangladesh: {
        type: String,
        required: true,
        maxlength: 255
    },
    priceIndia: {
        type: String,
        required: true,
        maxlength: 255
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


const Product = mongoose.model('Product', productSchema);

function validate(product) {
    const schema = {
        name: Joi.string().required(),
        priceBangladesh: Joi.string().required(),
        priceIndia: Joi.string().required(),
    }

    return Joi.validate(product, schema);
}

exports.Product = Product;
exports.Validate = validate;