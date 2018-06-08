'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const config = require('../config');
const router = express.Router();


const createAuthToken = function(user) {
  return jwt.sign({user}, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

const localAuth = passport.authenticate('local', {session: false});
router.use(bodyParser.json());
// The user provides a username and password to login
router.post('/login', localAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({authToken, userId: req.user._id});
});

// POST to register a new user
router.post('/register', (req, res) => {
  let { username, password, firstname, lastname } = req.body;
  let _hash;
  console.log(req.body);
  return User.find({username})
    .count()
    .then(count => {
      if(count > 0) {
        // There is an existing user with the same username
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      // If there is no existing user, hash the password
      return User.hashPassword(password); 
    })
    .then(hash => {
      _hash = hash;
    })
    .then(hash => { 
      return User.create({ 
        username, 
        password: _hash }); 
    })
    .then(user => {
      console.log(user);
      return res.status(201).json(user);
    })
    .catch(err => {
      // Forward validation errors on to the client, otherwise give a 500
      // error because something unexpected has happened
      if(err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      console.log(err);
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});


const jwtAuth = passport.authenticate('jwt', {session: false});

router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({ authToken, userId: req.user._id });
});

module.exports = {router};
