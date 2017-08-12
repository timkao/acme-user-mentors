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
    type: Sequelize.ARRAY(Sequelize.TEXT),
    defaultValue: []
  }
})

var Award = conn.define('award', {
  name: {
    type: Sequelize.STRING,
    //allowNull: false
  }
})


Award.belongsTo(User);
User.hasMany(Award);
User.belongsTo(User, {as: 'Mentor'});

User.generateAward = function(id) {
  var message = faker.company.catchPhrase()
  var newAward = []
  var currentUser
  return this.findById(id)
  .then(result => {
    currentUser = result
    result.award.push(message);
    newAward = result.award
    return this.update({award: newAward}, {
      where: {
        id: id
      }
    })
  })
  .then(() => {
    return Award.create({
      name: message
    })
  })
  .then(nAward => {
    nAward.setUser(currentUser)
  })
}

User.findUsersViewModel = function() {
  var allUsers;
  return this.findAll({
    include: Award
  })
  .then(result => {
    allUsers = result;
    var mentorsProms = []
    result.forEach( user => {
        mentorsProms.push(user.getMentor())
    })
    return Promise.all(mentorsProms)
  })
  .then( mentorNames => {
    var uniqueMentor = []
    for (var i = 0; i < mentorNames.length; i++) {

      if (mentorNames[i]) {
      if (uniqueMentor.length === 0) {
        uniqueMentor.push(mentorNames[i])
      }
      else {
        var unique = true;
        for (var j = 0; j < uniqueMentor.length; j++) {
          if (mentorNames[i].id === uniqueMentor[j].id) {
            unique = false
            break
          }
        }
        if (unique) {
          uniqueMentor.push(mentorNames[i])
        }
      }
      }
    }
    var mentorSelections = [];
    allUsers.forEach( user => {
      if (user.awards.length >= 2) {
        mentorSelections.push(user)
      }
    })
    // mentor do not show up when i pass in nunjucks
    /*
    allUsers = allUsers.map( user => {
        user.dataValues.mentor = 'check';
        for (var i = 0; i < result.length; i++) {
          if (result[i].id === user.MentorId) {
            user.dataValues.mentor = result[i].name
            break
          }
        }
      return user
    })
    */
    return [allUsers, uniqueMentor, mentorSelections]
  })
}

User.destroyById = function(id) {
  return this.destroy({
    where: {
      id: id
    }
  })
}

User.removeAward = function(userId, awardId) {
  return Award.destroy({
    where: {
      id: awardId
    }
  })
  .then(() => {
    return this.findAll({
      where: {
        id: userId
      },
      include: Award
    })
  })
  .then( result => {
    if (result[0].awards.length < 2) {
      return this.update({
        MentorId: null
      }, {
        where: {
          MentorId: result[0].id
        }
      })
    }
  })
}

User.updateUserFromRequestBody = function(id, reqBody) {
  return this.findAll({
    where: {
      name: reqBody.select
    }
  })
  .then( result => {
    //console.log(result);
    return this.update({MentorId: result[0].id}, {
      where: {
        id: id
      }
    })
  })
}


function sync() {
  return conn.sync({force: true, logging: false})
}

function seed() {
  var tim = User.create({
    name: 'Tim Kao',
    award: ['TBest Husband', 'TBest Boyfriend', 'TBest Life']
  })

  var peggy = User.create({
    name: 'Peggy Ho',
    award: ['PBest looking', 'PTop Sales']
  })

  var ken = User.create({
    name: 'Ken Chen',
    award: ['KBest Dancer']
  })

  var allen = User.create({
    name: 'Allen Wang',
    award: []
  })

  var normal = User.create({
    name: "Normal People",
    award: []
  })

  var taward1 = Award.create({
    name: 'TBest Husband'
  })

  var taward2 = Award.create({
    name: 'TBest Boyfriend'
  })

  var taward3 = Award.create({
    name: 'TBest Life'
  })

  var paward1 = Award.create({
    name: 'PBest Looking'
  })

  var paward2 = Award.create({
    name: 'PTop Sales'
  })

  var kaward1 = Award.create({
    name: 'KBest Dancer'
  })

  var persons
  return Promise.all([tim, peggy, ken, normal, allen])
  .then((result) => {
    persons = result
    result.forEach(people => {
      console.log(people.name + ' is created')
      if (people.name === 'Ken Chen' || people.name === 'Normal People') {
        people.setMentor(result[0])
      }
      else if (people.name === 'Allen Wang') {
        people.setMentor(result[1])
      }
    })
    return Promise.all([taward1, taward2, taward3, paward1, paward2, kaward1])
  })
  .then( awards => {
    // need a promise call to fix
      awards.forEach( award => {
        if (award.name[0] === 'T') {
          award.setUser(persons[0])
        }
        else if (award.name[0] === 'P') {
          award.setUser(persons[1])
        }
        else {
          award.setUser(persons[2])
        }
      })
  })

}

module.exports = {
  sync: sync,
  seed: seed,
  User: User,
  Award: Award
}
