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
console.log("TELEGRAM INIT DATA LENGTH:", getTelegramInitData().length);

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
      await fetch(API + "/start", { headers: getTelegramAuthHeaders() });

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
      await fetch(API + "/stop", { headers: getTelegramAuthHeaders() });

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
// =========================
// USDT / Toman Rate
// =========================
async function getUsdtTomanRate() {

  try {

    const res = await fetch(
      API + "/fiat-rate"
    );

    const data = await res.json();

    if (
      !data.ok ||
      !Number.isFinite(Number(data.rateToman)) ||
      Number(data.rateToman) <= 0
    ) {
      throw new Error(
        data.message || "Invalid USDT/Toman rate"
      );
    }

    return Number(data.rateToman);

  } catch (error) {

    console.error(
      "USDT TOMAN RATE ERROR:",
      error
    );

    return null;
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

    const tomanRate =
      await getUsdtTomanRate();

    if (tomanRate !== null) {

      const tomanValue =
        Number(data.balance ?? 0) *
        tomanRate;

      setText(
        "walletTomanValue",
        "ارزش تقریبی: " +
        Math.round(tomanValue).toLocaleString("fa-IR") +
        " تومان"
      );

    } else {

      setText(
        "walletTomanValue",
        "ارزش تقریبی: نرخ تومان در دسترس نیست"
      );
    }

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
// Wallet Deposit - Real TRC20
// =========================
async function walletDeposit() {

  const modal =
    document.getElementById("depositModal");

  if (!modal) {
    alert("صفحه واریز در دسترس نیست.");
    return;
  }

  modal.classList.add("open");

  const addressInput =
    document.getElementById("depositAddress");

  const statusEl =
    document.getElementById("depositAddressStatus");

  const txidInput =
    document.getElementById("depositTxid");

  const resultEl =
    document.getElementById("depositResult");

  if (addressInput) {
    addressInput.value = "";
  }

  if (txidInput) {
    txidInput.value = "";
  }

  if (resultEl) {
    resultEl.textContent = "";
  }

  if (statusEl) {
    statusEl.textContent =
      "در حال دریافت آدرس واریز...";
  }

  try {

    const res = await fetch(
      API + "/wallet-deposit-address",
      {
        headers: getTelegramAuthHeaders()
      }
    );

    const data = await res.json();

    if (!data.ok) {
      if (statusEl) {
        statusEl.textContent =
          data.message ||
          "آدرس واریز دریافت نشد";
      }
      return;
    }

    if (
      !data.depositEnabled ||
      !data.address
    ) {
      if (statusEl) {
        statusEl.textContent =
          "آدرس واریز TRC20 هنوز برای این کیف پول فعال نشده است.";
      }
      return;
    }

    if (addressInput) {
      addressInput.value =
        String(data.address).trim();
    }

    if (statusEl) {
      statusEl.textContent =
        "شبکه: " +
        (data.network || "TRC20") +
        " — آدرس آماده دریافت واریز است.";
    }

  } catch (error) {

    console.error(
      "Deposit Address Error:",
      error
    );

    if (statusEl) {
      statusEl.textContent =
        "خطا در دریافت آدرس واریز.";
    }
  }
}


// =========================
// Close Deposit Modal
// =========================
function closeDepositModal() {

  const modal =
    document.getElementById("depositModal");

  if (modal) {
    modal.classList.remove("open");
  }
}


// =========================
// Copy Deposit Address
// =========================
async function copyDepositAddress() {

  const input =
    document.getElementById("depositAddress");

  const address =
    String(input?.value || "").trim();

  if (!address) {
    alert("آدرس واریز هنوز آماده نیست.");
    return;
  }

  try {

    await navigator.clipboard.writeText(address);

    const button =
      document.getElementById(
        "copyDepositAddressBtn"
      );

    if (button) {
      const oldText = button.textContent;

      button.textContent = "کپی شد ✓";

      setTimeout(() => {
        button.textContent = oldText;
      }, 1800);
    }

  } catch (error) {

    console.error(
      "Copy Deposit Address Error:",
      error
    );

    alert(
      "کپی خودکار انجام نشد. آدرس را دستی کپی کنید."
    );
  }
}


// =========================
// Submit Real TRC20 Deposit
// =========================
async function submitDeposit() {

  const txidInput =
    document.getElementById("depositTxid");

  const submitButton =
    document.getElementById("submitDepositBtn");

  const resultEl =
    document.getElementById("depositResult");

  const txid =
    String(txidInput?.value || "").trim();

  if (!/^[a-fA-F0-9]{64}$/.test(txid)) {

    if (resultEl) {
      resultEl.textContent =
        "TXID واردشده معتبر نیست.";
    }

    return;
  }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent =
      "در حال بررسی بلاکچین...";
  }

  if (resultEl) {
    resultEl.textContent =
      "در حال بررسی تراکنش روی شبکه TRON...";
  }

  try {

    const res = await fetch(
      API + "/wallet-deposit",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getTelegramAuthHeaders()
        },
        body: JSON.stringify({
          txid: txid
        })
      }
    );

    const data = await res.json();

    if (!data.ok) {

      if (resultEl) {
        resultEl.textContent =
          data.message ||
          "واریز تأیید نشد.";
      }

      return;
    }

    if (resultEl) {
      resultEl.textContent =
        "واریز با موفقیت تأیید شد: " +
        data.amount +
        " USDT";
    }

    if (txidInput) {
      txidInput.value = "";
    }

    await getWalletStatus();
    await getWalletTransactions();

  } catch (error) {

    console.error(
      "Submit Deposit Error:",
      error
    );

    if (resultEl) {
      resultEl.textContent =
        "خطا در ارتباط با سرور.";
    }

  } finally {

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent =
        "بررسی و ثبت واریز";
    }
  }
}


// =========================
// TRON Withdrawal Address
// =========================


async function saveTronWithdrawalAddress() {

  const input = document.getElementById("withdrawAddress");
  const statusEl = document.getElementById("tronAddressStatus");
  const button = document.getElementById("saveTronAddressBtn");

  const address = String(input?.value || "").trim();

  if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) {
    alert("آدرس TRC20 معتبر نیست");
    return;
  }

  try {

    if (button) {
      button.disabled = true;
      button.textContent = "در حال ثبت...";
    }

    const res = await fetch(
      API + "/wallet-tron-address",
      {
        method: "POST",
        headers: {
          ...getTelegramAuthHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          address: address,
          network: "TRC20"
        })
      }
    );

    const data = await res.json();

    console.log("TRON ADDRESS SAVE RESPONSE:", data);

    if (!data.ok) {
      alert(
        data.message ||
        "ثبت آدرس TRC20 انجام نشد"
      );
      return;
    }

    if (statusEl) {
      statusEl.textContent =
        "وضعیت آدرس: در انتظار تأیید مدیر";
    }

    alert(
      "آدرس TRC20 با موفقیت ثبت شد.\n" +
      "پس از تأیید مدیر، برداشت فعال می‌شود."
    );

  } catch (error) {

    console.error(
      "TRON ADDRESS SAVE ERROR:",
      error
    );

    alert("خطا در ثبت آدرس TRC20");

  } finally {

    if (button) {
      button.disabled = false;
      button.textContent = "ثبت آدرس برای تأیید";
    }
  }
}

// =========================
// Professional Wallet Withdraw
// =========================

let selectedWithdrawMethod = "usdt";

async function loadTronWithdrawalAddress() {

  const input = document.getElementById("withdrawAddress");
  const statusEl = document.getElementById("tronAddressStatus");
  const button = document.getElementById("saveTronAddressBtn");

  try {

    if (statusEl) {
      statusEl.textContent =
        "وضعیت آدرس: در حال بررسی...";
    }

    const res = await fetch(
      API + "/wallet-tron-address",
      {
        headers: getTelegramAuthHeaders()
      }
    );

    const data = await res.json();

    console.log(
      "TRON ADDRESS STATUS RESPONSE:",
      data
    );

    if (!data.ok) {
      if (statusEl) {
        statusEl.textContent =
          data.message ||
          window.aiTraderWithdrawTranslate("خطا در دریافت وضعیت آدرس");
      }
      return;
    }

    if (input) {
      input.value = data.address || "";
    }

    const status =
      data.addressStatus || "PENDING";

    if (statusEl) {

      if (status === "APPROVED") {
        statusEl.textContent =
          "وضعیت آدرس: تأیید شده ✓";
      } else if (status === "REJECTED") {
        statusEl.textContent =
          "وضعیت آدرس: رد شده — آدرس جدید ثبت کنید";
      } else {
        statusEl.textContent =
          "وضعیت آدرس: در انتظار تأیید مدیر";
      }
    }

    if (button) {

      if (status === "APPROVED") {
        button.textContent =
          "تغییر آدرس";
      } else {
        button.textContent =
          "ثبت آدرس برای تأیید";
      }
    }

  } catch (error) {

    console.error(
      "LOAD TRON ADDRESS ERROR:",
      error
    );

    if (statusEl) {
      statusEl.textContent =
        window.aiTraderWithdrawTranslate("خطا در دریافت وضعیت آدرس");
    }
  }
}

function openWithdrawModal() {
  const modal = document.getElementById("withdrawModal");

  if (!modal) {
    alert("پنجره برداشت پیدا نشد");
    return;
  }

  selectedWithdrawMethod = "usdt";
  selectWithdrawMethod("usdt");

  const availableText =
    document.getElementById("walletAvailableBalance")?.textContent || "0";

  const available = Number(
    availableText.replace(/[^\d.-]/g, "")
  );

  const balanceElement =
    document.getElementById("withdrawAvailableBalance");

  if (balanceElement) {
    balanceElement.textContent =
      (Number.isFinite(available) ? available : 0) + " USDT";
  }

  const amount =
    document.getElementById("withdrawAmount");

  if (amount) {
    amount.value = "";
  }

  const fiatAmount =
    document.getElementById("fiatWithdrawAmount");

  if (fiatAmount) {
    fiatAmount.value = "";
  }

  const holder =
    document.getElementById("withdrawAccountHolder");

  if (holder) {
    holder.value = "";
  }

  const iban =
    document.getElementById("withdrawIban");

  if (iban) {
    iban.value = "";
  }

  updateWithdrawReceiveAmount();

  modal.classList.add("open");

  loadTronWithdrawalAddress();
}

function closeWithdrawModal() {
  const modal =
    document.getElementById("withdrawModal");

  if (modal) {
    modal.classList.remove("open");
  }
}

function selectWithdrawMethod(method) {
  selectedWithdrawMethod = method;

  document
    .querySelectorAll(".withdraw-method")
    .forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.method === method
      );
    });

  const usdtForm =
    document.getElementById("withdrawUsdtForm");

  const fiatForm =
    document.getElementById("withdrawFiatForm");

  if (usdtForm) {
    usdtForm.style.display =
      method === "usdt" ? "" : "none";
  }

  if (fiatForm) {
    fiatForm.style.display =
      method === "fiat" ? "" : "none";
  }
}

function getAvailableWithdrawBalance() {
  const text =
    document.getElementById(
      "walletAvailableBalance"
    )?.textContent || "0";

  const value = Number(
    text.replace(/[^\d.-]/g, "")
  );

  return Number.isFinite(value) ? value : 0;
}

function setMaxWithdrawAmount() {
  const input =
    document.getElementById("withdrawAmount");

  if (!input) {
    return;
  }

  input.value =
    getAvailableWithdrawBalance()
      .toFixed(8)
      .replace(/\.?0+$/, "");

  updateWithdrawReceiveAmount();
}

