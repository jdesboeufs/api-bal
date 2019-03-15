const test = require('ava')
const {MongoDBServer} = require('mongomem')
const express = require('express')
const request = require('supertest')
const {omit} = require('lodash')
const mongo = require('../../util/mongo')
const routes = require('..')

const GENERATED_VARS = ['_id', '_updated', '_created']
const KEYS = ['_id', '_bal', 'commune', 'voie', 'numero', 'positions', 'suffixe', '_created', '_updated']

test.before('start server', async () => {
  MongoDBServer.port = 27023 // Temp fix
  await MongoDBServer.start()
  await mongo.connect(await MongoDBServer.getConnectionString())
})

test.beforeEach('clean database', async () => {
  await mongo.db.collection('bases_locales').deleteMany({})
  await mongo.db.collection('voies').deleteMany({})
  await mongo.db.collection('numeros').deleteMany({})
})

test.after.always('cleanup', async () => {
  await mongo.disconnect()
  await MongoDBServer.tearDown()
})

function getApp() {
  const app = express()
  app.use(routes)
  return app
}

test.serial('create a numero', async t => {
  const _idVoie = new mongo.ObjectID()
  const _idBal = new mongo.ObjectID()
  await mongo.db.collection('bases_locales').insertOne({
    _id: _idBal,
    nom: 'foo',
    description: 'bar',
    emails: ['me@domain.tld'],
    communes: ['12345'],
    token: 'coucou',
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })
  await mongo.db.collection('voies').insertOne({
    _id: _idVoie,
    _bal: _idBal,
    commune: '12345',
    nom: 'voie',
    code: null,
    positions: [],
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })

  const {status, body} = await request(getApp())
    .post(`/voies/${_idVoie}/numeros`)
    .set({Authorization: 'Token coucou'})
    .send({numero: 42})

  t.is(status, 201)
  t.deepEqual(omit(body, GENERATED_VARS), {
    _bal: _idBal.toHexString(),
    voie: _idVoie.toHexString(),
    commune: '12345',
    numero: 42,
    suffixe: null,
    positions: []
  })
  t.true(KEYS.every(k => k in body))
  t.is(Object.keys(body).length, KEYS.length)
})

test.serial('create a numero / invalid payload', async t => {
  const _idVoie = new mongo.ObjectID()
  const _idBal = new mongo.ObjectID()
  await mongo.db.collection('bases_locales').insertOne({
    _id: _idBal,
    nom: 'foo',
    description: 'bar',
    emails: ['me@domain.tld'],
    communes: ['12345'],
    token: 'coucou',
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })
  await mongo.db.collection('voies').insertOne({
    _id: _idVoie,
    _bal: _idBal,
    commune: '12345',
    nom: 'voie',
    code: null,
    positions: [],
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })

  const {status} = await request(getApp())
    .post(`/voies/${_idVoie}/numeros`)
    .set({Authorization: 'Token coucou'})
    .send({numero: 'invalid numero'})

  t.is(status, 500)
})

test.serial('create a numero / invalid voie', async t => {
  const {status} = await request(getApp())
    .post('/voies/42/numeros')
    .set({Authorization: 'Token coucou'})
    .send({numero: 42})

  t.is(status, 404)
})
test.serial('create a numero / without admin token', async t => {
  const _idVoie = new mongo.ObjectID()
  const _idBal = new mongo.ObjectID()
  await mongo.db.collection('bases_locales').insertOne({
    _id: _idBal,
    nom: 'foo',
    description: 'bar',
    emails: ['me@domain.tld'],
    communes: ['12345'],
    token: 'coucou',
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })
  await mongo.db.collection('voies').insertOne({
    _id: _idVoie,
    _bal: _idBal,
    commune: '12345',
    nom: 'voie',
    code: null,
    positions: [],
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })

  const {status} = await request(getApp())
    .post(`/voies/${_idVoie}/numeros`)
    .send({numero: 42})

  t.is(status, 403)
})

