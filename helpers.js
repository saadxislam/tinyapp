//takes in an email and returns a user object which matches the email, or null if not found
const getUserByEmail = (email, database) => {
  for (let key in database) {
    if (database[key].email === email) {
      return database[key];
    }
  }
  return null;
};

//Generates a random 6 digit alphanumeric string
function generateRandomString() {
  return Math.random().toString(20).substr(2, 6);
}

//returns a user obj with a database of all the urls they own
const urlsForUser = (id, database) => {
  const userDB = {};
  for (let key in database) {
    if (database[key].userID === id) {
      userDB[key] = database[key];
    }
  }
  return userDB;
};




module.exports = { getUserByEmail, urlsForUser, generateRandomString };