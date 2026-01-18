const jwt = require('jsonwebtoken')
const moment = require('moment')
const socket = require('socket.io')
let ObjectId = require('mongodb').ObjectId
let socketUsers = {}
let EloRating = require('elo-rating')
let gamesort = {date:-1}
let groups = {}
let games = {}
let movecompensation = 2
let io

module.exports = (http, db) => {
  io = socket(http, { origins: '*:*', pingInterval: 15000})
  io.on('connection', function(socket){ //join group on connect
  	socket.on('disconnect',  (data) => {
	    for (var i in groups) {
	      if (Object.keys(groups[i].players).length) {
	        Object.keys(groups[i].players).map(j => {
	          let e = groups[i].players[j]
	          if(e.socket === socket.id){
	            console.log(`${e.code} leaves group: ${groups[i].code}`)
	            delete groups[i].players[j]
	            db.collection('groups').findOneAndUpdate(
	            {
	              '_id': new ObjectId(i)
	            },
	            {
	              "$set": { users: Object.keys(groups[i].players).length }
	            })
	            io.to(i).emit('players', groups[i].players)
	          }
	        })
	      }
	    }   
		})

    socket.on('join', (data) => {
	    if (data.game) {
	      socket.join(data.game._id)

        // console.log('join(data)',data)
	      if(!games[data.game._id]){
	        games[data.game._id] = data
	        //console.log(data.game._id + " game ready to start")
	      }

	      // io.emit('games', games)
        //console.log('join(5)',groups)
	      for(var i in groups){
          console.log('join(players)',i,Object.keys(groups[i].players).length)
          //console.log('join(7)',data.player._id)

	        for(var j in groups[i].players) {
            //console.log('a(8)',groups[i].players[j])
            console.log('a(8)',groups[i].players[j]._id,data.player._id)
	          if (groups[i].players[j]._id === data.player._id) {
	            groups[i].players[j].plying = true
	            io.emit('joined', groups[i].players[j])
              console.log('a(3)','joined', groups[i].players[j].code)
              //console.log('a(4)',i, groups[i].players)
	            io.to(i).emit('players', groups[i].players)
	          }
	        }
	      }
        //console.log('join(groups)',groups)
	    }		
		})

    socket.on('leave', function(data) {
      socket.leave(data)
    })

    socket.on('reject', function(data) {
      io.emit('reject', data)
    })

    socket.on('resume', function(data) {
      io.emit('resume', data)
    })

    socket.on('play', function(data) {
      io.to(data.id).emit('play', data)
    })

    socket.on('invite', function(data) {
      io.emit('invite', data)
    })

    socket.on('invite_rematch', function(data) {
      io.emit('invite_rematch', data)
    })

    socket.on('reject_rematch', function(data) {
      io.emit('reject_rematch', data)
    })

    socket.on('group_chat', function(data) { //move object emitter
      let id = data.id 
      
      data.created = new Date()
      delete data.id 

      if (data.sender !== 'bot') {
        let $push_query = []
        $push_query.push(data)
        db.collection('groups').findOneAndUpdate(
        {
          _id : new ObjectId(id)
        },
        {
          "$push" : { "chat": { "$each" : $push_query } }
        },
        { 
          upsert: true, 
          'new': true, 
          returnOriginal:false 
        })
      }

      io.to(id).emit('group_chat', data)
    })

    socket.on('preferences', function(data) {
      var exists = false
      db.collection('accounts').find({
        code: data.code
      }).toArray(function(err,docs){
        data.exists = false
        if (docs) {
          data.exists = true
        }
        io.emit('player', data)
      })
    })
    
    /*socket.on('playing', function (data) {
      io.emit('testing', {status: 'success'})
      io.emit('playing',  (data) => {
			  let total = 0
			  let playing = 0
			  for (var i in groups) {
			    total += Object.keys(groups[i].players).length
			    for (var j in groups[i].players) {
			      if (groups[i].players[j].plying) {
			        playing++
			       }
			    }
			  }

			  return {
			    idle: (total - playing), 
			    playing: playing
			  }	
			})
    })*/

    socket.on('playing',  (data) => {
      let total = 0
      let playing = 0
      for (var i in groups) {
        total += Object.keys(groups[i].players).length
        for (var j in groups[i].players) {
          if (groups[i].players[j].plying) {
            playing++
           }
        }
      }

      return {
        idle: (total - playing), 
        playing: playing
      } 
    })

    socket.on('find_opponent',  (data) => {
	    // console.log('find_opponent', data)
	    // console.log('groups', groups)
	    let item = {}
	    let event = 'landing'
	    let id = data.group
	    if (groups[id]) {
        //console.log('a(2)')
	      Object.keys(groups[id].players).forEach(i => {
	        let player = groups[id].players[i]
	        player.socket = socket.id
	        if (player.code !== data.player.code && !player.plying && !player.observe) {
	          event = groups[id].code
	          item = groups[id]
	          item.player = player
	        }
	      })
	    }

      //console.log('item', item)
	    if (item._id) {
	      let white = item.player
	      let black = data.player
	      let match_id = new ObjectId().toString()
	      const coin = Math.floor(Math.random() * 1)

	      if(coin){
	        white = data.player
	        black = item.player
	      }

	      const game = {      
	        event: event,
	        white: white.code,
	        black: black.code,
	        whiteelo: white.elo,
	        blackelo: black.elo,
	        whiteflag: white.flag,
	        blackflag: black.flag,
	        minutes: item.minutes,
	        games: item.games,
	        game: 1,
	        group: item._id,
	        compensation: item.compensation,
	        date:moment().utc().format('YYYY.MM.DD HH:mm'),
	        broadcast: true,
	        views: 0
	      }

	      db.collection('games').insertOne(game,function (err, response) {
	        if(err){ 
	          io.emit('opponent_not_found') 
	        } else {
	          io.emit('game_spawn', {
	            group: item._id,
	            match: match_id,
	            white: white.code,
	            black: black.code,
	            game: response.ops[0]._id
	          })
	        }
	      })
	    } else {
	      Object.keys(groups).forEach(i => {
	        Object.keys(groups[i].players).forEach(j => {
	          let player = groups[i].players[j]
	          player.socket = socket.id
	          if (player.code !== data.player.code && player.autoaccept && !player.observe && !player.plying) {
	            item = groups[i]
	            item.player = player
	          }
	        })
	      })

	      io.to(socket.id).emit('opponent_not_found') 
	      console.log('opponent_not_found')
	    }		
		})

    socket.on('group_join', (data) => {
	    if (!Object.keys(data.group).length) return false
	    
	    // console.log('group_join(group)',data.group)
	    let id = data.group._id
	    
	    if (!groups[id]) {
	      groups[id] = data.group
        console.log('creating players in ', id)
	      groups[id].players = {}
	    }

	    if(!groups[id].players[data.player._id]) {
	      data.player.socket = socket.id
	      groups[id].players[data.player._id] = data.player
        console.log('setting player ', data.player._id)
	      console.log(`${data.player.code} joins ${groups[id].code}`)
	    }

      // console.log('group_join(set player)', data.player._id)
	    groups[id].players[data.player._id].plying = false
	    socket.join(id)
	    io.to(id).emit("group_join", data.player)
	    io.to(id).emit('players', groups[id].players)

	    io.emit('playing', module.exports.playing)

	    return db.collection('groups').findOneAndUpdate(
	    {
	      '_id': new ObjectId(id)
	    },
	    {
	      "$set": { users: Object.keys(groups[id].players).length }
	    })		
		})

    socket.on('group_leave', (data) => {
	    if (!data.group) return 
	    const id = data.group._id
	    if (groups[id]) {
	      if (groups[id].players[data.player._id]) {
	        io.to(id).emit("group_leave", data.player)
          console.log('group leave ', data.player._id)
	        // delete groups[id].players[data.player._id]
	        console.log(`${data.player.code} leaves ${groups[id].code}`)
	      }

	      io.to(id).emit('players', groups[id].players)

	      io.emit('playing', module.exports.playing)

	      return db.collection('groups').findOneAndUpdate(
	      {
	        '_id': new ObjectId(id)
	      },
	      {
	        "$set": { users: Object.keys(groups[id].players).length }
	      })
	    }		
		})

    socket.on('action',  (data) => {
			console.log('action', data.action, data.id)
			io.to(data.id).emit(data.action, data)
		})

    /*socket.on('start', function(data) {
      io.to(data.id).emit('start', data)
    })

    socket.on('capitulate', function(data) {
      io.to(data.id).emit('capitulate', data)
    })

    socket.on('askfordraw', function(data) {
      io.to(data.id).emit('askfordraw', data)
    })

    socket.on('acceptdraw', function(data) {
      io.to(data.id).emit('acceptdraw', data)
    })

    socket.on('rejectdraw', function(data) {
      io.to(data.id).emit('rejectdraw', data)
    })

    socket.on('gone', function(data) {
      io.to(data.id).emit('gone', data)
    })
    
    socket.on('undo', function(data) { //undo emitter
      io.to(data.id).emit('undo', data)
    })

    socket.on('chat', function(data) { //chat object emitter
      io.to(data.id).emit('chat', data)
    })*/


    socket.on('move', function(data) { //move object emitter
      var id = data.id
      var item = {}
      var compensation = data.compensation||0
      for(var i in data){
        item[i] = data[i]
      }
      var t = data.turn === 'w' ? 'b' : 'w'
      data[t + 'time'] += compensation
      item[t + 'time'] = data[t + 'time']
      item.updatedAt = moment().utc().format()
      delete item.id 

      return db.collection('games').findOneAndUpdate(
      {
        '_id': new ObjectId(id)
      },
      {
        "$set": item
      },{ new: true }).then(function(doc){
        io.to(id).emit('move', data)
        io.emit('game', doc.value)
      })
    })

    socket.on('game', function(data) { //game object emitter
      var id = data._id
      var updateElo = false
      var event = ''
      data.updatedAt = moment().utc().format()
      delete data._id 

      if (!data.event) {
        if (groups[data.group]) {
          data.event = groups[data.group].code
        }
      }

      if (data.result && data.result !== '1/2-1/2') {
        updateElo = true
        var playerWin = data.result === '1-0'

        if (data.whiteelo && data.blackelo) {
          var elo = EloRating.calculate(data.whiteelo, data.blackelo, playerWin)
          data.whiteelo = elo.playerRating
          data.blackelo = elo.opponentRating
        }

        if (groups[data.group]) {
          if (groups[data.group].players[data.white]) {
            groups[data.group].players[data.white].elo = data.whiteelo
          }
          if (groups[data.group].players[data.black]) {
            groups[data.group].players[data.black].elo = data.blackelo
          }
        }
      }

      console.log('game', data)
      return db.collection('games').findOneAndUpdate(
      {
        '_id': new ObjectId(id)
      },
      {
        "$set": data
      },
      { 
        upsert: true, 
        'new': true, 
        returnOriginal:false 
      }).then(function(doc){
        // io.to(id).emit('data', data)
        let game = doc.value
        io.to(id).emit('game_updated', game)

        if (data.result) {
          io.emit('games', Object.keys(games).filter((e, i) => { return i !== id }))
        }

        if (updateElo) {
          let $push_query = []
          $push_query.push({
            elo: data.whiteelo,
            updateAt: new Date()
          })
          return db.collection('accounts').findOneAndUpdate({
            code: data.white,
          }, {
            "$set": {
              elo: data.whiteelo
            },
            "$push": {
              eloUpdates: { "$each": $push_query }
            }
          }).then(function(white){
            if(white.value) {
              if (groups[data.group]) {
                if (groups[data.group].players[white._id]) {
                  groups[data.group].players[white._id].elo = data.whiteelo
                }
              }
            }

            let $push_query = []
            $push_query.push({
              elo: data.blackelo,
              updateAt: new Date()
            })
            return db.collection('accounts').findOneAndUpdate({
              code: data.black,
            }, {
              "$set": {
                elo: data.blackelo
              },
              "$push": {
                eloUpdates: { "$each": $push_query }
              }
            }).then(function(black){
              if(black.value) {
                if (groups[data.group]) {
                  if (groups[data.group].players[black._id]) {
                    groups[data.group].players[black._id].elo = data.blackelo
                  }
                }
              }
            })
          })
        }
      })
    })

    socket.on('group', function(data) { //channel object emitter
      var id = data._id
      data.updatedAt = moment().utc().format()      
      delete data._id
      console.log('group', id, data)
      return db.collection('groups').findOneAndUpdate(
      {
        '_id': new ObjectId(id)
      }, {
        "$set": data
      }, {
        upsert: true, 
        'new': true, 
        returnOriginal:false 
      }).then(function(doc){
        console.log('doc',doc.value)
        io.to(id).emit('group_updated', doc.value)
      })
    })

    socket.on('group_result', function(data) { //channel object emitter
      var id = data._id
      data.updatedAt = moment().utc().format()      
      let $push_query = []
      $push_query.push(data.result)
      return db.collection('groups').findOneAndUpdate(
      {
        '_id': new ObjectId(id)
      }, {
        "$push" : { "results": { "$each" : $push_query } }
      }, {
        upsert: true, 
        'new': true, 
        returnOriginal:false 
      }).then(function(doc){
        io.to(id).emit('group_updated', doc.value)
      })
    })
  })
}
