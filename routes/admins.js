const bcrypt = require('bcrypt');
const _ = require('lodash');
const express = require('express');
const router = express.Router();
const { Admin, validateAdmin, validateUpdate, validatePassword } = require('../models/admin');
// const { Role } = require('../models/role');
const Joi = require('joi');
const auth = require('../middeware/auth');
const admin = require('../middeware/admin');
// const { auditFunc } = require('../models/audit');
const role = require('../middeware/role');

// Get Current Admin
router.get('/profile', auth, async (req, res) => {
  const admin = await Admin.findById(req.user._id).select('name email phone -_id');
  res.send(admin);
})

// Authenticate an admin (login)
router.post('/auth', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  const admin = await Admin.findOne({ email: req.body.email,password: req.body.password})
  if (!admin) return res.status(400).send({ message: "Invalid email or password." });

  // const validPassword = await bcrypt.compare(req.body.password, admin.password);
  // if (!validPassword) return res.status(400).send({ message: "Invalid email or password." });

  const token = admin.generateAuthToken(role);

  res.header('Authorization', token).send({ message: "Login Successful" });
});

// change password
router.post('/changepassword', [auth, admin], async (req, res) => {
  console.log(req.user)
  
  adminnew = await Admin.findOne({'_id':req.user._id,'password':req.body.oldPassword});
  console.log(adminnew);

  if (!adminnew)
      return res.send({ status: "200", message: "Sorry old password not matched" });
  
  adminnew.password = req.body.newPassword;

  console.log(adminnew)
  adminnew.save(function(err) {
    if(err) {
      console.log(err);

    };
  })

  res.status(200).send({ message: "Password Updated Successfully" });
});



function validate(req) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  }

  return Joi.validate(req, schema);
}

module.exports = router;