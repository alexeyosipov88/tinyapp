const getUserByEmail = (email, database) => {
  let keys = Object.keys(database);
  for (key of keys) {
    if (email === database[key].email) {
      return key;
    }
  }
  return false;
}
const generateRandomString = (length) => {
  let randomLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += randomLetters.charAt(Math.floor(Math.random() * randomLetters.length));
  }
  return result;
}




module.exports = {getUserByEmail, generateRandomString}