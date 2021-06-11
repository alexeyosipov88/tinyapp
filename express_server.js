const express = require("express");
const app = express();
const cookieSession = require('cookie-session')
const PORT = 8080  // default port 8080
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
const urlsForUser = (id) => {
  let result = {}
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
       result[key] = urlDatabase[key];
    }
  }
  return result;
}



/* const urlsForUser = require('./helpers'); */
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const getUserByEmail = require ('./helpers');
const generateRandomString = require('./helpers');
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
}


app.use(bodyParser.urlencoded({ extended: true }));

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!getUserByEmail(email, users)) {
    res.status(403).send("User with this email is not found");
  };
  if (!bcrypt.compareSync(password, users[getUserByEmail(email, users)].password)) {
    res.status(403).send("Login and password don't match");
  }
  req.session["user_id"] = getUserByEmail(email, users);
  res.redirect(`/urls`);
});



app.get("/login", (req, res) => {
  const templateVars = {
    user_id: req.session["user_id"],
    user: users[req.session["user_id"]]
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
  let newUrls = urlsForUser(req.session["user_id"]);
  const templateVars = {
    urls: newUrls,
    user_id: req.session["user_id"],
    user: users[req.session["user_id"]]
  }
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  if (!req.session["user_id"]) {
    res.redirect("/login")
  }
  const templateVars = {
    urls: urlDatabase,
    user_id: req.session["user_id"],
    user: users[req.session["user_id"]]
  }
  res.render("urls_new", templateVars);
});


app.get("/register", (req, res) => {
  const templateVars = {
    user_id: req.session["user_id"],
    user: users[req.session["user_id"]]
  }
  res.render("urls_register", templateVars);
});


app.post("/register", (req, res) => {
  const id = generateRandomString(5);
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  if (email === "" || password === "") {
    res.status(400).send("email or passwor is an empty string")
  };
  if (getUserByEmail(email, users)) {
    res.status(400).send("User with the same email already exists")
  }
  const user = { id, email, password };
  users[id] = user;
  req.session["user_id"] =  id;
  req.session.user_id = "asfsadfsd";
  res.redirect("/urls");
});


app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = {longURL: req.body.id, userID: req.session.user_id};
  res.redirect(`/urls`);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
app.post("/logout", (req, res) => {
  req.session['user_id'] = null;
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user_id: req.session["user_id"],
    user: users[req.session["user_id"]]
  }
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

console.log(users);