test.serial('get all numeros from a voie', async t => {
  const _idVoie = new mongo.ObjectID()
  const _idBal = new mongo.ObjectID()
  const _id = new mongo.ObjectID()
  await mongo.db.collection('bases_locales').insertOne({
    _id: _idBal,
    nom: 'foo',
    description: 'bar',
    emails: ['me@domain.tld'],
    communes: ['12345'],
    token: 'coucou',
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })
  await mongo.db.collection('voies').insertOne({
    _id: _idVoie,
    _bal: _idBal,
    commune: '12345',
    nom: 'voie',
    code: null,
    positions: [],
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })
  await mongo.db.collection('numeros').insertOne({
    _id,
    _bal: _idBal,
    commune: '12345',
    voie: _idVoie,
    numero: 42,
    suffixe: null,
    positions: [],
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })

  const {status, body} = await request(getApp())
    .get(`/voies/${_idVoie}/numeros`)

  t.is(status, 200)
  t.is(body.length, 1)
})

test.serial('get all numeros from a voie / invalid voie', async t => {
  const {status} = await request(getApp())
    .get('/voies/42/numeros')

  t.is(status, 404)
})

test.serial('get a numero', async t => {
  const _idVoie = new mongo.ObjectID()
  const _idBal = new mongo.ObjectID()
  const _id = new mongo.ObjectID()
  await mongo.db.collection('bases_locales').insertOne({
    _id: _idBal,
    nom: 'foo',
    description: 'bar',
    emails: ['me@domain.tld'],
    communes: ['12345'],
    token: 'coucou',
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })
  await mongo.db.collection('voies').insertOne({
    _id: _idVoie,
    _bal: _idBal,
    commune: '12345',
    nom: 'voie',
    code: null,
    positions: [],
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })
  await mongo.db.collection('numeros').insertOne({
    _id,
    _bal: _idBal,
    commune: '12345',
    voie: _idVoie,
    numero: 42,
    suffixe: null,
    positions: [],
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })

  const {status, body} = await request(getApp())
    .get(`/numeros/${_id}`)

  t.is(status, 200)
  t.deepEqual(omit(body, GENERATED_VARS), {
    _bal: _idBal.toHexString(),
    voie: _idVoie.toHexString(),
    commune: '12345',
    numero: 42,
    suffixe: null,
    positions: []
  })
  t.true(KEYS.every(k => k in body))
  t.is(Object.keys(body).length, KEYS.length)
})

test.serial('get a numero / invalid numero', async t => {
  const {status} = await request(getApp())
    .get('/numeros/42')

  t.is(status, 404)
})

test.serial('modify a numero', async t => {
  const _idVoie = new mongo.ObjectID()
  const _idBal = new mongo.ObjectID()
  const _id = new mongo.ObjectID()
  await mongo.db.collection('bases_locales').insertOne({
    _id: _idBal,
    nom: 'foo',
    description: 'bar',
    emails: ['me@domain.tld'],
    communes: ['12345'],
    token: 'coucou',
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })
  await mongo.db.collection('voies').insertOne({
    _id: _idVoie,
    _bal: _idBal,
    commune: '12345',
    nom: 'voie',
    code: null,
    positions: [],
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })
  await mongo.db.collection('numeros').insertOne({
    _id,
    _bal: _idBal,
    commune: '12345',
    voie: _idVoie,
    numero: 42,
    suffixe: null,
    positions: [],
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })

  const {status, body} = await request(getApp())
    .put(`/numeros/${_id}`)
    .set({Authorization: 'Token coucou'})
    .send({numero: 24})

  t.is(status, 200)
  t.is(body.numero, 24)
})

test.serial('modify a numero / invalid numero', async t => {
  const _idVoie = new mongo.ObjectID()
  const _idBal = new mongo.ObjectID()
  await mongo.db.collection('bases_locales').insertOne({
    _id: _idBal,
    nom: 'foo',
    description: 'bar',
    emails: ['me@domain.tld'],
    communes: ['12345'],
    token: 'coucou',
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })
  await mongo.db.collection('voies').insertOne({
    _id: _idVoie,
    _bal: _idBal,
    commune: '12345',
    nom: 'voie',
    code: null,
    positions: [],
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })

  const {status} = await request(getApp())
    .put('/numeros/42')
    .set({Authorization: 'Token coucou'})
    .send({numero: 24})

  t.is(status, 404)
})

