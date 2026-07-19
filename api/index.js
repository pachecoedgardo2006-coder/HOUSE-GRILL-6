// /api/index.js
import app from '../backend/src/app.js';

export default (req, res) => {
  console.log(`[DEBUG] Recibida petición: ${req.method} ${req.url}`);
  return app(req, res);
};