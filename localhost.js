var http = require('http'),
  httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer({});

var server = http.createServer(function (req, res) {
  const parts = req.url.split('/')
  let port;
  switch (parts[1]) {
    case 'account': port = 3000; break;
    case 'category': port = 3001; break;
    case 'project': port = 3002; break;
    case 'recipient': port = 3003; break;
    case 'transaction': port = 3004; break;
    case 'product': port = 3005; break;
  }
  req.url = parts.slice(2).join('/')

  proxy.web(req, res, { target: `http://localhost:${port}`, headers: req.headers });
});

console.log("listening on port 5050")
server.listen(5050);
