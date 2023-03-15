function generateRandomString() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function getUserByEmail(email, database) {
  for (let id in database) {
    console.log("users[id].email: ", database[id].email);
    if (database[id].email === email) {
      return id;
    }
  }
  return undefined;
}

const urlsForUser = function (id, urlDatabase) {
  const output = {};
  for (let urlID in urlDatabase) {
    if (urlDatabase[urlID].userID === id) {
      output[urlID] = urlDatabase[urlID].longURL;
    }
  }
  return output;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };