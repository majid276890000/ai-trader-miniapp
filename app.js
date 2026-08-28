// =========================
// Telegram WebApp
// =========================
alert("AI-Trader نسخه جدید اجرا شد");

const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

function getTelegramInitData() {
  return tg?.initData || "";
}

function getTelegramUser() {
  return tg?.initDataUnsafe?.user || null;
}

console.log(
  "Telegram User:",
  getTelegramUser()
);

if (tg) {
  alert(
    tg.initData
      ? "Telegram initData دریافت شد"
      : "Telegram initData خالی است"
  );
}
const API = "https://ai-trader-backend-1-n7yv.onrender.com";

// =========================
// Helper
// =========================
function setText(id, value) {
  const el = document.getElementById(id);

  if (el) {
    el.innerText = value;
  }
}

// =========================
// Bot Status
// =========================
async function getStatus() {
  try {
    const res = await fetch(API + "/status");
    const data = await res.json();

    setText(
      "status",
      data.bot === "active"
        ? "🟢 فعال"
        : "⚪ متوقف"
    );

    setText(
      "balance",
      Number(data.balance ?? 0).toFixed(2) +
      " USDT"
    );

    setText(
      "signal",
      data.bot === "active"
        ? "معامله‌گر فعال است"
        : "معامله‌گر متوقف است"
    );

  } catch (error) {

    setText(
      "status",
      "🔴 اتصال برقرار نیست"
    );

    setText(
      "signal",
      "Backend در دسترس نیست"
    );

    console.error(
      "Status Error:",
      error
    );
  }
}

// =========================
// Start Bot
// =========================
async function startBot() {
  try {

    const res =
      await fetch(API + "/start");

    const data =
      await res.json();

    setText(
      "status",
      "🟢 فعال"
    );

    setText(
      "signal",
      data.message ||
      "ربات شروع شد"
    );

    await getStatus();

  } catch (error) {

    setText(
      "signal",
      "❌ اتصال به Backend برقرار نیست"
    );

    console.error(
      "Start Error:",
      error
    );
  }
}

// =========================
// Stop Bot
// =========================
async function stopBot() {
  try {

    const res =
      await fetch(API + "/stop");

    const data =
      await res.json();

    setText(
      "status",
      "⚪ متوقف"
    );

    setText(
      "signal",
      data.message ||
      "ربات متوقف شد"
    );

    await getStatus();

  } catch (error) {

    setText(
      "signal",
      "❌ اتصال به Backend برقرار نیست"
    );

    console.error(
      "Stop Error:",
      error
    );
  }
}

// =========================
// BTC Price
// =========================
async function getBTCPrice() {
  try {

    const res =
      await fetch(API + "/price");

    const data =
      await res.json();

    if (data.price) {

      setText(
        "btcPrice",
        Number(data.price)
          .toFixed(2) +
        " USDT"
      );
    }

  } catch (error) {

    console.error(
      "BTC Price Error:",
      error
    );
  }
}

// =========================
// Market Analysis
// =========================
async function getAnalysis() {
  try {

    const res =
      await fetch(API + "/analysis");

    const data =
      await res.json();

    if (data.error) {
      throw new Error(
        data.error
      );
    }

    setText(
      "signal",
      data.signal || "WAIT"
    );

    setText(
      "trend",
      data.trend || "NEUTRAL"
    );

    setText(
      "confidence",
      data.confidence != null
        ? data.confidence + "%"
        : "-"
    );

    setText(
      "risk",
      data.risk || "LOW"
    );

    if (data.price) {

      setText(
        "btcPrice",
        Number(data.price)
          .toFixed(2) +
        " USDT"
      );
    }

  } catch (error) {

    console.error(
      "Analysis Error:",
      error
    );
  }
}

// =========================
// Paper Trading
// =========================
async function getPaperStatus() {

  try {

    const res =
      await fetch(
        API + "/paper-status"
      );

    const data =
      await res.json();

    const position =
      Number(data.position) || 0;

    const entry =
      Number(data.entryPrice) || 0;

    const profit =
      Number(data.profit) || 0;

    setText(
      "paperPosition",
      position > 0
        ? position.toFixed(8) +
          " BTC"
        : "0 BTC"
    );

    setText(
      "paperEntryPrice",
      entry > 0
        ? entry.toFixed(2) +
          " USDT"
        : "0 USDT"
    );

    setText(
      "paperProfit",
      profit.toFixed(2) +
      " USDT"
    );

    setText(
      "paperStatus",
      position > 0
        ? "🟢 معامله باز"
        : "⚪ بدون معامله"
    );

  } catch (error) {

    console.error(
      "Paper Status Error:",
      error
    );
  }
}

// =========================
// Paper Buy
// =========================
async function paperBuy() {

  try {

    const res =
      await fetch(
        API + "/paper-buy"
      );

    const data =
      await res.json();

    if (!data.ok) {

      alert(
        data.message ||
        "خرید انجام نشد"
      );

      return;
    }

    await getPaperStatus();
    await getStatus();

  } catch (error) {

    console.error(
      "Paper Buy Error:",
      error
    );

    alert(
      "خطا در خرید آزمایشی"
    );
  }
}

// =========================
// Paper Sell
// =========================
async function paperSell() {

  try {

    const res =
      await fetch(
        API + "/paper-sell"
      );

    const data =
      await res.json();

    if (!data.ok) {

      alert(
        data.message ||
        "فروش انجام نشد"
      );

      return;
    }

    await getPaperStatus();
    await getStatus();

  } catch (error) {

    console.error(
      "Paper Sell Error:",
      error
    );

    alert(
      "خطا در فروش آزمایشی"
    );
  }
}

