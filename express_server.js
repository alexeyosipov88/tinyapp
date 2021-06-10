const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(cookieParser())
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
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
const emailAlreadyExists = (email) => {
  let keys = Object.keys(users);
  for (key of keys) {
    if (email === users[key].email) {
      return key;
    }
  }
  return false;
}
const bodyParser = require("body-parser");
const generateRandomString = (length) => {
  let randomLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += randomLetters.charAt(Math.floor(Math.random() * randomLetters.length));
  }
  return result;
}
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!emailAlreadyExists(email)) {
    res.status(403).send("User with this email is not found");
  };
  if (users[emailAlreadyExists(email)].password !== password) {
    res.status(403).send("Login and password don't match");
  }
  res.cookie("user_id", emailAlreadyExists(email));
  res.redirect(`/urls`);
});
app.get("/login", (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"],
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_login", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user_id: req.cookies["user_id"],
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user_id: req.cookies["user_id"],
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_new", templateVars);
});
app.get("/register", (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"],
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_register", templateVars);
});
app.post("/register", (req, res) => {
  const id = generateRandomString(5);
  const email = req.body.email;
  const password = req.body.password;
  console.log(emailAlreadyExists(email))
  if (email === "" || password === "") {
    res.status(400).send("email or passwor is an empty string")
  };
  if (emailAlreadyExists(email) === true) {
    res.status(400).send("User with the same email already exists")
  }
  const user = { id, email, password };
  users[id] = user;
  res.cookie("user_id", id);
  res.redirect("/urls");
});


app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.id;
  res.redirect(`/urls`);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});   
app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user_id: req.cookies["user_id"],
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_show", templateVars);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});