function updateWithdrawReceiveAmount() {
  const input =
    document.getElementById("withdrawAmount");

  const output =
    document.getElementById("withdrawReceiveAmount");

  if (!input || !output) {
    return;
  }

  const amount = Number(input.value);

  output.textContent =
    Number.isFinite(amount) && amount > 0
      ? amount.toFixed(8).replace(/\.?0+$/, "") + " USDT"
      : "0 USDT";
}

async function submitProfessionalWithdraw() {

  // =========================
  // Fiat Withdrawal
  // =========================

  if (selectedWithdrawMethod === "fiat") {

    const fiatInput =
      document.getElementById("fiatWithdrawAmount");

    const holderInput =
      document.getElementById("withdrawAccountHolder");

    const ibanInput =
      document.getElementById("withdrawIban");

    const fiatAmount =
      Number(fiatInput?.value);

    const accountHolder =
      (holderInput?.value || "").trim();

    const iban =
      (ibanInput?.value || "")
        .replace(/\s+/g, "")
        .toUpperCase();

    if (
      !Number.isFinite(fiatAmount) ||
      fiatAmount <= 0
    ) {
      alert("مبلغ برداشت ریالی معتبر نیست");
      return;
    }

    if (
      accountHolder.length < 2 ||
      accountHolder.length > 100
    ) {
      alert("نام صاحب حساب معتبر نیست");
      return;
    }

    if (!/^IR\d{24}$/.test(iban)) {
      alert("شماره شبا معتبر نیست");
      return;
    }

    try {

      const res = await fetch(
        API + "/wallet-withdraw-fiat",
        {
          method: "POST",
          headers: {
            ...getTelegramAuthHeaders(),
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            fiatAmount,
            accountHolder,
            iban
          })
        }
      );

      const data = await res.json();

      if (!data.ok) {
        alert(
          data.message ||
          "درخواست برداشت ریالی انجام نشد"
        );
        return;
      }

      await getWalletStatus();
      await getWalletTransactions();

      closeWithdrawModal();

      alert(
        "درخواست برداشت با موفقیت ثبت شد.\n\n" +
        "مبلغ: " +
        Number(data.fiatAmount).toLocaleString("fa-IR") +
        " تومان\n" +
        "معادل: " +
        data.usdtAmount +
        " USDT\n" +
        "نرخ: " +
        Number(data.exchangeRate).toLocaleString("fa-IR") +
        " تومان\n\n" +
        "وضعیت: در انتظار بررسی"
      );

    } catch (error) {

      console.error(
        "Fiat Withdraw Error:",
        error
      );

      alert(
        "خطا در ثبت درخواست برداشت ریالی"
      );
    }

    return;
  }

  // =========================
  // USDT Withdrawal
  // =========================

  const amountInput =
    document.getElementById("withdrawAmount");

  const addressInput =
    document.getElementById("withdrawAddress");

  const statusEl =
    document.getElementById("tronAddressStatus");

  const destinationAddress =
    (addressInput?.value || "").trim();

  if (!destinationAddress) {
    alert(window.aiTraderWithdrawTranslate("ابتدا آدرس TRC20 خود را ثبت کنید"));
    return;
  }

  if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(destinationAddress)) {
    alert(window.aiTraderWithdrawTranslate("آدرس TRC20 معتبر نیست"));
    return;
  }

  const amount =
    Number(amountInput?.value);

  const available =
    getAvailableWithdrawBalance();

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    alert(window.aiTraderWithdrawTranslate("مبلغ برداشت معتبر نیست"));
    return;
  }

  if (amount > available) {
    alert(window.aiTraderWithdrawTranslate("مبلغ برداشت بیشتر از موجودی قابل برداشت است"));
    return;
  }

  try {

    const addressRes = await fetch(
      API + "/wallet-tron-address",
      {
        headers: getTelegramAuthHeaders()
      }
    );

    const addressData =
      await addressRes.json();

    console.log(
      "TRON ADDRESS CHECK BEFORE WITHDRAW:",
      addressData
    );

    if (!addressData.ok) {
      alert(
        addressData.message ||
        window.aiTraderWithdrawTranslate("بررسی آدرس TRC20 انجام نشد")
      );
      return;
    }

    const approvedAddress =
      String(addressData.address || "").trim();

    const addressStatus =
      addressData.addressStatus || "PENDING";

    if (addressStatus !== "APPROVED") {

      if (statusEl) {
        statusEl.textContent =
          addressStatus === "REJECTED"
            ? window.aiTraderWithdrawTranslate("وضعیت آدرس: رد شده — آدرس جدید ثبت کنید")
            : window.aiTraderWithdrawTranslate("وضعیت آدرس: در انتظار تأیید مدیر");
      }

      alert(
        addressStatus === "REJECTED"
          ? window.aiTraderWithdrawTranslate("آدرس TRC20 شما رد شده است. لطفاً آدرس جدید ثبت کنید.")
          : window.aiTraderWithdrawTranslate("آدرس TRC20 هنوز توسط مدیر تأیید نشده است.")
      );

      return;
    }

    if (approvedAddress !== destinationAddress) {
      alert(
        window.aiTraderWithdrawTranslate("آدرس واردشده با آدرس تأییدشده مطابقت ندارد.")
      );
      return;
    }

    const res = await fetch(
      API +
      "/wallet-withdraw?amount=" +
      encodeURIComponent(amount) +
      "&address=" +
      encodeURIComponent(destinationAddress),
      {
        method: "POST",
        headers: getTelegramAuthHeaders()
      }
    );

    const data =
      await res.json();

    if (!data.ok) {
      alert(
        data.message ||
        window.aiTraderWithdrawTranslate("برداشت انجام نشد")
      );
      return;
    }

    await getWalletStatus();
    await getWalletTransactions();

    closeWithdrawModal();

    alert(
      window.aiTraderWithdrawTranslate("USDT_WITHDRAW_LOCKED", amount)
    );

  } catch (error) {

    console.error(
      "Wallet Withdraw Error:",
      error
    );

    alert(window.aiTraderWithdrawTranslate("خطا در برداشت"));
  }
}


window.aiTraderWithdrawTranslate = function (text, amount) {
  const lang = localStorage.getItem("aiTraderLanguage") || "fa";
  const messages = {
    "ابتدا آدرس TRC20 خود را ثبت کنید": {
      en: "Please register your TRC20 address first.",
      ar: "يرجى تسجيل عنوان TRC20 أولاً.",
      ru: "Сначала зарегистрируйте адрес TRC20.",
      tr: "Önce TRC20 adresinizi kaydedin."
    },
    "آدرس TRC20 معتبر نیست": {
      en: "The TRC20 address is invalid.",
      ar: "عنوان TRC20 غير صالح.",
      ru: "Недействительный адрес TRC20.",
      tr: "TRC20 adresi geçersiz."
    },
    "مبلغ برداشت معتبر نیست": {
      en: "The withdrawal amount is invalid.",
      ar: "مبلغ السحب غير صالح.",
      ru: "Недопустимая сумма вывода.",
      tr: "Çekim tutarı geçersiz."
    },
    "مبلغ برداشت بیشتر از موجودی قابل برداشت است": {
      en: "The withdrawal amount exceeds your available balance.",
      ar: "مبلغ السحب يتجاوز الرصيد المتاح.",
      ru: "Сумма вывода превышает доступный баланс.",
      tr: "Çekim tutarı kullanılabilir bakiyenizi aşıyor."
    },
    "بررسی آدرس TRC20 انجام نشد": {
      en: "TRC20 address verification failed.",
      ar: "فشل التحقق من عنوان TRC20.",
      ru: "Не удалось проверить адрес TRC20.",
      tr: "TRC20 adresi doğrulanamadı."
    },
    "وضعیت آدرس: رد شده — آدرس جدید ثبت کنید": {
      en: "Address rejected — register a new address.",
      ar: "تم رفض العنوان — سجّل عنواناً جديداً.",
      ru: "Адрес отклонён — зарегистрируйте новый адрес.",
      tr: "Adres reddedildi — yeni bir adres kaydedin."
    },
    "وضعیت آدرس: در انتظار تأیید مدیر": {
      en: "Address pending admin approval.",
      ar: "العنوان بانتظار موافقة المسؤول.",
      ru: "Адрес ожидает подтверждения администратора.",
      tr: "Adres yönetici onayı bekliyor."
    },
    "آدرس TRC20 شما رد شده است. لطفاً آدرس جدید ثبت کنید.": {
      en: "Your TRC20 address was rejected. Please register a new address.",
      ar: "تم رفض عنوان TRC20 الخاص بك. يرجى تسجيل عنوان جديد.",
      ru: "Ваш адрес TRC20 отклонён. Зарегистрируйте новый адрес.",
      tr: "TRC20 adresiniz reddedildi. Lütfen yeni bir adres kaydedin."
    },
    "آدرس TRC20 هنوز توسط مدیر تأیید نشده است.": {
      en: "Your TRC20 address has not yet been approved by the admin.",
      ar: "لم يوافق المسؤول على عنوان TRC20 بعد.",
      ru: "Администратор ещё не подтвердил ваш адрес TRC20.",
      tr: "TRC20 adresiniz henüz yönetici tarafından onaylanmadı."
    },
    "آدرس واردشده با آدرس تأییدشده مطابقت ندارد.": {
      en: "The entered address does not match the approved address.",
      ar: "العنوان المدخل لا يطابق العنوان المعتمد.",
      ru: "Введённый адрес не совпадает с подтверждённым.",
      tr: "Girilen adres onaylanan adresle eşleşmiyor."
    },
    "برداشت انجام نشد": {
      en: "Withdrawal failed.",
      ar: "فشلت عملية السحب.",
      ru: "Не удалось выполнить вывод.",
      tr: "Çekim başarısız oldu."
    },
    "خطا در دریافت وضعیت آدرس": {
      en: "Error retrieving address status.",
      ar: "خطأ في جلب حالة العنوان.",
      ru: "Ошибка получения статуса адреса.",
      tr: "Adres durumu alınırken hata oluştu."
    },
    "فیلد سرمایه معاملاتی پیدا نشد": {
      en: "Trading capital field not found.",
      ar: "لم يتم العثور على حقل رأس المال للتداول.",
      ru: "Поле торгового капитала не найдено.",
      tr: "İşlem sermayesi alanı bulunamadı."
    },
    "سرمایه معاملاتی باید بین 2 تا 1000 USDT باشد": {
      en: "Trading capital must be between 2 and 1000 USDT.",
      ar: "يجب أن يكون رأس المال للتداول بين 2 و1000 USDT.",
      ru: "Торговый капитал должен составлять от 2 до 1000 USDT.",
      tr: "İşlem sermayesi 2 ile 1000 USDT arasında olmalıdır."
    },
    "خطا در ذخیره سرمایه معاملاتی": {
      en: "Error saving trading capital.",
      ar: "حدث خطأ أثناء حفظ رأس المال للتداول.",
      ru: "Ошибка сохранения торгового капитала.",
      tr: "İşlem sermayesi kaydedilirken hata oluştu."
    },
    "خطا در تغییر حالت معامله": {
      en: "Error changing trading mode.",
      ar: "حدث خطأ أثناء تغيير وضع التداول.",
      ru: "Ошибка изменения режима торговли.",
      tr: "İşlem modu değiştirilirken hata oluştu."
    },
    "خطا در ذخیره حالت معامله": {
      en: "Error saving trading mode.",
      ar: "حدث خطأ أثناء حفظ وضع التداول.",
      ru: "Ошибка сохранения режима торговли.",
      tr: "İşlem modu kaydedilirken hata oluştu."
    },
    "خطا در برداشت": {
      en: "Withdrawal error.",
      ar: "حدث خطأ أثناء السحب.",
      ru: "Ошибка при выводе средств.",
      tr: "Çekim sırasında hata oluştu."
    }
  };

  if (text === "USDT_WITHDRAW_LOCKED") {
    const templates = {
      en: `${amount} USDT has been locked for withdrawal.`,
      ar: `تم حجز ${amount} USDT للسحب.`,
      ru: `${amount} USDT заблокировано для вывода.`,
      tr: `${amount} USDT çekim için kilitlendi.`
    };
    return templates[lang] || `${amount} USDT برای برداشت قفل شد.`;
  }

  return messages[text]?.[lang] || text;
};

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

        const confirmButton = "";

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
// Initial Load
// =========================
function openTradingModeModal() {
  const modal = document.getElementById("tradingModeModal");
  if (modal) modal.style.display = "flex";
}

