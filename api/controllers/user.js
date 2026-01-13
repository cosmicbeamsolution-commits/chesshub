const path = require("path")
const bson = require('bson')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const emailHelper = require('../email/helper')
const emailClient = emailHelper()
const bcrypt = require('bcrypt')
const tokenExpires = 86400 * 30 * 12 // 1 year
const saltRounds = 10
var ObjectId = require('mongodb').ObjectId

module.exports = {
  login: (req, res) => {
    var email = req.body.email.toLowerCase()
    var password = req.body.password
    req.app.db.collection('accounts').findOne({
      email: email
    },function(err, user) {
      if (err) return res.status(500).send('Error on the server.')
      if (!user || !user.password) return res.status(404).send('No user found.')
      let passwordIsValid = bcrypt.compareSync(req.body.password, user.password)
      if (!passwordIsValid) return res.status(401).send({ auth: false, token: null })
      let token = jwt.sign({ id: user._id }, process.env.APP_SECRET, {
        expiresIn: tokenExpires
      })
      res.status(200).send({ auth: true, token: token, user: user })
    })
  },
  register: (req, res) => {
    let password = req.body.password
    if (!password) {
      return res.json({ status: 'error', message: 'no_password_given'})
    }

    bcrypt.hash(password, saltRounds, function (err, hash) {
      db.collection('accounts').findOneAndUpdate({
        _id: new ObjectId(req.body._id)
      },
      {
        "$set": {
          code: req.body.code,
          password: hash,
          email: req.body.email,
          updatedAt: moment().utc().format()
        }
      },{ 
        upsert: true, 
        'new': true, 
        returnOriginal:false 
      }).then(function(data) {
        return res.json(data.value)
      })
    })    
  }
}