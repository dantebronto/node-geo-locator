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
    var ipnum
    
    try {
      ipnum = ip_locator.calculate_ipnum( env.ip || env.parsed_url().query.ip || env.remoteAddress)
    } catch(ex) {
      // env.handle_exception(ex)
      env.on_screen({ body: 'Invalid IP' })
      return
    }
    
    // find ip block
    db.blocks.findOne({ start_ip_num: { '$lte': ipnum }, end_ip_num: { '$gte': ipnum } }, function(err, res){
      if ( res && res.location_id ){
        // find location data
        db.locations.findOne({ location_id: res.location_id }, function(err, geo){
          env.on_screen({
            type: 'application/json',
            body: sys.inspect(geo)
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
    ip = ip.split('.')
    return Number(ip[0]) * 16777216 + Number(ip[1]) * 65536 + Number(ip[2]) * 256 + Number(ip[3])
  }
}

// define picard routes, they're all handled the same way:
// GET /?ip=65.50.39.249
// GET /ip/65.50.39.249
// POST ?ip=65.50.39.249

get('/', ip_locator.do_lookup)
post('/', ip_locator.do_lookup)
get('/ip/:ip', ip_locator.do_lookup)