function closeTradingModeModal() {
  const modal = document.getElementById("tradingModeModal");
  if (modal) modal.style.display = "none";
}

function openTradingCapitalModal() {
  const modal = document.getElementById("tradingCapitalModal");
  if (modal) modal.style.display = "flex";
}

function closeTradingCapitalModal() {
  const modal = document.getElementById("tradingCapitalModal");
  if (modal) modal.style.display = "none";
}

async function loadTradingCapital() {
  try {
    const res = await fetch(API + "/trading-capital", {
      headers: getTelegramAuthHeaders()
    });
    const data = await res.json();

    if (data.ok) {
      setText(
        "tradingCapitalValue",
        Number(data.amount).toFixed(2) + " USDT"
      );

      const input = document.getElementById("tradingCapitalInput");
      if (input) input.value = Number(data.amount);
    }
  } catch (error) {
    console.error("Trading Capital Load Error:", error);
  }
}

async function saveTradingCapital() {
  const input = document.getElementById("tradingCapitalInput");

  if (!input) {
    alert(window.aiTraderWithdrawTranslate("فیلد سرمایه معاملاتی پیدا نشد"));
    return;
  }

  const amount = Number(input.value);

  if (!Number.isFinite(amount) || amount < 2 || amount > 1000) {
    alert(window.aiTraderWithdrawTranslate("سرمایه معاملاتی باید بین 2 تا 1000 USDT باشد"));
    return;
  }

  try {
    const res = await fetch(
      API + "/trading-capital?amount=" + encodeURIComponent(amount),
      {
        headers: getTelegramAuthHeaders()
      }
    );

    const data = await res.json();

    if (!data.ok) {
      alert(window.aiTraderWithdrawTranslate(data.message || "خطا در ذخیره سرمایه معاملاتی"));
      return;
    }

    setText(
      "tradingCapitalValue",
      Number(data.amount).toFixed(2) + " USDT"
    );

    closeTradingCapitalModal();

  } catch (error) {
    console.error("Trading Capital Save Error:", error);
    alert(window.aiTraderWithdrawTranslate("خطا در ذخیره سرمایه معاملاتی"));
  }
}

async function loadTradingMode() {
  try {
    const res = await fetch(API + "/trading-mode", {
      headers: getTelegramAuthHeaders()
    });
    const data = await res.json();

    if (data.ok) {
      const labels = {
        LOW: window.aiTraderWithdrawTranslate("کم‌ریسک"),
        MEDIUM: window.aiTraderWithdrawTranslate("متوسط"),
        HIGH: window.aiTraderWithdrawTranslate("پرریسک")
      };
      setText("tradingModeValue", labels[data.mode] || "کم‌ریسک");
    }
  } catch (error) {
    console.error("Trading Mode Load Error:", error);
  }
}

async function selectTradingMode(mode) {
  try {
    const res = await fetch(API + "/trading-mode?mode=" + encodeURIComponent(mode), {
      headers: getTelegramAuthHeaders()
    });
    const data = await res.json();

    if (!data.ok) {
      alert(window.aiTraderWithdrawTranslate(data.message || "خطا در تغییر حالت معامله"));
      return;
    }

    const labels = {
      LOW: window.aiTraderWithdrawTranslate("کم‌ریسک"),
      MEDIUM: window.aiTraderWithdrawTranslate("متوسط"),
      HIGH: window.aiTraderWithdrawTranslate("پرریسک")
    };

    setText("tradingModeValue", labels[data.mode] || "کم‌ریسک");
    closeTradingModeModal();
  } catch (error) {
    console.error("Trading Mode Save Error:", error);
    alert(window.aiTraderWithdrawTranslate("خطا در ذخیره حالت معامله"));
  }
}

window.selectTradingMode = selectTradingMode;

async function initApp() {

  await getStatus();
  await getBTCPrice();
  await getAnalysis();
  await loadTradingMode();
  await loadTradingCapital();


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
      "خرید با موفقیت ثبت شد\n" +
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
      "خطا در ثبت خرید"
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
      "فروش با موفقیت ثبت شد\n" +
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
      "خطا در ثبت فروش"
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

    setText(
      "todayProfit",
      Number(data.todayProfit ?? 0).toFixed(2) + " USDT"
    );

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

  console.log("TOGGLE AUTO TRADE CLICKED");

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

/* =====================================================
   ADMIN TRON ADDRESS PANEL
   ===================================================== */

let adminPanelAuthorized = false;

function toggleAdminPanel() {
  const panel = document.getElementById("adminTronPanel");
  const btn = document.getElementById("adminPanelToggleBtn");
  if (!adminPanelAuthorized || !panel || !btn) return;
  const isOpen = panel.style.display !== "none";
  panel.style.display = isOpen ? "none" : "block";
  btn.textContent = isOpen ? "ورود مدیر" : "بستن پنل مدیریت";
}

async function loadAdminTronPanel() {

  const panel =
    document.getElementById("adminTronPanel");

  const statusEl =
    document.getElementById("adminTronStatus");

  const listEl =
    document.getElementById("adminTronPendingList");

  if (!panel || !statusEl || !listEl) {
    return;
  }

  try {

    const res = await fetch(
      API + "/admin/wallet-tron-pending",
      {
        headers: getTelegramAuthHeaders()
      }
    );

    const data = await res.json();

    console.log(
      "ADMIN TRON PENDING RESPONSE:",
      data
    );

    if (!data.ok) {
      adminPanelAuthorized = false;
      panel.style.display = "none";
      const btn = document.getElementById("adminPanelToggleBtn");
      if (btn) btn.style.display = "none";
      return;
    }

    adminPanelAuthorized = true;
    const btn = document.getElementById("adminPanelToggleBtn");
    if (btn) {
      btn.style.display = "block";
      btn.textContent = "ورود مدیر";
    }
    panel.style.display = "none";

    if (!data.wallets || data.wallets.length === 0) {

      statusEl.textContent =
        "درخواست در انتظار تأیید وجود ندارد.";

      listEl.innerHTML = "";

      return;
    }

    statusEl.textContent =
      data.count +
      " درخواست در انتظار تأیید";

    listEl.innerHTML =
      data.wallets.map(wallet => {

        const userId =
          String(wallet.user_id || "");

        const address =
          String(wallet.tron_address || "");

        return `
          <div
            class="card"
            style="margin-top:12px;"
          >

            <div>
              <strong>کاربر #${userId}</strong>
            </div>

            <div
              style="
                margin-top:8px;
                word-break:break-all;
                direction:ltr;
                text-align:left;
              "
            >
              ${address}
            </div>

            <div
              style="
                margin-top:6px;
                font-size:13px;
                opacity:.75;
              "
            >
              شبکه: TRC20
            </div>

            <div
              style="
                display:flex;
                gap:8px;
                margin-top:12px;
              "
            >

              <button
                type="button"
                onclick="approveAdminTronAddress(${userId})"
              >
                ✓ تأیید
              </button>

              <button
                type="button"
                onclick="rejectAdminTronAddress(${userId})"
              >
                ✕ رد
              </button>

            </div>

          </div>
        `;
      }).join("");

  } catch (error) {

    console.error(
      "ADMIN TRON PANEL ERROR:",
      error
    );

    adminPanelAuthorized = false;
    panel.style.display = "none";
    const btn = document.getElementById("adminPanelToggleBtn");
    if (btn) btn.style.display = "none";
  }
}


async function adminTronAddressAction(
  action,
  userId
) {

  try {

    const res = await fetch(
      API +
      "/admin/wallet-tron-" +
      action,
      {
        method: "POST",
        headers: {
          ...getTelegramAuthHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: Number(userId)
        })
      }
    );

    const data =
      await res.json();

    console.log(
      "ADMIN TRON ACTION RESPONSE:",
      data
    );

    if (!data.ok) {

      alert(
        data.message ||
        "عملیات انجام نشد"
      );

      return;
    }

    alert(
      action === "approve"
        ? "آدرس TRC20 تأیید شد."
        : "آدرس TRC20 رد شد."
    );

    await loadAdminTronPanel();

  } catch (error) {

    console.error(
      "ADMIN TRON ACTION ERROR:",
      error
    );

    alert(
      "خطا در انجام عملیات"
    );
  }
}


async function approveAdminTronAddress(userId) {

  if (
    !confirm(
      "آیا از تأیید این آدرس TRC20 مطمئن هستید؟"
    )
  ) {
    return;
  }

  await adminTronAddressAction(
    "approve",
    userId
  );
}


async function rejectAdminTronAddress(userId) {

  if (
    !confirm(
      "آیا از رد این آدرس TRC20 مطمئن هستید؟"
    )
  ) {
    return;
  }

  await adminTronAddressAction(
    "reject",
    userId
  );
}



