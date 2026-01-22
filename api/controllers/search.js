const moment = require('moment')
const gamesort = {date:-1}
const onlinewhen = moment().utc().subtract(10, 'minutes')

module.exports = {
  groups: (req, res) => {
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

    req.app.db.collection('groups').countDocuments($find, function(error, count){
      req.app.db.collection('groups').find($find)
        .sort({_id:-1})
        .limit(limit)
        .skip(offset)
        .toArray(function(err,data){
          return res.json({data, count})
        })
    })
  },
  online: (req, res) => {
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

    req.app.db.collection('games').countDocuments($find, function(error, numOfDocs){
      req.app.db.collection('games').find($find)
        .sort(gamesort)
        .limit(limit)
        .skip(offset)
        .toArray(function(err,docs){
          return res.json({games:docs,count:numOfDocs})
        })
    })
  },
  dash: (req, res) => {
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

    req.app.db.collection('games').countDocuments($find, function(error, numOfDocs){
      req.app.db.collection('games').find($find)
        .sort(gamesort)
        .limit(limit)
        .skip(offset)
        .toArray(function(err,docs){
          return res.json({games:docs,count:numOfDocs})
        })   
    })
  },
  search: (req, res) => {
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

    req.app.db.collection('games').countDocuments($find, function(error, numOfDocs){
      req.app.db.collection('games').find($find)
        .sort(gamesort)
        .limit(limit)
        .skip(offset)
        .toArray(function(err,docs){
          return res.json({games:docs,count:numOfDocs})
        })   
    })
  }
}