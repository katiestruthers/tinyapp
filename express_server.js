const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

app.get('/', (request, response) => {
  response.send('Hello!');
});

app.get('/urls', (request, response) => {
  const templateVars = {
    urls: urlDatabase,
    username: request.cookies["username"]
  };
  response.render('urls_index', templateVars);
});

app.get('/urls/new', (request, response) => {
  const templateVars = { username: request.cookies["username"] };
  response.render('urls_new', templateVars);
});

app.get('/urls/:id', (request, response) => {
  const templateVars = {
    id: request.params.id,
    longURL: urlDatabase.id,
    username: request.cookies["username"]
  };
  response.render('urls_show', templateVars);
});

app.get('/u/:id', (request, response) => {
  const longURL = urlDatabase[request.params.id];
  response.redirect(longURL);
});

app.get('/urls.json', (request, response) => {
  response.json(urlDatabase);
});

app.get('/hello', (request, response) => {
  response.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.post('/urls', (request, response) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = request.body.longURL;
  response.redirect(`/u/${shortURL}`);
});

app.post('/urls/:id/delete', (request, response) => {
  delete urlDatabase[request.params.id];
  response.redirect('/urls');
});

app.post('/urls/:id', (request, response) => {
  const id = request.params.id;
  urlDatabase[id] = request.body.longURL;
  response.redirect('/urls');
});

app.post('/login', (request, response) => {
  response.cookie('username', request.body.username);
  response.redirect('/urls');
});

app.post('/logout', (request, response) => {
  response.clearCookie('username');
  response.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});