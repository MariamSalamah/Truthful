export function errorHandler(err, req, res, _next) {
  console.error(err);
  res.status(500).json({ error: { message: err.message || 'Internal server error' } });
}
