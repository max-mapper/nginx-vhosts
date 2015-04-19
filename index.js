var fs = require('fs')
var path = require('path')
var exec = require('child_process').exec
var Reload = require('nginx-reload')

module.exports = Vhosts

function Vhosts(opts, onChange) {
  if (!(this instanceof Vhosts)) return new Vhosts(opts, onChange)
  if (typeof opts === 'function') {
    onChange = opts
    opts = {}
  }
  this.opts = opts || {}
  this.confDir = this.opts.confDir || '/etc/nginx/conf.d/'
  this.onChange = onChange || function noop(){}
  this.nginx = Reload(this.opts, function (running) {
    if (onChange) onChange(running)
  })
}

Vhosts.prototype.config = function(opts) {
  return  ''
  +  'upstream ' + opts.name + ' {\n'
  + '  server 127.0.0.1:' + opts.port + ';\n'
  + '}\n'
  + 'server {\n'
  + '  listen 80;\n'
  + '  server_name ' + opts.domain + ';\n'
  + '  location / {\n'
  + '    proxy_pass http://' + opts.name + ';\n'
  + '    proxy_set_header X-Forwarded-For $remote_addr;\n'
  + '    proxy_buffering off;\n'
  + '  }\n'
  + '}\n'
}

Vhosts.prototype.write = function(opts, cb) {
  var self = this
  var config = opts.config || this.config(opts)
  var confPath = path.join(this.confDir, opts.name + '.conf')
  fs.writeFile(confPath, config, function(err) {
    if (err) return cb(err)
    self.nginx.reload(cb)
  })
}

Vhosts.prototype.end = function() {
  this.nginx.end()
}

Vhosts.prototype.remove = function(name, cb) {
  var self = this
  var confPath = path.join(this.confDir, name + '.conf')
  fs.unlink(confPath, function(err) {
    if (err) return cb(err)
    self.nginx.reload(cb)
  })
}
