// src/components/Groups.jsx
export default function Groups() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

      <div className="card bg-blue-50">
        <h3 className="card-title">Group A</h3>
        <p className="mt-2 text-gray-700">Java Exam Group</p>
      </div>

      <div className="card bg-green-50">
        <h3 className="card-title">Group B</h3>
        <p className="mt-2 text-gray-700">DSA Mock Test Group</p>
      </div>

    </div>
  );
}
