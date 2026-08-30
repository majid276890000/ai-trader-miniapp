// =========================
// Telegram WebApp
// =========================

const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

function getTelegramInitData() {
  return tg?.initData || "";
}

function getTelegramAuthHeaders() {
  const initData = getTelegramInitData();

  return initData
    ? { "X-Telegram-Init-Data": initData }
    : {};
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
const API = "https://ai-trader-backend-xfyg.onrender.com";

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

    console.log("WALLET RESPONSE", res.status, res.ok);

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

    console.log("AUTO TRADE ON/OFF RESPONSE:", data);
    const debugStatus =
      document.getElementById("autoTradeStatus");

    if (debugStatus) {
      debugStatus.textContent =
        "DEBUG: " + JSON.stringify(data);
    }

    console.log(
      "AUTO TRADE RESPONSE:",
      data
    );

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

  console.log("WALLET STATUS START", API, getTelegramInitData().length);

  try {

    const res =
      await fetch(
        API + "/wallet-status",
        {
          headers: getTelegramAuthHeaders()
        }
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

    const input = prompt("مبلغ واریز تستی را وارد کنید (USDT):", "10");

    if (input === null) return;

    const amount = Number(input);

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("مبلغ واردشده معتبر نیست.");
      return;
    }

    const res = await fetch(
      API + "/wallet-deposit?amount=" + encodeURIComponent(amount),
      {
        headers: getTelegramAuthHeaders()
      }
    );

    const data = await res.json();

    if (!data.ok) {
      alert(data.message || "واریز انجام نشد");
      return;
    }

    await getWalletStatus();
    await getWalletTransactions();

    alert(amount + " USDT به کیف پول تستی اضافه شد.");

  } catch (error) {

    console.error("Wallet Deposit Error:", error);

    alert("خطا در واریز");
  }
}

// =========================
// TRON Wallet Address - TEST
// =========================
async function getTronWalletAddress() {

  try {

    const res = await fetch(
      API + "/wallet-tron-address",
      {
        headers: getTelegramAuthHeaders()
      }
    );

    const data = await res.json();

    console.log("TRON ADDRESS RESPONSE:", data);

    if (!data.ok) {
      alert(
        data.message ||
        "دریافت آدرس TRON انجام نشد"
      );
      return;
    }

    alert(
      "آدرس تستی TRC20:\n" +
      data.address
    );

  } catch (error) {

    console.error(
      "TRON ADDRESS ERROR:",
      error
    );

    alert("خطا در دریافت آدرس TRON");
  }
}

// =========================
// Wallet Withdraw
// =========================
async function walletWithdraw() {

  const amountInput = prompt("مبلغ برداشت را به USDT وارد کنید:");

  if (amountInput === null) {
    return;
  }

  const amount = Number(amountInput);

  if (!Number.isFinite(amount) || amount <= 0) {
    alert("مبلغ برداشت معتبر نیست");
    return;
  }

  try {

    const res = await fetch(
      API + "/wallet-withdraw?amount=" + encodeURIComponent(amount),
      {
        headers: getTelegramAuthHeaders()
      }
    );

    const data = await res.json();

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
      amount + " USDT برای برداشت قفل شد."
    );

  } catch (error) {

    console.error(
      "Wallet Withdraw Error:",
      error
    );

    alert("خطا در برداشت");
  }
}

