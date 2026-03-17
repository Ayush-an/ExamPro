import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './Home';

const Landing = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <div className="flex-grow">
                <Home />
            </div>
            <Footer />
        </div>
    );
};

export default Landing;
