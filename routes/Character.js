'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Character = require('../models/character-model');


router.get('/characters-mobile', (req, res) => {
  Character.find()
    .then(response => {
      res.json(response);
    })
    .catch(err => {
      console.log(err);
    });
});
    
/*router.get('/characters/:id', (req, res) => {
  Character.findById({ _id: req.params.id })
    .then(response => {
      res.json(response);
    })
    .catch(err => {
      console.log(err);
    });
});*/
    
router.post('/characters-mobile', (req, res) => {
  const character = new Character({
    name: req.body.name,
    race: req.body.race,
    classification: req.body.classification,
    weapon: req.body.weapon
  });
  character.save();
  res.json(character);
});
    
router.put('/characters-mobile/:id', (req, res) => {
  const id = req.params.id;
  const updateObj = {};
  const updateFields = ['name', 'race', 'classification', 'weapon'];
    
  updateFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });
    
  Character.findByIdAndUpdate(id, updateObj, { new: true })
    .then(item => {
      if (item) {
        res.json(item);
      }
    })
    .catch(err => console.log(err));
});
    
router.delete('/characters-mobile/:id', (req, res) => {
  Character.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch(err => console.log(err));
});

module.exports = router;