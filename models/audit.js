const mongoose = require('mongoose');
const _ = require('lodash');

const auditSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
    },
    userType: {
        type: String,
        enum: ['A', 'U'],    //Admin and User,
        required: true
    },
    title: String,
    description: String,
    ip: String,
    createdDate: {
        type: Date,
        default: Date.now
    }
})

const Audit = mongoose.model('Audit', auditSchema);

async function auditFunc(audit) {

    audit = _.pick(audit, ['user', 'admin', 'title', 'description', 'ip']);
    audit.userType = audit.user ? 'P' : 'A';
    audit.description = JSON.stringify(audit.description);
    audit = new Audit(audit);
    await audit.save()
}

exports.Audit = Audit;
exports.auditFunc = auditFunc;