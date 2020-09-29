const express = require('express');
const app = express();
const PORT = 8080; //default port 8080

app.set("view engine", "ejs");    //tells exprees app to use EJS as it's templating engine


const urlDatabase = {
  "b2xVn2": "http://www.lighthoutlabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  const templateVars = { shortURL: request.params.shortURL, longURL: `/urls/${request.params.shortURL}`};
  response.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

