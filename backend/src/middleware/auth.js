function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: { message: 'Sign in to continue.' } });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: { message: 'Sign in to continue.' } });
  if (req.session.role !== 'admin') return res.status(403).json({ error: { message: 'Administrator access required.' } });
  next();
}

module.exports = { requireAuth, requireAdmin };
