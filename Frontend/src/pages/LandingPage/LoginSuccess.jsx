import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function LoginSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");

    if (token && userStr) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", decodeURIComponent(userStr));
      // Go to this specific app's dashboard
      navigate("/dashboard");
    }
  }, [searchParams, navigate]);

  return <div>Syncing session...</div>;
}