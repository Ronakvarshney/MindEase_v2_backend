const { decodeToken } = require("../core/security/jwt");

const protect = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access - No token provided",
      });
    }

    const decoded = decodeToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access - Invalid token",
      });
    }
    req.user = decoded ;
    next();
  } catch (err) {
    console.error("Error in auth middleware:", err);
    res.status(500).json({
      success: false,
      message: "Server error in auth middleware",
    });
  }
};


module.exports = protect ;