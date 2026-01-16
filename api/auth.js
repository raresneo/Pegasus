const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'pegasus_master_key_2025';

const auth = {
  // Middleware principal pentru verificarea token-ului
  verifyToken: (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) return res.status(403).json({ message: 'Acces refuzat. Token lipsește.' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ message: 'Sesiune expirată sau invalidă.' });
      req.user = decoded;
      next();
    });
  },

  // Middleware pentru restricționarea accesului la anumite roluri
  authorize: (roles = []) => {
    if (typeof roles === 'string') roles = [roles];
    return (req, res, next) => {
      if (!req.user || (roles.length && !roles.includes(req.user.role))) {
        return res.status(403).json({ message: 'Permisiuni insuficiente pentru această acțiune.' });
      }
      next();
    };
  },

  generateToken: (user) => {
    return jwt.sign(
      { id: user.id, role: user.role, email: user.email, name: user.name }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
  },

  hashPassword: async (pw) => await bcrypt.hash(pw, 10),
  comparePassword: async (pw, hash) => await bcrypt.compare(pw, hash)
};

module.exports = auth;