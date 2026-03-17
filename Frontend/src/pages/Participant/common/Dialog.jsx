export default function Dialog({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg p-6 bg-white shadow-xl rounded-xl animate-scaleIn">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-blue-600">{title}</h2>
          <button
            onClick={onClose}
            className="text-xl font-bold text-gray-500 hover:text-red-500"
          >
            ×
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