// =========================
// Wallet Transactions
// =========================
async function getWalletTransactions() {

  try {

    const res =
      await fetch(
        API + "/wallet-transactions",
        {
          headers: getTelegramAuthHeaders()
        }
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
        ),
        {
          headers: getTelegramAuthHeaders()
        }
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

// =========================
// REAL TRADE BUY
// =========================
async function tradeBuy(amount) {

  try {

    const telegramInitData =
      getTelegramInitData();

    if (!telegramInitData) {
      alert("Telegram احراز هویت نشده است");
      return;
    }

    const res =
      await fetch(
        API + "/trade-buy?amount=" +
        encodeURIComponent(amount),
        {
          headers:
            getTelegramAuthHeaders()
        }
      );

    const data =
      await res.json();

    console.log(
      "TRADE BUY RESPONSE:",
      data
    );

    if (!data.ok) {
      alert(
        data.message ||
        "خرید انجام نشد"
      );
      return;
    }

    alert(
      "خرید واقعی با موفقیت انجام شد\n" +
      "مبلغ: " +
      Number(data.trade.amount)
        .toFixed(2) +
      " USDT"
    );

    await getWalletStatus();

  } catch (error) {

    console.error(
      "Trade Buy Error:",
      error
    );

    alert(
      "خطا در خرید واقعی"
    );
  }
}

// =========================
// REAL TRADE SELL
// =========================
async function tradeSell() {

  try {

    const telegramInitData =
      getTelegramInitData();

    if (!telegramInitData) {
      alert("Telegram احراز هویت نشده است");
      return;
    }

    const res =
      await fetch(
        API + "/trade-sell",
        {
          headers:
            getTelegramAuthHeaders()
        }
      );

    const data =
      await res.json();

    console.log(
      "TRADE SELL RESPONSE:",
      data
    );

    if (!data.ok) {
      alert(
        data.message ||
        "فروش انجام نشد"
      );
      return;
    }

    alert(
      "فروش واقعی با موفقیت انجام شد\n" +
      "سود/زیان: " +
      Number(data.profit ?? 0)
        .toFixed(2) +
      " USDT"
    );

    await getWalletStatus();

  } catch (error) {

    console.error(
      "Trade Sell Error:",
      error
    );

    alert(
      "خطا در فروش واقعی"
    );
  }
}

// =========================
// REAL TRADE HISTORY
// =========================
async function getTradeHistory() {

  const box =
    document.getElementById("tradeHistory");

  if (!box) return;

  try {

    const res =
      await fetch(
        API + "/trade-history",
        {
          headers:
            getTelegramAuthHeaders()
        }
      );

    const data =
      await res.json();

    if (!data.ok) {
      box.innerHTML =
        "<p>" +
        (
          data.message ||
          "دریافت تاریخچه معاملات ناموفق بود"
        ) +
        "</p>";

      return;
    }

    const trades =
      data.trades || [];

    if (trades.length === 0) {
      box.innerHTML =
        "<p>هنوز معامله‌ای ثبت نشده است.</p>";

      return;
    }

    box.innerHTML =
      trades.map(trade => {

        const side =
          trade.side === "BUY"
            ? "🟢 خرید"
            : "🔴 فروش";

        const status =
          trade.status === "OPEN"
            ? "باز"
            : "بسته";

        const profit =
          Number(trade.profit || 0);

        return `
          <div class="trade-history-item">

            <strong>
              ${side}
            </strong>

            <span>
              مبلغ:
              ${Number(trade.amount || 0).toFixed(2)}
              USDT
            </span>

            <span>
              قیمت:
              ${Number(trade.price || 0).toFixed(2)}
            </span>

            <span>
              وضعیت:
              ${status}
            </span>

            <span>
              سود/زیان:
              ${profit.toFixed(6)}
              USDT
            </span>

          </div>
        `;

      }).join("");

  } catch (error) {

    console.error(
      "Trade History Error:",
      error
    );

    box.innerHTML =
      "<p>خطا در دریافت تاریخچه معاملات</p>";
  }
}

// =========================
// LOAD TRADE HISTORY
// =========================
setTimeout(() => {
  getTradeHistory();
}, 500);

// =========================
// AUTO TRADE CONTROL
// =========================
async function getAutoTradeStatus() {

  const status =
    document.getElementById("autoTradeStatus");

  const button =
    document.getElementById("autoTradeButton");

  if (!status || !button) return;

  try {

    const res =
      await fetch(
        API + "/auto-trade",
        {
          headers:
            getTelegramAuthHeaders()
        }
      );

    const data =
      await res.json();

    if (!data.ok) {
      status.textContent =
        data.message ||
        "دریافت وضعیت ناموفق بود";

      button.textContent =
        "خطا";

      return;
    }

    if (data.enabled) {

      status.textContent =
        "🟢 معامله خودکار فعال است";

      button.textContent =
        "⛔ خاموش کردن";

    } else {

      status.textContent =
        "⚪ معامله خودکار خاموش است";

      button.textContent =
        "🤖 روشن کردن";
    }

  } catch (error) {

    console.error(
      "Auto Trade Status Error:",
      error
    );

    status.textContent =
      "خطا در اتصال به سرور";

    button.textContent =
      "تلاش دوباره";
  }
}


async function toggleAutoTrade() {

  const button =
    document.getElementById("autoTradeButton");

  if (!button) return;

  button.disabled = true;

  try {

    const currentRes =
      await fetch(
        API + "/auto-trade",
        {
          headers:
            getTelegramAuthHeaders()
        }
      );

    const current =
      await currentRes.json();

    if (!current.ok) {
      alert(
        current.message ||
        "دریافت وضعیت ناموفق بود"
      );

      return;
    }

    const action =
      current.enabled
        ? "off"
        : "on";

    const res =
      await fetch(
        API +
        "/auto-trade?action=" +
        action,
        {
          headers:
            getTelegramAuthHeaders()
        }
      );

    const data =
      await res.json();

    if (!data.ok) {
      alert(
        data.message ||
        "تغییر وضعیت ناموفق بود"
      );

      return;
    }

    await getAutoTradeStatus();

  } catch (error) {

    console.error(
      "Toggle Auto Trade Error:",
      error
    );

    alert(
      "خطا در اتصال به سرور"
    );

  } finally {

    button.disabled = false;
  }
}


setTimeout(() => {
  getAutoTradeStatus();
}, 700);
