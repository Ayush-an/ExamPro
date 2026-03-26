// src/components/participant/RemoveParticipant.jsx
import React, { useEffect, useState } from "react";
import { fetchRemovedParticipants } from "../../../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

const RemoveParticipant = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load removed participants
  const loadRemovedParticipants = async () => {
    try {
      setLoading(true);
      const res = await fetchRemovedParticipants();

      console.log("Backend response:", res);

      if (!res.success) {
        toast.error("Failed to fetch removed participants");
        return;
      }

      // Map backend data (already includes removedByName)
      const mapped = res.data.map((p) => {
        console.log("Participant from backend:", p);
        return {
          ...p,
          removedByName: p.removedByName || "-",
          groupName: p.groupName || "-",
          removedAt: p.removedAt || null,
        };
      });

      setParticipants(mapped);
      toast.success("Removed participants loaded");
    } catch (err) {
      toast.error("Failed to load removed participants");
      console.error("Error loading removed participants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRemovedParticipants();
  }, []);

  // Filter participants
  const filtered = participants.filter((p) =>
    [p.name, p.email, p.mobile, p.groupName, p.removedByName]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const currentParticipants = filtered.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  const handleClearFilter = () => {
    setSearchQuery("");
    setCurrentPage(0);
    toast.info("Filters cleared");
  };

  const handleExportToExcel = () => {
    if (!participants.length) {
      toast.info("No data to export");
      return;
    }

    const wsData = filtered.map((p, index) => ({
      Sr: index + 1,
      "Group Name": p.groupName,
      Name: p.name,
      Email: p.email,
      Mobile: p.mobile,
      Status: p.status,
      "Date of Join": new Date(p.dateOfJoin).toLocaleString(),
      "Created At": new Date(p.createdAt).toLocaleString(),
      "Removed At": p.removedAt ? new Date(p.removedAt).toLocaleString() : "-",
      "Removed By": p.removedByName,
    }));

    const worksheet = XLSX.utils.json_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Removed Participants");
    XLSX.writeFile(workbook, "RemovedParticipants.xlsx");
    toast.success("Excel file generated");
  };

  return (
    <div className="relative p-6 bg-gray-100 rounded-lg shadow-md">
      <ToastContainer position="top-right pt-8" autoClose={2000} />

      <h2 className="mb-6 text-2xl font-semibold text-center text-gray-800">Removed Participants</h2>

      {/* Search Bar */}
      <div className="flex flex-wrap items-center gap-4 p-4 mb-6 bg-white rounded-lg shadow-md">
        <input type="text" placeholder="Search by name, email, mobile, group, removed by"
          className="flex-1 min-w-[200px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <button onClick={handleClearFilter} className="px-4 py-2 font-bold text-gray-800 bg-gray-200 rounded hover:bg-gray-300">
          Clear
        </button>

        <button onClick={handleExportToExcel} className="px-4 py-2 ml-auto font-bold text-white bg-green-500 rounded hover:bg-green-600" >
          Export to Excel
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-slate-200">
            <tr>
              {[
                "Sr.", "Group Name", "Name", "Email", "Mobile", "Status", "Date of Join", "Created On", "Removed On", "Removed By",
              ].map((h) => (
                <th key={h} className="px-4 py-2 text-sm font-medium text-left text-gray-700"  > {h}  </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="10" className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : currentParticipants.length > 0 ? (
              currentParticipants.map((p, index) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {currentPage * rowsPerPage + index + 1}
                  </td>
                  <td className="px-6 py-4">{p.groupName}</td>
                  <td className="px-6 py-4">{p.name}</td>
                  <td className="px-6 py-4">{p.email}</td>
                  <td className="px-6 py-4">{p.mobile}</td>
                  <td className="px-6 py-4">{p.status}</td>
                  <td className="px-6 py-4">
                    {new Date(p.dateOfJoin).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(p.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {p.removedAt ? new Date(p.removedAt).toLocaleString() : "-"}
                  </td>
                  <td className="px-6 py-4">{p.removedByName}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="px-6 py-4 text-center text-gray-500">
                  No removed participants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <select
          className="px-3 py-2 border border-gray-300 rounded"
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setCurrentPage(0);
          }}
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>

        <div className="flex items-center space-x-2">
          <span>
            {currentPage + 1} / {totalPages || 1}
          </span>

          <button
            className="p-2 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            ◀
          </button>

          <button
            className="p-2 border rounded disabled:opacity-50"
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
            }
            disabled={currentPage === totalPages - 1 || totalPages === 0}
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};
export default RemoveParticipant;