test.serial('modify a numero / invalid payload', async t => {
  const _idVoie = new mongo.ObjectID()
  const _idBal = new mongo.ObjectID()
  const _id = new mongo.ObjectID()
  await mongo.db.collection('bases_locales').insertOne({
    _id: _idBal,
    nom: 'foo',
    description: 'bar',
    emails: ['me@domain.tld'],
    communes: ['12345'],
    token: 'coucou',
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })
  await mongo.db.collection('voies').insertOne({
    _id: _idVoie,
    _bal: _idBal,
    commune: '12345',
    nom: 'voie',
    code: null,
    positions: [],
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })
  await mongo.db.collection('numeros').insertOne({
    _id,
    _bal: _idBal,
    commune: '12345',
    voie: _idVoie,
    numero: 42,
    suffixe: null,
    positions: [],
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })

  const {status} = await request(getApp())
    .put(`/numeros/${_id}`)
    .set({Authorization: 'Token coucou'})
    .send({numero: 'invalid numero'})

  t.is(status, 500)
})
test.serial('modify a numero / without admin token', async t => {
  const _idVoie = new mongo.ObjectID()
  const _idBal = new mongo.ObjectID()
  const _id = new mongo.ObjectID()
  await mongo.db.collection('bases_locales').insertOne({
    _id: _idBal,
    nom: 'foo',
    description: 'bar',
    emails: ['me@domain.tld'],
    communes: ['12345'],
    token: 'coucou',
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })
  await mongo.db.collection('voies').insertOne({
    _id: _idVoie,
    _bal: _idBal,
    commune: '12345',
    nom: 'voie',
    code: null,
    positions: [],
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })
  await mongo.db.collection('numeros').insertOne({
    _id,
    _bal: _idBal,
    commune: '12345',
    voie: _idVoie,
    numero: 42,
    suffixe: null,
    positions: [],
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })

  const {status} = await request(getApp())
    .put(`/numeros/${_id}`)
    .send({numero: 'invalid numero'})

  t.is(status, 403)
  const numero = await mongo.db.collection('numeros').findOne({_id})
  t.is(numero.numero, 42)
})

test.serial('delete a numero', async t => {
  const _idVoie = new mongo.ObjectID()
  const _idBal = new mongo.ObjectID()
  const _id = new mongo.ObjectID()
  await mongo.db.collection('bases_locales').insertOne({
    _id: _idBal,
    nom: 'foo',
    description: 'bar',
    emails: ['me@domain.tld'],
    communes: ['12345'],
    token: 'coucou',
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })
  await mongo.db.collection('voies').insertOne({
    _id: _idVoie,
    _bal: _idBal,
    commune: '12345',
    nom: 'voie',
    code: null,
    positions: [],
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })
  await mongo.db.collection('numeros').insertOne({
    _id,
    _bal: _idBal,
    commune: '12345',
    voie: _idVoie,
    numero: 42,
    suffixe: null,
    positions: [],
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })

  const {status} = await request(getApp())
    .delete(`/numeros/${_id}`)
    .set({Authorization: 'Token coucou'})

  t.is(status, 204)
  const numero = await mongo.db.collection('numeros').findOne({_id})
  t.falsy(numero)
})

test.serial('delete a numero / invalid numero', async t => {
  const {status} = await request(getApp())
    .delete('/numeros/42')

  t.is(status, 404)
})

test.serial('delete a numero / without admin token', async t => {
  const _idVoie = new mongo.ObjectID()
  const _idBal = new mongo.ObjectID()
  const _id = new mongo.ObjectID()
  await mongo.db.collection('bases_locales').insertOne({
    _id: _idBal,
    nom: 'foo',
    description: 'bar',
    emails: ['me@domain.tld'],
    communes: ['12345'],
    token: 'coucou',
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })
  await mongo.db.collection('voies').insertOne({
    _id: _idVoie,
    _bal: _idBal,
    commune: '12345',
    nom: 'voie',
    code: null,
    positions: [],
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })
  await mongo.db.collection('numeros').insertOne({
    _id,
    _bal: _idBal,
    commune: '12345',
    voie: _idVoie,
    numero: 42,
    suffixe: null,
    positions: [],
    _created: new Date('2019-01-01'),
    _updated: new Date('2019-01-01')
  })

  const {status} = await request(getApp())
    .delete(`/numeros/${_id}`)

  t.is(status, 403)
})