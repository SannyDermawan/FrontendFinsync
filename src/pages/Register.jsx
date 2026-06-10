import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Register({ onNavigate }) {
    
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const passwordChecks = {
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  symbol: /[@$!%*#?&]/.test(password),
};
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid =
  passwordChecks.length &&
  passwordChecks.uppercase &&
  passwordChecks.lowercase &&
  passwordChecks.number &&
  passwordChecks.symbol;
  const isConfirmValid = password === confirmPassword;
const isFormValid =
  username.trim() !== "" &&
  isEmailValid &&
  isPasswordValid &&
  isConfirmValid;
  const [notif, setNotif] = useState("");
  const [notifType, setNotifType] = useState("error");

  useEffect(() => {
  if (notif) {
    const timer = setTimeout(() => {
      setNotif("");
    }, 1500);

    return () => clearTimeout(timer);
  }
}, [notif]);

async function register() {

  if (loading) return;
  setLoading(true);

  setErrors({});

  if (!username || !email || !password) {
    setLoading(false);
    return alert("Isi semua field!");
  }

  if (password !== confirmPassword) {
    setLoading(false);
    return setErrors({
      confirmPassword: "Password tidak sama",
    });
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

  if (!passwordRegex.test(password)) {
    setLoading(false);
    return setErrors({
      password:
        "Password must be at least 8 characters and include uppercase letters, lowercase letters, numbers, and symbols.",
    });
  }

  const res = await fetch("http://127.0.0.1:8000/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    setNotif("Terjadi error dari server");
    setLoading(false);
    return;
  }

  if (!res.ok) {

    if (data.errors?.email) {
      setNotif("Email sudah digunakan");
      setNotifType("error");
      setLoading(false);
      return;
    }

    if (data.errors) {
      const firstError = Object.values(data.errors)[0][0];
      setNotif(firstError);
      setLoading(false);
      return;
    }

    setNotif(data.message || "Register gagal");
    setLoading(false);
    return;
  }

  
  setNotif("Register berhasil!");
  setNotifType("success");

  setTimeout(() => {
    setLoading(false);
    navigate("/login");
  }, 1500);
}
  

  return (
    <div className="page auth-page active">
      {/* <Toast message={notif} show={!!notif} type={notifType} /> */}
      <div className="auth-card">
        <div className="auth-logo">FinSync</div>
        <div className="auth-title">Sign Up</div>
        <div className="auth-subtitle">Buat akun baru Anda</div>

        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            className="form-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="password-checklist">
            <div className={passwordChecks.length ? "valid" : "invalid"}>
              {passwordChecks.length ? "✔" : "✖"} Minimal 8 karakter
            </div>

            <div className={passwordChecks.uppercase ? "valid" : "invalid"}>
              {passwordChecks.uppercase ? "✔" : "✖"} Huruf besar
            </div>

            <div className={passwordChecks.lowercase ? "valid" : "invalid"}>
              {passwordChecks.lowercase ? "✔" : "✖"} Huruf kecil
            </div>

            <div className={passwordChecks.number ? "valid" : "invalid"}>
              {passwordChecks.number ? "✔" : "✖"} Angka
            </div>

            <div className={passwordChecks.symbol ? "valid" : "invalid"}>
              {passwordChecks.symbol ? "✔" : "✖"} Simbol
            </div>
          </div>

          {errors.password && (
            <div className="error-text">{errors.password}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input
            className="form-input"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
            setConfirmPassword(e.target.value);
            setErrors({ ...errors, confirmPassword: "" });
            }}
          />
          {errors.confirmPassword && (
          <div className="error-text">{errors.confirmPassword}</div>
          )}
        </div>

        <button
        className="btn btn-primary"
        onClick={register}
        disabled={!isFormValid || loading}
        >
        {loading ? "Loading..." : "Sign Up"}
        </button>

        <div className="auth-link">
          <a onClick={() => navigate("/login")}>← Back to Sign In</a>
        </div>
      </div>
    </div>
  );
}