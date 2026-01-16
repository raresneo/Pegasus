const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('./supabaseClient');

const JWT_SECRET = process.env.JWT_SECRET || 'pegasus_master_key_2025';

const auth = {
  // Middleware principal pentru verificarea token-ului Supabase
  verifyToken: async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) return res.status(403).json({ message: 'Acces refuzat. Token lipsește.' });

    try {
      // Verifică token-ul cu Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ message: 'Sesiune expirată sau invalidă.' });
      }

      // Obține profilul complet din baza de date
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (profileError || !userProfile) {
        return res.status(404).json({ message: 'Profil utilizator negăsit.' });
      }

      // Attach user info to request
      req.user = {
        id: userProfile.id,
        auth_id: user.id,
        email: userProfile.email,
        name: userProfile.name,
        role: userProfile.role,
        avatar: userProfile.avatar
      };

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Eroare la verificarea token-ului.' });
    }
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

  // Păstrăm pentru compatibilitate (nu mai este necesar cu Supabase Auth)
  generateToken: (user) => {
    return jwt.sign(
      { id: user.id, role: user.role, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  },

  // Funcții pentru hashing parole (păstrate pentru cazuri speciale)
  hashPassword: async (pw) => await bcrypt.hash(pw, 10),
  comparePassword: async (pw, hash) => await bcrypt.compare(pw, hash)
};

module.exports = auth;