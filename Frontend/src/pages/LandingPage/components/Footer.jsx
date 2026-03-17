import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, NavLink } from 'react-router-dom';
const Footer = () => {
  return (
    <footer className="px-10 py-16 text-gray-300 bg-gray-900">
      <div className="grid gap-12 mx-auto max-w-7xl md:grid-cols-4">
        <div className="col-span-1 md:col-span-1">
          <h2 className="mb-4 text-2xl font-bold text-white">2BRAINR</h2>
          <p className="text-sm leading-relaxed">
            Leading the way in digital assessment and exam management software since 2025.
          </p>
        </div>
        
        <div>
          <h3 className="mb-4 font-bold text-white">Contact Us</h3>
          <ul className="space-y-2 text-sm">
            <li>📞 +91 0000000000</li>
            <li>📧 support@2brainr.com</li>
            <li>📍 123 Sambhaji Nagar, Akurdi, Pimpri-Chinchwad, India.</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-bold text-white">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li className="transition cursor-pointer hover:text-white">Privacy Policy</li>
            <li className="transition cursor-pointer hover:text-white">Terms of Service</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-bold text-white">Newsletter</h3>
            <button className="w-full py-2 font-bold text-white bg-indigo-600 rounded-lg">  <NavLink to="/pricing" className={({ isActive }) => `transition ${isActive ? 
                  '' : ''}` }> Subscribe</NavLink></button>
          
        </div>
      </div>
      <div className="pt-8 mt-12 text-xs text-center border-t border-gray-800">
        © 2026 2BRAINR Software Inc. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;