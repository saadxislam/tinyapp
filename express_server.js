//CALLING EXPRESS:
const express = require('express');
const app = express();

const PORT = 8080; //default port 8080

//BCRYPT
const bcrypt = require('bcrypt');

//COOKIE PARSER INSTALLED VIA NPM I COOKIE-PARSER
const cookieParser = require('cookie-parser')
app.use(cookieParser());

//BODY PARSER INSTALLED VIA NPM I BODY-PARSER
const bodyParser = require("body-parser");
const { request } = require('express');
app.use(bodyParser.urlencoded({extended: true}));

//SETS THE VIEW ENGINE MIDDLEWARE AS 'EJS'
app.set("view engine", "ejs");    //tells exprees app to use EJS as it's templating engine

//FUNCTION TO SET UP A RANDOM STRING THAT'S ALPHANUMERIC FOR THE SHORTURL
function generateRandomString() {
  return Math.random().toString(20).substr(2, 6);
}

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
}

const urlsForUser = (id) => {
  const userDB = {};
  for (let key in urlDatabase){
    if (urlDatabase[key].userID === id){
      userDB[key] = urlDatabase[key];
    } 
  }
  return userDB;
}




//THESE ARE MY "GET" ROUTES:
app.get("/", (request, response) => {
  // response.send("Hello!")
  response.redirect('/login');
});

//HOME PAGE
app.get("/urls", (request, response) => {
  const userID = request.cookies['user_id'];
  const user = users[userID];               //check if that user ID is not in the users
  if (!user){
    response.send('Must be logged in to behold the beauty of this page. Proceed to /login or /register');
    return;
  }
  const userDB = urlsForUser(userID)
  const templateVars = { urls: userDB,  user: user } 
  response.render("urls_index", templateVars);
  
});

// GETTING TO REGISTRATION PAGE:
app.get('/register', (request, response) => {
  const userID = request.cookies['user_id'];
  const user = users[userID]; 
  
  const templateVars = { urls: urlDatabase,  user: user,  } 
  response.render('urls_register', templateVars);
})

// GETTING TO LOGIN PAGE:
app.get('/login', (request, response) => {
  const userID = request.cookies['user_id'];
  const user = users[userID]; 
  const templateVars = { urls: urlDatabase,  user: user } 
  response.render('urls_login', templateVars);
})

app.get('/urls/new', (request, response) => {
  const userID = request.cookies['user_id'];
  const user = users[userID]; 
  const templateVars = {  user: user };
  if (userID){
    response.render("urls_new", templateVars);
    return;
  } else {
    response.redirect("/login");
  }
});

app.get('/urls/:shortURL', (request, response) => {
  const userID = request.cookies['user_id'];
  const user = users[userID]; 
  const templateVars = { shortURL: request.params.shortURL, longURL: urlDatabase[request.params.shortURL].longURL ,  user: user};
  response.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (request, response) => {
  const longURL = urlDatabase[request.params.shortURL].longURL;
  response.redirect(longURL);
});


//THESE ARE MY CREATE/DELETE POST ROUTES:
/*
After our browser renders our new URL form, the user populates the form with a longURL and presses submit.
Our browser sends a POST request to our server.
*/

//ADDING AN ENDPOINT TO HANDLE POST TO /LOGIN:
app.post('/login', (request, response) => {

  
  const user = getUserByEmail(request.body.email);
  console.log(user);


  if (!user) {
    response.status(403).send('Email not found');
  }

  const isPasswordGood = bcrypt.compareSync(request.body.password, user.password);
  if (!isPasswordGood) {
    response.status(403).send('Password mismatch');
    return;
  }
  response.cookie('user_id', user.id);

  response.redirect('/urls');

});

//ADDING AN ENDPOINT TO HANDLE POST TO /LOGOUT:
app.post('/logout', (request, response) => {

  response.clearCookie("user_id");
  
  response.redirect('/');
});




app.post('/urls/:id', (request, response) => {
  const shortURL = request.params.id
  const userDB = urlsForUser(request.cookies['user_id'])
  if (request.body.longURL in userDB){
    urlDatabase[shortURL] = request.body.longURL
  } else {
    response.status(403).send('Not your property to edit')
  }
  response.redirect('/urls');
});
  

app.post("/urls", (request, response) => {
  console.log(request.body); 
  const shortURL = generateRandomString();
  const userID = request.cookies['user_id'];
  
  urlDatabase[shortURL] = { longURL: request.body["longURL"], userID: userID };
  response.redirect(`/urls/${shortURL}`);
});     

app.post('/urls/:shortURL/delete', (request, response) => {
  const userDB = urlsForUser(request.cookies['user_id'])
  if (request.params.shortURL in userDB){
    delete urlDatabase[request.params.shortURL];
  } else {
    response.status(403).send('Not your property to delete')
  }
  
  response.redirect('/urls');
});

app.post('/register', (request, response) => {
  const email = request.body.email;
  const password = request.body.password;

  if (!email || !password){
    response.status(400).send('can\'t leave fields empty');
    return;
  }

  const user = getUserByEmail(email);
  if (user){
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
  }

  users[id] = newUser;
    response.cookie('user_id', id);
    response.redirect('urls');
    
})

const getUserByEmail = (email) => {
  for (let key in users){
    if (users[key].email === email){
      return users[key];
    }
  }
  return null;
}

// // CATCH ALL
// app.get('*', (request, response) => {
//   response.status(404).send('Page not found');
//  });

 
//I AM LISTENING HERE:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

