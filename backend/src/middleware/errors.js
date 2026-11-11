function notFound(req, res) {
  res.status(404).json({ error: { message: 'Route not found.' } });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.name === 'ZodError') {
    return res.status(400).json({ error: { message: 'Invalid request.', details: error.issues.map(({ path, message }) => ({ field: path.join('.'), message })) } });
  }
  if (error.code === '23505') return res.status(409).json({ error: { message: 'That value is already in use.' } });
  console.error(error.message);
  res.status(error.status || 500).json({ error: { message: error.status ? error.message : 'Something went wrong.' } });
}

module.exports = { notFound, errorHandler };
