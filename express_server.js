const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const methodOverride = require('method-override')

const PORT = 8080;  // default port 8080

app.use(methodOverride('_method'));

app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
const bodyParser = require("body-parser");

const { urlsForUser, makeProperLongUrl, getUserByEmail, generateRandomString } = require('./helpers');


const bcrypt = require('bcrypt');




const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
};

app.use(bodyParser.urlencoded({ extended: true }));


// get request handler for getting urlDB in json format

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// sends hello for the user to check get request handler. it all started from here

app.get("/", (req, res) => {
  if (!req.session["user_id"]) {
    res.redirect("/login");
    return;
  }
  res.redirect("/urls");
});

// post request handler for creating short url

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  const longURL = makeProperLongUrl(req.body.longURL);
  urlDatabase[shortURL] = { longURL: longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
});

// post request handler for signing in

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!getUserByEmail(email, users)) {
    res.status(403).send("User with this email is not found");
    return;
  }
  if (!bcrypt.compareSync(password, users[getUserByEmail(email, users)].password)) {
    res.status(403).send("Login and password don't match");
    return;
  }
  req.session["user_id"] = getUserByEmail(email, users);
  res.redirect(`/urls`);
});

// get request handler for login page

app.get("/login", (req, res) => {
  const templateVars = {
    user_id: req.session["user_id"],
    user: users[req.session["user_id"]]
  };
  res.render("urls_login", templateVars);
});


// get request handler, shows the list of urls created by the user

app.get("/urls", (req, res) => {
  if (!users[req.session["user_id"]]) {
    res.redirect("/login");
    return;
  }
  let newUrls = urlsForUser(req.session["user_id"], urlDatabase);
  const templateVars = {
    urls: newUrls,
    user_id: req.session["user_id"],
    user: users[req.session["user_id"]],
  };
  res.render("urls_index", templateVars);
});

// get request handler for showing a page for creating short url

app.get("/urls/new", (req, res) => {
  if (!req.session["user_id"]) {
    res.redirect("/login");
    return;
  }
  const templateVars = {
    urls: urlDatabase,
    user_id: req.session["user_id"],
    user: users[req.session["user_id"]]
  };
  res.render("urls_new", templateVars);
});

// get request handler for registering new users

app.get("/register", (req, res) => {
  const templateVars = {
    user_id: req.session["user_id"],
    user: users[req.session["user_id"]]
  };
  res.render("urls_register", templateVars);
});

// post request handler for creating new account

app.post("/register", (req, res) => {
  const id = generateRandomString(5);
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  if (email === "" || password === "") {
    res.status(400).send("email or password is an empty string");
    return;
  }
  if (getUserByEmail(email, users)) {
    res.status(400).send("User with the same email already exists");
    return;
  }
  const user = { id, email, password };
  users[id] = user;
  req.session["user_id"] = id;
  res.redirect("/urls");
});

// post request handler for editing URL

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = makeProperLongUrl(req.body.id);
  urlDatabase[shortURL] = { longURL: longURL, userID: req.session.user_id };
  res.redirect(`/urls`);
});

// post request handler for deleting URL

app.delete("/urls/:shortURL", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// get request handler for clicking on the shortURL link (redirects to the real website)

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.send("The short URL doesn't exist");
    return;
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// post request handler for logout

app.post("/logout", (req, res) => {
  req.session['user_id'] = null;
  res.redirect("/urls");
});

// get request handler for short url

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user_id: req.session["user_id"],
    user: users[req.session["user_id"]]
  };
  res.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
