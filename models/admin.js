const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require('joi');
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 10,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Role'
    },
    authToken: String,
    isAdmin: {
        type: Boolean,
        default: true
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


adminSchema.methods.generateAuthToken = function (role) {
    const token = jwt.sign({ _id: this._id, name: this.name, email: this.email, isAdmin: this.isAdmin, role: role }, config.get('jwtPrivateKey'), { expiresIn: '6h' });
    return token;
}

const Admin = mongoose.model('Admin', adminSchema);

function validateAdmin(admin) {
    const schema = {
        name: Joi.string().max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        phone: Joi.string().length(10).regex(/^[0-9]+$/).required(),
        password: Joi.string().min(5).max(255).required(),
        // role: Joi.objectId().required()
    }

    return Joi.validate(admin, schema);
}

function validateUpdate(player) {
    const schema = {
        name: Joi.string().max(50).required(),
        phone: Joi.string().length(10).regex(/^[0-9]+$/).required(),
        // role: Joi.objectId().required()
    }

    return Joi.validate(player, schema, { allowUnknown: true });
}

function validatePassword(password) {
    const schema = {
        old_password: Joi.string().min(5).max(50).required(),
        new_password: Joi.string().min(5).max(50).required(),
    }

    return Joi.validate(password, schema);
}

exports.Admin = Admin;
exports.validateAdmin = validateAdmin;
exports.validateUpdate = validateUpdate;
exports.validatePassword = validatePassword;