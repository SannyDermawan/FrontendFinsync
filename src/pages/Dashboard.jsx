import React, {
  useState,
  useEffect
} from "react";

import TransactionHistoryLOGO from "../asset/TransactionHistoryLOGO.jpg";
import Sidebar from "../components/Sidebar";

export default function Dashboard({
  user,
  onNavigate,
  onLogout
}) {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [spending, setSpending] = useState(0);
  const [saldoOVO, setSaldoOVO] = useState(0);
  const [saldoDANA, setSaldoDANA] = useState(0);
  const [walletStatus, setWalletStatus] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState(null);
  const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [showAll, setShowAll] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const [transferModal, setTransferModal] = useState({ open: false, wallet: null });
  const [topupModal, setTopupModal] = useState({ open: false, wallet: null });
  const [successModal, setSuccessModal] = useState({ open: false, type: null, amount: null, tujuan: null });
  const [totalSavings, setTotalSavings] = useState(0);
  const [savingModal, setSavingModal] = useState(false);
  const [savingAmount, setSavingAmount] = useState("");
  const [historyModal, setHistoryModal] = useState(false);
  const [savingHistory, setSavingHistory] = useState([]); 

useEffect(() => {
  if (!user) return;

  fetch(`http://127.0.0.1:8000/api/wallet-status/${user.id}`)
    .then(res => res.json())
    .then(async (statusData) => {

      setWalletStatus(statusData);

      let totalBalance = 0;
      let totalSpending = 0;

      let ovoSaldo = 0;
      let danaSaldo = 0;

      let allTransactions = [];

      const last7 = [0,0,0,0,0,0,0];
      const today = new Date();

      for (const wallet of statusData) {

        if (wallet.connected != 1) continue;

        totalBalance += wallet.saldo;

        if (wallet.wallet === "ovo") {
          ovoSaldo = wallet.saldo;
        }

        if (wallet.wallet === "dana") {
          danaSaldo = wallet.saldo;
        }

        const txRes = await fetch(
          `http://127.0.0.1:8000/api/transactions/${wallet.wallet_id}`
        );

        const txData = await txRes.json();

        allTransactions = [
          ...allTransactions,
          ...txData.map(tx => ({
            ...tx,
            wallet_name: wallet.wallet
          }))
        ];
      }

      allTransactions.sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      );

     allTransactions.forEach(tx => {
      if (tx.type === "transfer") {

        totalSpending += tx.amount;

        const txDate = new Date(tx.created_at);

        const diff = Math.floor(
          (today - txDate) /
          (1000 * 60 * 60 * 24)
        );

        if (diff >= 0 && diff < 7) {

          last7[6 - diff] += tx.amount;

        }
      }

    });

      setChartData(last7);
      setSaldoOVO(ovoSaldo);
      setSaldoDANA(danaSaldo);
      setBalance(totalBalance);
      setSpending(totalSpending);
      setTransactions(allTransactions);

      const notifRes = await fetch(
      `http://127.0.0.1:8000/api/notification-settings/${user.id}`
      );

      const notifData = await notifRes.json();

      setNotificationSettings(notifData);
      const savingRes = await fetch(
      `http://127.0.0.1:8000/api/savings/${user.id}`
      );

      const savingData = await savingRes.json();

      setTotalSavings(
        Number(savingData.total)
      );
    });

}, [user]);

  function handleSuccessClose() {
    setSuccessModal({ open: false });
  }

  const visibleTxns = showAll ? transactions : transactions.slice(0, 5);
  const filteredTxns = visibleTxns.filter(tx => {

  const txDate = new Date(tx.created_at);
  const today = new Date();

  const diff = Math.floor(
    (today - txDate) /
    (1000 * 60 * 60 * 24)
  );

  return diff === (activeDay - 1);

});
  const max = Math.max(...chartData, 1);
  const showBudgetAlert =
  notificationSettings &&
  notificationSettings.spending_alert &&
  spending >= (
    notificationSettings.monthly_budget *
    notificationSettings.alert_threshold /
    100
  );
  const todaySpending = transactions
  .filter(tx => {

    if (tx.type !== "transfer")
      return false;

    const txDate = new Date(tx.created_at);
    const today = new Date();

    return (
      txDate.getDate() === today.getDate() &&
      txDate.getMonth() === today.getMonth() &&
      txDate.getFullYear() === today.getFullYear()
    );

  })
  .reduce(
    (sum, tx) => sum + tx.amount,
    0
  );
  const weeklyAverage =
  chartData.reduce((sum, val) => sum + val, 0) / 7;

  const compareText =
  todaySpending > weeklyAverage
    ? "diatas rata-rata"
    : todaySpending < weeklyAverage
    ? "dibawah rata-rata"
    : "sama dengan rata-rata";
  
  const weeklySpending =
  transactions
    .filter(tx => {

      const diff =
        Math.floor(
          (new Date() - new Date(tx.created_at))
          / (1000 * 60 * 60 * 24)
        );

      return (
        diff < 7 &&
        tx.type === "transfer"
      );

    })
    .reduce(
      (sum, tx) => sum + tx.amount,
      0
    );

  const weeklyTransactionCount =
    transactions.filter(tx => {

      const txDate = new Date(tx.created_at);

      const diff =
        Math.floor(
          (new Date() - txDate)
          / (1000 * 60 * 60 * 24)
        );

      return diff < 7;

    }).length;

  const todayTransactions = transactions.filter(tx => {

  const txDate = new Date(tx.created_at);
  const today = new Date();

  return (
    txDate.getDate() === today.getDate() &&
    txDate.getMonth() === today.getMonth() &&
    txDate.getFullYear() === today.getFullYear()
  );

});

  const todayTransactionCount =
    todayTransactions.length;
  const isConnected = (walletName) => {
  return walletStatus.some(w => w.wallet === walletName && w.connected == 1);
};


  return (
    <div className="app-layout">
        <Sidebar
            activePage="dashboard"
            onLogout={onLogout}
        />
      <main className="main-content">
        <div className="page-header">
          <div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 2 }}>
              Selamat datang kembali, {user?.name} 👋
            </div>
            <div className="page-title">Dashboard</div>
          </div>
          <div className="header-avatar" onClick={() => onNavigate("settings")}>
            {user?.name.charAt(0).toUpperCase()}
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
            <span className="wallet-amount">Rp {totalSavings.toLocaleString("id-ID")}</span>
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
            <div className="profile-name">{user?.name}</div>
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
           <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12
    }}
  >
    <img
      src={TransactionHistoryLOGO}
      alt="Transaction History"
      style={{
        width: 40,
        height: 40,
        borderRadius: 6,
        objectFit: "cover"
      }}
    />

    <div
      style={{
        fontSize: 18,
        fontWeight: 700,
        color: "#0f172a"
      }}
    >
      Transaction History
    </div>
  </div>

  <button
    className="download-report-btn"
    onClick={() =>
      window.open(
        `http://127.0.0.1:8000/api/report/${user.id}`,
        "_blank"
      )
    }
  >
    Download PDF
  </button>
