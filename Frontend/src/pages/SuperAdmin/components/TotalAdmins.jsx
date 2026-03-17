// src/components/TotalAdmins.jsx

import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { fetchAdmins } from "../../../utils/api";

export default function TotalAdmins({ open, onClose }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchAdmins();
        setAdmins(data.admins || data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch admins");
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
              <h3 className="mb-4 text-lg font-semibold">All Admins</h3>

              {loading ? (
                <div>Loading...</div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-96">
                  {admins.length ? admins.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{a.name}</div>
                        <div className="text-sm text-gray-500">{a.email}</div>
                      </div>
                      <div className="text-sm text-gray-600">{a.organizationName || a.organization?.name || a.organizationId ? `Org ID: ${a.organizationId}` : ""}</div>
                    </div>
                  )) : <div className="text-gray-500">No admins found</div>}
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