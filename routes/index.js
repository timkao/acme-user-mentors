const router = require('express').Router()
const models = require('../models')
const User = models.User
const Award = models.Award
const Promise = require('bluebird')

router.get('/', (req, res, next) => {
  User.findUsersViewModel()
  .then(result => {
      res.render('users', {
      showUser: true,
      users: result[0],
      mentors: result[1],
      selections: result[2]
    })
  })
  .catch(next)
})

router.post('/:id/award', (req, res, next) => {
  User.generateAward(req.params.id)
  .then(() => {
    res.redirect('/users')
  })
  .catch(next)
})

router.post('/', (req, res, next) => {
  User.create(req.body)
  .then(() => {
    res.redirect('/users')
  })
  .catch(next)
})

router.delete('/:id', (req, res, next) => {
  User.destroyById(req.params.id)
  .then(() => {
    res.redirect('/users')
  })
  .catch(next)
})

router.delete('/:userId/award/:id', (req, res, next) => {
  User.removeAward(req.params.userId, req.params.id)
    .then(() => {
      res.redirect('/users')
    })
    .catch( next);
})

router.put('/:id', (req, res, next) => {
  User.updateUserFromRequestBody(req.params.id, req.body)
    .then(() => {
      res.redirect('/users')
    })
    .catch(next);

})

module.exports = router
