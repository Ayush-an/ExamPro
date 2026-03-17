import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function UnifiedLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState("staff"); // 'staff' or 'participant'

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let resData;
      if (loginType === "participant") {
        // Participant login via a separate endpoint
        const res = await api.post("/participant/login", { email, password });
        resData = res.data;
        if (resData.token) {
          localStorage.setItem("token", resData.token);
          localStorage.setItem("user", JSON.stringify(resData.user));
          // Force page reload to pick up auth context
          window.location.href = "/participant";
          return;
        }
      } else {
        // Staff login via AuthContext (sets state properly)
        resData = await login(email, password);
      }

      if (resData?.token || resData?.user) {
        const user = resData.user;
        const role = user?.role;

        toast.success(`Welcome, ${user?.name || user?.full_name || "User"}!`);

        // Role-based navigation
        if (role === "SUPERADMIN") {
          navigate("/superadmin");
        } else if (role === "ADMIN") {
          navigate("/admin");
        } else if (role === "SUPERUSER") {
          navigate("/superuser");
        } else if (role === "PARTICIPANT") {
          navigate("/participant");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-100">
      <div className="flex w-full max-w-4xl overflow-hidden bg-white shadow-2xl rounded-3xl">
        {/* Visual Side */}
        <div className="items-center justify-center hidden w-1/2 p-12 text-white bg-blue-600 lg:flex">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full bg-white/20">
              <span className="text-5xl font-extrabold">2B</span>
            </div>
            <h2 className="text-2xl font-bold">Unified Assessment Portal</h2>
            <p className="mt-2 opacity-80">Access your dashboard from one single place.</p>
          </div>
        </div>

        {/* Form Side */}
        <div className="w-full p-12 lg:w-1/2">
          <Link to="/" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="mb-8 text-3xl font-bold text-gray-800">Login</h1>

          {/* Toggle Tab */}
          <div className="flex p-1 mb-6 bg-gray-100 rounded-xl">
            <button
              onClick={() => setLoginType("staff")}
              className={`flex-1 py-2 rounded-lg font-bold transition ${loginType === "staff" ? "bg-white text-blue-600 shadow" : "text-gray-500"
                }`}
            >
              Staff
            </button>
            <button
              onClick={() => setLoginType("participant")}
              className={`flex-1 py-2 rounded-lg font-bold transition ${loginType === "participant" ? "bg-white text-blue-600 shadow" : "text-gray-500"
                }`}
            >
              Participant
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              required
              className="w-full px-4 py-3 border outline-none rounded-xl focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full px-4 py-3 border outline-none rounded-xl focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              disabled={loading}
              className="w-full py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "SIGN IN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}