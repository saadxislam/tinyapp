//EXPRESS IS A FUNCTION SO WE PUT IT INSIDE CONST APP AND CALL IT
const express = require('express');
const app = express();
const PORT = 8080; //default port 8080

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
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

urlsForUser = (id) => {
  const userDB = {};
  for (let key in urlDatabase){
    if (urlDatabase[key].userID === id){
      userDB[key] = {longURL: urlDatabase[key].longURL , userID: id }
    } 
  }
  return userDB;
}




//THESE ARE MY "GET" ROUTES:
app.get("/", (request, response) => {
  // response.send("Hello!")
  response.redirect('/urls');
});

//HOME PAGE
app.get("/urls", (request, response) => {
  const userID = request.cookies['user_id'];
  const user = users[userID];               //check if that user ID is not in the users
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
  } else {
    response.redirect("urls_login");
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
  const username = request.body.username;
  const password = request.body.password

 if (!emailExists(request.body.email)){
  response.status(403).send('Email not found');
 } else {
   const id = emailExists(request.body.email) 
   if (users[id].password !== request.body.password){
    response.status(403).send('Password mismatch');
   } else {
    response.cookie('user_id', id);
   }
   response.redirect('/urls');
  }


});

//ADDING AN ENDPOINT TO HANDLE POST TO /LOGOUT:
app.post('/logout', (request, response) => {

  response.clearCookie("user_id");
  
  response.redirect('/urls');
});




app.post('/urls/:id', (request, response) => {
  const shortURL = request.params.id
  const userDB = urlsForUser(request.cookies['user_id'])
  if (request.body.longURL in userDB){
    urlDatabase[shortURL] = request.body.longURL
  } else {
    response.status(403).send('Not your property, Edith')
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

  const newUserID = generateRandomString();
  const id = newUserID;
  const email = request.body.email;
  const password = request.body.password;

  const newUser = {
    id,
    email,
    password,
  }

  
  if (!email || !password){
    response.status(400).send('can\'t leave fields empty');
  } else if(emailExists(request.body.email)){
    response.status(400).send('Email already registered');
  } else {
    users[newUserID] = newUser;
    response.cookie('user_id', newUserID);
    response.redirect('urls');
  }  
  

})
const emailExists = (email) => {
  for (let key in users){
    if (users[key].email === email){
      return key;
    }
  }
  return false;
}

// // CATCH ALL
// app.get('*', (request, response) => {
//   response.status(404).send('Page not found');
//  });

 
//I AM LISTENING HERE:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

