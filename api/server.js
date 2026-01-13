const fs = require('fs')
var express = require('express')
var path = require('path')
var app = express()
var cors = require('cors')
var http = require('http').Server(app)
var mongodb = require('mongodb')
const bcrypt = require('bcrypt')
const initApp = require("./routes/web")
const initIO = require("./routes/socket")
var expressLayouts = require('express-ejs-layouts')
var bodyParser = require('body-parser')
var ObjectId = require('mongodb').ObjectId
const mongo_url = process.env.MONGO_URL
const tokenExpires = 86400 * 30 * 12 // 1 year
const saltRounds = 10
const portDefault = 4000
var allowedOrigins = [
  'http://localhost:4000',
  'http://localhost:8080',
  'http://192.168.2.105:8080',
  'http://192.168.2.105:4000',
  //'https://flitz.herokuapp.com',
  //'https://flitzapi.herokuapp.com'
]

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true)
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
        'allow access from the specified Origin.'
      return callback(new Error(msg), false)
    }
    return callback(null, true)
  }
}))

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*") // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ type: 'application/json' }))
app.set('views', path.join(__dirname, 'static'))
app.use(express.static(path.join(__dirname, 'static')))
app.set('view engine', 'ejs')
app.use(expressLayouts)

mongodb.MongoClient.connect(mongo_url, { 
  useUnifiedTopology: true, 
  useNewUrlParser: true 
}, (err, database) => {
  if(err) throw err

  const db = database.db(mongo_url.split('/').reverse()[0])
  app.db = db

  initApp(app, db)
  initIO(http, db)

  let port = process.env.PORT || portDefault
  var server = http.listen(port, function () { //run http and web socket server
    console.log(`Server running at http://localhost:${port}`)
  })
})