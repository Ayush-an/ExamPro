import React from 'react';
import AboutUs from './components/AboutUs';
import HowItWorks from './components/How_it_work';
import Pricing from './components/Pricing';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="grid items-center gap-12 px-10 py-20 mx-auto max-w-7xl md:grid-cols-2">
        <div>
          <span className="px-4 py-1 text-sm font-bold tracking-wider text-indigo-700 uppercase bg-indigo-100 rounded-full">
            Start Now
          </span>
          <h1 className="mt-6 text-6xl font-extrabold leading-tight text-slate-900">
            Master Your Exams with <span className="text-indigo-600">2BRAINR</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            The ultimate software for educators and students to manage and track their progress through digital assessment.
          </p>
          <div className="flex gap-4 mt-10">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 font-bold text-white transition bg-slate-900 rounded-xl hover:scale-105 active:scale-95 shadow-lg"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Image & Stickers Container */}
        <div className="relative">
          <div className="bg-indigo-200 rounded-3xl w-full h-[400px] overflow-hidden shadow-2xl relative">
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
              alt="Software Dashboard"
              className="object-cover w-full h-full opacity-90"
            />
          </div>

          {/* Stickers/Badges */}
          <div className="absolute flex items-center gap-3 p-4 bg-white shadow-xl -top-5 -right-5 rounded-2xl animate-bounce">
            <div className="p-2 bg-green-100 rounded-full">✅</div>
            <span className="font-bold text-slate-800">99% Success Rate</span>
          </div>

          <div className="absolute flex items-center gap-3 p-4 bg-white shadow-xl -bottom-10 -left-10 rounded-2xl">
            <div className="p-2 bg-yellow-100 rounded-full">⭐</div>
            <div>
              <p className="text-xs text-slate-400">Trusted by</p>
              <p className="font-bold text-slate-800">500+ Institutions</p>
            </div>
          </div>
        </div>
      </section>

      <AboutUs />
      <HowItWorks />
      <section id="pricing">
        <Pricing />
      </section>
    </main>
  );
};

export default Home;
