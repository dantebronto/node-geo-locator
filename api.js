require('./config/env')
var sys = require('sys')
var mongo = require('./vendor/node-mongodb-native/lib/mongodb')

var client = new mongo.Db('apidb', new mongo.Server('localhost', '27017', { auto_reconnect: true }), {})

var db = {} // open the client connection & attach mongo views to my db object
client.open(function(err, client){
  client.collections(function(err, collections){
    collections.forEach(function(collection) {
      db[collection.collectionName] = collection
    })
  })
})

var IPLocator = { 
  do_lookup: function(env){
    var ip = env.ip || env.parsed_url().ip || env.remoteAddress
    var ipnum = IPLocator.calculate_ipnum( ip )
    
    // find ip block
    db.blocks.findOne({ start_ip_num: { '$lte': ipnum }, end_ip_num: { '$gte': ipnum } }, function(err, res){
      if ( res && res.location_id ){
        // find location data
        db.locations.findOne({ location_id: res.location_id }, function(err, geo){
          var type, body
          var q = env.parsed_url().query
          var body = JSON.stringify(geo)
          
          if( q && q.callback ){
            type = 'application/javascript'
            body = q.callback  + '(' + body + ')'
          } else {
            type = 'application/json'
          }
          
          env.on_screen({
            type: type,
            body: body
          })   
        })
      } else {
        env.on_screen({ 
          type: 'application/json',
          body: '[]' 
        })
      }   
    })
  },
  calculate_ipnum: function(ip){
    if( typeof ip == 'undefined' ){ return 0 }
    ip = ip.split('.')
    return Number(ip[0]) * 16777216 + Number(ip[1]) * 65536 + Number(ip[2]) * 256 + Number(ip[3])
  }
}

// define Picard routes, they all have the same handler, do_lookup:

// GET /?ip=65.50.39.249
get('/', IPLocator.do_lookup)

// GET /ip/65.50.39.249
get('/ip/:ip', IPLocator.do_lookup)

// POST ?ip=65.50.39.249
post('/', IPLocator.do_lookup)

// on the front-end, you could do

// $.getJSON('http://apihost.com/ip/<your-ip>?callback=?', function(data){ 
//   console.log(data.city)
// })
