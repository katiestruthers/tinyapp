const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers');
const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));

const urlDatabase = {
  b6UTxQ: {
    longURL: 'https://www.tsn.ca',
    userID: '51o7z2',
  },
  i3BoGr: {
    longURL: 'https://www.google.ca',
    userID: 'vv6naa',
  },
};

const users = {
  '51o7z2': {
    id: '51o7z2',
    email: 'a@a.com',
    password: '$2a$10$dO4bvAGctwd2Ns1n4dw.puWCRQQmOGywA5UCZuMQ4R4m/3mXwC0xy',
  },
  'vv6naa': {
    id: 'vv6naa',
    email: 'b@b.com',
    password: '$2a$10$UgRugOYbBzf3SutvLRYmFOi44z5pyaLSAf/Xm0xMKrTilpVweJrMa',
  },
};

app.get('/', (req, res) => {
  const user = req.session.user_id;

  if (user) {
    return res.redirect('/urls');
  }

  res.redirect('/login');
});

/////////////////////////////////////////////////////////////
// URL ROUTES
/////////////////////////////////////////////////////////////

// Display urls index
app.get('/urls', (req, res) => {
  const user = req.session.user_id;

  if (!user) {
    return res.status(401).send('Must login first before viewing your URLs.');
  }

  const templateVars = {
    urls: urlsForUser(user, urlDatabase),
    user: users[user],
  };
  res.render('urls_index', templateVars);
});

// Display form to create a new url
app.get('/urls/new', (req, res) => {
  const user = req.session.user_id;

  if (!user) {
    return res.redirect('/login');
  }

  const templateVars = { user: users[user] };
  res.render('urls_new', templateVars);
});

// Create a new url
app.post('/urls', (req, res) => {
  const user = req.session.user_id;

  if (!user) {
    return res.status(401).send('Must login to create new shortened URL.');
  }

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: user,
  };

  res.redirect(`/urls/${shortURL}`);
});


// Display form to edit a url
app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const user = req.session.user_id;
  const errorMsg = 'Unable to display edit page. ';

  if (!(id in urlDatabase)) {
    return res.status(404).send(`${errorMsg} URL ID ${id} does not exist.`);
  }

  if (!user) {
    return res.status(401).send(`${errorMsg} Must login to verify ownership of URL ID ${id}.`);
  }

  if (user !== urlDatabase[id].userID) {
    return res.status(403).send(`${errorMsg} You are not the owner of URL ID ${id}.`);
  }

  const templateVars = {
    id: id,
    longURL: urlDatabase[id].longURL,
    user: users[user],
  };
  res.render('urls_show', templateVars);
});

// Edit a url
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const user = req.session.user_id;
  const errorMsg = 'Unable to edit. ';

  if (!(id in urlDatabase)) {
    return res.status(404).send(`${errorMsg} URL ID ${id} does not exist.`);
  }

  if (!user) {
    return res.status(401).send(`${errorMsg} Must login to verify ownership of URL ID ${id}.`);
  }

  if (user !== urlDatabase[id].userID) {
    return res.status(403).send(`${errorMsg} You are not the owner of URL ID ${id}.`);
  }

  urlDatabase[id].longURL = req.body.longURL;
  res.redirect('/urls');
});

// Redirect from short url to associated long url
app.get('/u/:id', (req, res) => {
  const id = req.params.id;

  if (!(id in urlDatabase)) {
    return res.status(404).send(`Unable to redirect. URL ID ${id} does not exist.`);
  }

  res.redirect(urlDatabase[id].longURL);
});

// Delete an existing url
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  const user = req.session.user_id;
  const errorMsg = 'Unable to delete. ';

  if (!urlDatabase[id]) {
    return res.status(404).send(`${errorMsg} URL ID ${id} does not exist.`);
  }

  if (!user) {
    return res.status(401).send(`${errorMsg} Must login to verify ownership of URL ID ${id}.`);
  }

  if (user !== urlDatabase[id].userID) {
    return res.status(403).send(`${errorMsg} You are not the owner of URL ID ${id}.`);
  }

  delete urlDatabase[id];
  res.redirect('/urls');
});

/////////////////////////////////////////////////////////////
// USER ROUTES
/////////////////////////////////////////////////////////////

// Display form to register a new user
app.get('/register', (req, res) => {
  const user = req.session.user_id;

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

  if (getUserByEmail(email, users)) {
    return res.status(400).send(`Email address ${email} is already registered.`);
  }

  users[id] = {
    id: id,
    email: email,
    password: bcrypt.hashSync(password, 10),
  };

  // eslint-disable-next-line camelcase
  req.session.user_id = id;
  res.redirect('/urls');
});

// Display form to login user
app.get('/login', (req, res) => {
  const user = req.session.user_id;

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
  const id = getUserByEmail(email, users);

  if (!(id)) {
    return res.status(400).send(`Email address ${email} is not registered.`);
  }

  const hashedPassword = users[id].password;
  if (!bcrypt.compareSync(password, hashedPassword)) {
    return res.status(400).send('Incorrect password.');
  }

  // eslint-disable-next-line camelcase
  req.session.user_id = id;
  res.redirect('/urls');
});

// Logout a currently logged in user
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});