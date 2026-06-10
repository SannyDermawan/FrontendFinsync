import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VerifyOTP() {

  const navigate = useNavigate();

  const [otp, setOtp] = useState("");

  async function verifyOtp() {

    const email =
      localStorage.getItem(
        "resetEmail"
      );

    const res = await fetch(
      "http://127.0.0.1:8000/api/verify-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          otp
        })
      }
    );

    const data =
      await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    navigate("/reset-password");
  }

  return (
    <div className="page auth-page active">
      <div className="auth-card">

        <div className="auth-logo">
          FinSync
        </div>

        <div className="auth-title">
          Verify OTP
        </div>

        <div className="auth-subtitle">
          Masukkan kode OTP
        </div>

        <div className="form-group">

          <label className="form-label">
            OTP
          </label>

          <input
            className="form-input"
            type="text"
            placeholder="123456"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value)
            }
          />

        </div>

        <button
          className="btn btn-primary"
          onClick={verifyOtp}
        >
          Verify OTP
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