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
  random: (req, res) => {
    req.app.db.collection('groups').aggregate([
      { "$match" : { "broadcast": true } },
      { "$project" : { code: 1, games: 1, minutes: 1, compensation: 1, users: 1 } },
      {
        "$redact": {
            "$cond": [
                { 
                  "$lt": [ { "$strLenCP": "code" }, 20]
                },
                "$$KEEP",
                "$$PRUNE"
            ]
        }
      },
      { $sample: { size: 9 } }
      ]).toArray(function(err,docs) {
        if (docs) {
          return res.json({ status: 'success', data: docs })
        } else {
          return res.json({ status: 'error' })
        }
    })
  },  
  get: (req, res) => {
    let dateLimit = moment().subtract(14, 'days')
    req.app.db.collection('groups').find({
      '_id': new ObjectId(req.body.id)
    }).toArray(function(err,docs){
      var data = {}
      if(docs[0]){
        data = docs[0]
        data.chat = data.chat ? data.chat.filter(e => moment(e.created).format('x') > dateLimit) : []
        data.results = data.results ? data.results.filter(e => moment(e.date, 'YYYY.MM.DD').format('x') > dateLimit) : []
      }
      return res.json(data)
    })    
  },
  update: (req, res) => {
    var id = req.body.id
    var $set = {}
    for(var i in req.body){
      $set[i] = req.body[i]
    }

    $set.updatedAt = moment().utc().format()      
    delete $set.id 

    return req.app.db.collection('groups').findOneAndUpdate(
    {
      '_id': new ObjectId(id)
    },
    {
      "$set": $set
    },{ new: true }).then(function(doc){
      return res.json({ status: 'success', data: doc.value})
      //io.emit('group_changed', match)
    })    
  },
  create: (req, res) => {
    const doc = {
      code: req.body.code,
      owner: req.body.owner,
      games: req.body.games,
      minutes: req.body.minutes,
      compensation: req.body.compensation,
      date: moment().utc().format('YYYY.MM.DD HH:mm'),
      broadcast: true,
      chat: [],
      results: [],
      users: 1
    }

    req.app.db.collection('groups').insertOne(doc,function (err, response) {
      if(err){ 
        console.log(err)
        return res.json({ status: 'error', message: 'Could not create group'})
      } else {
        return res.json({ status: 'success', data: response.ops[0]})
      }
    })
  },
}