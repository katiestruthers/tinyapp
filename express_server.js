const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const generateRandomString = function() {
  let string = '';

  for (let i = 0; i < 6; i++) {
    string += String.fromCharCode(Math.floor(Math.random() * 95) + 33);
  }

  return string;
};
console.log(generateRandomString());

app.get('/', (request, response) => {
  response.send('Hello!');
});

app.get('/urls', (request, response) => {
  const templateVars = { urls: urlDatabase };
  response.render('urls_index', templateVars);
});

app.get('/urls/new', (request, response) => {
  response.render('urls_new');
});

app.get('/urls/:id', (request, response) => {
  const templateVars = { id: request.params.id, longURL: urlDatabase.id };
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
  console.log(request.body);
  response.send('Ok');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});