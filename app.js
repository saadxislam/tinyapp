// basic http web server that responds with a string containing the request path and method

const http = require('http');
const PORT = 8080;

//a func that handles requests and sends response


//Below, requestHandler is registered as a callback function that we register with the http
//module via its createServer function. The callback receives request and response arguments.
//We read values from the request, and send a string back to the client using the response object.
const requestHandler = (request, response) => {

  if (request.url === "/") {
    response.end('Welcome!');
  } else if (request.url === "/urls") {
    response.end("www.example.com\nwww.google.com");
  } else {
    response.statusCode = 404;
    response.end('404 Page Not found');
  }

  response.end(`Requested path: ${request.url}\nRequest Method: ${request.method}`);
};

const server = http.createServer(requestHandler); // this is non blocking
console.log('Server created'); // NEW LINE


server.listen(PORT, () => {                         // this is non blocking
  console.log(`Server listening on: http://localhost:${PORT}`);
});

console.log('Last line (after .listen call)'); // NEW LINE
