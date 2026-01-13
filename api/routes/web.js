const express = require("express")
const router = express.Router()
const moment = require('moment')
const authToken = require("../controllers/auth")
const accountController = require("../controllers/account")
const userController = require("../controllers/user")
const groupController = require("../controllers/group")
const gameController = require("../controllers/game")
const gamesort = {date:-1}
var onlinewhen = moment().utc().subtract(10, 'minutes')


module.exports = (app, db) => {
  router.get('/', function (req, res) {
    res.render('index')
  })

  router.post('/register', userController.register)
  router.post('/group/create', groupController.create)
  router.post('/account', accountController.update)
  router.post('/account/create', accountController.create)
  router.post('/account/login', accountController.login)
  router.post('/account/validate_code', accountController.validate_code)
  router.post('/account/validate/:code', accountController.validate)
  router.post('/account/data', authToken, accountController.data)
  router.get('/account/notifications', authToken,accountController.getNotifications)
  router.get('/account/notifications/count', authToken,accountController.getNotificationsCount)
  router.get('/account/:id', authToken,accountController.getById)
  router.post('/group/update', groupController.update)
  router.post('/game/create', gameController.create)
  router.post('/game/save', gameController.save)
  router.post('/game', gameController.get)
  router.post('/group', groupController.get)
  router.post('/playlist', gameController.playlist)
  router.post('/gamecount', gameController.count)
  router.post('/eco/search', gameController.ecoSearch)
  router.post('/eco/search/pgn', gameController.ecoSearchPgn)
  router.post('/eco/pgn', gameController.searchPgn)
  router.post('/eco/pgn/random', gameController.randomPgn)
  router.post('/group/random', groupController.random)
  router.post('/search', function (req, res) { 
    var limit = parseInt(req.body.limit)||25
    , offset = parseInt(req.body.offset)||0
    , query = unescape(req.body.query).trim()
    , strict = unescape(req.body.strict).trim()

    let $find = {"pgn" : { $exists: true, $ne: null }}
    if(query.length){
      $find.$or = []
      if(query.match(/^(\d)\. /g)) {
        $find.$or.push({"pgn": {'$regex' : query, '$options' : 'i'}})
      } else {
        if (strict === '1') {
          $find.$or.push({"white": query})
          $find.$or.push({"black": query})
        } else {
          if (query.indexOf(' ') === -1 && query.length > 15) {
            $find.$or.push({"group": query})
          } else {
            $find.$or.push({"date": {'$regex' : query, '$options' : 'i'}})        
            query.split(' ').forEach((word) => {
              $find.$or.push({"white": {'$regex' : word, '$options' : 'i'}})
              $find.$or.push({"black": {'$regex' : word, '$options' : 'i'}})
              $find.$or.push({"event": {'$regex' : word, '$options' : 'i'}})
              $find.$or.push({"site": {'$regex' : word, '$options' : 'i'}})
            }) 
          }
        }
      }
    }

    db.collection('games').countDocuments($find, function(error, numOfDocs){
      db.collection('games').find($find)
        .sort(gamesort)
        .limit(limit)
        .skip(offset)
        .toArray(function(err,docs){
          return res.json({games:docs,count:numOfDocs})
        })   
    })
  })

  router.post('/dash/search', function (req, res) { 
    var limit = parseInt(req.body.limit)||25
    , offset = parseInt(req.body.offset)||0
    , query = unescape(req.body.query).trim()
    , code = unescape(req.body.code).trim()
    , strict = unescape(req.body.strict).trim()

    let $find = {}

    $find.$or = []
    $find.$or.push({"white": code})
    $find.$or.push({"black": code})

    if(query.length){
      $find.$or.push({"white": code})
      $find.$or.push({"black": code})
      $find.$or.push({"white": query})
      $find.$or.push({"black": query})
    }

    db.collection('games').countDocuments($find, function(error, numOfDocs){
      db.collection('games').find($find)
        .sort(gamesort)
        .limit(limit)
        .skip(offset)
        .toArray(function(err,docs){
          return res.json({games:docs,count:numOfDocs})
        })   
    })
  })

  router.post('/online', function (req, res) { 

    var $or = []
    , limit = parseInt(req.body.limit)||25
    , offset = parseInt(req.body.offset)||0
    , query = unescape(req.body.query)

    let $find = {
      pgn : { $exists: true, $ne: null },
      updatedAt: { $gte: onlinewhen.format() },
      result: { $nin : ["0-1", "1-0", "1/2-1/2"] }
    }

    if(query.length){
      $find.$or = []
      query.split(' ').forEach((word) => {
        $find.$or.push({"white": {'$regex' : word, '$options' : 'i'}})
        $find.$or.push({"black": {'$regex' : word, '$options' : 'i'}})
        $find.$or.push({"event": {'$regex' : word, '$options' : 'i'}})
        $find.$or.push({"site": {'$regex' : word, '$options' : 'i'}})
        $find.$or.push({"date": {'$regex' : word, '$options' : 'i'}})
        $find.$or.push({"pgn": {'$regex' : word, '$options' : 'i'}})
      })
    }

    db.collection('games').countDocuments($find, function(error, numOfDocs){
      db.collection('games').find($find)
        .sort(gamesort)
        .limit(limit)
        .skip(offset)
        .toArray(function(err,docs){
          return res.json({games:docs,count:numOfDocs})
        })
    })
  })

  router.post('/groups', function (req, res) { 

    var $or = []
    , limit = parseInt(req.body.limit)||25
    , offset = parseInt(req.body.offset)||0
    , query = unescape(req.body.query)

    let $find = {
      broadcast : true
    }

    if(query.length){
      $find = {"code" : { '$regex' : query, '$options' : 'i'}}
    }

    db.collection('groups').countDocuments($find, function(error, numOfDocs){
      db.collection('groups').find($find)
        .sort({_id:-1})
        .limit(limit)
        .skip(offset)
        .toArray(function(err,docs){
          return res.json({data: docs, count:numOfDocs})
        })
    })
  })

	return app.use('/', router)
}