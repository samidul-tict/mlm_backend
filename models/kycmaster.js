const Joi = require('joi');
const mongoose = require('mongoose');

const kycMasterSchema = new mongoose.Schema({
    countryid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country',
    },
    kycfields: [{
        kyc: {
            type: String,
        },
    }],
    createdDate: { type: Date, default: Date.now },
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
 

const KycMaster = mongoose.model('KycMaster', kycMasterSchema);

function validateKycMaster(KycMaster) {
    const schema = {
        countryid: Joi.string().required(),
        kycfields: Joi.array()
    }

    return Joi.validate(KycMaster, schema);
}

exports.KycMaster = KycMaster;
exports.validateKycMaster = validateKycMaster;