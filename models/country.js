const mongoose = require('mongoose');
const Joi = require('joi');

const countrySchema = new mongoose.Schema({
    countryCode: {
        type: String,
        minlength: 2,
        maxlength: 64,
    },
    countryName: {
        type: String,
        minlength: 2,
        maxlength: 64,
    },
    filename: {
        type: String,
        default: 'noimg.png'
    },
    serveAt: {
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


const Country = mongoose.model('Country', countrySchema);

function validate(country) {
    const schema = {
        countryCode: Joi.string().required(),
        countryName: Joi.string().required(),
        serveAt: Joi.number().required()
    }

    return Joi.validate(country, schema);
}

exports.Country = Country;
exports.Validate = validate;