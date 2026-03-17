import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Country, State } from "country-state-city";
import { createAdmin } from "../../../utils/api";

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
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-3xl p-6 bg-white shadow-xl rounded-2xl">
              <Dialog.Title className="mb-4 text-xl font-semibold">
                Create Admin & Organization
              </Dialog.Title>

              <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
                {/* Organization Fields */}
                <input
                  name="organizationName"
                  placeholder="Organization Name"
                  value={form.organizationName}
                  onChange={handleChange}
                  className="p-3 border rounded"
                  required
                />
                <input
                  name="organizationEmail"
                  type="email"
                  placeholder="Organization Email"
                  value={form.organizationEmail}
                  onChange={handleChange}
                  className="p-3 border rounded"
                  required
                />
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="p-3 border rounded"
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map((c) => (
                    <option key={c.isoCode} value={c.isoCode}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  disabled={!form.country}
                  className="p-3 border rounded"
                  required={!!form.country}
                >
                  <option value="">Select State</option>
                  {states.map((s) => (
                    <option key={s.isoCode} value={s.isoCode}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <input
                  name="phone"
                  placeholder="Organization Phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="p-3 border rounded"
                />
                <input
                  name="address"
                  placeholder="Organization Address"
                  value={form.address}
                  onChange={handleChange}
                  className="p-3 border rounded"
                />

                {/* Admin Fields */}
                <input
                  name="adminName"
                  placeholder="Admin Name"
                  value={form.adminName}
                  onChange={handleChange}
                  className="p-3 border rounded"
                  required
                />
                <input
                  name="adminEmail"
                  type="email"
                  placeholder="Admin Email"
                  value={form.adminEmail}
                  onChange={handleChange}
                  className="p-3 border rounded"
                  required
                />
                <input
                  name="adminMobile"
                  placeholder="Admin Mobile"
                  value={form.adminMobile}
                  onChange={handleChange}
                  className="p-3 border rounded"
                />
                <input
                  name="adminPassword"
                  type="text"
                  placeholder="Admin Password"
                  value={form.adminPassword}
                  onChange={handleChange}
                  className="p-3 border rounded"
                  required
                />

                <div className="flex justify-end col-span-2 gap-2 mt-3">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 rounded"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 text-white bg-blue-600 rounded"
                  >
                    {loading ? "Creating..." : "Create Admin"}
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
