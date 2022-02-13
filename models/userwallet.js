const mongoose = require('mongoose');

const userwalletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pinId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PinMaster',
        required: true
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


const UserWallet = mongoose.model('UserWallet', userwalletSchema);


exports.UserWallet = UserWallet;