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
      mentors: result[1]
    })
  })
  .catch(next)
  /*
  var allUsers
  models.User.findAll({})
  .then(users => {
    allUsers = users
    var mentorsProms = []
    users.forEach( user => {
      if (user.MentorId !==  null) {
        mentorsProms.push(user.getMentor())
      }
    })

    return Promise.all(mentorsProms)

  })
  .then((result) => {
    allUsers = allUsers.map(user => {
      if (user.MentorId !== null) {
        for (var i = 0; i < result.length; i++) {
          if (result[i].id && result[i].id === user.MentorId) {
            user.dataValues.mentor = result[i].name
            break
          }
        }
      }
      return user
    })
    res.render('users', {
      showUser: true,
      users: allUsers,
      scale: Math.floor(12 / allUsers.length)
    })
  })
*/
})

router.post('/:id/award', (req, res, next) => {
  User.generateAward(req.params.id)
  .then(() => {
    res.redirect('/users')
  })
  .catch(next)

  /*
  var message = 'need input from faker'
  var newAward = [];
  models.User.findById(req.params.id)
  .then(result => {
    result.award.push(message);
    newAward = result.award
    return models.User.update({award: newAward}, {
      where: {
        id: req.params.id
      }
    })
  })
  .then(() => {
    res.redirect('/users')
  })
  .catch(next)
  */
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

router.get('/check', (req, res, next) => {
  var allUsers;
  User.findAll({
    include: Award
  })
  .then(result => {
    allUsers = result;
    var mentorsProms = []
    result.forEach( user => {
      if (user.MentorId !==  null) {
        mentorsProms.push(user.getMentor())
      }
    })
    return Promise.all(mentorsProms)
  })
  .then( result => {
    allUsers = allUsers.map(user => {
      if (user.MentorId !== null) {
        for (var i = 0; i < result.length; i++) {
          if (result[i].id && result[i].id === user.MentorId) {
            user.dataValues.mentor = result[i].name
            break
          }
        }
      }
      return user
    })
    res.send(allUsers);
  })
})

router.delete('/:userId/awards/:id', (req, res, next) => {
  User.removeAward(req.params.userId, req.params.id)
    .then(() => {
      res.redirect('/users')
    })
    .catch( next);
});

module.exports = router
