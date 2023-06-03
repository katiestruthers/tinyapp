const { assert } = require('chai');
const { generateRandomString, getUserByEmail, urlsForUser } = require('../helpers');

const usersTest = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

const urlsTest = {
  'urlRandomID': {
    longURL: 'https://www.tsn.ca',
    userID: 'userRandomID',
  },
  'url2RandomID': {
    longURL: 'https://www.google.ca',
    userID: 'user2RandomID',
  },
};

describe('generateRandomString', function() {
  it('should return a string with a length of 6', function() {
    const string = generateRandomString();
    assert.lengthOf(string, 6);
  });
});

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const actual = getUserByEmail('user@example.com', usersTest);
    const expected = 'userRandomID';
    assert.equal(actual, expected);
  });
  it('should return null if email not in database', function() {
    const actual = getUserByEmail('notInDatabase@example.com', usersTest);
    const expected = null;
    assert.equal(actual, expected);
  });
});

describe('urlsForUser', function() {
  it('should return relevant urls for valid user', function() {
    const actual = urlsForUser('userRandomID', urlsTest);
    const expected = {
      'urlRandomID': {
        longURL: 'https://www.tsn.ca',
        userID: 'userRandomID',
      }
    };
    assert.deepEqual(actual, expected);
  });
  it('should return an empty object for invalid user', function() {
    const actual = urlsForUser('user3RandomID', urlsTest);
    const expected = {};
    assert.deepEqual(actual, expected);
  });
});