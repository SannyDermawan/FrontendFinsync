import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";

import { useEffect, useState } from "react";
import "./App.css";
import TransactionHistoryLOGO from "./asset/TransactionHistoryLOGO.jpg";

// ===== SIDEBAR COMPONENT =====

// ===== TOAST COMPONENT =====
// function Toast({ message, show, type }) {
//   return (
//     <div className={`toast ${show ? "show" : ""} ${type}`}>
//       <div className="toast-icon">
//         {type === "success" ? "✔️" : "⚠️"}
//       </div>
//       <div className="toast-text">{message}</div>
//     </div>
//   );
// }

// ===== MODAL: TRANSFER =====
function TransferModal({ open, onClose, wallet, balance, onSuccess }) {
  const [kategori, setKategori] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [nominal, setNominal] = useState("Rp0");

  async function doTransfer() {
    const user = JSON.parse(localStorage.getItem("user"));
    const amount = parseInt(nominal.replace(/\D/g, "")) || 0;
    if (!amount || !tujuan) return alert("Isi semua field!");

    const res = await fetch("http://127.0.0.1:8000/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json", },
      body: JSON.stringify({ user_id: user.id, wallet, type: "transfer", amount }),
    });
    if (res.ok) {
      onClose();
      onSuccess("transfer", amount, tujuan);
    }
  }

  if (!open) return null;
  return (
    <div className="modal-overlay open">
      <div className="modal">
        <div className="modal-header">
          <button className="modal-back" onClick={onClose}>←</button>
          <div className="modal-title">Transfer</div>
          <span className={`modal-wallet-badge ${wallet}`}>{wallet?.toUpperCase()}</span>
        </div>
        <div className="form-group">
          <label className="form-label">Kategori Transfer</label>
          <select className="select-input" value={kategori} onChange={e => setKategori(e.target.value)}>
            <option value="">Pilih kategori</option>
            <option>Transfer</option>
            <option>Belanja</option>
            <option>Makan</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Tujuan Transfer</label>
          <input className="form-input" placeholder="Masukkan nomor tujuan" value={tujuan} onChange={e => setTujuan(e.target.value)} style={{ marginBottom: 0 }} />
        </div>
        <div className="form-group" style={{ marginTop: 16 }}>
          <label className="form-label">Nominal Transfer</label>
          <input
            className="amount-input"
            value={nominal}
            onFocus={() => { if (nominal === "Rp0") setNominal("Rp "); }}
            onChange={e => setNominal(e.target.value)}
          />
          <div className="saldo-info">Saldo Tersedia: Rp {balance?.toLocaleString("id-ID")}</div>
        </div>
        <button className="btn btn-primary" onClick={doTransfer}>Lanjutkan</button>
      </div>
    </div>
  );
}

// ===== MODAL: TOPUP =====
function TopupModal({ open, onClose, wallet, onSuccess }) {
  const [nominal, setNominal] = useState("Rp0");
  const [metode, setMetode] = useState("DANA");

  async function doTopup() {
    const user = JSON.parse(localStorage.getItem("user"));
    const amount = parseInt(nominal.replace(/\D/g, "")) || 0;
    if (!amount) return alert("Isi nominal!");

    const res = await fetch("http://127.0.0.1:8000/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, wallet, type: "topup", amount }),
    });
    if (res.ok) {
      onClose();
      onSuccess("topup", amount);
    }
  }

  if (!open) return null;
  return (
    <div className="modal-overlay open">
      <div className="modal">
        <div className="modal-header">
          <button className="modal-back" onClick={onClose}>←</button>
          <div className="modal-title">Top Up</div>
          <span className={`modal-wallet-badge ${wallet}`}>{wallet?.toUpperCase()}</span>
        </div>
        <div className="form-group">
          <label className="form-label">Nominal Top Up</label>
          <input
            className="amount-input"
            value={nominal}
            onFocus={() => { if (nominal === "Rp0") setNominal("Rp "); }}
            onChange={e => setNominal(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Metode Pembayaran</label>
          <select className="select-input" value={metode} onChange={e => setMetode(e.target.value)}>
            <option>DANA</option>
            <option>OVO</option>
            <option>Transfer Bank</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={doTopup}>Lanjutkan</button>
      </div>
    </div>
  );
}

// ===== MODAL: SUCCESS =====
function SuccessModal({ open, onClose, type, amount, tujuan }) {
  if (!open) return null;
  return (
    <div className="modal-overlay open">
      <div className="modal">
        <div className="success-modal">
          <div className="success-icon">✓</div>
          <div className="success-title">{type === "transfer" ? "Transfer Berhasil!" : "Top Up Berhasil!"}</div>
          <div className="success-desc">
            <strong>Rp {amount?.toLocaleString("id-ID")}</strong>{" "}
            {type === "transfer"
              ? <>telah berhasil dikirim ke<br /><strong>{tujuan}</strong></>
              : "telah berhasil di-top up ke wallet Anda"}
          </div>
          <button className="btn btn-primary" onClick={onClose}>Kembali ke Beranda</button>
        </div>
      </div>
    </div>
  );
}

// ===== MODAL: CONFIRM WALLET =====
function ConfirmWalletModal({ open, walletName, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className="modal-overlay open">
      <div className="modal">
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔗</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Connect Wallet</div>
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 4 }}>
            Anda akan menghubungkan wallet <strong>{walletName?.toUpperCase()}</strong>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Pastikan akun Anda sudah aktif</div>
        </div>
        <div className="confirm-row">
          <button className="btn-cancel" onClick={onClose}>Batal</button>
          <button className="btn-confirm" onClick={onConfirm}>Konfirmasi</button>
        </div>
      </div>
    </div>
  );
}