/* =====================================================
   ADMIN WITHDRAWAL PROCESSING PANEL
===================================================== */
async function loadAdminWithdrawPanel() {
  const panel = document.getElementById("adminTronPanel");
  if (!panel) return;

  let section = document.getElementById("adminWithdrawPanel");

  if (!section) {
    section = document.createElement("div");
    section.id = "adminWithdrawPanel";
    section.style.marginTop = "20px";
    panel.appendChild(section);
  }

  section.innerHTML = `
    <div class="section-heading">
      <div>
        <div class="eyebrow">WITHDRAWALS</div>
        <h2>مدیریت برداشت‌ها</h2>
      </div>
    </div>
    <div id="adminWithdrawStatus">در حال بررسی برداشت‌ها...</div>
    <button
      type="button"
      style="margin-top:12px;"
      onclick="verifyAdminTronSigner()"
    >
      بررسی امضاکننده خزانه
    </button>
    <div id="adminWithdrawPendingList" style="margin-top:12px;"></div>
    <div id="adminWithdrawProcessingList" style="margin-top:12px;"></div>
    <div id="adminWithdrawFiatList" style="margin-top:20px;"></div>
  `;

  try {
    const headers = getTelegramAuthHeaders();

    const [pendingRes, processingRes] = await Promise.all([
      fetch(API + "/admin/wallet-withdraw-pending", { headers }),
      fetch(API + "/admin/wallet-withdraw-processing", { headers })
    ]);

    const pendingData = await pendingRes.json();
    const processingData = await processingRes.json();

    let fiatWithdrawals = [];
    let fiatError = "";
    try {
      const fiatRes = await fetch(API + "/admin/wallet-withdraw-fiat-pending", { headers });
      const fiatData = await fiatRes.json();
      if (fiatRes.ok && fiatData.ok) {
        fiatWithdrawals = fiatData.withdrawals || [];
      } else {
        fiatError = fiatData.message || "خطا در دریافت برداشت‌های ریالی";
      }
    } catch (error) {
      fiatError = "ارتباط با بخش برداشت ریالی برقرار نشد";
    }

    if (!pendingData.ok || !processingData.ok) {
      section.innerHTML = "";
      return;
    }

    const statusEl = document.getElementById("adminWithdrawStatus");
    const pendingListEl = document.getElementById("adminWithdrawPendingList");
    const processingListEl = document.getElementById("adminWithdrawProcessingList");

    const pendingWithdrawals = pendingData.withdrawals || [];
    const processingWithdrawals = processingData.withdrawals || [];

    statusEl.textContent =
      pendingWithdrawals.length +
      " در انتظار پردازش — " +
      processingWithdrawals.length +
      " در حال پردازش — " +
      fiatWithdrawals.length +
      " برداشت ریالی در انتظار";

    pendingListEl.innerHTML = `
      <div class="eyebrow">PENDING</div>
      ${
        pendingWithdrawals.length === 0
          ? '<div style="margin-top:8px;opacity:.75;">برداشت در انتظار پردازش وجود ندارد.</div>'
          : pendingWithdrawals.map(withdrawal => {
              const id = Number(withdrawal.id);
              const userId = String(withdrawal.user_id || "");
              const amount = String(withdrawal.amount || "0");
              const address = String(withdrawal.destination_address || "");

              return `
                <div class="card" style="margin-top:12px;">
                  <div><strong>برداشت #${id}</strong></div>
                  <div style="margin-top:8px;">
                    کاربر #${userId} — ${amount} ${withdrawal.currency || "USDT"}
                  </div>
                  <div style="margin-top:8px;word-break:break-all;direction:ltr;text-align:left;">
                    ${address}
                  </div>
                  <div style="margin-top:6px;font-size:13px;opacity:.75;">
                    شبکه: TRC20
                  </div>
                  <button
                    type="button"
                    style="margin-top:12px;"
                    onclick="processAdminWithdrawal(${id})"
                  >
                    شروع پردازش
                  </button>
                </div>
              `;
            }).join("")
      }
    `;

    processingListEl.innerHTML = `
      <div class="eyebrow">PROCESSING</div>
      ${
        processingWithdrawals.length === 0
          ? '<div style="margin-top:8px;opacity:.75;">برداشت در حال پردازش وجود ندارد.</div>'
          : processingWithdrawals.map(withdrawal => {
              const id = Number(withdrawal.id);
              const userId = String(withdrawal.user_id || "");
              const amount = String(withdrawal.amount || "0");
              const address = String(withdrawal.destination_address || "");

              return `
                <div class="card" style="margin-top:12px;">
                  <div><strong>برداشت #${id}</strong></div>
                  <div style="margin-top:8px;">
                    کاربر #${userId} — ${amount} ${withdrawal.currency || "USDT"}
                  </div>
                  <div style="margin-top:8px;word-break:break-all;direction:ltr;text-align:left;">
                    ${address}
                  </div>
                  <div style="margin-top:6px;font-size:13px;opacity:.75;">
                    شبکه: TRC20
                  </div>

                  <div style="margin-top:12px;font-size:13px;">
                  <button type="button" style="margin-top:12px;" onclick="failAdminWithdrawal(${id})">رد برداشت و آزادسازی موجودی</button>
                    ${
                      withdrawal.blockchain_status === "CREATED"
                        ? "🟡 مرحله ۱ از ۳ — آماده ساخت تراکنش"
                        : withdrawal.blockchain_status === "BUILT"
                        ? "🟡 مرحله ۲ از ۳ — آماده امضا"
                        : withdrawal.blockchain_status === "SIGNED"
                        ? "🟠 مرحله ۳ از ۳ — آماده ارسال به TRON"
                        : withdrawal.blockchain_status === "BROADCASTED"
                        ? "🟢 تراکنش به شبکه TRON ارسال شد"
                        : "وضعیت: " + (withdrawal.blockchain_status || "نامشخص")
                    }
                  </div>

                  ${
                    withdrawal.blockchain_status === "CREATED"
                      ? `
                        <button
                          type="button"
                          style="margin-top:12px;"
                          onclick="buildAdminWithdrawal(${id})"
                        >
                          ① ساخت تراکنش
                        </button>
                      `
                      : ""
                  }

                  ${
                    withdrawal.blockchain_status === "BUILT"
                      ? `
                        <button
                          type="button"
                          style="margin-top:8px;"
                          onclick="signAdminWithdrawal(${id})"
                        >
                          ② امضای تراکنش
                        </button>
                      `
                      : ""
                  }

                  ${
                    withdrawal.blockchain_status === "SIGNED"
                      ? `
                        <button
                          type="button"
                          style="margin-top:8px;"
                          onclick="broadcastAdminWithdrawal(${id})"
                        >
                          ③ ارسال به شبکه TRON
                        </button>
                      `
                      : ""
                  }
                </div>
              `;
            }).join("")
      }
    `;

    const fiatListEl = document.getElementById("adminWithdrawFiatList");
    const safe = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[ch]);

    fiatListEl.innerHTML = `
      <div class="section-heading">
        <div>
          <div class="eyebrow">FIAT WITHDRAWALS</div>
          <h2>برداشت ریالی با شبا</h2>
        </div>
      </div>
      ${fiatError ? `<div style="margin-top:8px;color:#c66;">${safe(fiatError)}</div>` : ""}
      ${
        fiatWithdrawals.length === 0
          ? '<div style="margin-top:8px;opacity:.75;">برداشت ریالی در انتظار وجود ندارد.</div>'
          : fiatWithdrawals.map(withdrawal => {
              const id = Number(withdrawal.id);
              return `
                <div class="card" style="margin-top:12px;">
                  <div><strong>درخواست ریالی #${id}</strong></div>
                  <div style="margin-top:8px;">کاربر #${safe(withdrawal.user_id)}</div>
                  <div style="margin-top:8px;">
                    مبلغ واریزی: <strong>${safe(withdrawal.fiat_amount)} ریال</strong>
                  </div>
                  <div style="margin-top:6px;">
                    مبلغ کسر از کیف پول: ${safe(withdrawal.amount)} ${safe(withdrawal.currency || "USDT")}
                  </div>
                  <div style="margin-top:6px;">صاحب حساب: ${safe(withdrawal.account_holder)}</div>
                  <div style="margin-top:6px;direction:ltr;text-align:left;word-break:break-all;">
                    ${safe(withdrawal.iban)}
                  </div>
                  <div style="margin-top:6px;">نرخ تبدیل: ${safe(withdrawal.exchange_rate)}</div>
                  <button
                    type="button"
                    style="margin-top:12px;"
                    onclick="completeAdminFiatWithdrawal(${id})"
                  >
                    ثبت واریز انجام‌شده
                  </button>
                  <button
                    type="button"
                    style="margin-top:8px;"
                    onclick="failAdminFiatWithdrawal(${id})"
                  >
                    رد برداشت و آزادسازی موجودی
                  </button>
                </div>
              `;
            }).join("")
      }
    `;

  } catch (error) {
    console.error("ADMIN WITHDRAW PANEL ERROR:", error);
    section.innerHTML = "";
  }
}

async function completeAdminFiatWithdrawal(transactionId) {
  const confirmed = confirm(
    "آیا وجه این درخواست را واقعاً به شبای ثبت‌شده واریز کرده‌اید؟\n\n" +
    "سامانه انتقال بانکی انجام نمی‌دهد. این عملیات فقط برداشت را در کیف پول تسویه می‌کند."
  );
  if (!confirmed) return;

  try {
    const response = await fetch(API + "/admin/wallet-withdraw-fiat-complete", {
      method: "POST",
      headers: {
        ...getTelegramAuthHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ transactionId: Number(transactionId) })
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      alert(data.message || "ثبت تکمیل برداشت ریالی ناموفق بود.");
      return;
    }

    alert("برداشت ریالی با موفقیت تسویه شد.");
    await loadAdminWithdrawPanel();
  } catch (error) {
    console.error("ADMIN FIAT WITHDRAW COMPLETE ERROR:", error);
    alert("خطا در ارتباط با سرور هنگام تسویه برداشت ریالی.");
  }
}


async function failAdminFiatWithdrawal(transactionId) {
  const reason = prompt("دلیل رد درخواست برداشت ریالی را وارد کنید:");
  if (!reason || !reason.trim()) return;

  if (!confirm("درخواست رد می‌شود و مبلغ قفل‌شده به موجودی قابل استفاده برمی‌گردد. ادامه می‌دهید؟")) return;

  try {
    const response = await fetch(API + "/admin/wallet-withdraw-fiat-fail", {
      method: "POST",
      headers: {
        ...getTelegramAuthHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        transactionId: Number(transactionId),
        reason: reason.trim()
      })
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      alert(data.message || "رد برداشت ریالی انجام نشد.");
      return;
    }

    alert("برداشت ریالی رد شد و موجودی قفل‌شده آزاد شد.");
    await loadAdminWithdrawPanel();
  } catch (error) {
    console.error("ADMIN FIAT WITHDRAW FAIL ERROR:", error);
    alert("خطا در ارتباط با سرور.");
  }
}

async function failAdminWithdrawal(transactionId) {
  const reason = prompt("دلیل رد برداشت را وارد کنید:");
  if (!reason || !reason.trim()) return;
  if (!confirm("این برداشت FAILED می‌شود و مبلغ قفل‌شده به موجودی قابل استفاده برمی‌گردد.\n\nادامه می‌دهید؟")) return;
  try {
    const res = await fetch(API + "/admin/wallet-withdraw-fail", {
      method: "POST",
      headers: { ...getTelegramAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId: Number(transactionId), errorMessage: reason.trim() })
    });
    const data = await res.json();
    if (!data.ok) { alert(data.message || "رد برداشت انجام نشد"); return; }
    alert("برداشت رد شد و موجودی قفل‌شده آزاد شد.");
    await loadAdminWithdrawPanel();
  } catch (error) {
    console.error("ADMIN WITHDRAW FAIL ERROR:", error);
    alert("خطا در اتصال به سرور");
  }
}

async function processAdminWithdrawal(transactionId) {
  if (!confirm(
    "آیا می‌خواهید این برداشت وارد مرحله پردازش شود؟"
  )) {
    return;
  }

  try {
    const res = await fetch(
      API + "/admin/wallet-withdraw-process",
      {
        method: "POST",
        headers: {
          ...getTelegramAuthHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transactionId: Number(transactionId)
        })
      }
    );

    const data = await res.json();

    console.log(
      "ADMIN WITHDRAW PROCESS RESPONSE:",
      data
    );

    if (!data.ok) {
      alert(
        data.message ||
        "پردازش برداشت انجام نشد"
      );
      return;
    }

    alert("برداشت وارد مرحله پردازش شد.");
    await loadAdminWithdrawPanel();

  } catch (error) {
    console.error(
      "ADMIN WITHDRAW PROCESS ERROR:",
      error
    );

    alert("خطا در اتصال به سرور");
  }
}

