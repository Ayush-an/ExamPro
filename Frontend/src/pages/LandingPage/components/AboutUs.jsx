import React from 'react';

const AboutUs = () => {
    return (
        <section id="about" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-10">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-4xl font-extrabold text-slate-900 mb-6">About <span className="text-indigo-600">2BRAINR</span></h2>
                        <p className="text-lg text-slate-600 mb-6">
                            We are committed to revolutionizing the way education and assessments are handled. Our platform provides a seamless, secure, and intuitive environment for both educators and students.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3">
                                <div className="p-1 bg-indigo-100 rounded-full text-indigo-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="font-medium text-slate-700">Innovative Assessment Tools</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="p-1 bg-indigo-100 rounded-full text-indigo-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="font-medium text-slate-700">Real-time Data Analytics</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="p-1 bg-indigo-100 rounded-full text-indigo-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="font-medium text-slate-700">User-Centric Design</span>
                            </li>
                        </ul>
                    </div>
                    <div className="bg-slate-100 rounded-3xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200 rounded-full -mr-16 -mt-16 opacity-50"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-200 rounded-full -ml-16 -mb-16 opacity-50"></div>
                        <div className="relative z-10 text-center">
                            <p className="text-3xl font-bold text-slate-800 mb-2">Our Mission</p>
                            <p className="text-slate-600 italic">"Empowering institutions with the best-in-class assessment technology."</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
