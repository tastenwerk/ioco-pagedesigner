var static = require('node-static')
  , http = require('http')
  , util = require('util');
var webroot = __dirname+'/public'
  , port = 8080;
var file = new(static.Server)(webroot);

http.createServer(function(req, res) {
  req.addListener('end', function() {
    file.serve(req, res, function(err, result) {
      if (err) {
        console.error('Error serving %s - %s', req.url, err.message);
        if (err.status === 404 || err.status === 500) {
          res.writeHead(err.status, err.headers);
          res.end();
        }
      } else {
        console.log('%s - %s', req.url, res.message);
      }
    });
  });
}).listen(port);
console.log('node-static running at http://localhost:%d', port);