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

const getUserByEmail = function(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return user;
    }
  }

  return null;
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

// Display urls index
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']],
  };
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// Display form to create a new url
app.get('/urls/new', (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render('urls_new', templateVars);
});

// Create a new url
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});


// Display form to edit a url
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase.id,
    user: users[req.cookies['user_id']],
  };
  res.render('urls_show', templateVars);
});

// Edit a url
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect('/urls');
});

// Redirect from short url to associated long url
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// Delete an existing url
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

/////////////////////////////////////////////////////////////
// USER ROUTES
/////////////////////////////////////////////////////////////

// Display form to register a new user
app.get('/register', (req, res) => {
  const user = req.cookies['user_id'];

  if (user) {
    return res.redirect('/urls');
  }

  const templateVars = { user: users[user] };
  res.render('register', templateVars);
});

// Register a new user
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!(email) || !(password)) {
    return res.status(400).send('Must include an email and password.');
  }

  if (getUserByEmail(email)) {
    return res.status(400).send(`Email address ${email} is already registered.`);
  }

  users[id] = {
    id: id,
    email: email,
    password: password,
  };

  res.cookie('user_id', id);
  res.redirect('/urls');
});

// Display form to login user
app.get('/login', (req, res) => {
  const user = req.cookies['user_id'];

  if (user) {
    return res.redirect('/urls');
  }

  const templateVars = { user: users[user] };
  res.render('login', templateVars);
});

// Login a registered user
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = getUserByEmail(email);

  if (!(id)) {
    return res.status(403).send(`Email address ${email} is not registered.`);
  }

  if (password !== users[id].password) {
    return res.status(403).send('Incorrect password.');
  }

  res.cookie('user_id', id);
  res.redirect('/urls');
});

// Logout a currently logged in user
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});