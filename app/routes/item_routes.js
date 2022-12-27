const express = require('express')
const passport = require('passport')

const Item = require('../models/item')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

// INDEX
router.get('/items', requireToken, (req, res, next) => {
  Item.find()
    .then(items => {
      return items.map(item => item.toObject())
    })
    .then(items => res.status(200).json({ items: items }))
    .catch(next)
})

// GET /items/:id
router.get('/items/:id', requireToken, (req, res, next) => {
  Item.findById(req.params.id)
    .then(handle404)
    .then(item => res.status(200).json({ item: item.toObject() }))
    .catch(next)
})

// POST /items
router.post('/items', requireToken, (req, res, next) => {
  // set owner of new item to be current user -- auth
  req.body.item.owner = req.user.id

  Item.create(req.body.item)
    .then(item => {
      res.status(201).json({ item: item.toObject() })
    })
    .catch(next)
})

// PATCH /items/:id
router.patch('/items/:id', requireToken, removeBlanks, (req, res, next) => {
  // delete re-owner
  delete req.body.item.owner

  Item.findById(req.params.id)
    .then(handle404)
    .then(item => {
      requireOwnership(req, item)

      return item.updateOne(req.body.item)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

// DELETE /items/:id
router.delete('/items/:id', requireToken, (req, res, next) => {
  Item.findById(req.params.id)
    .then(handle404)
    .then(item => {
      requireOwnership(req, item)
      item.deleteOne()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
