const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return user;
    }
  }

  return null;
};

const urlsForUser = function(id, database) {
  const ret = {};

  for (const url in database) {
    if (database[url].userID === id) {
      ret[url] = database[url];
    }
  }

  return ret;
};


module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser
};