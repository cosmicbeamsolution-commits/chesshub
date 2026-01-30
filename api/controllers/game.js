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
var gamesort = {date:-1}

module.exports = {
  randomPgn: (req, res) => {
    req.app.db.collection('eco').aggregate([
      {
        "$redact": {
            "$cond": [
                { "$lt": [ { "$strLenCP": "$pgn" }, 20] },
                "$$KEEP",
                "$$PRUNE"
            ]
        }
      },
      { $sample: { size: 1 } }
      ]).toArray(function(err,docs){
      return res.json(docs[0])
    })    
  },
  searchPgn: (req, res) => {
    req.app.db.collection('eco').find({
      pgn: new RegExp('^' + req.body.pgn, 'i')
    }).toArray(function(err,docs){
      return res.json(docs[0])
    })    
  },
  ecoSearchPgn: (req, res) => {
    req.app.db.collection('eco').find({
      pgn: req.body.pgn
    }).toArray(function(err,docs){
      return res.json(docs[0])
    })    
  },
  ecoSearch: (req, res) => {
    var limit = parseInt(req.body.limit)||25, 
    offset = parseInt(req.body.offset)||0, 
    query = unescape(req.body.query)

    let $find = {"pgn" : { $exists: true, $ne: null }}

    if(query.length){
      $find.$or = []
      if(query.match(/^(\d)\. /g)) {
        $find.$or.push({"pgn": {'$regex' : query, '$options' : 'i'}})
      } else {
        $find.$or.push({"eco": {'$regex' : query, '$options' : 'i'}})
        $find.$or.push({"name": {'$regex' : query, '$options' : 'i'}})
      }
    }

    req.app.db.collection('eco').countDocuments($find, function(error, numOfDocs){
      req.app.db.collection('eco').find($find)
        .sort({name:1})
        .limit(limit)
        .skip(offset)
        .toArray(function(err,docs){
          return res.json({games:docs,count:numOfDocs})
        })   
    })    
  },
  count: (req, res) => {
    req.app.db.collection('games').find(req.body).toArray(function(err,docs){
      return res.json(docs.length)
    })

  },
  playlist: (req, res) => {
    var $or = []
    var limit = 5
    var offset = 0

    for (var i in req.body) {
      $or.push({'black': {'$regex' : req.body.black, '$options' : 'i'}})
      $or.push({'white': {'$regex' : req.body.white, '$options' : 'i'}})
      $or.push({'black': {'$regex' : req.body.white, '$options' : 'i'}})
      $or.push({'white': {'$regex' : req.body.black, '$options' : 'i'}})
    }

    req.app.db.collection('games').find({"$or": $or})
      .sort(gamesort)
      .limit(limit)
      .skip(offset)
      .toArray((err, docs) => {
        return res.json(docs)
      })    
  },
  get: (req, res) => {
    if (!req.body.id) {
      return res.json({ status: 'error', message: 'error_game_nep' })
    }
    let id = req.body.id
    var data = {}
    req.app.db.collection('games').find({
      '_id': new ObjectId(id)
    }).toArray((err, docs) => {
      if(docs[0]){
        data = docs[0]
        req.app.db.collection('games')
          .find({_id: {$gt: data._id}})
          .sort({_id: 1 })
          .limit(1)
          .toArray((err, next) => {
            if (next[0]) {
              data.next = next[0]._id
            }
            req.app.db.collection('games')
              .find({_id: {$lt: data._id}})
              .sort({_id: -1 })
              .limit(1)
              .toArray((err, prev) => {
                if (prev[0]) {
                  data.prev = prev[0]._id
                }
                return res.json(data)
              })
          })
      }
    })    
  },
  save: (req, res) => {
    let body = req.body
    body.site = 'Flitz'
    body.date = moment().format('YYYY.MM.DD HH:mm')
    body.views = 0
    req.app.db.collection('games').insertOne(body, (err, response) => {
      if(err){ 
        console.log(err)
        return res.json({ status : 'error', message : 'Could not create game'})
      } else {
        return res.json({ status : 'success', data: response.ops[0]})
      }
    })    
  },
  create: (req, res) => {
    const doc = {      
      event: req.body.event,
      white: req.body.white,
      black: req.body.black,
      whiteflag: req.body.whiteflag,
      blackflag: req.body.blackflag,
      whiteelo: req.body.whiteelo,
      blackelo: req.body.blackelo,
      minutes: req.body.minutes,
      rounds: req.body.rounds,
      game: req.body.game,
      compensation: req.body.compensation,
      date:moment().utc().format('YYYY.MM.DD HH:mm'),
      broadcast: true,
      views: 0
    }

    req.app.db.collection('games').insertOne(doc,function (err, response) {
      if(err){ 
        console.log(err)
        return res.json({ status : 'error', message : 'Could not create game'})
      } else {
        return res.json({ status : 'success', data: response.ops[0]})
      }
    })
  },
}