function ResetPage({ onNavigate }) {
  return (
    <div className="page auth-page active">
      <div className="auth-card">
        <div className="auth-logo">FinSync</div>
        <div className="auth-title">Reset Password</div>
        <div className="auth-subtitle">Masukkan password baru Anda</div>
        <div className="form-group">
          <label className="form-label">Code from Email</label>
          <input className="form-input" type="text" placeholder="Enter code from email" />
        </div>
        <div className="form-group">
          <label className="form-label">New Password</label>
          <input className="form-input" type="password" placeholder="Enter new password" />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <input className="form-input" type="password" placeholder="Confirm new password" />
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate("signin")}>Reset Password</button>
        <div className="auth-link"><a onClick={() => onNavigate("signin")}>← Back to Sign In</a></div>
      </div>
    </div>
  );
}

// ===== APP ROOT =====
function App() {
  const [user, setUser] = useState(() => {
  const savedUser = localStorage.getItem("user");

  return savedUser
    ? JSON.parse(savedUser)
    : null;
});

  useEffect(() => { 
  const u = JSON.parse(localStorage.getItem("user"));

  const params = new URLSearchParams(window.location.search);
  const connected = params.get("connected");
  const wallet_id = params.get("wallet_id");

  if (connected && wallet_id) {

  localStorage.setItem(
    "pending_wallet",
    JSON.stringify({
      connected,
      wallet_id
    })
  );

}

if (connected === "ovo" && u) {

  alert("OVO berhasil terhubung ✅");

  fetch(
    "http://127.0.0.1:8000/api/connect-wallet",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: u.id,
        wallet_id: wallet_id
      })
    }
  )
  .then(res => res.json())
  .then(data => {

    console.log("OVO CONNECTED:", data);

    window.location.href = "/";
  })
  .catch(err => {
    console.error("OVO ERROR:", err);
  });

}

if (connected === "dana" && u) {

  fetch(
    "http://127.0.0.1:8000/api/connect-wallet",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: u.id,
        wallet_id: wallet_id
      })
    }
  )
  .then(res => res.json())
  .then(data => {

    console.log("DANA CONNECTED:", data);

    alert("DANA berhasil terhubung ✅");

    window.location.href = "/";
  });
}

  }, []);

  function handleLogin(data) {
    setUser(data);
  }

  function handleLogout() {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  }

return (
  <Routes>

    <Route
      path="/login"
      element={
        <Login
          onLogin={handleLogin}
        />
      }
    />

    <Route
      path="/verify-otp"
      element={<VerifyOTP />}
    />

    <Route
      path="/reset-password"
      element={<ResetPassword />}
    />

    <Route
      path="/register"
      element={
        <Register
        />
      }
    />

    <Route
      path="/forgot-password"
      element={
        <ForgotPassword
        />
      }
    />

      <Route
    path="/dashboard"
    element={
      user ? (
        <Dashboard
          user={user}
          onLogout={handleLogout}
        />
      ) : (
        <Navigate to="/login" />
      )
    }
  />

      <Route
    path="/settings"
    element={
      user ? (
        <Settings
          user={user}
          setUser={setUser}
          onLogout={handleLogout}
        />
      ) : (
        <Navigate to="/login" />
      )
    }
  />

    <Route
  path="/"
  element={
    user
      ? <Navigate to="/dashboard" />
      : <Navigate to="/login" />
  }
/>

    <Route
      path="*"
      element={<Navigate to="/login" />}
    />

  </Routes>
);
}
//p
export default App;