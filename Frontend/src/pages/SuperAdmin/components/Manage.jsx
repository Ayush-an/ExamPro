// src/components/Manage.jsx
import { useEffect, useState, useMemo, useCallback } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Manage() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [organizations, setOrganizations] = useState([]);
  const [editOrg, setEditOrg] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

  // ---------------- SAFE FETCH ----------------
  const safeFetch = useCallback(
    async (url, options = {}) => {
      try {
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          ...options,
        });

        if (!res.ok) {
          console.warn(`❌ Fetch failed (${res.status})`);
          return null;
        }

        return res.json();
      } catch (err) {
        console.error("❌ Fetch error:", err);
        return null;
      }
    },
    [token]
  );

  // ---------------- FETCH ORGANIZATIONS ----------------
  const fetchOrganizations = useCallback(async () => {
    const data = await safeFetch(`${API}/api/organization/stats`);
    if (data) setOrganizations(data.organizations || []);
  }, [API, safeFetch]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // ---------------- UPDATE ORGANIZATION ----------------
  const updateOrganization = async () => {
    if (!editOrg) return;

    const res = await safeFetch(`${API}/api/organization/${editOrg.id}`, {
      method: "PUT",
      body: JSON.stringify(editOrg),
    });

    if (res) {
      alert("Organization updated successfully");
      fetchOrganizations();
      setEditOrg(null);
    } else {
      alert("Update failed");
    }
  };

  // ---------------- DELETE ORGANIZATION ----------------
  const deleteOrganization = async (orgId) => {
    if (!confirm("Are you sure you want to delete this organization?")) return;

    const res = await safeFetch(`${API}/api/organization/${orgId}`, {
      method: "DELETE",
    });

    if (res) {
      alert("Organization deleted successfully");
      fetchOrganizations();
    } else {
      alert("Failed to delete organization");
    }
  };

  // ---------------- SORT HANDLER ----------------
  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // ---------------- FILTER + SORT (memoized) ----------------
  const filteredOrgs = useMemo(() => {
    let result = [...organizations];

    if (searchTerm.trim() !== "") {
      result = result.filter((org) =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    result.sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [organizations, searchTerm, sortConfig]);

  // ---------------- EXPORT TO EXCEL ----------------
  const exportToExcel = () => {
    const isPrivileged = user.role === "SuperUser" || user.role === "SuperAdmin";

    const data = filteredOrgs.map((org) => ({
      Name: org.name,
      Status: org.status,
      Admins: org.adminCount,
      "Super Users": org.superUserCount,
      Participants: isPrivileged ? org.participantCount : "Restricted",
      Users: org.totalUsers,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Organizations");

    saveAs(
      new Blob([XLSX.write(workbook, { bookType: "xlsx", type: "array" })], {
        type: "application/octet-stream",
      }),
      "organizations.xlsx"
    );
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-700">Manage Organizations</h1>

        <input type="text" placeholder="Search organizations..." className="w-full p-2 border rounded sm:w-auto"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

        <button className="px-4 py-2 text-white bg-green-600 rounded-lg shadow hover:bg-green-700" onClick={exportToExcel}>
          Export to Excel
        </button>
      </div>

      {/* TABLE */}
      <div className="p-6 overflow-x-auto bg-white shadow rounded-xl">
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="text-gray-500 border-b">
              {["name", "status"].map((key) => (
                <th key={key} className="px-2 py-3 cursor-pointer" onClick={() => requestSort(key)}  >
                  {key.charAt(0).toUpperCase() + key.slice(1)}{" "}
                  {sortConfig.key === key
                    ? sortConfig.direction === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
              ))}

              <th className="px-2 py-3">Admins</th>
              <th className="px-2 py-3">Super Users</th>
              <th className="px-2 py-3"> Participants</th>
              <th className="px-2 py-3">Total Users</th>
              <th className="px-2 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrgs.map((org) => (
              <tr key={org.id} className="border-b">
                <td className="px-2 py-4 font-medium">{org.name}</td>
                <td className="px-2 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                      org.status === "Active"
                        ? "bg-green-100 text-green-600"
                        : org.status === "Inactive"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {org.status}
                  </span>
                </td>

                <td className="px-2 py-4">{org.adminCount}</td>
                <td className="px-2 py-4">{org.superUserCount}</td>
                <td className="px-2 py-4">{org.participantCount}</td>
                <td className="px-2 py-4">{org.totalUsers}</td>

                <td className="px-2 py-4 text-right">
                  <button className="mr-4 text-purple-600 hover:underline" onClick={() => setEditOrg(org)}> Edit </button>
                  <button className="text-red-500 hover:underline" onClick={() => deleteOrganization(org.id)}> Delete </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {editOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="p-6 bg-white shadow-lg rounded-xl w-96">
            <h2 className="mb-4 text-lg font-semibold">Edit Organization — {editOrg.name}</h2>

            <input type="text" className="w-full p-2 mb-2 border rounded" value={editOrg.name} onChange={(e) => setEditOrg({ ...editOrg, name: e.target.value })} placeholder="Name" />
            <input type="email" className="w-full p-2 mb-2 border rounded" value={editOrg.email} onChange={(e) => setEditOrg({ ...editOrg, email: e.target.value })}placeholder="Email" />
            <input type="text" className="w-full p-2 mb-2 border rounded" value={editOrg.country || ""} onChange={(e) => setEditOrg({ ...editOrg, country: e.target.value })} placeholder="Country" />
            <input type="text" className="w-full p-2 mb-2 border rounded" value={editOrg.state || ""} onChange={(e) => setEditOrg({ ...editOrg, state: e.target.value })}  placeholder="State" />

            <select className="w-full p-3 mb-4 border rounded" value={editOrg.status} onChange={(e) => setEditOrg({ ...editOrg, status: e.target.value })}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>

            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setEditOrg(null)}  >
                Cancel
              </button>
              <button className="px-4 py-2 text-white bg-blue-600 rounded" onClick={updateOrganization}  >  Update </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}