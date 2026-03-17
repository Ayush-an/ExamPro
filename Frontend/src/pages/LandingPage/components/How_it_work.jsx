import React from 'react';

const HowItWorks = () => {
    const steps = [
        {
            number: "01",
            title: "Register & Setup",
            description: "Sign up your organization and configure your branding and user roles."
        },
        {
            number: "02",
            title: "Create Content",
            description: "Easily build exams, question banks, and assignments with our intuitive tools."
        },
        {
            number: "03",
            title: "Deliver & Monitor",
            description: "Launch assessments securely and monitor student progress in real-time."
        },
        {
            number: "04",
            title: "Analyze Results",
            description: "Get detailed reports and insights to help you make informed educational decisions."
        }
    ];

    return (
        <section id="how-it-works" className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-4">How It <span className="text-indigo-600">Works</span></h2>
                    <p className="text-lg text-slate-600">Simpler than you think, more powerful than you expect.</p>
                </div>
                <div className="grid md:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative group hover:shadow-md transition">
                            <span className="text-5xl font-black text-slate-100 absolute top-4 right-4 group-hover:text-indigo-50 transition">{step.number}</span>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-slate-800 mb-3">{step.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
