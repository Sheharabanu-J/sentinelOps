exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        error: "Access Denied: Insufficient authorization level."
      });
    }
    const userRole = req.user.role.toUpperCase();
    const allowed = allowedRoles.map(r => r.toUpperCase());
    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        error: "Access Denied: Insufficient authorization level."
      });
    }
    next();
  };
};

exports.enforceBaseScope = (req, res, next) => {
  if (req.user.role === 'BASE_COMMANDER') {
    // If it's a GET request, attach to query, else attach to body for POST/PUT
    if (req.method === 'GET') {
      req.query.baseId = req.user.baseId;
    } else {
      req.body.baseId = req.user.baseId;
    }
  }
  next();
};
