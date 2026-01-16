
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as Icons from '../components/icons';
import { useLanguage } from '../context/LanguageContext';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { login, register, loading } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      const success = await login(email, password);
      if (!success) setError('Eroare autentificare. Verificați datele de staff sau membru.');
    } else {
      if (!name) return setError('Numele este necesar pentru profilul de membru.');
      const result = await register(name, email, password);
      if (!result.success) setError(result.message || 'Eroare la înregistrare.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-dark px-4 relative overflow-hidden font-sans">
      {/* Background FX */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-600 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md p-10 space-y-8 bg-card-dark rounded-[3rem] border border-white/10 shadow-2xl animate-scaleIn relative z-10">
        <div className="text-center">
            <div className="p-4 bg-black rounded-2xl border-2 border-primary-500/20 inline-block mb-6 shadow-xl">
              <Icons.LogoIcon className="w-10 h-10 text-primary-500" />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Pegasus</h1>
            <p className="text-[9px] font-black text-primary-500 uppercase tracking-[0.4em] mt-3">Elite Hub Ecosystem</p>
        </div>

        {/* Switcher */}
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
          <button 
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-primary-500 text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
          >
            Autentificare Hub
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-primary-500 text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
          >
            Creează Cont Membru
          </button>
        </div>
        
        <form className="space-y-5" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="space-y-1 animate-fadeIn">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Nume Complet</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-6 py-4 text-white bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
                placeholder="ex: Andrei Ionescu"
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Email Identitate</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 text-white bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
              placeholder="nume@exemplu.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Parolă Securizată</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 text-white bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-xs font-bold text-red-500 text-center animate-shake">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 rounded-2xl shadow-xl text-xs font-black uppercase tracking-[0.2em] text-white bg-accent-600 hover:bg-accent-700 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Se validează nodul...' : isLogin ? 'Intră în Sistem' : 'Creează Identitate'}
          </button>
        </form>
        
        <div className="text-center opacity-30 pt-4">
            <p className="text-[8px] font-bold uppercase tracking-widest text-white">Protected by Pegasus Core Security v4.2</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
