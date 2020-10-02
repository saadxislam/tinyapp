const { request } = require('express');
const { getUserByEmail, urlsForUser, generateRandomString } = require('./helpers');

const express = require('express');
const app = express();

const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");


const PORT = 8080;

app.use(cookieSession({
  name: 'session',
  keys: ["key1", "key2"]
}));

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");




// OUR DB OF URLS:
const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": {longURL: "http://www.google.com", userID: "user2RandomID" }
};

//OUR DATA STORE OF USERS:
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2b$10$/dFKYljjDgj8Dv2Y3ik5VO2dAIncSrascckWnzGXm7SR/SKhEbxm2"
    // password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2b$10$nFVOrD6ym1WE087Ut0v57Ogz1o1LQdh1AVfyi6K3PpuzHh4sVtgw6"
    // password: "dishwasher-funk"
  }
};


// 
app.get("/", (request, response) => {
  response.redirect('/login');
});

//HOME PAGE
app.get("/urls", (request, response) => {
  const userID = request.session.user_id;
  const user = users[userID];               //check if that user ID is not in the users
  if (!user) {
    response.send('Must be logged in to behold the beauty of this page. Proceed to /login or /register');
    return;
  }
  const userDB = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: userDB,  user: user };
  response.render("urls_index", templateVars);
  
});

// REGISTRATION ROUTE
app.get('/register', (request, response) => {
  const userID = request.session.user_id;
  const user = users[userID];
  
  const templateVars = { urls: urlDatabase,  user: user,  };
  response.render('urls_register', templateVars);
});

// LOGIN ROUTE
app.get('/login', (request, response) => {
  const userID = request.session.user_id;
  const user = users[userID];
  const templateVars = { urls: urlDatabase,  user: user };
  response.render('urls_login', templateVars);
});

// NEW URL ROUTE
app.get('/urls/new', (request, response) => {
  const userID = request.session.user_id;
  const user = users[userID];
  const templateVars = {  user: user };
  if (userID) {
    response.render("urls_new", templateVars);
    return;
  } else {
    response.redirect("/login");
  }
});

// ROUTE BASED ON SPECIFIC URL
app.get('/urls/:shortURL', (request, response) => {
  const userID = request.session.user_id;
  const user = users[userID];
  const templateVars = { shortURL: request.params.shortURL, longURL: urlDatabase[request.params.shortURL].longURL ,  user: user};
  response.render("urls_show", templateVars);
});

//REDIRECT SHORT URL TO LONG
app.get("/u/:shortURL", (request, response) => {
  const longURL = urlDatabase[request.params.shortURL].longURL;
  response.redirect(longURL);
});


// /LOGIN ACTION
app.post('/login', (request, response) => {

  
  const user = getUserByEmail(request.body.email, users);
  console.log(user);


  if (!user) {
    response.status(403).send('Email not found');
  }

  const isPasswordGood = bcrypt.compareSync(request.body.password, user.password);
  if (!isPasswordGood) {
    response.status(403).send('Password mismatch');
    return;
  }
  request.session.user_id = user.id;

  response.redirect('/urls');

});

// /LOGOUT ACTION
app.post('/logout', (request, response) => {

  request.session = null;
  
  response.redirect('/');
});



//
app.post('/urls/:id', (request, response) => {
  const shortURL = request.params.id;
  const userUrlsDB = urlsForUser(request.session.user_id, urlDatabase);
  if (shortURL in userUrlsDB) {
    urlDatabase[shortURL].longURL = request.body.longURL;
  } else {
    response.status(403).send('Not your property to edit');
  }
  response.redirect('/urls');
});
  
// 
app.post("/urls", (request, response) => {
  console.log(request.body);
  const shortURL = generateRandomString();
  const userID = request.session.user_id;
  
  urlDatabase[shortURL] = { longURL: request.body["longURL"], userID: userID };
  response.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (request, response) => {
  const userDB = urlsForUser(request.session.user_id, urlDatabase);
  if (request.params.shortURL in userDB) {
    delete urlDatabase[request.params.shortURL];
  } else {
    response.status(403).send('Not your property to delete');
  }
  
  response.redirect('/urls');
});

app.post('/register', (request, response) => {
  const email = request.body.email;
  const password = request.body.password;

  if (!email || !password) {
    response.status(400).send('can\'t leave fields empty');
    return;
  }

  const user = getUserByEmail(email, users);
  if (user) {
    response.send("User exists");
    return;
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log('hashedPassword :', hashedPassword);

  const id = generateRandomString();

  const newUser = {
    id,
    email,
    password: hashedPassword,
  };

  users[id] = newUser;
  request.session.user_id = newUser.id;
  response.redirect('urls');
    
});

 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



