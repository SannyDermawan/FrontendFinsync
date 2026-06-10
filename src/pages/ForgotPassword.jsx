import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendOtp() {

    if (!email) {
      alert("Masukkan email");
      return;
    }

    setLoading(true);

    try {

      const res = await fetch(
        "http://127.0.0.1:8000/api/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        setLoading(false);
        return;
      }

      localStorage.setItem(
        "resetEmail",
        email
      );

      navigate("/verify-otp");

    } catch (err) {
      alert("Server error");
    }

    setLoading(false);
  }

  return (
    <div className="page auth-page active">
      <div className="auth-card">

        <div className="auth-logo">
          FinSync
        </div>

        <div className="auth-title">
          Forgot Password
        </div>

        <div className="auth-subtitle">
          Masukkan email untuk reset password
        </div>

        <div className="form-group">
          <label className="form-label">
            Email
          </label>

          <input
            className="form-input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={sendOtp}
        >
          {loading ? "Loading..." : "Kirim OTP"}
        </button>

        <div className="auth-link">
          <a onClick={() => navigate("/login")}>
            ← Back to Sign In
          </a>
        </div>

      </div>
    </div>
  );
}