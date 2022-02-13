const mongoose = require('mongoose');

const userpaymentwalletforbSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserPlanb'
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    withdralAmount: {
        type: Number,
        default: 0
    },
    balancedAmount: {
        type: Number,
        default: 0
    },
    planBrank: {
        type: Number,
        default: 1
    },
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


const UserPaymentWalletForB = mongoose.model('UserPaymentWalletForB', userpaymentwalletforbSchema);


exports.UserPaymentWalletForB = UserPaymentWalletForB;