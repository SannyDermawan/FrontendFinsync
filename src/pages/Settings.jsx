import React, {
  useState,
  useEffect
} from "react";

import Sidebar from "../components/Sidebar";

export default function Settings({
  user,
  setUser,
  onNavigate,
  onLogout
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [confirmWallet, setConfirmWallet] = useState(null);
  const [passStrength, setPassStrength] = useState(0);
  const [passLabel, setPassLabel] = useState("Masukkan password baru");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toggles, setToggles] = useState({daily: true, weekly: false, spendAlert: true});
  const [rangeVal, setRangeVal] = useState(75);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [monthlySavingsGoal, setMonthlySavingsGoal] = useState(0);
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

  if (!user) return;

  fetch(
    `http://127.0.0.1:8000/api/notification-settings/${user.id}`
  )
    .then(res => res.json())
    .then(data => {

      setToggles({
        daily: Boolean(data.daily_summary),
        weekly: Boolean(data.weekly_report),
        spendAlert: Boolean(data.spending_alert)
      });

      setRangeVal(data.alert_threshold);

      setMonthlyBudget(
        data.monthly_budget
      );

      setMonthlySavingsGoal(
        data.monthly_savings_goal
      );

    });

}, [user]);

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
    if (confirmWallet === "ovo") window.location.href = `http://localhost/ovo/?redirect=http://localhost:3000`;
    else if (confirmWallet === "dana") {
    window.location.href = `http://localhost/dana/?redirect=http://localhost:3000`;
    }

    setConfirmWallet(null);
  }

  return (
    <div className="app-layout">
        <Sidebar
            activePage="settings"
            onLogout={onLogout}
        />
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
                <button
                  className="btn-save"
                  disabled={!isEditing}
                  onClick={async () => {

                    const res = await fetch(
                      "http://127.0.0.1:8000/api/profile/update",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          user_id: user.id,
                          ...profile,
                        }),
                      }
                    );

                    const data = await res.json();

                    if (res.ok) {

                      const updatedUser = {
                        ...user,
                        first_name: profile.firstName,
                        last_name: profile.lastName,
                        nickname: profile.nickname,
                        gender: profile.gender,
                        language: profile.language,
                      };

                      localStorage.setItem(
                        "user",
                        JSON.stringify(updatedUser)
                      );

                      setUser(updatedUser);

                      setIsEditing(false);

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
                  <input
                    className="form-input"
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) =>
                      setCurrentPassword(e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => {

                      setNewPassword(e.target.value);

                      updateStrength(e.target.value);

                    }}
                  />
                  <div className="password-strength">
                    <div className="password-strength-fill" style={{ width: `${passStrength}%` }}></div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{passLabel}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                  />
                </div>
                <button
                  className="btn-save"
                  onClick={async () => {

                    if (!currentPassword) {
                      alert("Masukkan password lama");
                      return;
                    }

                    if (newPassword !== confirmPassword) {
                      alert("Konfirmasi password tidak cocok");
                      return;
                    }

                    const res = await fetch(
                      "http://127.0.0.1:8000/api/change-password",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                          user_id: user.id,
                          current_password: currentPassword,
                          new_password: newPassword
                        })
                      }
                    );

                    const data = await res.json();

                    if (res.ok) {

                      alert(
                        "Password berhasil diubah ✅"
                      );

                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");

                    } else {

                      alert(data.message);

                    }

                  }}
                >
                  Save Password
                </button>
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
                  <input
                    className="limit-input"
                    value={`Rp ${Number(monthlyBudget).toLocaleString("id-ID")}`}
                    onChange={(e) => {

                      const angka =
                        e.target.value.replace(/\D/g, "");

                      setMonthlyBudget(
                        angka === "" ? 0 : Number(angka)
                      );

                    }}
                  />
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
                  <input
                    className="limit-input"
                    value={`Rp ${Number(monthlySavingsGoal).toLocaleString("id-ID")}`}
                    onChange={(e) => {

                      const angka =
                        e.target.value.replace(/\D/g, "");

                      setMonthlySavingsGoal(
                        angka === "" ? 0 : Number(angka)
                      );

                    }}
                  />
                </div>
                <button
                  className="btn-save"
                  onClick={async () => {

                    const res = await fetch(
                      `http://127.0.0.1:8000/api/notification-settings/${user.id}`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify({

                          daily_summary: toggles.daily,
                          weekly_report: toggles.weekly,

                          spending_alert: toggles.spendAlert,

                          alert_threshold: rangeVal,

                          monthly_budget: monthlyBudget,

                          savings_goal_enabled: true,

                          monthly_savings_goal:
                            monthlySavingsGoal

                        })
                      }
                    );

                    if (res.ok) {
                      alert(
                        "Notification settings berhasil disimpan ✅"
                      );
                    }

                  }}
                >
                  Save Changes
                </button>
              </div>
            )}

            {/* Wallet */}
            {activeSection === "wallet" && (
              <div className="settings-section active">
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Connect Wallet</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {["ovo", "dana"].map(w => {
                  const connectedWallet = connections.find(
                    c => c.wallet === w && c.connected == 1
                  );

                  return (
                    <div
                      key={w}
                      style={{
                        background: connectedWallet ? "#16a34a" : "#1e293b",
                        color: "white",
                        padding: "16px",
                        borderRadius: 10,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >

                      <div>
                        <div style={{ fontWeight: 700 }}>
                          {w.toUpperCase()}
                        </div>

                        <div
                          style={{
                            fontSize: 13,
                            opacity: 0.9,
                            marginTop: 4
                          }}
                        >
                          {connectedWallet
                            ? connectedWallet.account_name
                            : "Belum terhubung"}
                        </div>
                      </div>

                      {connectedWallet ? (

                        <button
                          onClick={async () => {

                            await fetch(
                              "http://127.0.0.1:8000/api/disconnect-wallet",
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                  user_id: user.id,
                                  wallet_id: connectedWallet.wallet_id
                                })
                              }
                            );

                            const res = await fetch(
                              `http://127.0.0.1:8000/api/wallet-status/${user.id}`
                            );

                            const data = await res.json();

                            setConnections(data);

                          }}
                          style={{
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            padding: "8px 14px",
                            borderRadius: 8,
                            cursor: "pointer"
                          }}
                        >
                          Disconnect
                        </button>

                      ) : (

                        <button
                          onClick={() => connectWallet(w)}
                          style={{
                            background: "#4f46e5",
                            color: "white",
                            border: "none",
                            padding: "8px 14px",
                            borderRadius: 8,
                            cursor: "pointer"
                          }}
                        >
                          Connect
                        </button>

                      )}

                    </div>
                  );
                })}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* <ConfirmWalletModal
        open={!!confirmWallet}
        walletName={confirmWallet}
        onClose={() => setConfirmWallet(null)}
        onConfirm={confirmWalletAction}
      /> */}
    </div>
  );
}