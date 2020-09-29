const express = require('express');
const app = express();
const PORT = 8080; //default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");    //tells exprees app to use EJS as it's templating engine

function generateRandomString() {
  return Math.random().toString(20).substr(2, 6);
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

/*
After our browser renders our new URL form, the user populates the form with a longURL and presses submit.
Our browser sends a POST request to our server.
Our server logs the request body to the console, then responds with 200 OK.
Our browser renders the "Ok" message.
*/




//THESE ARE MY READING "GET" ROUTES:
app.get("/", (request, response) => {
  response.send("Hello!")
});

app.get("/url.json", (request, response) => {
  response.json(urlDatabase);
})

app.get("/hello", (request, response) => {
  response.send("<html><body> Hello <b> World </b></body></html>\n");
})
app.get("/urls", (request, response) => {
  const templateVars = { urls: urlDatabase } 
  response.render("urls_index", templateVars);
})

app.get('/urls/new', (request, response) => {
  response.render("urls_new");
});

app.get('/urls/:shortURL', (request, response) => {
  const templateVars = { shortURL: request.params.shortURL, longURL: urlDatabase[request.params.shortURL]};
  response.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (request, response) => {
  const longURL = urlDatabase[request.params.shortURL]
  response.redirect(longURL);
});


//THESE ARE MY CREATE POST ROUTES:
app.post("/urls", (request, response) => {
  console.log(request.body); 
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = request.body["longURL"];
  response.redirect(`/urls/${shortURL}`);
});     

app.post('/urls/:shortURL/delete', (request, response) => {
  delete urlDatabase[request.params.shortURL];
  response.redirect('/urls');
});


//I AM LISTENING HERE:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

