// src/components/participant/ActiveParticipant.jsx
import React, { useState } from 'react';
const ActiveParticipant = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [adminFilter, setAdminFilter] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const activityData = [
    {
      sr: 1,
      name: '',
      email: '',
      mobile: '',
      loginTime: '',
      logoutTime: '',
      spentTime: '',
      Group: '',
    },
  ];

  const handleApplyFilter = () => {
    console.log("Applying filters:", { searchQuery, adminFilter, dateRange });
    };

  const handleExportToExcel = () => {
    console.log("Exporting participant activity to Excel...");
  };
  const totalPages = Math.ceil(activityData.length / rowsPerPage);
  const currentActivity = activityData.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);
  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h2 className="mb-6 text-2xl font-semibold text-center text-gray-800">Participant Activity</h2>
      <div className="flex flex-wrap items-center gap-4 p-6 mb-6 bg-white rounded-lg shadow-md">
        <input type="text" placeholder="Search name, email, or mobile"
          className="flex-1 min-w-[200px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

        {/* Admin Filter Dropdown */}
        <div className="relative flex-1 min-w-[150px]">
          <select className="block w-full px-3 py-2 pr-8 leading-tight text-gray-700 bg-white border border-gray-300 rounded appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={adminFilter} onChange={(e) => setAdminFilter(e.target.value)} >
            <option value="">Select Admin</option> <option value="Mohd Sameer">Admin 1</option> <option value="Admin2">Admin 2</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none">
            <svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        {/* Date Range Picker (The missing part from the previous response) */}
        <div className="relative flex items-center flex-1 min-w-[180px] border border-gray-300 rounded-md">
          <span className="absolute text-gray-500 left-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </span>
          <input type="text" placeholder="Select date range" className="w-full py-2 pr-2 bg-transparent pl-9 focus:outline-none" value={dateRange} onChange={(e) => setDateRange(e.target.value)}/>
        </div>
        <button onClick={handleApplyFilter} className="w-auto px-4 py-2 font-bold text-white transition duration-150 ease-in-out bg-blue-600 rounded hover:bg-blue-700">
          Apply
        </button>
        <button onClick={handleExportToExcel} className="w-auto px-4 py-2 font-bold text-white transition duration-150 ease-in-out bg-green-500 rounded hover:bg-green-600">
          Export to Excel
        </button>
      </div>

      {/* Activity Table */}
        <div className="overflow-x-auto bg-white">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-orange-200">
              <tr>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500">Sr.</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500">Name</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 ">Email</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 ">Mobile</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 ">Login Time</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 ">Logout Time</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 ">Spent Time</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 ">Group</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentActivity.length > 0 ? (
                currentActivity.map((activity, index) => (
                  <tr key={activity.id}>
                    <td className="px-6 py-4 text-sm text-gray-700">{currentPage * rowsPerPage + index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{activity.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{activity.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{activity.mobile}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{activity.loginTime}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{activity.logoutTime}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{activity.spentTime}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{activity.admin}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500 whitespace-nowrap">
                    No data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <select
              className="block px-3 py-2 pr-8 leading-tight text-gray-700 bg-white border border-gray-300 rounded appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={rowsPerPage}
              onChange={(e) => {  setRowsPerPage(Number(e.target.value)); setCurrentPage(0);  }} >
              <option value="10">10</option> <option value="20">20</option> <option value="50">50</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-700">
              {currentPage + 1} / {totalPages === 0 ? 1 : totalPages}
            </span>
            <button className="p-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} disabled={currentPage === 0} >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button className="p-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))} disabled={currentPage === totalPages - 1 || totalPages === 0} >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
  );
};
export default ActiveParticipant;