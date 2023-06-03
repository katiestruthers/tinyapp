const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
    password: '$2a$10$dO4bvAGctwd2Ns1n4dw.puWCRQQmOGywA5UCZuMQ4R4m/3mXwC0xy', // 123
  },
  'vv6naa': {
    id: 'vv6naa',
    email: 'b@b.com',
    password: '$2a$10$UgRugOYbBzf3SutvLRYmFOi44z5pyaLSAf/Xm0xMKrTilpVweJrMa', // 456
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

const urlsForUser = function(id) {
  const ret = {};

  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      ret[url] = urlDatabase[url];
    }
  }

  return ret;
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
  const user = req.cookies['user_id'];

  if (!user) {
    return res.status(401).send('Must login first before viewing your URLs.');
  }

  const templateVars = {
    urls: urlsForUser(user),
    user: users[user],
  };
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// Display form to create a new url
app.get('/urls/new', (req, res) => {
  const user = req.cookies['user_id'];

  if (!user) {
    return res.redirect('/login');
  }

  const templateVars = { user: users[user] };
  res.render('urls_new', templateVars);
});

// Create a new url
app.post('/urls', (req, res) => {
  const user = req.cookies['user_id'];

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
  const user = req.cookies['user_id'];
  const longURL = urlDatabase[id].longURL;
  const errorMsg = 'Unable to display edit page. ';

  if (!longURL) {
    return res.status(400).send(`${errorMsg} URL ID ${id} does not exist.`);
  }

  if (!user) {
    return res.status(401).send(`${errorMsg} Must login to verify ownership of URL ID ${id}.`);
  }

  if (user !== urlDatabase[id].userID) {
    return res.status(403).send(`${errorMsg} You are not the owner of URL ID ${id}.`);
  }

  const templateVars = {
    id: id,
    longURL: longURL,
    user: users[user],
  };
  res.render('urls_show', templateVars);
});

// Edit a url
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const user = req.cookies['user_id'];
  const errorMsg = 'Unable to edit. ';

  if (!urlDatabase[id]) {
    return res.status(400).send(`${errorMsg} URL ID ${id} does not exist.`);
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
  const longURL = urlDatabase[id].longURL;

  if (!longURL) {
    return res.status(400).send(`Unable to redirect. URL ID ${id} does not exist.`);
  }

  res.redirect(longURL);
});

// Delete an existing url
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  const user = req.cookies['user_id'];
  const errorMsg = 'Unable to delete. ';

  if (!urlDatabase[id]) {
    return res.status(400).send(`${errorMsg} URL ID ${id} does not exist.`);
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
    password: bcrypt.hashSync(password, 10),
  };

  console.log(users);
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
  const hashedPassword = users[id].password;
  const id = getUserByEmail(email);

  if (!(id)) {
    return res.status(400).send(`Email address ${email} is not registered.`);
  }

  if (!bcrypt.compareSync(password, hashedPassword)) {
    return res.status(400).send('Incorrect password.');
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