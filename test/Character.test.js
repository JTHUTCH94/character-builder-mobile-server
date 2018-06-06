'use strict';
const app = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_DATABASE_URL } = require('../config');

const Character = require('../character-model');
const seedCharacter = require('../db/seed/character');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Character API - Characters', function () {

  before(function () {
    return mongoose.connect(TEST_DATABASE_URL)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Promise.all([
      Character.insertMany(seedCharacter)
    ]);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('GET /api/characters', function () {
    it('Should return all existing characters', function(){
      return Promise.all([
        Character.find(),
        chai.request(app).get('/api/characters')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return a list with the correct right fields', function () {
      return Promise.all([
        Character.find(),
        chai.request(app).get('/api/characters')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(function (item) {
            expect(item).to.be.a('object');
            expect(item).to.have.keys('id', 'name', 'race', 'classification', 'weapon');
          });
        });
    });
  });

  /*describe('GET /api/characters/:id', function () {

    it('Should return correct character', function () {
      let data;
      return Character.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/characters/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name', 'race', 'classification', 'weapon');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.race).to.equal(data.race);
          expect(res.body.weapon).to.equal(data.weapon);
        });
    });*/


  describe('POST /api/characters', function () {

    it('should create and return a new character when provided valid data', function () {
      const newCharacter = {
        'name': 'Jack',
        'race': 'Elf',
        'classification': 'Bard',
        'weapon': 'Staff'
      };
      let res;
      return chai.request(app)
        .post('/api/characters')
        .send(newCharacter)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name', 'race', 'classification', 'weapon');
          return Character.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.race).to.equal(data.race);
          expect(res.body.weapon).to.equal(data.weapon);
        });
    });
  });

  describe('PUT /api/characters/:id', function () {

    it('should update the character', function () {
      const updateCharacter = {
        'name': 'Troy',
        'race': 'Orc',
        'classification': 'Knight',
        'weapon': 'Hammer'
      };
      let data;
      return Character.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app)
            .put(`/api/characters/${data.id}`)
            .send(updateCharacter);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name', 'race', 'classification', 'weapon');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.race).to.equal(updateCharacter.race);
          expect(res.body.weapon).to.equal(updateCharacter.weapon);
        });
    });
  });

  describe('DELETE  /api/characters/:id', function () {

    it('should delete a character by id', function () {
      let data;
      return Character.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).delete(`/api/characters/${data.id}`);
        })
        .then(function (res) {
          expect(res).to.have.status(204);
        });
    });
  });
});