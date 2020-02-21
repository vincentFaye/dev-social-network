const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = (req, res, next) => {
  // Get the token from the header
  const token = req.header('x-auth-token')

  // check if no token
  if (!token) {
    res.status(401).json({ msg: 'No token, authorization denied'})
  }

  // Verify token
  try {
    const decode = jwt.verify(token, config.get('jwtSecret'))
    req.user = decode.user
    next()
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' })
  }
}
