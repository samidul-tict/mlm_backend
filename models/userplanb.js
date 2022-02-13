const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require('joi');
const mongoose = require('mongoose');
const { baseUrl } = require('../util/constants');

const userplanbSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    uniqueIdPlanB: {
        type: String,
        default: function () { return Math.random().toString(36).substr(2, 6).toUpperCase(); }
    },
    level: {
        type: Number,
        default: 1
    },
    clusterSize: {
        type: Number,
        default: 1,
        min: 1,
        max: 7
    },
    leftUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserPlanb'
    },
    rightUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserPlanb'
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

const UserPlanb = mongoose.model('UserPlanb', userplanbSchema);

exports.UserPlanb = UserPlanb;






// userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
// },
// uniqueIdPlanA: {
//     type: String
// },
// uniqueIdPlanB: {
//     type: String,
//     default: function () { return Math.random().toString(36).substr(2, 6).toUpperCase(); }
// },
// referBy: {
//     type: String
// },
// lebel: {
//     type: Number
// },
// lebelStatus: {
//     type: String,
//     enum: ['0', '1'],
//     default: '1'
// },
// rankCode:{
//     type:String,
//     enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G']
// },
// rankStatus: {
//     type: String,
//     enum: ['0', '1'],
//     default: '1'
// },

// createdDate: { type: Date, default: Date.now },
// modifiedDate: Date,
// modifiedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Admin'
// },
// isActive: {
//     type: String,
//     enum: ['0', '1'],
//     default: '1'
// },
// softDelete: {
//     type: String,
//     enum: ['0', '1'],
//     default: '0'
// }