</div>
            {filteredTxns.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "30px",
                  color: "#94a3b8"
                }}
              >
                Tidak ada transaksi pada hari ini
              </div>
            )}
            {filteredTxns.map((tx, i) => {
              const isMinus = tx.type === "transfer";
              return (
                <div key={i} className="txn-item">
                  <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "#f3f0ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26
                  }}
                >
                  {isMinus ? "↑" : "↓"}
                </div>
                  <div className="txn-info">
                    <div className="txn-info">

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#ede9fe",
              color: "#6C3FE8",
              padding: "4px 10px",
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 700,
              marginBottom: 8
            }}
          >
            {tx.type === "topup" ? "↓" : "↑"}
            {tx.type.toUpperCase()}
          </div>

          <div
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: "#0f172a"
            }}
          >
            {tx.wallet_name?.toUpperCase()}
          </div>

          <div
            style={{
              fontSize: 13,
              color: "#64748b",
              marginTop: 4
            }}
          >
            {new Date(tx.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric"
            })}
          </div>

        </div>
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

            {notificationSettings?.daily_summary && (
              <div
                className="notif-item"
                style={{ borderLeft: "4px solid #f59e0b" }}
              >
                <div className="notif-title">
                  📊 Aktivitas Hari Ini
                </div>

                <div className="notif-desc">
                  Total {todayTransactionCount} transaksi dilakukan hari ini
                </div>

                <div className="notif-desc">
                  Pengeluaran: Rp {todaySpending.toLocaleString("id-ID")} ({compareText})
                </div>

                <div
                  className="notif-action"
                  style={{ color: "#f59e0b" }}
                >
                  Rata-rata seminggu: Rp {Math.round(weeklyAverage).toLocaleString("id-ID")}
                </div>
              </div>
            )}

              {Number(notificationSettings?.weekly_report) === 1 && (
              <div
                className="notif-item"
                style={{ borderLeft: "4px solid #004CEF" }}
              >
                <div className="notif-title">
                  📋 Aktivitas Minggu Ini
                </div>

                <div className="notif-desc" >
                  Total pengeluaran: <span
                  className="notif-action"
                  style={{
                    color: "#004CEF",
                    fontWeight: 600
                  }}
                >
                  Rp {weeklySpending.toLocaleString("id-ID")}
                </span>
                </div>

                <div className="notif-desc">
                  Total transaksi: <span
                  className="notif-action"
                  style={{
                    color: "#004CEF",
                    fontWeight: 600
                  }}
                >
                  {weeklyTransactionCount} transaksi
                </span>
                </div>
              </div>
            )}

              {showBudgetAlert && (
                <div
                  className="notif-item"
                  style={{
                    borderLeft: "4px solid #6C3FE8"
                  }}
                >
                  <div className="notif-title">
                    ⚠️ Budget Hampir Habis
                  </div>

                  <div className="notif-desc">
                    Pengeluaran bulan ini:
                    Rp {spending.toLocaleString("id-ID")}
                  </div>

                  <div className="notif-action">
                    Melewati batas {
                      notificationSettings.alert_threshold
                    }%
                  </div>
                  <div className="notif-action" onClick={() => onNavigate("settings")} style={{ cursor: "pointer" }}>Atur ulang budget pengeluaran →</div>
                </div>
              )}
            

            <div
              className="notif-item"
              style={{ borderLeft: "4px solid #22c55e" }}
            >
              <div className="notif-title">
                🎯 Target Tabungan
              </div>

              <div className="notif-desc">
                Rp {totalSavings.toLocaleString("id-ID")}
                {" / "}
                Rp {notificationSettings?.monthly_savings_goal?.toLocaleString("id-ID")}
              </div>

              <div className="savings-progress">
                <div
                  className="savings-progress-fill"
                  style={{
                    width: `${Math.max(
                    0,
                    Math.min(
                      (totalSavings /
                        (notificationSettings?.monthly_savings_goal || 1))
                        * 100,
                      100
                    )
                  )}%`
                  }}
                />
              </div>

              <div
                className="notif-action"
                style={{ color: "#22c55e" }}
              >
                {Math.max(
                  0,
                  Math.min(
                    Math.round(
                      (totalSavings /
                        (notificationSettings?.monthly_savings_goal || 1))
                        * 100
                    ),
                    100
                  )
                )}% tercapai
              </div>

              <div className="saving-actions">

              <button
                className="saving-btn"
                onClick={() => setSavingModal(true)}
              >
                + Tambah Tabungan
              </button>

              <button
                className="history-btn"
                onClick={async () => {

                  const res = await fetch(
                    `http://127.0.0.1:8000/api/savings-history/${user.id}`
                  );

                  const data = await res.json();

                  setSavingHistory(data);

                  setHistoryModal(true);

                }}
              >
                Riwayat
              </button>

            </div>
            </div>
          </div>

        </div>
      </main>

      {/* <TransferModal
        open={transferModal.open}
        wallet={transferModal.wallet}
        balance={transferModal.wallet === "ovo" ? saldoOVO : saldoDANA}
        onClose={() => setTransferModal({ open: false })}
        onSuccess={(type, amount, tujuan) => setSuccessModal({ open: true, type, amount, tujuan })}
      /> */}
      {/* <TopupModal
        open={topupModal.open}
        wallet={topupModal.wallet}
        onClose={() => setTopupModal({ open: false })}
        onSuccess={(type, amount) => setSuccessModal({ open: true, type, amount })}
      /> */}
      {/* <SuccessModal
        open={successModal.open}
        type={successModal.type}
        amount={successModal.amount}
        tujuan={successModal.tujuan}
        onClose={handleSuccessClose}
      /> */}
      {savingModal && (
      <div className="modal-overlay">

        <div className="modal-card">

          <h3>🎯 Tambah Tabungan</h3>

          <input
            className="saving-input"
            type="number"
            placeholder="Masukkan nominal"
            value={savingAmount}
            onChange={(e) =>
              setSavingAmount(e.target.value)
            }
          />

          <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setSavingModal(false)}
              >
                Batal
              </button>

            <button
              className="btn-save-saving"
              onClick={async () => {

              const amount = Number(savingAmount);

              if (amount === 0) {
                alert("Nominal tidak boleh Rp 0");
                return;
              }

              if (Math.abs(amount) > 100000000) {
                alert("Maksimal transaksi tabungan Rp 100.000.000");
                return;
              }

              if (totalSavings + amount < 0) {
                alert("Tabungan tidak boleh kurang dari Rp 0");
                return;
              }

              const res = await fetch(
                "http://127.0.0.1:8000/api/savings",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    user_id: user.id,
                    amount: amount
                  })
                }
              );

             if (res.ok) {

              const newSaving = await res.json();

              setTotalSavings(
                prev => Number(prev) + Number(amount)
              );

              setSavingHistory(prev => [
                newSaving.saving,
                ...prev
              ]);

              setSavingAmount("");

              setSavingModal(false);

              alert(
                amount > 0
                  ? "Tabungan berhasil ditambahkan ✅"
                  : "Tabungan berhasil dikurangi ✅"
              );

            }

            }}
            >
              Simpan
            </button>

          </div>

        </div>

      </div>
    )}

    {historyModal && (
    <div className="modal-overlay">

      <div className="modal-card">

        <h3 className="modal-title">
          📜 Riwayat Tabungan
        </h3>

      <div className="saving-history-list">
        {savingHistory.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#64748b",
              padding: "20px 0"
            }}
          >
            Belum ada riwayat tabungan
          </div>
        ) : (
          savingHistory.map(item => (

          <div
            key={item.id}
            style={{
              padding: "12px 0",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >

            <div>

              <div
                style={{
                  fontWeight: 600,
                  color:
                    item.amount >= 0
                      ? "#22c55e"
                      : "#ef4444"
                }}
              >
                {item.amount >= 0 ? "+" : "-"} Rp{" "}
                {Math.abs(item.amount).toLocaleString("id-ID")}
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "#64748b",
                  marginTop: 4
                }}
              >
                {new Date(item.created_at)
                  .toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
              </div>

            </div>

            <button
              onClick={async () => {

                const confirmDelete =
                  window.confirm(
                    "Hapus riwayat ini?"
                  );

                if (!confirmDelete)
                  return;

                await fetch(
                  `http://127.0.0.1:8000/api/savings/${item.id}`,
                  {
                    method: "DELETE"
                  }
                );

                setSavingHistory(
                  prev =>
                    prev.filter(
                      h => h.id !== item.id
                    )
                );

                setTotalSavings(
                  prev =>
                    Number(prev) - Number(item.amount)
                );

              }}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 18
              }}
            >
              🗑️
            </button>

          </div>

        ))
        )}
      </div>

        <div className="modal-actions">

          <button
            className="btn-save-saving"
            onClick={() => setHistoryModal(false)}
          >
            Tutup
          </button>

        </div>

      </div>

    </div>
  )}
    </div>
  );
}