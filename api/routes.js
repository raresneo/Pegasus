
const express = require('express');
const router = express.Router();
const db = require('./supabase/db'); // Use Supabase database
const supabase = require('./supabaseClient'); // Supabase client for auth
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

// Login unificat pentru toate rolurile folosind Supabase Auth
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Autentificare prin Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password
    });

    if (error) {
      return res.status(401).json({
        message: error.message === 'Invalid login credentials'
          ? 'Email sau parolă incorectă.'
          : 'Eroare la autentificare.'
      });
    }

    // Obține profilul utilizatorului din baza de date
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', data.user.id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'Profil utilizator negăsit.' });
    }

    // Returnează session token de la Supabase și informații user
    res.json({
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Eroare server la autentificare.' });
  }
});

// Înregistrare Client (Membru) - Publică cu Supabase Auth
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Creare cont în Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: password,
      options: {
        data: {
          full_name: name
        }
      }
    });

    if (authError) {
      return res.status(400).json({
        message: authError.message === 'User already registered'
          ? 'Acest email este deja utilizat.'
          : authError.message
      });
    }

    const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    // 2. Creare profil utilizator în baza de date
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([{
        auth_id: authData.user.id,
        name: name,
        email: email.toLowerCase(),
        role: 'member',
        avatar: avatar
      }])
      .select()
      .single();

    if (userError) {
      console.error('Error creating user profile:', userError);
      return res.status(500).json({ message: 'Eroare la crearea profilului.' });
    }

    // 3. Creare profil membru în CRM
    const { error: memberError } = await supabase
      .from('members')
      .insert([{
        user_id: newUser.id,
        first_name: name.split(' ')[0],
        last_name: name.split(' ').slice(1).join(' ') || '',
        email: email.toLowerCase(),
        join_date: new Date().toISOString().split('T')[0],
        avatar: avatar,
        location_id: null, // Will be set when they choose a location
        member_type: 'member'
      }]);

    if (memberError) {
      console.error('Error creating member profile:', memberError);
      // Continue anyway - user account is created
    }

    // 4. Returnează token și informații user
    res.status(201).json({
      token: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      user: {
        id: newUser.id,
        name: newUser.name,
        role: newUser.role,
        avatar: newUser.avatar,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
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
