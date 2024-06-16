const jwt = require("jsonwebtoken");

// Middleware function to authenticate users
function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(" ")[1]; // Get token part after "Bearer"

      const decoded = jwt.verify(token, process.env.SECRET_KEY);

      // Assuming your JWT payload contains a 'userId' property
      req.user = { id: decoded.userId };

      next(); // Proceed to the next middleware or route handler
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
}

module.exports = authenticateUser;