// =========================
// Wallet Status
// =========================
// =========================
// Wallet Status
// =========================
async function getWalletStatus() {

  try {

    const res =
      await fetch(
        API + "/wallet-status"
      );

    const data =
      await res.json();

    setText(
      "walletBalance",
      Number(data.balance ?? 0)
        .toFixed(2) +
      " USDT"
    );

    setText(
      "walletAvailableBalance",
      Number(
        data.availableBalance ?? 0
      ).toFixed(2) +
      " USDT"
    );

    setText(
      "walletLockedBalance",
      Number(
        data.lockedBalance ?? 0
      ).toFixed(2) +
      " USDT"
    );

  } catch (error) {

    console.error(
      "Wallet Status Error:",
      error
    );

    setText(
      "walletBalance",
      "خطا"
    );

    setText(
      "walletAvailableBalance",
      "خطا"
    );

    setText(
      "walletLockedBalance",
      "خطا"
    );
  }
}

// =========================
// Wallet Deposit
// =========================
async function walletDeposit() {

  try {

    const res =
      await fetch(
        API + "/wallet-deposit"
      );

    const data =
      await res.json();

    if (!data.ok) {

      alert(
        data.message ||
        "واریز انجام نشد"
      );

      return;
    }

    await getWalletStatus();
    await getWalletTransactions();

    alert(
      "100 USDT به کیف پول تستی اضافه شد."
    );

  } catch (error) {

    console.error(
      "Wallet Deposit Error:",
      error
    );

    alert(
      "خطا در واریز"
    );
  }
}

// =========================
// Wallet Withdraw
// =========================
async function walletWithdraw() {

  try {

    const res =
      await fetch(
        API + "/wallet-withdraw"
      );

    const data =
      await res.json();

    if (!data.ok) {

      alert(
        data.message ||
        "برداشت انجام نشد"
      );

      return;
    }

    await getWalletStatus();
    await getWalletTransactions();

    alert(
      "20 USDT از کیف پول تستی برداشت شد."
    );

  } catch (error) {

    console.error(
      "Wallet Withdraw Error:",
      error
    );

    alert(
      "خطا در برداشت"
    );
  }
}

// =========================
// Wallet Transactions
// =========================
async function getWalletTransactions() {

  try {

    const res =
      await fetch(
        API + "/wallet-transactions"
      );

    const data =
      await res.json();

    const list =
      document.getElementById(
        "walletTransactions"
      );

    if (!list) return;

    list.innerHTML = "";

    if (
      !data.transactions ||
      data.transactions.length === 0
    ) {

      list.innerHTML =
        "<p>هنوز تراکنشی ثبت نشده.</p>";

      return;
    }

    data.transactions
      .slice()
      .reverse()
      .forEach(tx => {

        const item =
          document.createElement(
            "div"
          );

        item.className =
          "wallet-transaction";

        const title =
          tx.type === "DEPOSIT"
            ? "🟢 واریز"
            : "🔴 برداشت";

        const amount =
          Number(tx.amount || 0)
            .toFixed(2);

        const date =
          tx.timestamp
            ? new Date(
                tx.timestamp
              ).toLocaleString(
                "fa-IR"
              )
            : "-";

        const status =
          tx.status === "PENDING"
            ? "⏳ در انتظار تأیید"
            : tx.status === "COMPLETED"
              ? "✅ تکمیل‌شده"
              : tx.status || "-";

        const confirmButton =
          tx.type === "WITHDRAW" &&
          tx.status === "PENDING"
            ? `
              <button
                class="confirm-withdraw-btn"
                onclick="confirmWalletWithdraw(${tx.id})"
              >
                ✅ تأیید برداشت
              </button>
            `
            : "";

        item.innerHTML = `
          <div>${title}</div>
          <div>${amount} USDT</div>
          <small>${status}</small>
          <small>${date}</small>
          ${confirmButton}
        `;

        list.appendChild(
          item
        );
      });

  } catch (error) {

    console.error(
      "Wallet Transactions Error:",
      error
    );
  }
}

// =========================
// Confirm Wallet Withdraw
// =========================
async function confirmWalletWithdraw(
  transactionId
) {

  try {

    const res =
      await fetch(
        API +
        "/wallet-confirm-withdraw?id=" +
        encodeURIComponent(
          transactionId
        )
      );

    const data =
      await res.json();

    if (!data.ok) {

      alert(
        data.message ||
        "تأیید برداشت انجام نشد"
      );

      return;
    }

    await getWalletStatus();
    await getWalletTransactions();

    alert(
      "برداشت با موفقیت تأیید شد."
    );

  } catch (error) {

    console.error(
      "Confirm Withdraw Error:",
      error
    );

    alert(
      "خطا در تأیید برداشت"
    );
  }
}

// =========================
// Initial Load
// =========================
async function initApp() {

  await getStatus();
  await getBTCPrice();
  await getAnalysis();

  await getPaperStatus();

  await getWalletStatus();
  await getWalletTransactions();
}

// =========================
// Refresh
// =========================
initApp();

setInterval(
  getStatus,
  15000
);

setInterval(
  getBTCPrice,
  15000
);

setInterval(
  getAnalysis,
  15000
);

setInterval(
  getPaperStatus,
  15000
);

setInterval(
  getWalletStatus,
  15000
);

setInterval(
  getWalletTransactions,
  30000
);
