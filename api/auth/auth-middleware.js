const db = require('../../data/dbConfig')

const jwt = require('jsonwebtoken') // npm install

const { JWT_SECRET } = require('../../config')

const restrict = (req, res, next) => {
  const token = req.headers.authorization

if(token){
  jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
      if(err){
          next({ status: 401, message: "token invalid" });
      } else {
          req.decodedJwt = decodedToken
          next();
      }
  })
} else {
  next({ status: 402, message: "token required" });
} 
}


const checkIfMissing = (req, res, next) => {
    const { username, password } = req.body
    if (username && password ) {
        next();
    } else {
        next({ status: 400, message: 'username and password required' });
    }
} 

const checkUsernameString = async (req, res, next) => {
    const { username } = req.body
    const [user] = await db('users').where('username', username).select('username')
    if (!user) {
        next();
    } else {
        next ({ status: 400, message: 'username taken' });
    }
}

module.exports = {
    restrict,
    checkIfMissing,
    checkUsernameString
}