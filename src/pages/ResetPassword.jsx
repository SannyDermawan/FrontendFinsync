import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {

  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function resetPassword() {

    if (!password || !confirmPassword) {
      alert("Lengkapi semua field");
      return;
    }

    if (password !== confirmPassword) {
      alert("Password tidak sama");
      return;
    }

    const email =
      localStorage.getItem(
        "resetEmail"
      );

    if (!email) {
      alert("Email tidak ditemukan");
      navigate("/forgot-password");
      return;
    }

    setLoading(true);

    try {

      const res = await fetch(
        "http://127.0.0.1:8000/api/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        alert(data.message);
        setLoading(false);
        return;
      }

      localStorage.removeItem(
        "resetEmail"
      );

      alert(
        "Password berhasil diubah"
      );

      navigate("/login");

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
          Reset Password
        </div>

        <div className="auth-subtitle">
          Masukkan password baru
        </div>

        <div className="form-group">

          <label className="form-label">
            Password Baru
          </label>

          <input
            className="form-input"
            type="password"
            placeholder="Password baru"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
          />

        </div>

        <div className="form-group">

          <label className="form-label">
            Konfirmasi Password
          </label>

          <input
            className="form-input"
            type="password"
            placeholder="Konfirmasi password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
          />

        </div>

        <button
          className="btn btn-primary"
          onClick={resetPassword}
        >
          {
            loading
              ? "Loading..."
              : "Reset Password"
          }
        </button>

        <div className="auth-link">

          <a
            onClick={() =>
              navigate("/login")
            }
          >
            ← Back to Sign In
          </a>

        </div>

      </div>

    </div>
  );
}