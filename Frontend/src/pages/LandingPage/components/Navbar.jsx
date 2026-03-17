import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, NavLink } from 'react-router-dom';
const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-10 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        <div className="flex items-center justify-center w-10 h-10 font-bold text-white bg-indigo-600 rounded-lg">2B</div>
        <span className="text-xl font-bold tracking-tight text-slate-800">2BRAINR</span>
      </div>

      <div className="hidden gap-8 font-medium text-slate-600 md:flex">
        <NavLink to="/" className={({ isActive }) => `transition ${isActive ?
          'text-indigo-600 font-bold' : 'text-slate-600 hover:text-indigo-600'}`}> Home</NavLink>

        <a href="#pricing" className="transition hover:text-indigo-600">Pricing</a>
        <a href="#about" className="transition hover:text-indigo-600">About Us</a>
        <a href="#how-it-works" className="transition hover:text-indigo-600">How it works</a>
      </div>

      <button
        onClick={() => navigate('/login')}
        className="px-6 py-2 font-semibold text-white transition bg-indigo-600 rounded-full shadow-md hover:bg-indigo-700 hover:shadow-lg active:scale-95"
      >
        Login
      </button>
    </nav>
  );
};

export default Navbar;