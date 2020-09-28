const express = require('express');
const app = express();
const PORT = 8080; //default port 8080


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
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});