const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require('joi');
const mongoose = require('mongoose');
const { baseUrl } = require('../util/constants');

const levelSchema = new mongoose.Schema({
    upperLevel1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    upperLevel2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    upperLevel3: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    upperLevel4: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    upperLevel5: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    upperLevel6: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    upperLevel7: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    upperLevel8: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    upperLevel9: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    upperLevel10: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    upperLevel11: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    upperLevel12: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
}); 

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        minlength: 5,
        maxlength: 255,
    },
    validateEmail: {
        type: String,
        enum: ['0', '1'],
        default: '0'
    },
    phone: {
        type: String,
        minlength: 8,
        maxlength: 15
    },
    password: {
        type: String
    },
    image: {
        type: String,
        default: 'noimg.png'
    },
    uniqueId: {
        type: String,
        default: function () { return Math.random().toString(36).substr(2, 6).toUpperCase(); }
    },
    introducerId: {
        type: String,
        default: ''
    },
    sponsorId: {
        type: String,
        default: ''
    },
    planALevels: levelSchema,
    joiningPin: {
        type: String,
        default: ''
    },
    planBEntered: {
        type: Boolean,
        default: false
    },
    planBLevel: Number,
    planBStatus: {
        type: String,
        enum: ['0', '1'],
        default: '0'
    },
    otp: Number,
    authToken: String,
    deviceKey: String,
    address: String,
    gender: String,
    identificationNo: String,
    city: String,
    pincode: String,
    state: String,
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country'
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


userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({
        _id: this._id,
        name: this.name,
        email: this.email,
        image: this.image,
        phone: this.phone,
        status: this.isActive,
        uniqueId: this.uniqueId
    }, config.get('jwtPrivateKey'));
    return token;
}

const User = mongoose.model('User', userSchema);

function validateUser(user) {
    const schema = {
        name: Joi.string().max(50),
        phone: Joi.string().allow(''),
        country: Joi.string(),
        address: Joi.string().allow(""),
        identificationNo: Joi.string().allow(null),
        gender: Joi.string().allow(null),
        introducerId: Joi.string(),
        sponsorId: Joi.string(),
        joiningPin: Joi.string(),
    }

    return Joi.validate(user, schema);
}

function validateUpdate(user) {
    const schema = {
        name: Joi.string().max(50),
        phone: Joi.string(),
        email: Joi.string().min(5).max(255).email(),
        image: Joi.string().allow(null),
        address: Joi.string().allow(""),
        identificationNo: Joi.string().allow(null),
        gender: Joi.string().allow(null),
        uniqueId: Joi.string().allow(null),
        password: Joi.string().allow(null),
        introducerId: Joi.string(),
        sponsorId: Joi.string(),
        joiningPin: Joi.string(),
    }

    return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;
exports.validateUpdate = validateUpdate;


















// const jwt = require('jsonwebtoken');
// const config = require('config');
// const Joi = require('joi');
// const mongoose = require('mongoose');
// const { baseUrl } = require('../util/constants');

// const levelSchema = new mongoose.Schema({
//     upperLevel1: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     upperLevel2: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     upperLevel3: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     upperLevel4: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     upperLevel5: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     upperLevel6: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     upperLevel7: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     upperLevel8: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     upperLevel9: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     upperLevel10: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     upperLevel11: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     upperLevel12: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
// }); 

// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         maxlength: 50
//     },
//     email: {
//         type: String,
//         minlength: 5,
//         maxlength: 255,
//     },
//     validateEmail: {
//         type: String,
//         enum: ['0', '1'],
//         default: '0'
//     },
//     phone: {
//         type: String,
//         minlength: 8,
//         maxlength: 15
//     },
//     password: {
//         type: String
//     },
//     image: {
//         type: String,
//         default: 'noimg.png'
//     },
//     uniqueId: {
//         type: String,
//         default: function () { return Math.random().toString(36).substr(2, 6).toUpperCase(); }
//     },
//     introducerId: {
//         type: String,
//         default: ''
//     },
//     sponsorId: {
//         type: String,
//         default: ''
//     },
//     planALevels: levelSchema,
//     joiningPin: {
//         type: String,
//         default: ''
//     },
//     planBEntered: {
//         type: Boolean,
//         default: false
//     },
//     planBLevel: Number,
//     planBStatus: {
//         type: String,
//         enum: ['0', '1'],
//         default: '0'
//     },
//     otp: Number,
//     authToken: String,
//     deviceKey: String,
//     address: String,
//     city: String,
//     pincode: String,
//     state: String,
//     country: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Country'
//     },
//     createdDate: { type: Date, default: Date.now },
//     modifiedDate: Date,
//     modifiedBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Admin'
//     },
//     isActive: {
//         type: String,
//         enum: ['0', '1'],
//         default: '1'
//     },
//     softDelete: {
//         type: String,
//         enum: ['0', '1'],
//         default: '0'
//     }
// })


// userSchema.methods.generateAuthToken = function () {
//     const token = jwt.sign({
//         _id: this._id,
//         name: this.name,
//         email: this.email,
//         image: this.image,
//         phone: this.phone,
//         status: this.isActive,
//         uniqueId: this.uniqueId
//     }, config.get('jwtPrivateKey'));
//     return token;
// }

// const User = mongoose.model('User', userSchema);

// function validateUser(user) {
//     const schema = {
//         name: Joi.string().max(50),
//         phone: Joi.string().allow(''),
//         country: Joi.string(),
//         address: Joi.string().allow(null),
//         introducerId: Joi.string(),
//         sponsorId: Joi.string(),
//         joiningPin: Joi.string(),
//     }

//     return Joi.validate(user, schema);
// }

// function validateUpdate(user) {
//     const schema = {
//         name: Joi.string().max(50),
//         phone: Joi.string(),
//         email: Joi.string().min(5).max(255).email(),
//         image: Joi.string().allow(null),
//         address: Joi.string().allow(null),
//         introducerId: Joi.string(),
//         sponsorId: Joi.string(),
//         joiningPin: Joi.string(),
//     }

//     return Joi.validate(user, schema);
// }

// exports.User = User;
// exports.validate = validateUser;
// exports.validateUpdate = validateUpdate;