async function buildAdminWithdrawal(transactionId) {
  if (!confirm(
    "آیا می‌خواهید تراکنش خام این برداشت ساخته شود؟\n\nدر این مرحله هیچ امضا یا ارسال به شبکه انجام نمی‌شود."
  )) {
    return;
  }

  try {
    const res = await fetch(
      API + "/admin/wallet-withdraw-build",
      {
        method: "POST",
        headers: {
          ...getTelegramAuthHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transactionId: Number(transactionId)
        })
      }
    );

    const data = await res.json();

    console.log(
      "ADMIN WITHDRAW BUILD RESPONSE:",
      data
    );

    if (!data.ok) {
      alert(
        data.message ||
        "ساخت تراکنش خام انجام نشد"
      );
      return;
    }

    alert("تراکنش خام با موفقیت ساخته شد و در Ledger ثبت شد.");
    await loadAdminWithdrawPanel();

  } catch (error) {
    console.error(
      "ADMIN WITHDRAW BUILD ERROR:",
      error
    );

    alert("خطا در اتصال به سرور");
  }
}

async function signAdminWithdrawal(transactionId) {
  if (!confirm(
    "آیا می‌خواهید این برداشت با کلید امن خزانه امضا شود؟\\n\\nدر این مرحله تراکنش فقط امضا می‌شود و هنوز به شبکه ارسال نمی‌شود."
  )) {
    return;
  }

  try {
    const res = await fetch(
      API + "/admin/wallet-withdraw-sign",
      {
        method: "POST",
        headers: {
          ...getTelegramAuthHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transactionId: Number(transactionId)
        })
      }
    );

    const data = await res.json();

    console.log(
      "ADMIN WITHDRAW SIGN RESPONSE:",
      data
    );

    if (!data.ok) {
      alert(
        data.message ||
        "امضای تراکنش انجام نشد"
      );
      return;
    }

    alert(
      "تراکنش با موفقیت امضا شد.\\n\\nتراکنش هنوز به شبکه ارسال نشده است."
    );

    await loadAdminWithdrawPanel();

  } catch (error) {
    console.error(
      "ADMIN WITHDRAW SIGN ERROR:",
      error
    );

    alert("خطا در اتصال به سرور");
  }
}



async function broadcastAdminWithdrawal(transactionId) {
  if (!confirm(
    "⚠️ هشدار مهم\n\nاین مرحله تراکنش امضاشده را واقعاً به شبکه TRON ارسال می‌کند.\n\nپس از ارسال، تراکنش روی بلاکچین قابل برگشت نیست.\n\nآیا مطمئن هستید؟"
  )) {
    return;
  }

  try {
    const res = await fetch(
      API + "/admin/wallet-withdraw-broadcast",
      {
        method: "POST",
        headers: {
          ...getTelegramAuthHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transactionId: Number(transactionId)
        })
      }
    );

    const data = await res.json();

    console.log(
      "ADMIN WITHDRAW BROADCAST RESPONSE:",
      data
    );

    if (!data.ok) {
      alert(
        data.message ||
        "ارسال تراکنش به شبکه انجام نشد"
      );
      return;
    }

    alert(
      "تراکنش با موفقیت به شبکه TRON ارسال شد.\n\nTXID:\n" +
      data.txID
    );

    await loadAdminWithdrawPanel();

  } catch (error) {
    console.error(
      "ADMIN WITHDRAW BROADCAST ERROR:",
      error
    );

    alert("خطا در اتصال به سرور");
  }
}

async function verifyAdminTronSigner() {
  try {
    const res = await fetch(
      API + "/admin/wallet-withdraw-signer-verify",
      {
        method: "POST",
        headers: {
          ...getTelegramAuthHeaders(),
          "Content-Type": "application/json"
        }
      }
    );

    const data = await res.json();

    console.log(
      "ADMIN TRON SIGNER VERIFY RESPONSE:",
      data
    );

    if (!data.ok) {
      alert(
        data.message ||
        "کلید امضاکننده با آدرس خزانه مطابقت ندارد"
      );
      return;
    }

    alert(
      "تأیید شد ✅\n\nکلید خصوصی با آدرس کیف پول خزانه مطابقت دارد."
    );
  } catch (error) {
    console.error(
      "ADMIN TRON SIGNER VERIFY ERROR:",
      error
    );

    alert("خطا در بررسی امضاکننده");
  }
}

/* Load admin panel */
setTimeout(() => {
  loadAdminTronPanel();
  loadAdminWithdrawPanel();
}, 1200);


/* =========================
   BOTTOM NAVIGATION
   ========================= */

function showAppPage(page) {
  const sections = document.querySelectorAll(".page-section");

  sections.forEach((section) => {
    section.style.display =
      section.classList.contains("page-" + page) ? "" : "none";
  });

  document.querySelectorAll(".bottom-nav-item").forEach((item) => {
    item.classList.toggle(
      "active",
      item.dataset.page === page
    );
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".bottom-nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      showAppPage(item.dataset.page);
    });
  });

  showAppPage("home");
});


/* =========================
   5-SECOND SPLASH SCREEN
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("appSplash");

  if (!splash) return;

  setTimeout(() => {
    splash.classList.add("splash-hide");

    setTimeout(() => {
      splash.remove();
    }, 500);
  }, 4500);
});


/* =========================
   TRON wallet connection
   Public addresses only; no transactions or private keys.
   ========================= */

function setChainWalletStatus(message) {
  const el = document.getElementById("tronWalletStatus");
  if (el) el.textContent = message;
}

function shortenChainAddress(address) {
  if (!address || address.length < 12) return address || "";
  return address.slice(0, 6) + "..." + address.slice(-4);
}

async function connectTronWallet() {
  const button = document.getElementById("connectTronWalletBtn");
  try {
    const provider = window.tronLink;

    if (!provider || typeof provider.request !== "function") {
      setChainWalletStatus(
        "TronLink در این مرورگر شناسایی نشد. Mini App را در محیط سازگار با TronLink باز کنید."
      );
      return;
    }

    if (button) button.disabled = true;
    setChainWalletStatus("در انتظار تأیید اتصال TRON...");

    const accounts = await provider.request({
      method: "tron_requestAccounts"
    });

    const address =
      (Array.isArray(accounts) && accounts[0]) ||
      window.tronWeb?.defaultAddress?.base58;

    if (!address || typeof address !== "string") {
      throw new Error("آدرس عمومی TRON در دسترس نیست.");
    }

    const addressEl = document.getElementById("tronWalletAddress");
    if (addressEl) {
      addressEl.textContent = shortenChainAddress(address);
      addressEl.title = address;
    }

    setChainWalletStatus(
      "کیف پول TRON متصل شد: " + shortenChainAddress(address)
    );
  } catch (error) {
    console.error("TRON wallet connection error:", error);
    setChainWalletStatus(
      error?.code === 4001
        ? "درخواست اتصال TRON رد شد."
        : "اتصال TRON انجام نشد؛ کیف پول و مرورگر را بررسی کنید."
    );
  } finally {
    if (button) button.disabled = false;
  }
}

