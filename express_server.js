const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

const users = {
  '51o7z2': {
    id: '51o7z2',
    email: 'a@a.com',
    password: '123',
  },
  'vv6naa': {
    id: 'vv6naa',
    email: "b@b.com",
    password: "456",
  },
};

const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

/////////////////////////////////////////////////////////////
// URL ROUTES
/////////////////////////////////////////////////////////////

// INDEX - display urls index
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// CREATE - display form to create a new url
app.get('/urls/new', (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render('urls_new', templateVars);
});

// EDIT - display form to edit a url
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase.id,
    username: req.cookies["username"]
  };
  res.render('urls_show', templateVars);
});

// READ - redirect from short url to associated long url
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// SAVE - add a new url
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/u/${shortURL}`);
});

// DELETE - delete an existing url
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// UPDATE - update an existing url
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect('/urls');
});

/////////////////////////////////////////////////////////////
// USER ROUTES
/////////////////////////////////////////////////////////////

// CREATE - display form to register a new user
app.get('/register', (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render('register', templateVars);
});

// SAVE - add a new user
app.post('/register', (req, res) => {
  const id = generateRandomString();
  users[id] = {
    id: id,
    email: req.body.email,
    password: req.body.password,
  };
  res.cookie('user_id', id);
  res.redirect('/urls');
});

// LOGIN a user
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

// LOGOUT currently logged in user
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});