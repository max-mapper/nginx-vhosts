var Vhosts = require('./')
var request = require('request')
var test = require('tape')
var http = require('http')

var pizzaServer = http.createServer(function(req, res) { res.end('pizza') }).listen(8080)
var shouldStop
var opts = {
  confDir: '/usr/local/etc/nginx/conf.d/',
  pidLocation: '/var/run/nginx.pid'
}

test('.write() writes a new vhost', function(t) {
  var vhosts = Vhosts(opts, function running(isRunning) {
    if (isRunning) return writeConfig()
    if (!isRunning) return vhosts.nginx.start(function(err) {
      shouldStop = true
      if (err) throw err
    })
  })

  function writeConfig() {
    request('http://test.local', function(err, resp, body) {
      t.false(err, 'no error')
      t.true(body.toString().indexOf('pizza') === -1, 'no vhost')
      vhosts.write({
        name: 'test',
        port: '8080',
        domain: 'test.local'
      }, function(err, stdout, stderr) {
        t.false(err, 'wrote vhost test')
        // give nginx 250ms to reload configuration
        setTimeout(function() {
          request('http://test.local', function(err, resp, body) {
            t.false(err, 'no error')
            t.true(body.toString().indexOf('pizza') > -1, 'vhost')
            t.end()
            vhosts.nginx.end()
          })
        }, 250)
      })
    })
  }
})

test('.remove() should remove a vhost', function(t) {
  var vhosts = Vhosts(opts, function running(isRunning) {
    if (isRunning) return removeConfig()
  })
  
  function removeConfig() {
    request('http://test.local', function(err, resp, body) {
      t.false(err, 'no error')
      t.true(body.toString().indexOf('pizza') > -1, 'is vhosting')
      vhosts.remove('test', function(err) {
        t.false(err, 'removed vhost test')
        // give nginx 250ms to reload configuration
        setTimeout(function() {
          request('http://test.local', function(err, resp, body) {
            t.false(err, 'no error')
            t.true(body.toString().indexOf('pizza') === -1, 'not vhosting')
            vhosts.nginx.end()
            if (shouldStop) vhosts.nginx.stop()
            pizzaServer.close()
            t.end()
          })
        }, 250)
      })
    })
  }
})
