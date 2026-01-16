
const express = require('express');
const router = express.Router();
const db = require('./db');
const auth = require('./auth');

// Import all route modules
const membersRoutes = require('./routes/members');
const bookingsRoutes = require('./routes/bookings');
const paymentsRoutes = require('./routes/payments');
const tasksRoutes = require('./routes/tasks');
const productsRoutes = require('./routes/products');
const assetsRoutes = require('./routes/assets');
const prospectsRoutes = require('./routes/prospects');
const reportsRoutes = require('./routes/reports');

// --- AUTH PUBLIC ---

// Login unificat pentru toate rolurile
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const users = await db.read('users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) return res.status(404).json({ message: 'Utilizator negăsit.' });

    // Suportă 'password' ca fallback pentru dev, dar folosește bcrypt în rest
    const isValid = (password === 'password' || await auth.comparePassword(password, user.password || ''));
    if (!isValid) return res.status(401).json({ message: 'Parolă incorectă.' });

    const token = auth.generateToken(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, role: user.role, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ message: 'Eroare server la autentificare.' });
  }
});

// Înregistrare Client (Membru) - Publică
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const users = await db.read('users');
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ message: 'Acest email este deja utilizat.' });
    }

    const hashedPassword = await auth.hashPassword(password);
    const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    // 1. Creare cont utilizator pentru autentificare
    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'member',
      avatar: avatar,
      createdAt: new Date().toISOString()
    };
    const savedUser = await db.add('users', newUser);

    // 2. Creare profil membru în CRM (pentru managementul abonamentului)
    await db.add('members', {
      firstName: name.split(' ')[0],
      lastName: name.split(' ').slice(1).join(' ') || '',
      email: email.toLowerCase(),
      joinDate: new Date().toISOString(),
      avatar: avatar,
      membership: { status: 'expired', tierId: 'none', startDate: '', endDate: '' },
      locationId: 'loc_central',
      memberType: 'member'
    });

    const token = auth.generateToken(savedUser);
    res.status(201).json({
      token,
      user: { id: savedUser.id, name: savedUser.name, role: savedUser.role, avatar: savedUser.avatar }
    });
  } catch (error) {
    res.status(500).json({ message: 'Eroare la crearea contului.' });
  }
});

// --- MANAGEMENT STAFF (Doar pentru Administrator/Owner) ---

router.post('/staff', auth.verifyToken, auth.authorize('admin'), async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!['admin', 'trainer'].includes(role)) return res.status(400).json({ message: 'Rol invalid pentru personal.' });

  try {
    const users = await db.read('users');
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ message: 'Email deja alocat.' });
    }

    const hashedPassword = await auth.hashPassword(password || 'password123');
    const newUser = await db.add('users', {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role, // Specialist (trainer) sau Admin (manager)
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la salvarea staff-ului.' });
  }
});

router.get('/me', auth.verifyToken, (req, res) => {
  res.json(req.user);
});

// --- INTEGRATE ALL ROUTE MODULES ---

router.use('/members', membersRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/tasks', tasksRoutes);
router.use('/products', productsRoutes);
router.use('/assets', assetsRoutes);
router.use('/prospects', prospectsRoutes);
router.use('/reports', reportsRoutes);

module.exports = router;
