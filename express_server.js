const express = require("express");
const PORT = 8080; // default port 8080
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const saltRounds = 10;
//const cookieParser = require('cookie-parser');
const morgan = require("morgan");
const app = express();
const {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
} = require("./helpers");

// MiddleWare
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.use(express.urlencoded({extended: true}));
// app.use(cookieParser());
app.set("view engine", "ejs");
app.use(morgan('dev'));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("password1", saltRounds)
  },
  "jmB0jt": {
    id: "jmB0jt",
    email: "user2@example.com",
    password: bcrypt.hashSync("password2", saltRounds)
  },
}

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//renders URLs page with list of all the URLs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlsForUser(req.session.user_id, urlDatabase), user: users[req.session.user_id] };
  res.render("urls_index", templateVars);
});

//renders new URL page
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    res.render("urls_new", { user: users[req.session.user_id] });
  } else {
    res.redirect("/login");
  }
});


app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.send("<html><h1>Error: this URL does not exist</h1></html> ");
  } else if (!req.session.user_id) {
    return res.send("<html><h1>Error: please login to view this page</h1></html> ");
  } else if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    return res.send('<html><h1>Error: you do not have permission to view this URL</h1></html>');
  }
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const urlID = urlDatabase[req.params.id];
  if (urlID === undefined) {
    res.statusCode = 404;
    return res.send("<html><h1>Error: shortURL does not exist</h1></html>");
  } else {
    res.redirect(urlID.longURL);
  }
});

//generates a new shortURL, adds it to the database
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.send('<html><h1>Error: please login to view this page</h1></html>');
  }
  let tempString = generateRandomString();
  urlDatabase[tempString] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  return res.redirect(`/urls/${tempString}`);
});


//updates an existing url
app.post("/urls/:id", (req, res) => {
  if (req.session.user_id && req.session.user_id === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    return res.send("<html><h1>Error: you do not have permission to edit this URL</h1></html>");
  }
});

//removes a URL 
app.post("/urls/:id/delete", (req, res) => {
  console.log("req.session", req.session);
  if (req.session.user_id && req.session.user_id === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id];
    return res.redirect("/urls");
  }
  return res.send("<html><h1>Error: you do not have permission to delete this URL</h1></html>");
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_login", templateVars);
});

// Logs in user by creating encrypted cookie
app.post("/login", (req, res) => {
  const userId = getUserByEmail(req.body.email, users);
  if (!userId) {
    res.statusCode = 403;
    return res.send("<html><h1>Error: User does not exist</h1></html>");
  } else if (!bcrypt.compareSync(req.body.password, users[userId].password)) {
    res.statusCode = 403;
    return res.send("<html><h1>Error: incorrect password</h1></html>");
  } else {
    req.session["user_id"] = userId;
    return res.redirect("/urls");
  }
});

//renders register page 
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[req.session.user_id] };
  return res.render("urls_register", templateVars);
});

// Adds user to database with hashed password
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.statusCode = 400;
    return res.send("<html><h1>Error: Please enter an email and password</h1></html>");
  } else if (users[getUserByEmail(req.body.email, users)]) {
    res.statusCode = 400;
    return res.send("<html><h1>Error: Email already exists</h1></html>");
  } else {
    const id = generateRandomString();
    users[id] = {
      id,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, saltRounds)
    };
    req.session["user_id"] = id;
    return res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect("/urls");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`TinyApp server listening on port ${PORT}!`);
});