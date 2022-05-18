const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Gather the jwt access token from the request header
  console.log("init authcheck");
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];  if (!token) return res.status(400).send("Access Denied!, no token entered");
  try {
    const verified = jwt.verify(token, process.env.jwtSecret);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send({ error: "auth failed, check auth-token" });
  }
};