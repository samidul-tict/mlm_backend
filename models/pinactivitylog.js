const mongoose = require('mongoose');

const pinActivityLogSchema = new mongoose.Schema({
    pinId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PinMaster',
        required: true
    }],
    purchasedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    sellBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    transactionNumber: String,
    createdDate: { type: Date, default: Date.now },
    softDelete: {
        type: Number,
        enum: [0, 1],
        default: 0
    }
})


const PinActivityLog = mongoose.model('PinActivityLog', pinActivityLogSchema);

exports.PinActivityLog = PinActivityLog;