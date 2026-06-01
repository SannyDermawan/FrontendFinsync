import { useEffect, useState } from "react";
import "./App.css";

// ===== SIDEBAR COMPONENT =====
function Sidebar({ activePage, onNavigate, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">FinSync</div>
      <nav className="sidebar-nav">
        <div
          className={`nav-item ${activePage === "dashboard" ? "active" : ""}`}
          onClick={() => onNavigate("dashboard")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span>Dashboard</span>
        </div>
        <div
          className={`nav-item ${activePage === "settings" ? "active" : ""}`}
          onClick={() => onNavigate("settings")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
          </svg>
          <span>Settings</span>
        </div>
      </nav>
      <div className="nav-logout" onClick={onLogout}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span>Logout</span>
      </div>
    </aside>
  );
}

// ===== TOAST COMPONENT =====
function Toast({ message, show, type }) {
  return (
    <div className={`toast ${show ? "show" : ""} ${type}`}>
      <div className="toast-icon">
        {type === "success" ? "✔️" : "⚠️"}
      </div>
      <div className="toast-text">{message}</div>
    </div>
  );
}

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

// ===== SETTINGS PAGE =====
function SettingsPage({ user, onNavigate, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [confirmWallet, setConfirmWallet] = useState(null);
  const [passStrength, setPassStrength] = useState(0);
  const [passLabel, setPassLabel] = useState("Masukkan password baru");
  const [toggles, setToggles] = useState({ daily: true, weekly: false, spendAlert: true });
  const [rangeVal, setRangeVal] = useState(75);
  const [profile, setProfile] = useState({
  firstName: user.first_name || "",
  lastName: user.last_name || "",
  nickname: user.nickname || "",
  gender: user.gender || "male",
  language: user.language || "en"
  });
  const [connections, setConnections] = useState([]);

  useEffect(() => {
  fetch(`http://127.0.0.1:8000/api/wallet-status/${user.id}`)
    .then(res => res.json())
    .then(data => {
      console.log("CONNECTIONS:", data);
      setConnections(data);
    });
  }, []);
  
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const wallet = params.get("connected");
  const user_id = params.get("user_id");

  console.log("PARAMS:", wallet, user_id);

  if (wallet && user_id) {
    console.log("CONNECT WALLET TRIGGER:", wallet, user_id);

    fetch("http://127.0.0.1:8000/api/connect-wallet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user_id,
        wallet_id: wallet,
      }),
    })
    .then(res => res.json())
    .then(data => {
      console.log("CONNECTED SUCCESS:", data);

      return fetch(`http://127.0.0.1:8000/api/wallet-status/${user_id}`);
    })
    .then(res => res.json())
    .then(data => {
      setConnections(data);
    })
    .catch(err => {
      console.log("CONNECT ERROR:", err);
    });
  }
  }, []);

  function updateStrength(val) {
    let s = 0;
    if (val.length >= 8) s += 33;
    if (/[A-Z]/.test(val)) s += 33;
    if (/[0-9!@#$%]/.test(val)) s += 34;
    setPassStrength(s);
    setPassLabel(s < 40 ? "Lemah" : s < 80 ? "Sedang" : "Kuat");
  }

  function connectWallet(type) {
    setConfirmWallet(type);
  }

  function confirmWalletAction() {
    if (confirmWallet === "ovo") window.location.href = `http://localhost/ovo/?user_id=${user.id}&redirect=http://localhost:3000`;
    else if (confirmWallet === "dana") {
    window.location.href = `http://localhost/dana/?user_id=${user.id}&redirect=http://localhost:3000`;
    }

    setConfirmWallet(null);
  }

  return (
    <div className="app-layout">
      <Sidebar activePage="settings" onNavigate={onNavigate} onLogout={onLogout} />
      <main className="main-content">
        <div className="page-header">
          <div className="page-title">Settings</div>
        </div>

        <div className="settings-layout">
          {/* Left sidebar */}
          <div className="settings-sidebar">
            <div className="user-profile-card">
              <div className="profile-avatar-lg">{user?.name?.charAt(0).toUpperCase()}</div>
              <div className="profile-name">{user?.name}</div>
              <div className="profile-role">Designer UI/UX</div>
            </div>
            <div className="settings-menu">
              {[
                { key: "profile", label: "👤 Profile Details" },
                { key: "password", label: "🔒 Password" },
                { key: "notifications", label: "🔔 Notifications" },
                { key: "wallet", label: "💳 Connect Wallet" },
              ].map(item => (
                <div
                  key={item.key}
                  className={`settings-menu-item ${activeSection === item.key ? "active" : ""}`}
                  onClick={() => setActiveSection(item.key)}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Right content */}
          <div className="card settings-card">

            {/* Profile */}
            {activeSection === "profile" && (
              <div className="settings-section active">
                <div className="profile-header">
                  <div>
                    <div className="profile-date">Sat, 07 March 2026</div>
                    <div className="profile-info">
                      <div>
                        <div className="profile-info-name">{user?.name}</div>
                        <div className="profile-info-email">{user?.email}</div>
                      </div>
                    </div>
                  </div>
                  <button className="btn-edit" onClick={() => setIsEditing(true)}>Edit</button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input className="form-input"
                    placeholder="Your first name"
                    value={profile.firstName}
                    onChange={(e) =>
                      setProfile({ ...profile, firstName: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input className="form-input"
                      placeholder="Your last name"
                      value={profile.lastName}
                      onChange={(e) =>
                        setProfile({ ...profile, lastName: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nickname</label>
                    <input className="form-input"
                    placeholder="Your nickname"
                    value={profile.nickname}
                    onChange={(e) =>
                      setProfile({ ...profile, nickname: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <div className="radio-group" style={{ marginTop: 10 }}>
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="gender"
                          checked={profile.gender === "male"}
                          onChange={() =>
                            setProfile({ ...profile, gender: "male" })
                          } disabled={!isEditing}
                        /> Male
                      </label>

                      <label className="radio-option">
                        <input
                          type="radio"
                          name="gender"
                          checked={profile.gender === "female"}
                          onChange={() =>
                            setProfile({ ...profile, gender: "female" })
                          } disabled={!isEditing}
                        /> Female
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Language</label>
                    <select
                    className="form-input"
                    value={profile.language}
                    onChange={(e) =>
                      setProfile({ ...profile, language: e.target.value })
                    }
                    disabled={!isEditing}
                    >
                    <option value="en">English</option>
                    <option value="id">Indonesia</option>
                  </select>
                  </div>
                </div>
                <div className="section-divider"></div>
                <div className="form-group">
                  <label className="form-label">My Email Address</label>
                  <input className="form-input" value={user?.email || ""} disabled/>
                </div>
                <button className="btn-save"
                onClick={async () => {

                  const res = await fetch("http://127.0.0.1:8000/api/profile/update", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      user_id: user.id,
                      ...profile,
                    }),
                  });

                  const data = await res.json();

                  if (res.ok) {
                    // UPDATE LOCALSTORAGE
                    const updatedUser = {
                      ...user,
                      first_name: profile.firstName,
                      last_name: profile.lastName,
                      nickname: profile.nickname,
                      gender: profile.gender,
                      language: profile.language,
                    };

                    localStorage.setItem("user", JSON.stringify(updatedUser));
                    window.location.reload();

                    alert("Profile berhasil disimpan!");
                  } else {
                    alert("Gagal update");
                  }
                }}
              >
                Save Changes
              </button>
              </div>
            )}

            {/* Password */}
            {activeSection === "password" && (
              <div className="settings-section active">
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Change Password</div>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input className="form-input" type="password" placeholder="••••••••" />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input className="form-input" type="password" placeholder="••••••••" onChange={e => updateStrength(e.target.value)} />
                  <div className="password-strength">
                    <div className="password-strength-fill" style={{ width: `${passStrength}%` }}></div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{passLabel}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input className="form-input" type="password" placeholder="••••••••" />
                </div>
                <button className="btn-save">Save Password</button>
              </div>
            )}

            {/* Notifications */}
            {activeSection === "notifications" && (
              <div className="settings-section active">
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Notifications Settings</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Notifications Preferences
                </div>
                <div className="toggle-row">
                  <span className="toggle-label">Daily Notifications</span>
                  <div className={`toggle ${toggles.daily ? "on" : ""}`} onClick={() => setToggles(t => ({ ...t, daily: !t.daily }))}></div>
                </div>
                <div className="toggle-row">
                  <span className="toggle-label">Weekly Notifications</span>
                  <div className={`toggle ${toggles.weekly ? "on" : ""}`} onClick={() => setToggles(t => ({ ...t, weekly: !t.weekly }))}></div>
                </div>
                <div className="section-divider"></div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Spending Limit Alert</div>
                <div className="form-group">
                  <label className="form-label">Set Monthly Spending Limit</label>
                  <input className="limit-input" defaultValue="Rp2.500.000" />
                </div>
                <div className="toggle-row">
                  <span className="toggle-label">Enable Spending Alert</span>
                  <div className={`toggle ${toggles.spendAlert ? "on" : ""}`} onClick={() => setToggles(t => ({ ...t, spendAlert: !t.spendAlert }))}></div>
                </div>
                <div className="range-wrap">
                  <div className="range-label">
                    <span>Alert threshold</span>
                    <span>{rangeVal}%</span>
                  </div>
                  <input type="range" className="range-input" min="0" max="100" value={rangeVal} onChange={e => setRangeVal(e.target.value)} />
                  <div className="range-ticks">
                    {["0%", "25%", "50%", "75%", "100%"].map(t => <span key={t} className="range-tick">{t}</span>)}
                  </div>
                </div>
                <div className="section-divider"></div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Monthly Savings Goal</div>
                <div className="form-group">
                  <label className="form-label">Set Monthly Savings</label>
                  <input className="limit-input" defaultValue="Rp2.500.000" />
                </div>
                <button className="btn-save">Save Settings</button>
              </div>
            )}

            {/* Wallet */}
            {activeSection === "wallet" && (
              <div className="settings-section active">
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Connect Wallet</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {["ovo", "dana"].map(w => {
                    const isConnected = connections.some(
                      c => c.wallet === w && c.connected === 1
                    );

                    return (
                      <div
                        key={w}
                        style={{
                          background: isConnected ? "#16a34a" : "#1e293b",
                          color: "white",
                          padding: "14px 16px",
                          borderRadius: 10,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          cursor: "pointer"
                        }}
                        onClick={() => !isConnected && connectWallet(w)}
                      >
                        <div>{w.toUpperCase()}</div>
                        <div>{isConnected ? "✅ Connected" : "→"}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <ConfirmWalletModal
        open={!!confirmWallet}
        walletName={confirmWallet}
        onClose={() => setConfirmWallet(null)}
        onConfirm={confirmWalletAction}
      />
    </div>
  );
}

// ===== DASHBOARD PAGE =====
function DashboardPage({ user, onNavigate, onLogout }) {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [spending, setSpending] = useState(0);
  const [saldoOVO, setSaldoOVO] = useState(0);
  const [saldoDANA, setSaldoDANA] = useState(0);
  const [walletStatus, setWalletStatus] = useState([]);
  const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [showAll, setShowAll] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const [transferModal, setTransferModal] = useState({ open: false, wallet: null });
  const [topupModal, setTopupModal] = useState({ open: false, wallet: null });
  const [successModal, setSuccessModal] = useState({ open: false, type: null, amount: null, tujuan: null });

useEffect(() => {
  if (!user) return;

  Promise.all([
  fetch(`http://127.0.0.1:8000/api/wallet/${user.id}/ovo`).then(res => res.json()),
  fetch(`http://127.0.0.1:8000/api/wallet/${user.id}/dana`).then(res => res.json()),
  fetch(`http://127.0.0.1:8000/api/transactions/${user.id}`).then(res => res.json()),
  fetch(`http://127.0.0.1:8000/api/wallet-status/${user.id}`).then(res => res.json())
])
.then(([ovoData, danaData, txData, statusData]) => {

  if (!Array.isArray(txData)) return;

  const ovoConnected = statusData.some(w => w.wallet === "ovo" && w.connected == 1);
  const danaConnected = statusData.some(w => w.wallet === "dana" && w.connected == 1);

  let totalSpending = 0;
  const last7 = [0,0,0,0,0,0,0];
  const today = new Date();

  const filteredTx = txData.filter(tx => {
    if (tx.wallet === "ovo" && ovoConnected) return true;
    if (tx.wallet === "dana" && danaConnected) return true;
    return false;
  });

  filteredTx.forEach(tx => {
    if (tx.type === "transfer") totalSpending += tx.amount;

    const txDate = new Date(tx.created_at);
    const diff = Math.floor((today - txDate)/(1000*60*60*24));

    if (diff < 7 && tx.type === "transfer") {
      last7[6 - diff] += tx.amount;
    }
  });

  const finalOvo = ovoConnected ? ovoData.saldo : 0;
  const finalDana = danaConnected ? danaData.saldo : 0;

  setSaldoOVO(finalOvo);
  setSaldoDANA(finalDana);
  setBalance(finalOvo + finalDana);
  setSpending(totalSpending);
  setTransactions(filteredTx);
  setChartData(last7);
  setWalletStatus(statusData);

});

}, [user]);

  function handleSuccessClose() {
    setSuccessModal({ open: false });
  }

  const visibleTxns = showAll ? transactions : transactions.slice(0, 5);
  const max = Math.max(...chartData, 1);
  const isConnected = (walletName) => {
  return walletStatus.some(w => w.wallet === walletName && w.connected == 1);
};


  return (
    <div className="app-layout">
      <Sidebar activePage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
      <main className="main-content">
        <div className="page-header">
          <div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 2 }}>
              Selamat datang kembali, {user.name} 👋
            </div>
            <div className="page-title">Dashboard</div>
          </div>
          <div className="header-avatar" onClick={() => onNavigate("settings")}>
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="dashboard-grid">

          {/* BALANCE */}
          <div className="card balance-card">
            <div className="balance-label">E-Wallet Balance</div>
            <div className="balance-amount">Rp {balance.toLocaleString("id-ID")}</div>
          <div className="balance-sub">

          <div className="wallet-inline">
            <span className="wallet-label">OVO</span>
            <span className="wallet-amount">Rp {saldoOVO.toLocaleString("id-ID")}</span>
          </div>

          <div className="wallet-inline">
            <span className="wallet-label">DANA</span>
            <span className="wallet-amount">Rp {saldoDANA.toLocaleString("id-ID")}</span>
          </div>

          {/* GARIS DI TENGAH */}
          <div className="balance-divider"></div>

          <div className="wallet-inline">
            <span className="wallet-label">SPENDING</span>
            <span className="wallet-amount">Rp {spending.toLocaleString("id-ID")}</span>
          </div>

          <div className="wallet-inline">
            <span className="wallet-label">SAVINGS</span>
            <span className="wallet-amount">Rp 3.000.000</span>
          </div>

        </div>

            <div className="balance-connect" style={{ marginTop: 24 }}>
              Connect with OVO &amp; Dana
            </div>
          </div>

          {/* CHART */}
          <div className="card chart-card">
            <div className="card-title">Grafik Spending – Last 7 Days</div>
            <div className="chart-bars">
  {chartData.map((h, i) => (
    <div key={i} className="chart-bar-wrap">

      <div
        className="chart-bar"
        style={{ height: h === 0 ? "4px" : Math.max((h / max) * 100, 8) + "%" }}
      >
        {h > 0 && (
          <div className="bar-val">
            {transactions
              .filter(tx => {
                const d = new Date(tx.created_at);
                const today = new Date();
                const diff = Math.floor((today - d)/(1000*60*60*24));
                return diff === (6 - i) && tx.type === "transfer";
              })
              .reduce((sum, tx) => sum + tx.amount, 0)
              .toLocaleString("id-ID")}
          </div>
        )}
      </div>

      <div className="chart-day">{i + 1}</div>
    </div>
  ))}
</div>
          </div>

          {/* PROFILE */}
          <div className="card profile-card">
            <div className="profile-avatar">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="black" strokeWidth="1.5" />
                <path d="M4 20c1.5-4 14.5-4 16 0" stroke="black" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="profile-name">{user.name}</div>
            <div className="profile-range">
              <div className="range-label">📅 Last 7 Days</div>
              <div className="range-days">
                {[1, 2, 3, 4, 5, 6, 7].map(d => (
                  <div
                    key={d}
                    className={`day ${activeDay === d ? "active" : ""}`}
                    onClick={() => setActiveDay(d)}
                  >
                    {d}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TRANSACTIONS */}
          <div className="card txn-card">
            <div className="card-title">Transaction History</div>
            {visibleTxns.map((tx, i) => {
              const isMinus = tx.type === "transfer";
              return (
                <div key={i} className="txn-item">
                  <div className="txn-icon">{isMinus ? "💸" : "💰"}</div>
                  <div className="txn-info">
                    <div className="txn-name">{tx.type.toUpperCase()}</div>
                    <div className="txn-date">{new Date(tx.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className={`txn-amount ${isMinus ? "negative" : "positive"}`}>
                    {isMinus ? "-" : "+"}Rp {tx.amount.toLocaleString("id-ID")}
                  </div>
                </div>
              );
            })}
            {!showAll && transactions.length > 5 && (
            <div className="txn-more">
              <button onClick={() => setShowAll(true)}>
                Lihat lebih banyak
              </button>
            </div>
          )}
          </div>

          {/* NOTIFICATIONS */}
          <div className="card notif-card">
            <div className="card-title">Notifications</div>
            <div className="notif-item" style={{ borderLeft: "4px solid #6C3FE8" }}>
              <div className="notif-title">⚠️ Budget Hampir Habis</div>
              <div className="notif-desc">Sisa Rp20.000 bulan ini</div>
              <div className="notif-action">Atur ulang budget pengeluaran →</div>
            </div>
            <div className="notif-item" style={{ borderLeft: "4px solid #f59e0b" }}>
              <div className="notif-title">📊 Pengeluaran Hari Ini</div>
              <div className="notif-desc">Rp150.000 (diatas rata-rata)</div>
              <div className="notif-action" style={{ color: "#f59e0b" }}>Lebih tinggi dari rata-rata harian →</div>
            </div>
            <div className="notif-item" style={{ borderLeft: "4px solid #22c55e" }}>
              <div className="notif-title">🎯 Target Tabungan</div>
              <div className="notif-desc">Kamu sudah mencapai 75% target bulan ini</div>
              <div className="notif-action" style={{ color: "#22c55e" }}>Lihat detail →</div>
            </div>
            <div className="notif-item" style={{ borderLeft: "4px solid #004CEF" }}>
              <div className="notif-title">📋 Aktivitas Hari Ini</div>
              <div className="notif-desc">3 Transaksi dilakukan hari ini</div>
              <div className="notif-action" style={{ color: "#a855f7" }}>Lihat semua →</div>
            </div>
          </div>

        </div>
      </main>

      <TransferModal
        open={transferModal.open}
        wallet={transferModal.wallet}
        balance={transferModal.wallet === "ovo" ? saldoOVO : saldoDANA}
        onClose={() => setTransferModal({ open: false })}
        onSuccess={(type, amount, tujuan) => setSuccessModal({ open: true, type, amount, tujuan })}
      />
      <TopupModal
        open={topupModal.open}
        wallet={topupModal.wallet}
        onClose={() => setTopupModal({ open: false })}
        onSuccess={(type, amount) => setSuccessModal({ open: true, type, amount })}
      />
      <SuccessModal
        open={successModal.open}
        type={successModal.type}
        amount={successModal.amount}
        tujuan={successModal.tujuan}
        onClose={handleSuccessClose}
      />
    </div>
  );
}

// ===== AUTH PAGES =====
function SignInPage({ onLogin, onNavigate }) {
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

  setTimeout(() => {
    setLoading(false);
    onLogin(data); 
  }, 1000);
}

  return (
    <div className="page auth-page active">
      <Toast message={notif} show={!!notif} type={notifType} />
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
        <div className="forgot-link"><a onClick={() => onNavigate("forgot")}>Forgot password?</a></div>
        <button
        className="btn btn-primary"
        onClick={login}
        disabled={!email || !password || loading}
        >
        {loading ? "Loading..." : "Sign In"}
        </button>
        <div className="auth-link">Belum punya akun? <a onClick={() => onNavigate("signup")}>Sign up</a></div>
      </div>
    </div>
  );
}

function SignUpPage({ onNavigate }) {

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
  username &&
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
    onNavigate("signin");
  }, 1500);
}
  

  return (
    <div className="page auth-page active">
      <Toast message={notif} show={!!notif} type={notifType} />
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
          <a onClick={() => onNavigate("signin")}>← Back to Sign In</a>
        </div>
      </div>
    </div>
  );
}

function ForgotPage({ onNavigate }) {
  return (
    <div className="page auth-page active">
      <div className="auth-card">
        <div className="auth-logo">FinSync</div>
        <div className="auth-title">Forgot Password</div>
        <div className="auth-subtitle">Masukkan email untuk reset password</div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="Enter your email" />
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate("reset")}>Reset Password</button>
        <div className="auth-link"><a onClick={() => onNavigate("signin")}>← Back to Sign In</a></div>
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
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("signin");

  useEffect(() => { 
  const u = JSON.parse(localStorage.getItem("user"));

  if (u) { 
    setUser(u); 
    setPage("dashboard"); 
  }

  const params = new URLSearchParams(window.location.search);
  const connected = params.get("connected");
  const wallet_id = params.get("wallet_id");

if (connected === "ovo") {

  const wallet_id = params.get("wallet_id");

  alert("OVO berhasil terhubung ✅");

  fetch("http://127.0.0.1:8000/api/connect-wallet", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user_id: u.id,
      wallet_id: wallet_id
    })
  });

  window.location.href = "/";
}

  }, []);

  function handleLogin(data) {
    setUser(data);
    setPage("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("user");
    setUser(null);
    setPage("signin");
  }

  function navigate(target) {
    setPage(target);
  }

  if (!user) {
    if (page === "signup") return <SignUpPage onNavigate={navigate} />;
    if (page === "forgot") return <ForgotPage onNavigate={navigate} />;
    if (page === "reset") return <ResetPage onNavigate={navigate} />;
    return <SignInPage onLogin={handleLogin} onNavigate={navigate} />;
  }

  if (page === "settings") return <SettingsPage user={user} onNavigate={navigate} onLogout={handleLogout} />;
  return <DashboardPage user={user} onNavigate={navigate} onLogout={handleLogout} />;
}

export default App;