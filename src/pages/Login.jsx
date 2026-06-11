import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin, onNavigate }) {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [notif, setNotif] = useState("");
    const [loading, setLoading] = useState(false);
    const [notifType, setNotifType] = useState("error");
    useEffect(() => {
    if (notif) {
        const timer = setTimeout(() => setNotif(""), 3000);
        return () => clearTimeout(timer);
    }
    }, [notif]);

    async function login() {

    if (loading) return; 
    setLoading(true);

    if (!email || !password) {
        setLoading(false);
        return setNotif("Isi email dan password");
    }

    const res = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        "Accept": "application/json", 
        },
        body: JSON.stringify({ email, password }),
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
        setNotif(data.message || "Login gagal");
        setNotifType("error");
        setLoading(false);
        return;
    }


    localStorage.setItem("user", JSON.stringify(data));

    setNotif("Login berhasil!");
    setNotifType("success");

    setTimeout(async () => {

    localStorage.setItem(
        "user",
        JSON.stringify(data)
    );

    onLogin(data);

const pendingWallet = JSON.parse(
  localStorage.getItem("pending_wallet")
);

if (pendingWallet) {

  await fetch(
    "http://127.0.0.1:8000/api/connect-wallet",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: data.id,
        wallet_id: pendingWallet.wallet_id
      })
    }
  );

  localStorage.removeItem(
    "pending_wallet"
  );

  alert(
    pendingWallet.connected.toUpperCase() +
    " berhasil terhubung ✅"
  );
}

navigate("/dashboard");

    }, 1000);
    }

    return (
        <div className="page auth-page active">
        {/* <Toast message={notif} show={!!notif} type={notifType} /> */}
        <div className="auth-card">
            <div className="auth-logo">FinSync</div>
            <div className="auth-title">Sign In</div>
            <div className="auth-subtitle">Masuk ke akun e-wallet Anda</div>
            <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
            </div>
            <div className="forgot-link"><a onClick={() => navigate("/forgot-password")}>Forgot password?</a></div>
            <button
            className="btn btn-primary"
            onClick={login}
            disabled={!email || !password || loading}
            >
            {loading ? "Loading..." : "Sign In"}
            </button>
            <div className="auth-link">Belum punya akun? <a onClick={() => navigate("/register")}>Sign up</a></div>
        </div>
        </div>
    );
}