// =========================
// EVM wallet connection has been removed.
// TRON connection is handled by wallet-connect module.
// SUBSCRIPTION FRONTEND
// =========================
async function loadSubscriptionStatus() {
  const statusEl = document.getElementById("subscriptionStatus");
  const addressEl = document.getElementById("subscriptionTreasuryAddress");

  try {
    const response = await fetch(`${API}/subscription-status`, {
      method: "GET",
      headers: getTelegramAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error("status failed");

    if (addressEl) {
      addressEl.textContent = data.treasuryAddress || "آدرس مقصد تنظیم نشده است";
    }

    if (statusEl) {
      statusEl.textContent = data.active
        ? `اشتراک فعال تا: ${new Date(data.expiresAt).toLocaleDateString("fa-IR")}`
        : data.latestPaymentStatus === "PENDING_ADMIN"
          ? "پرداخت شما در انتظار تأیید مدیر است."
          : data.latestPaymentStatus === "REJECTED"
            ? "آخرین پرداخت رد شده است."
            : "اشتراک فعالی ندارید.";
    }
  } catch (error) {
    console.error("Subscription status error:", error);
    if (statusEl) statusEl.textContent = "دریافت وضعیت اشتراک ناموفق بود.";
  }
}

document.getElementById("copySubscriptionAddress")?.addEventListener("click", async () => {
  const address = document.getElementById("subscriptionTreasuryAddress")?.textContent?.trim();
  if (!address || !address.startsWith("T")) {
    alert("آدرس مقصد هنوز دریافت نشده است.");
    return;
  }

  try {
    await navigator.clipboard.writeText(address);
    alert("آدرس مقصد کپی شد.");
  } catch {
    alert("کپی خودکار انجام نشد؛ آدرس را دستی کپی کنید.");
  }
});

document.addEventListener("DOMContentLoaded", loadSubscriptionStatus);

document.getElementById("submitSubscriptionPayment")?.addEventListener("click", async () => {
  const button = document.getElementById("submitSubscriptionPayment");
  const txidInput = document.getElementById("subscriptionTxid");
  const statusEl = document.getElementById("subscriptionStatus");
  const txid = txidInput?.value?.trim() || "";

  if (!/^[a-fA-F0-9]{64}$/.test(txid)) {
    alert("شناسه تراکنش TXID باید ۶۴ کاراکتر هگزادسیمال باشد.");
    return;
  }

  if (button) button.disabled = true;
  if (statusEl) statusEl.textContent = "در حال بررسی تراکنش روی شبکه TRON...";

  try {
    const response = await fetch(`${API}/subscription-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getTelegramAuthHeaders()
      },
      body: JSON.stringify({ txid })
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.message || "ثبت پرداخت انجام نشد.");
    }

    if (statusEl) {
      statusEl.textContent = data.message || "پرداخت ثبت شد و در انتظار بررسی مدیر است.";
    }
    if (txidInput) txidInput.value = "";
    await loadSubscriptionStatus();

  } catch (error) {
    console.error("Subscription payment error:", error);
    if (statusEl) statusEl.textContent = error.message || "خطا در ثبت پرداخت.";
  } finally {
    if (button) button.disabled = false;
  }
});

// ===== AI-TRADER MULTI-LANGUAGE: STATIC UI =====
(() => {
  const translations = {
    en: {
      "معامله‌گر هوشمند":"Smart Trader","آنلاین":"Online","موجودی کل":"Total Balance",
      "ارزش تقریبی: در حال دریافت...":"Estimated value: Loading...",
      "قابل استفاده":"Available","قفل‌شده":"Locked","سیگنال هوش مصنوعی":"AI Signal",
      "در حال تحلیل...":"Analyzing...","قیمت BTC":"BTC Price","روند":"Trend",
      "اعتماد":"Confidence","ریسک":"Risk","وضعیت ربات":"Bot Status",
      "در حال بررسی...":"Checking...","▶ شروع ربات":"▶ Start Bot","■ توقف ربات":"■ Stop Bot",
      "معامله خودکار":"Auto Trading","در حال بررسی وضعیت...":"Checking status...",
      "موجودی اولیه":"Initial Balance","سود امروز":"Today's Profit",
      "کیف پول":"Wallet","اتصال کیف پول TRON":"Connect TRON Wallet",
      "شبکه TRON":"TRON Network","کیف پول متصل نیست":"Wallet not connected",
      "اتصال TRON":"Connect TRON","موجودی USDT در TRON: ـ":"TRON USDT Balance: —",
      "وضعیت TRON: متصل نیست":"TRON Status: Not connected","واریز":"Deposit",
      "برداشت":"Withdraw","آدرس TRC20":"TRC20 Address","تراکنش‌های اخیر":"Recent Transactions",
      "در حال دریافت...":"Loading...","تاریخچه معاملات":"Trade History",
      "تنظیمات":"Settings","اشتراک AI-Trader":"AI-Trader Subscription",
      "اشتراک ۹۰ روزه — ۱۵ USDT":"90-day subscription — 15 USDT",
      "شبکه پرداخت: TRON (TRC20)":"Payment Network: TRON (TRC20)",
      "آدرس مقصد پرداخت ۱۵ تتر:":"15 USDT Payment Address:",
      "در حال دریافت آدرس...":"Loading address...","کپی آدرس پرداخت":"Copy Payment Address",
      "در حال بررسی اشتراک...":"Checking subscription...","شناسه تراکنش TXID":"Transaction ID (TXID)",
      "TXID تراکنش را وارد کنید":"Enter transaction TXID",
      "ثبت پرداخت اشتراک":"Submit Subscription Payment","زبان برنامه":"App Language",
      "انتخاب زبان نمایش برنامه":"Choose display language","حالت معامله":"Trading Mode",
      "مدیریت نحوه اجرای معاملات ربات":"Manage bot trading behavior","کم‌ریسک":"Low Risk",
      "سرمایه معاملاتی":"Trading Capital","سرمایه مورد استفاده ربات":"Capital used by the bot",
      "اتصال صرافی":"Exchange Connection","اتصال API برای معاملات واقعی":"API connection for live trading",
      "متصل به Wallex":"Connected to Wallex","نسخه برنامه":"App Version",
      "برداشت دارایی":"Withdraw Assets","موجودی قابل برداشت":"Available to Withdraw",
      "برداشت رمزارزی":"Crypto withdrawal","ریالی":"Fiat","واریز به حساب بانکی":"Bank transfer",
      "شبکه انتقال":"Transfer Network","شبکه سریع و کم‌هزینه":"Fast, low-cost network",
      "آدرس کیف پول مقصد":"Destination Wallet Address","آدرس TRC20 را وارد کنید":"Enter TRC20 address",
      "فقط آدرس USDT روی شبکه TRON (TRC20) را وارد کنید.":"Enter only a USDT address on the TRON (TRC20) network.",
      "وضعیت آدرس: در حال بررسی...":"Address status: Checking...",
      "ثبت آدرس برای تأیید":"Submit Address for Review","مقدار برداشت":"Withdrawal Amount",
      "حداکثر":"Max","کارمزد شبکه":"Network Fee","محاسبه هنگام ثبت":"Calculated on submission",
      "مبلغ دریافتی":"Amount to Receive","قبل از تأیید، شبکه و اطلاعات برداشت را با دقت بررسی کنید. تراکنش‌های بلاکچینی پس از ارسال قابل برگشت نیستند.":"Check the network and withdrawal details carefully. Blockchain transactions cannot be reversed after submission.",
      "مبلغ برداشت":"Withdrawal Amount","تومان":"Toman","نام صاحب حساب":"Account Holder Name",
      "نام و نام خانوادگی":"Full Name","شماره شبا":"IBAN","نرخ تبدیل":"Exchange Rate",
      "معادل USDT":"USDT Equivalent","ادامه برداشت":"Continue Withdrawal",
      "برداشت امن با احراز هویت تلگرام":"Secure withdrawal with Telegram authentication",
      "واریز USDT":"Deposit USDT","شبکه واریز":"Deposit Network",
      "آدرس اختصاصی واریز شما":"Your Personal Deposit Address","کپی":"Copy",
      "در حال بررسی وضعیت آدرس...":"Checking address status...",
      "فقط USDT روی شبکه TRON (TRC20) ارسال کنید.":"Send only USDT on the TRON (TRC20) network.",
      "TXID تراکنش":"Transaction TXID",
      "مبلغ واریز توسط سیستم از روی بلاکچین شناسایی می‌شود و نیازی به وارد کردن مبلغ نیست.":"The deposit amount is detected automatically from the blockchain. No amount entry is required.",
      "بررسی و ثبت واریز":"Verify and Submit Deposit","تأیید آدرس‌های TRC20":"Approve TRC20 Addresses",
      "در حال بررسی درخواست‌ها...":"Checking requests...","خانه":"Home","معامله":"Trade",
      "ذخیره":"Save","نحوه اجرای معاملات ربات را انتخاب کنید:":"Choose how the bot executes trades:",
      "متوسط":"Medium","پرریسک":"High Risk",
      "مقدار سرمایه مورد استفاده ربات را به USDT وارد کنید:":"Enter the amount of capital the bot will use in USDT:",
      "حداقل 2 و حداکثر 1000 USDT":"Minimum 2 and maximum 1000 USDT"
    },
    ar: {
      "معامله‌گر هوشمند":"المتداول الذكي","آنلاین":"متصل","موجودی کل":"الرصيد الإجمالي",
      "ارزش تقریبی: در حال دریافت...":"القيمة التقريبية: جارٍ التحميل...",
      "قابل استفاده":"المتاح","قفل‌شده":"المقفل","سیگنال هوش مصنوعی":"إشارة الذكاء الاصطناعي",
      "در حال تحلیل...":"جارٍ التحليل...","قیمت BTC":"سعر BTC","روند":"الاتجاه",
      "اعتماد":"الثقة","ریسک":"المخاطر","وضعیت ربات":"حالة الروبوت",
      "در حال بررسی...":"جارٍ التحقق...","▶ شروع ربات":"▶ تشغيل الروبوت","■ توقف ربات":"■ إيقاف الروبوت",
      "معامله خودکار":"التداول الآلي","در حال بررسی وضعیت...":"جارٍ التحقق من الحالة...",
      "موجودی اولیه":"الرصيد الأولي","سود امروز":"ربح اليوم","کیف پول":"المحفظة",
      "اتصال کیف پول TRON":"ربط محفظة TRON","شبکه TRON":"شبكة TRON",
      "کیف پول متصل نیست":"المحفظة غير متصلة","اتصال TRON":"ربط TRON",
      "موجودی USDT در TRON: ـ":"رصيد USDT على TRON: —",
      "وضعیت TRON: متصل نیست":"حالة TRON: غير متصل","واریز":"إيداع",
      "برداشت":"سحب","آدرس TRC20":"عنوان TRC20","تراکنش‌های اخیر":"المعاملات الأخيرة",
      "در حال دریافت...":"جارٍ التحميل...","تاریخچه معاملات":"سجل التداول",
      "تنظیمات":"الإعدادات","اشتراک AI-Trader":"اشتراك AI-Trader",
      "اشتراک ۹۰ روزه — ۱۵ USDT":"اشتراك لمدة 90 يومًا — 15 USDT",
      "شبکه پرداخت: TRON (TRC20)":"شبكة الدفع: TRON (TRC20)",
      "آدرس مقصد پرداخت ۱۵ تتر:":"عنوان دفع 15 USDT:",
      "در حال دریافت آدرس...":"جارٍ تحميل العنوان...","کپی آدرس پرداخت":"نسخ عنوان الدفع",
      "در حال بررسی اشتراک...":"جارٍ التحقق من الاشتراك...","شناسه تراکنش TXID":"معرّف المعاملة TXID",
      "TXID تراکنش را وارد کنید":"أدخل TXID المعاملة",
      "ثبت پرداخت اشتراک":"إرسال دفعة الاشتراك","زبان برنامه":"لغة التطبيق",
      "انتخاب زبان نمایش برنامه":"اختر لغة العرض","حالت معامله":"وضع التداول",
      "مدیریت نحوه اجرای معاملات ربات":"إدارة طريقة تداول الروبوت","کم‌ریسک":"مخاطر منخفضة",
      "سرمایه معاملاتی":"رأس مال التداول","سرمایه مورد استفاده ربات":"رأس المال الذي يستخدمه الروبوت",
      "اتصال صرافی":"ربط منصة التداول","اتصال API برای معاملات واقعی":"ربط API للتداول الحقيقي",
      "متصل به Wallex":"متصل بـ Wallex","نسخه برنامه":"إصدار التطبيق",
      "برداشت دارایی":"سحب الأصول","موجودی قابل برداشت":"الرصيد القابل للسحب",
      "برداشت رمزارزی":"سحب العملات الرقمية","ریالی":"بالعملة المحلية",
      "واریز به حساب بانکی":"تحويل إلى الحساب البنكي","شبکه انتقال":"شبكة التحويل",
      "شبکه سریع و کم‌هزینه":"شبكة سريعة ومنخفضة التكلفة",
      "آدرس کیف پول مقصد":"عنوان المحفظة المستلمة","آدرس TRC20 را وارد کنید":"أدخل عنوان TRC20",
      "فقط آدرس USDT روی شبکه TRON (TRC20) را وارد کنید.":"أدخل عنوان USDT على شبكة TRON (TRC20) فقط.",
      "وضعیت آدرس: در حال بررسی...":"حالة العنوان: جارٍ التحقق...",
      "ثبت آدرس برای تأیید":"إرسال العنوان للمراجعة","مقدار برداشت":"مبلغ السحب",
      "حداکثر":"الحد الأقصى","کارمزد شبکه":"رسوم الشبكة","محاسبه هنگام ثبت":"يُحسب عند الإرسال",
      "مبلغ دریافتی":"المبلغ المستلم",
      "قبل از تأیید، شبکه و اطلاعات برداشت را با دقت بررسی کنید. تراکنش‌های بلاکچینی پس از ارسال قابل برگشت نیستند.":"تحقق من الشبكة وتفاصيل السحب جيدًا. لا يمكن التراجع عن معاملات البلوك تشين بعد إرسالها.",
      "مبلغ برداشت":"مبلغ السحب","تومان":"تومان","نام صاحب حساب":"اسم صاحب الحساب",
      "نام و نام خانوادگی":"الاسم الكامل","شماره شبا":"رقم IBAN","نرخ تبدیل":"سعر التحويل",
      "معادل USDT":"ما يعادل USDT","ادامه برداشت":"متابعة السحب",
      "برداشت امن با احراز هویت تلگرام":"سحب آمن عبر التحقق من Telegram",
      "واریز USDT":"إيداع USDT","شبکه واریز":"شبكة الإيداع",
      "آدرس اختصاصی واریز شما":"عنوان الإيداع الخاص بك","کپی":"نسخ",
      "در حال بررسی وضعیت آدرس...":"جارٍ التحقق من حالة العنوان...",
      "فقط USDT روی شبکه TRON (TRC20) ارسال کنید.":"أرسل USDT عبر شبكة TRON (TRC20) فقط.",
      "TXID تراکنش":"TXID المعاملة",
      "مبلغ واریز توسط سیستم از روی بلاکچین شناسایی می‌شود و نیازی به وارد کردن مبلغ نیست.":"يحدد النظام مبلغ الإيداع من البلوك تشين تلقائيًا، ولا حاجة لإدخال المبلغ.",
      "بررسی و ثبت واریز":"التحقق وإرسال الإيداع","تأیید آدرس‌های TRC20":"تأكيد عناوين TRC20",
      "در حال بررسی درخواست‌ها...":"جارٍ فحص الطلبات...","خانه":"الرئيسية",
      "معامله":"تداول","ذخیره":"حفظ","نحوه اجرای معاملات ربات را انتخاب کنید:":"اختر طريقة تنفيذ الروبوت للصفقات:",
      "متوسط":"متوسط","پرریسک":"مخاطر مرتفعة",
      "مقدار سرمایه مورد استفاده ربات را به USDT وارد کنید:":"أدخل رأس المال الذي سيستخدمه الروبوت بوحدة USDT:",
      "حداقل 2 و حداکثر 1000 USDT":"الحد الأدنى 2 والحد الأقصى 1000 USDT"
    },
    ru: {
      "معامله‌گر هوشمند":"Умный трейдер","آنلاین":"В сети","موجودی کل":"Общий баланс",
      "ارزش تقریبی: در حال دریافت...":"Примерная стоимость: загрузка...",
      "قابل استفاده":"Доступно","قفل‌شده":"Заблокировано","سیگنال هوش مصنوعی":"Сигнал ИИ",
      "در حال تحلیل...":"Анализ...","قیمت BTC":"Цена BTC","روند":"Тренд",
      "اعتماد":"Уверенность","ریسک":"Риск","وضعیت ربات":"Статус бота",
      "در حال بررسی...":"Проверка...","▶ شروع ربات":"▶ Запустить бота","■ توقف ربات":"■ Остановить бота",
      "معامله خودکار":"Автоторговля","در حال بررسی وضعیت...":"Проверка состояния...",
      "موجودی اولیه":"Начальный баланс","سود امروز":"Прибыль сегодня","کیف پول":"Кошелёк",
      "اتصال کیف پول TRON":"Подключить кошелёк TRON","شبکه TRON":"Сеть TRON",
      "کیف پول متصل نیست":"Кошелёк не подключён","اتصال TRON":"Подключить TRON",
      "موجودی USDT در TRON: ـ":"Баланс USDT в TRON: —",
      "وضعیت TRON: متصل نیست":"Статус TRON: не подключён","واریز":"Пополнить",
      "برداشت":"Вывести","آدرس TRC20":"Адрес TRC20","تراکنش‌های اخیر":"Последние транзакции",
      "در حال دریافت...":"Загрузка...","تاریخچه معاملات":"История сделок",
      "تنظیمات":"Настройки","اشتراک AI-Trader":"Подписка AI-Trader",
      "اشتراک ۹۰ روزه — ۱۵ USDT":"Подписка на 90 дней — 15 USDT",
      "شبکه پرداخت: TRON (TRC20)":"Сеть оплаты: TRON (TRC20)",
      "آدرس مقصد پرداخت ۱۵ تتر:":"Адрес для оплаты 15 USDT:",
      "در حال دریافت آدرس...":"Загрузка адреса...","کپی آدرس پرداخت":"Копировать адрес оплаты",
      "در حال بررسی اشتراک...":"Проверка подписки...","شناسه تراکنش TXID":"ID транзакции TXID",
      "TXID تراکنش را وارد کنید":"Введите TXID транзакции",
      "ثبت پرداخت اشتراک":"Отправить оплату подписки","زبان برنامه":"Язык приложения",
      "انتخاب زبان نمایش برنامه":"Выберите язык интерфейса","حالت معامله":"Режим торговли",
      "مدیریت نحوه اجرای معاملات ربات":"Управление торговлей бота","کم‌ریسک":"Низкий риск",
      "سرمایه معاملاتی":"Торговый капитал","سرمایه مورد استفاده ربات":"Капитал, используемый ботом",
      "اتصال صرافی":"Подключение биржи","اتصال API برای معاملات واقعی":"API для реальной торговли",
      "متصل به Wallex":"Подключено к Wallex","نسخه برنامه":"Версия приложения",
      "برداشت دارایی":"Вывод средств","موجودی قابل برداشت":"Доступно для вывода",
      "برداشت رمزارزی":"Вывод криптовалюты","ریالی":"В местной валюте",
      "واریز به حساب بانکی":"Перевод на банковский счёт","شبکه انتقال":"Сеть перевода",
      "شبکه سریع و کم‌هزینه":"Быстрая и недорогая сеть",
      "آدرس کیف پول مقصد":"Адрес кошелька получателя","آدرس TRC20 را وارد کنید":"Введите адрес TRC20",
      "فقط آدرس USDT روی شبکه TRON (TRC20) را وارد کنید.":"Укажите только адрес USDT в сети TRON (TRC20).",
      "وضعیت آدرس: در حال بررسی...":"Статус адреса: проверка...",
      "ثبت آدرس برای تأیید":"Отправить адрес на проверку","مقدار برداشت":"Сумма вывода",
      "حداکثر":"Максимум","کارمزد شبکه":"Комиссия сети","محاسبه هنگام ثبت":"Рассчитывается при отправке",
      "مبلغ دریافتی":"Сумма к получению",
      "قبل از تأیید، شبکه و اطلاعات برداشت را با دقت بررسی کنید. تراکنش‌های بلاکچینی پس از ارسال قابل برگشت نیستند.":"Перед подтверждением проверьте сеть и данные вывода. Отправленные блокчейн-транзакции необратимы.",
      "مبلغ برداشت":"Сумма вывода","تومان":"Томан","نام صاحب حساب":"Владелец счёта",
      "نام و نام خانوادگی":"Полное имя","شماره شبا":"IBAN","نرخ تبدیل":"Курс обмена",
      "معادل USDT":"Эквивалент USDT","ادامه برداشت":"Продолжить вывод",
      "برداشت امن با احراز هویت تلگرام":"Безопасный вывод с проверкой Telegram",
      "واریز USDT":"Пополнение USDT","شبکه واریز":"Сеть пополнения",
      "آدرس اختصاصی واریز شما":"Ваш адрес для пополнения","کپی":"Копировать",
      "در حال بررسی وضعیت آدرس...":"Проверка адреса...",
      "فقط USDT روی شبکه TRON (TRC20) ارسال کنید.":"Отправляйте только USDT в сети TRON (TRC20).",
      "TXID تراکنش":"TXID транзакции",
      "مبلغ واریز توسط سیستم از روی بلاکچین شناسایی می‌شود و نیازی به وارد کردن مبلغ نیست.":"Сумма пополнения определяется по блокчейну автоматически. Вводить её не нужно.",
      "بررسی و ثبت واریز":"Проверить и отправить пополнение","تأیید آدرس‌های TRC20":"Подтверждение адресов TRC20",
      "در حال بررسی درخواست‌ها...":"Проверка запросов...","خانه":"Главная",
      "معامله":"Торговля","ذخیره":"Сохранить","نحوه اجرای معاملات ربات را انتخاب کنید:":"Выберите режим торговли бота:",
      "متوسط":"Средний","پرریسک":"Высокий риск",
      "مقدار سرمایه مورد استفاده ربات را به USDT وارد کنید:":"Введите капитал, который будет использовать бот, в USDT:",
      "حداقل 2 و حداکثر 1000 USDT":"Минимум 2 и максимум 1000 USDT"
    },
    tr: {
      "معامله‌گر هوشمند":"Akıllı Trader","آنلاین":"Çevrimiçi","موجودی کل":"Toplam Bakiye",
      "ارزش تقریبی: در حال دریافت...":"Tahmini değer: Yükleniyor...",
      "قابل استفاده":"Kullanılabilir","قفل‌شده":"Kilitli","سیگنال هوش مصنوعی":"Yapay Zekâ Sinyali",
      "در حال تحلیل...":"Analiz ediliyor...","قیمت BTC":"BTC Fiyatı","روند":"Trend",
      "اعتماد":"Güven","ریسک":"Risk","وضعیت ربات":"Bot Durumu",
      "در حال بررسی...":"Kontrol ediliyor...","▶ شروع ربات":"▶ Botu Başlat","■ توقف ربات":"■ Botu Durdur",
      "معامله خودکار":"Otomatik İşlem","در حال بررسی وضعیت...":"Durum kontrol ediliyor...",
      "موجودی اولیه":"Başlangıç Bakiyesi","سود امروز":"Bugünün Kârı","کیف پول":"Cüzdan",
      "اتصال کیف پول TRON":"TRON Cüzdanını Bağla","شبکه TRON":"TRON Ağı",
      "کیف پول متصل نیست":"Cüzdan bağlı değil","اتصال TRON":"TRON Bağla",
      "موجودی USDT در TRON: ـ":"TRON USDT Bakiyesi: —",
      "وضعیت TRON: متصل نیست":"TRON Durumu: Bağlı değil","واریز":"Yatır",
      "برداشت":"Çek","آدرس TRC20":"TRC20 Adresi","تراکنش‌های اخیر":"Son İşlemler",
      "در حال دریافت...":"Yükleniyor...","تاریخچه معاملات":"İşlem Geçmişi",
      "تنظیمات":"Ayarlar","اشتراک AI-Trader":"AI-Trader Aboneliği",
      "اشتراک ۹۰ روزه — ۱۵ USDT":"90 günlük abonelik — 15 USDT",
      "شبکه پرداخت: TRON (TRC20)":"Ödeme Ağı: TRON (TRC20)",
      "آدرس مقصد پرداخت ۱۵ تتر:":"15 USDT ödeme adresi:",
      "در حال دریافت آدرس...":"Adres yükleniyor...","کپی آدرس پرداخت":"Ödeme Adresini Kopyala",
      "در حال بررسی اشتراک...":"Abonelik kontrol ediliyor...","شناسه تراکنش TXID":"İşlem Kimliği TXID",
      "TXID تراکنش را وارد کنید":"İşlem TXID'sini girin",
      "ثبت پرداخت اشتراک":"Abonelik Ödemesini Gönder","زبان برنامه":"Uygulama Dili",
      "انتخاب زبان نمایش برنامه":"Görüntüleme dilini seçin","حالت معامله":"İşlem Modu",
      "مدیریت نحوه اجرای معاملات ربات":"Botun işlem şeklini yönetin","کم‌ریسک":"Düşük Risk",
      "سرمایه معاملاتی":"İşlem Sermayesi","سرمایه مورد استفاده ربات":"Botun kullanacağı sermaye",
      "اتصال صرافی":"Borsa Bağlantısı","اتصال API برای معاملات واقعی":"Gerçek işlemler için API bağlantısı",
      "متصل به Wallex":"Wallex'e bağlı","نسخه برنامه":"Uygulama Sürümü",
      "برداشت دارایی":"Varlık Çekme","موجودی قابل برداشت":"Çekilebilir Bakiye",
      "برداشت رمزارزی":"Kripto çekimi","ریالی":"Yerel para",
      "واریز به حساب بانکی":"Banka hesabına aktarım","شبکه انتقال":"Transfer Ağı",
      "شبکه سریع و کم‌هزینه":"Hızlı ve düşük maliyetli ağ",
      "آدرس کیف پول مقصد":"Alıcı Cüzdan Adresi","آدرس TRC20 را وارد کنید":"TRC20 adresini girin",
      "فقط آدرس USDT روی شبکه TRON (TRC20) را وارد کنید.":"Yalnızca TRON (TRC20) ağındaki USDT adresini girin.",
      "وضعیت آدرس: در حال بررسی...":"Adres durumu: Kontrol ediliyor...",
      "ثبت آدرس برای تأیید":"Onay için Adresi Gönder","مقدار برداشت":"Çekim Miktarı",
      "حداکثر":"Maksimum","کارمزد شبکه":"Ağ Ücreti","محاسبه هنگام ثبت":"Gönderim sırasında hesaplanır",
      "مبلغ دریافتی":"Alınacak Tutar",
      "قبل از تأیید، شبکه و اطلاعات برداشت را با دقت بررسی کنید. تراکنش‌های بلاکچینی پس از ارسال قابل برگشت نیستند.":"Onaylamadan önce ağı ve çekim bilgilerini kontrol edin. Blockchain işlemleri gönderildikten sonra geri alınamaz.",
      "مبلغ برداشت":"Çekim Tutarı","تومان":"Toman","نام صاحب حساب":"Hesap Sahibi",
      "نام و نام خانوادگی":"Ad Soyad","شماره شبا":"IBAN","نرخ تبدیل":"Döviz Kuru",
      "معادل USDT":"USDT Karşılığı","ادامه برداشت":"Çekime Devam Et",
      "برداشت امن با احراز هویت تلگرام":"Telegram doğrulamasıyla güvenli çekim",
      "واریز USDT":"USDT Yatırma","شبکه واریز":"Yatırma Ağı",
      "آدرس اختصاصی واریز شما":"Size Özel Yatırma Adresi","کپی":"Kopyala",
      "در حال بررسی وضعیت آدرس...":"Adres durumu kontrol ediliyor...",
      "فقط USDT روی شبکه TRON (TRC20) ارسال کنید.":"Yalnızca TRON (TRC20) ağında USDT gönderin.",
      "TXID تراکنش":"İşlem TXID'si",
      "مبلغ واریز توسط سیستم از روی بلاکچین شناسایی می‌شود و نیازی به وارد کردن مبلغ نیست.":"Yatırma tutarı blockchain üzerinden otomatik algılanır. Tutar girmeniz gerekmez.",
      "بررسی و ثبت واریز":"Yatırmayı Kontrol Et ve Gönder","تأیید آدرس‌های TRC20":"TRC20 Adreslerini Onayla",
      "در حال بررسی درخواست‌ها...":"İstekler kontrol ediliyor...","خانه":"Ana Sayfa",
      "معامله":"İşlem","ذخیره":"Kaydet","نحوه اجرای معاملات ربات را انتخاب کنید:":"Botun işlem şeklini seçin:",
      "متوسط":"Orta","پرریسک":"Yüksek Risk",
      "مقدار سرمایه مورد استفاده ربات را به USDT وارد کنید:":"Botun kullanacağı sermayeyi USDT olarak girin:",
      "حداقل 2 و حداکثر 1000 USDT":"Minimum 2, maksimum 1000 USDT"
    }
  };

  function applyAppLanguage(language) {
    const lang = translations[language] ? language : "fa";
    const dict = translations[lang] || {};
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === "fa" || lang === "ar") ? "rtl" : "ltr";

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE"].includes(parent.tagName)) continue;
      const original = node.nodeValue;
      const trimmed = original.trim();
      if (dict[trimmed]) {
        node.nodeValue = original.replace(trimmed, dict[trimmed]);
      }
    }

    document.querySelectorAll("[placeholder]").forEach(el => {
      if (!el.dataset.originalPlaceholder) el.dataset.originalPlaceholder = el.placeholder;
      if (dict[el.dataset.originalPlaceholder]) el.placeholder = dict[el.dataset.originalPlaceholder];
    });
    document.querySelectorAll("[aria-label]").forEach(el => {
      if (!el.dataset.originalAria) el.dataset.originalAria = el.getAttribute("aria-label");
      if (dict[el.dataset.originalAria]) el.setAttribute("aria-label", dict[el.dataset.originalAria]);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const selector = document.getElementById("appLanguage");
    const saved = localStorage.getItem("aiTraderLanguage") || "fa";
    if (selector) {
      selector.value = saved;
      selector.addEventListener("change", () => {
        localStorage.setItem("aiTraderLanguage", selector.value);
        location.reload();
      });
    }
    applyAppLanguage(saved);
  });
})();

// ===== DYNAMIC DEPOSIT MESSAGE TRANSLATIONS =====
(() => {
  const messages = {
    en: {
      "در حال دریافت آدرس واریز...":"Loading deposit address...",
      "آدرس واریز دریافت نشد":"Deposit address could not be loaded",
      "آدرس واریز TRC20 هنوز برای این کیف پول فعال نشده است.":"TRC20 deposit address is not enabled for this wallet yet.",
      "آدرس آماده دریافت واریز است.":"Address is ready to receive deposits.",
      "خطا در دریافت آدرس واریز.":"Error loading deposit address.",
      "آدرس واریز هنوز آماده نیست.":"Deposit address is not ready yet.",
      "کپی شد ✓":"Copied ✓",
      "کپی خودکار انجام نشد. آدرس را دستی کپی کنید.":"Automatic copy failed. Please copy the address manually.",
      "TXID واردشده معتبر نیست.":"The entered TXID is invalid.",
      "در حال بررسی بلاکچین...":"Checking blockchain...",
      "در حال بررسی تراکنش روی شبکه TRON...":"Checking transaction on the TRON network...",
      "واریز تأیید نشد.":"Deposit was not confirmed.",
      "واریز با موفقیت تأیید شد: ":"Deposit successfully confirmed: ",
      "خطا در ارتباط با سرور.":"Server connection error.",
      "بررسی و ثبت واریز":"Check and Submit Deposit"
    },
    ar: {
      "در حال دریافت آدرس واریز...":"جارٍ تحميل عنوان الإيداع...",
      "آدرس واریز دریافت نشد":"تعذر تحميل عنوان الإيداع",
      "آدرس واریز TRC20 هنوز برای این کیف پول فعال نشده است.":"عنوان إيداع TRC20 غير مفعّل لهذه المحفظة بعد.",
      "آدرس آماده دریافت واریز است.":"العنوان جاهز لاستقبال الإيداعات.",
      "خطا در دریافت آدرس واریز.":"حدث خطأ أثناء تحميل عنوان الإيداع.",
      "آدرس واریز هنوز آماده نیست.":"عنوان الإيداع غير جاهز بعد.",
      "کپی شد ✓":"تم النسخ ✓",
      "کپی خودکار انجام نشد. آدرس را دستی کپی کنید.":"تعذر النسخ التلقائي. انسخ العنوان يدويًا.",
      "TXID واردشده معتبر نیست.":"رقم TXID المُدخل غير صالح.",
      "در حال بررسی بلاکچین...":"جارٍ التحقق من البلوك تشين...",
      "در حال بررسی تراکنش روی شبکه TRON...":"جارٍ التحقق من المعاملة على شبكة TRON...",
      "واریز تأیید نشد.":"لم يتم تأكيد الإيداع.",
      "واریز با موفقیت تأیید شد: ":"تم تأكيد الإيداع بنجاح: ",
      "خطا در ارتباط با سرور.":"خطأ في الاتصال بالخادم.",
      "بررسی و ثبت واریز":"تحقق من الإيداع وتسجيله"
    },
    ru: {
      "در حال دریافت آدرس واریز...":"Загрузка адреса пополнения...",
      "آدرس واریز دریافت نشد":"Не удалось получить адрес пополнения",
      "آدرس واریز TRC20 هنوز برای این کیف پول فعال نشده است.":"Адрес пополнения TRC20 для этого кошелька ещё не активирован.",
      "آدرس آماده دریافت واریز است.":"Адрес готов к получению средств.",
      "خطا در دریافت آدرس واریز.":"Ошибка загрузки адреса пополнения.",
      "آدرس واریز هنوز آماده نیست.":"Адрес пополнения ещё не готов.",
      "کپی شد ✓":"Скопировано ✓",
      "کپی خودکار انجام نشد. آدرس را دستی کپی کنید.":"Не удалось скопировать автоматически. Скопируйте адрес вручную.",
      "TXID واردشده معتبر نیست.":"Введён неверный TXID.",
      "در حال بررسی بلاکچین...":"Проверка блокчейна...",
      "در حال بررسی تراکنش روی شبکه TRON...":"Проверка транзакции в сети TRON...",
      "واریز تأیید نشد.":"Пополнение не подтверждено.",
      "واریز با موفقیت تأیید شد: ":"Пополнение успешно подтверждено: ",
      "خطا در ارتباط با سرور.":"Ошибка соединения с сервером.",
      "بررسی و ثبت واریز":"Проверить и отправить пополнение"
    },
    tr: {
      "در حال دریافت آدرس واریز...":"Yatırma adresi yükleniyor...",
      "آدرس واریز دریافت نشد":"Yatırma adresi alınamadı",
      "آدرس واریز TRC20 هنوز برای این کیف پول فعال نشده است.":"Bu cüzdan için TRC20 yatırma adresi henüz etkin değil.",
      "آدرس آماده دریافت واریز است.":"Adres yatırma işlemleri için hazır.",
      "خطا در دریافت آدرس واریز.":"Yatırma adresi yüklenirken hata oluştu.",
      "آدرس واریز هنوز آماده نیست.":"Yatırma adresi henüz hazır değil.",
      "کپی شد ✓":"Kopyalandı ✓",
      "کپی خودکار انجام نشد. آدرس را دستی کپی کنید.":"Otomatik kopyalama başarısız. Adresi manuel kopyalayın.",
      "TXID واردشده معتبر نیست.":"Girilen TXID geçersiz.",
      "در حال بررسی بلاکچین...":"Blok zinciri kontrol ediliyor...",
      "در حال بررسی تراکنش روی شبکه TRON...":"TRON ağındaki işlem kontrol ediliyor...",
      "واریز تأیید نشد.":"Yatırma işlemi onaylanmadı.",
      "واریز با موفقیت تأیید شد: ":"Yatırma başarıyla onaylandı: ",
      "خطا در ارتباط با سرور.":"Sunucu bağlantı hatası.",
      "بررسی و ثبت واریز":"Yatırmayı Kontrol Et ve Gönder"
    }
  };

  function translateDynamicDepositText(node) {
    const lang = localStorage.getItem("aiTraderLanguage") || "fa";
    const dict = messages[lang];
    if (!dict || !node || node.nodeType !== Node.TEXT_NODE) return;

    const original = node.nodeValue;
    const trimmed = original.trim();
    if (dict[trimmed]) {
      node.nodeValue = original.replace(trimmed, dict[trimmed]);
      return;
    }

    if (trimmed.startsWith("واریز با موفقیت تأیید شد: ")) {
      node.nodeValue = original.replace(
        "واریز با موفقیت تأیید شد: ",
        dict["واریز با موفقیت تأیید شد: "]
      );
    }

    if (trimmed.startsWith("شبکه: ") && trimmed.includes(" — آدرس آماده دریافت واریز است.")) {
      node.nodeValue = original.replace(
        "شبکه: ",
        lang === "en" ? "Network: " :
        lang === "ar" ? "الشبكة: " :
        lang === "ru" ? "Сеть: " : "Ağ: "
      ).replace(
        " — آدرس آماده دریافت واریز است.",
        " — " + dict["آدرس آماده دریافت واریز است."]
      );
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === "characterData") {
          translateDynamicDepositText(record.target);
        }
        record.addedNodes?.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            translateDynamicDepositText(node);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
            let textNode;
            while ((textNode = walker.nextNode())) {
              translateDynamicDepositText(textNode);
            }
          }
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  });
})();

// ===== WITHDRAWAL SECURITY WARNING TRANSLATION =====
document.addEventListener("DOMContentLoaded", function () {
  const warning = document.querySelector(".withdraw-warning p");
  if (!warning) return;

  const lang = localStorage.getItem("aiTraderLanguage") || "fa";

  const translations = {
    en: "Before confirming, carefully check the network and withdrawal details. Blockchain transactions cannot be reversed after they are sent.",
    ar: "قبل التأكيد، تحقق بعناية من الشبكة وتفاصيل السحب. لا يمكن التراجع عن معاملات البلوكشين بعد إرسالها.",
    ru: "Перед подтверждением внимательно проверьте сеть и данные вывода. После отправки транзакции в блокчейне нельзя отменить.",
    tr: "Onaylamadan önce ağı ve çekim bilgilerini dikkatlice kontrol edin. Blockchain işlemleri gönderildikten sonra geri alınamaz."
  };

  if (translations[lang]) {
    warning.textContent = translations[lang];
  }
});
// ===== END WITHDRAWAL SECURITY WARNING TRANSLATION =====
