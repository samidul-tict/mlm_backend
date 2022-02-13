const Joi = require('joi');
const mongoose = require('mongoose');

const userKycSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    kyc: [{
        kycId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'KycMaster',
            required: true
        },
        value: {
            type: String
        }, 
    }],
    accountImage: String,
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


const UserKyc = mongoose.model('UserKyc', userKycSchema);

function validateUserKyc(UserKyc) {
    const schema = {
        userId: Joi.string(),
        accountImage: Joi.string().allow(null),
        kyc: Joi.array()
    }

    return Joi.validate(UserKyc, schema);
}

exports.UserKyc = UserKyc;
exports.validateUserKyc = validateUserKyc;