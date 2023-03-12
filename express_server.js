const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser')

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser())

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
 
  app.get('/urls', (req, res) => {
    const templateVars = {
      urls: urlDatabase,
      username: req.cookies['username']
    };
    res.render('urls_index', templateVars);
  });

  app.post("/urls", (req, res) => {
    const randomStr = generateRandomString();
     urlDatabase[randomStr] = req.body.longURL; 

     app.get("/urls/new", (req, res) => {  
      const templateVars = {
        urls: urlDatabase,
        username: req.cookies['username']
      };
        res.render("urls_new", templateVars);
      });

  app.post('/login', (req, res) => {
    const username = req.body.email;
    res.cookie('username', username);
    res.redirect('/urls');
  });

  app.get('/login',(req, res) => {
    res.render('urls_login')
  });

  app.get('/dashboard', (req, res) => {
    const username = req.session.username;
    res.render('dashboard', { username });
  });


