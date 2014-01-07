# nginx-vhosts

[![NPM](https://nodei.co/npm/nginx-vhosts.png)](https://nodei.co/npm/nginx-vhosts/)

Programmatically add or remove vhosts to a running Nginx instance.

To use this you should have your Nginx configuration file set up such that the `http` section has a `include` directive for all `.conf` files in a certain folder on your machine, e.g.:

```
http {
    ##
    # Virtual Host Configs
    ##

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

The machine configured with the configuration about would use either `/etc/nginx/conf.d/` or `/etc/nginx/sites-enabled/` as the `confDir` below. Note that the official [Ubuntu PPA](http://wiki.nginx.org/Install#Ubuntu_PPA) for Nginx has it configured this way by default.

See also: 

- https://github.com/maxogden/install-nginx-on-ubuntu
- https://github.com/maxogden/nginx-reload

### api

#### `var vhosts = require('nginx-vhosts')(opts, onStopStart)`

`onStopStart` is passed to and called from [nginx-reload](https://github.com/maxogden/nginx-reload)

```js
var vhosts = require('nginx-vhosts')(opts, function running(isRunning) {
  // isRunning is a boolean, true if nginx is running, false if it is not
  // this function will get called whenever nginx stops or starts
  // note: .reload() does not trigger this function, as nginx does not
  // actually stop during a configuration reload
}
```

`opts` defaults to:

```js
{
  confDir: '/usr/local/etc/nginx/conf.d/',
  pidLocation: '/var/run/nginx.pid'
}
```

#### `vhosts.write(opts, cb)`

```js
vhosts.write({
  name: 'test',
  port: '8080',
  domain: 'test.local'
}, function(err, stdout, stderr) {
  // err, stdout, and stderr from the nginx configuration reload
})
```

This writes a new configuration file to the configuration directory and then tells Nginx to reload its configuration. In the above example it would configure Nginx to proxy requests from `test.local` to `localhost:8080`

You can also supply your own config file:

```js
vhosts.write({
  name: 'test',
  config: 'upstream foo { server 127.0.0.1:8080 } ...'
}, cb)
```

Note: it may take Nginx a few seconds to finish reloading the configuration after the callback is called.

#### `vhosts.remove(name, cb)`

```js
vhosts.remove('test', function(err, stdout, stderr) {
  
})
```

This removes a configuration file and tells Nginx to reload its configuration.

Note: it may take Nginx a few seconds to finish reloading the configuration after the callback is called.

### run the tests

There are integration tests available, provided you have the following things set up:

- your nginx is configured to store a `pid` file in '/var/run/nginx.pid'
- your nginx is configured to `include` confs for `http` from `/usr/local/etc/nginx/conf.d/`
- you have `test.local` in your `/etc/hosts` as an entry for `localhost`

```
npm install
sudo npm test
```
