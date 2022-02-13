const mongoose = require('mongoose');

const userPaymentWalletActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    transactionId: {
        type: String,
        default: function () { return Math.random().toString(36).substr(2, 10).toUpperCase(); }
    },
    debit: {
        type: Number,
        default: 0
    },
    credit: {
        type: Number,
        default: 0
    },
    rewardForUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rank: {
        type: Number,
        default: 0
    },
    rewardType: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    description: String,
    createdDate: { type: Date, default: Date.now },
    softDelete: {
        type: Number,
        enum: [0, 1],
        default: 0
    }
})


const UserPaymentWalletActivity = mongoose.model('UserPaymentWalletActivity', userPaymentWalletActivitySchema);

exports.UserPaymentWalletActivityLog = UserPaymentWalletActivity;