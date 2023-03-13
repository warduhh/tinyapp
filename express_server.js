const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());


function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies['username']
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const randomStr = generateRandomString();
   urlDatabase[randomStr] = req.body.longURL; 
   res.redirect(`/urls/${randomStr}`); 
 });
 

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies['username']
  };
    res.render("urls_new", templateVars);
  });

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

// added short urls route 
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL };
  res.render("urls_show", templateVars);
});

//"/u/:id" will redirect to its longURL
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send('Short URL not found');
  }
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {   
  const id = req.params.id;
  const newUrl = req.body.longURL;
  urlDatabase[id] = newUrl;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const username = req.body.email;
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post('/register', (req, res) => {
  const randomUserID = generateRandomString();
const userEmail = req.body.email;
res.cookie('user_id', randomUserID);
users[randomUserID] = {
  id: randomUserID,
  email: req.body.email,
  password: req.body.password
};

  res.redirect('/urls');
});


app.post("/logout", (req, res) => {
  res.clearCookie("username");
  console.log("Cookie cleared");
  res.redirect("/urls");
});

app.get('/login',(req, res) => {
  res.render('urls_login')
});

app.get('/dashboard', (req, res) => {
  const username = req.session.username;
  res.render('dashboard', { username });
});

