// src/components/TotalOrganizations.jsx
import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { fetchOrganizations } from "../../../utils/api";

export default function TotalOrganizations({ open, onClose }) {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchOrganizations();
        setOrgs(data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch organizations");
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

          <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <h3 className="mb-4 text-lg font-semibold">Organizations</h3>

              {loading ? (
                <div>Loading...</div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-96">
                  {orgs.length ? orgs.map((o) => (
                    <div key={o.id} className="p-3 border rounded">
                      <div className="font-medium">{o.name}</div>
                      <div className="text-sm text-gray-500">{o.email}</div>
                      <div className="text-sm text-gray-600">{o.country} • {o.state}</div>
                    </div>
                  )) : <div className="text-gray-500">No organizations found</div>}
                </div>
              )}

              <div className="flex justify-end mt-4">
                <button className="px-4 py-2 bg-gray-100 rounded" onClick={onClose}>Close</button>
              </div>
            </div>
          </Transition.Child>

        </div>
      </Dialog>
    </Transition>
  );
}