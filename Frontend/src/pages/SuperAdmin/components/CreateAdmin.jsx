// src/components/CreateAdmin.jsx

import { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Country, State } from "country-state-city";
import { createAdmin } from "../../../utils/api";
import { X, Building2, UserPlus, MapPin, Phone, Lock, ChevronDown, Rocket } from "lucide-react";

export default function CreateAdmin({ open, onClose, onCreated }) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    organizationName: "",
    organizationEmail: "",
    country: "",
    state: "",
    phone: "",
    address: "",
    adminName: "",
    adminEmail: "",
    adminMobile: "",
    adminPassword: "",
  });

  const countries = Country.getAllCountries();
  const states = form.country ? State.getStatesOfCountry(form.country) : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "country") {
      setForm((prev) => ({ ...prev, country: value, state: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requiredFields = [
        "organizationName",
        "organizationEmail",
        "adminName",
        "adminEmail",
        "adminPassword",
      ];
      for (let field of requiredFields) {
        if (!form[field]) {
          alert("Please fill all required fields");
          setLoading(false);
          return;
        }
      }

      const countryObj = countries.find((c) => c.isoCode === form.country);
      const stateObj = states.find((s) => s.isoCode === form.state);

      const payload = {
        organizationName: form.organizationName,
        organizationEmail: form.organizationEmail,
        country: countryObj?.name || null,
        state: stateObj?.name || null,
        phone: form.phone || null,
        address: form.address || null,
        adminName: form.adminName,
        adminEmail: form.adminEmail,
        mobile: form.adminMobile || null,
        password: form.adminPassword,
      };

      await createAdmin(payload);

      alert("Admin & Organization created successfully");
      onCreated && onCreated();
      onClose();
      setForm({
        organizationName: "",
        organizationEmail: "",
        country: "",
        state: "",
        phone: "",
        address: "",
        adminName: "",
        adminEmail: "",
        adminMobile: "",
        adminPassword: "",
      });
    } catch (err) {
      console.error("Create Admin error:", err);
      alert(err.response?.data?.message || err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition show={open}>
      <Dialog onClose={onClose} className="relative z-50">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild>
              <DialogPanel
                transition
                className="relative transform overflow-hidden rounded-[2.5rem] bg-white text-left shadow-2xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-3xl data-[closed]:sm:scale-95"
              >
                <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        <UserPlus size={24} />
                      </div>
                      <div>
                        <DialogTitle as="h3" className="text-2xl font-black text-slate-800 tracking-tight">
                          Provision New Tenant
                        </DialogTitle>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Register Organization & Primary Admin</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={onClose}
                      className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-8">
                    {/* Organization Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4 border-l-4 border-indigo-600 pl-3">
                        <Building2 size={16} className="text-indigo-600" />
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Organization Profile</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          name="organizationName"
                          placeholder="Legal Entity Name"
                          value={form.organizationName}
                          onChange={handleChange}
                          className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition"
                          required
                        />
                        <input
                          name="organizationEmail"
                          type="email"
                          placeholder="Corporate Email"
                          value={form.organizationEmail}
                          onChange={handleChange}
                          className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition"
                          required
                        />
                        <div className="relative">
                           <select
                              name="country"
                              value={form.country}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition appearance-none pr-10"
                              required
                           >
                              <option value="">Choose Country</option>
                              {countries.map((c) => (
                                 <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                              ))}
                           </select>
                           <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        <div className="relative">
                           <select
                              name="state"
                              value={form.state}
                              onChange={handleChange}
                              disabled={!form.country}
                              className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition appearance-none pr-10 disabled:opacity-50"
                              required={!!form.country}
                           >
                              <option value="">Choose State</option>
                              {states.map((s) => (
                                 <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                              ))}
                           </select>
                           <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                           <input
                              name="phone"
                              placeholder="Business Contact Number"
                              value={form.phone}
                              onChange={handleChange}
                              className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition"
                           />
                           <input
                              name="address"
                              placeholder="Headquarters Address"
                              value={form.address}
                              onChange={handleChange}
                              className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition"
                           />
                        </div>
                      </div>
                    </div>

                    {/* Admin Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4 border-l-4 border-emerald-500 pl-3">
                        <Lock size={16} className="text-emerald-500" />
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Administrative Access</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          name="adminName"
                          placeholder="Full Name"
                          value={form.adminName}
                          onChange={handleChange}
                          className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-100 outline-none transition"
                          required
                        />
                        <input
                          name="adminEmail"
                          type="email"
                          placeholder="Login Email (System ID)"
                          value={form.adminEmail}
                          onChange={handleChange}
                          className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-100 outline-none transition"
                          required
                        />
                        <input
                          name="adminMobile"
                          placeholder="Personal Mobile"
                          value={form.adminMobile}
                          onChange={handleChange}
                          className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-100 outline-none transition"
                        />
                        <input
                          name="adminPassword"
                          type="text"
                          placeholder="Access Password"
                          value={form.adminPassword}
                          onChange={handleChange}
                          className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-100 outline-none transition"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex flex-col sm:flex-row justify-end gap-3">
                    <button
                      type="button"
                      className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition"
                      onClick={onClose}
                    >
                      Cancel Provision
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 sm:flex-none px-12 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-600 disabled:bg-slate-300 transition shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      ) : <Rocket size={16} />}
                      {loading ? "Provisioning..." : "Execute Provision"}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
