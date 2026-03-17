const ErrorPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-red-50">
    <h1 className="mb-4 text-6xl">❌</h1>
    <h1 className="text-3xl font-bold text-gray-900">Payment Failed</h1>
    <p className="mt-2 text-gray-600">Something went wrong with your transaction. No money was charged.</p>
    <button onClick={() => window.history.back()} className="mt-8 font-bold text-indigo-600 underline">Try Again</button>
  </div>
);
export default ErrorPage;