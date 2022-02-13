const mongoose = require('mongoose');

const usertotalwalletlogSchema = new mongoose.Schema({
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
    description: String,
    statusFlag: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    createdDate: { type: Date, default: Date.now },
    paymentDate: { type: Date },
    softDelete: {
        type: Number,
        enum: [0, 1],
        default: 0
    }
})


const UserTotalWalletLog = mongoose.model('UserTotalWalletLog', usertotalwalletlogSchema);

exports.UserTotalWalletLog = UserTotalWalletLog;