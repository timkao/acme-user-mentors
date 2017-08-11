const Sequelize = require('sequelize')
const conn = new Sequelize(process.env.DATABASE_URL)
const Promise = require('bluebird')
const faker = require('faker')


var User = conn.define('user', {
  name: {
    type: Sequelize.STRING,
    //allowNull: false
  },
  award: {
    type: Sequelize.ARRAY(Sequelize.TEXT)
  }
})

User.belongsTo(User, {as: 'Mentor'});

User.generateAward = function(id) {
  var message = faker.lorem.sentence()
  var newAward = []
  return this.findById(id)
  .then(result => {
    result.award.push(message);
    newAward = result.award
    this.update({award: newAward}, {
      where: {
        id: id
      }
    })
  })
}

User.findUsersViewModel = function() {
  var allUsers
  return this.findAll({})
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
  .then(result => {
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
    return allUsers
  })
}

function sync() {
  return conn.sync({force: true})
}

function seed() {
  var tim = User.create({
    name: 'Tim Kao',
    award: ['Best Husband', 'Best Boyfriend', 'Best Life']
  })

  var peggy = User.create({
    name: 'Peggy Ho',
    award: ['Best Comedian', 'Best looking', 'Top Sales']
  })

  var ken = User.create({
    name: 'Ken Chen',
    award: ['Best Dancer']
  })

  var allen = User.create({
    name: 'Allen Wang',
    award: []
  })

  var normal = User.create({
    name: "Normal People",
    award: []
  })

  return Promise.all([tim, peggy, ken, normal, allen])
  .then((result) => {
    result.forEach(people => {
      console.log(people.name + ' is created')
      if (people.name === 'Ken Chen' || people.name === 'Normal People') {
        people.setMentor(result[0])
      }
      else if (people.name === 'Allen Wang') {
        people.setMentor(result[1])
      }
    })
  })

}

module.exports = {
  sync: sync,
  seed: seed,
  User: User
}
