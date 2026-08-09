const API = "http://localhost:3000";

async function startBot() {
  try {
    const res = await fetch(API + "/start");
    const data = await res.json();

    document.getElementById("status").innerText = "🟢 فعال";

    document.getElementById("signal").innerText =
      data.message || "ربات شروع شد";

    await getStatus();

  } catch (error) {
    document.getElementById("signal").innerText =
      "❌ اتصال به Backend برقرار نیست";
  }
}

async function stopBot() {
  try {
    const res = await fetch(API + "/stop");
    const data = await res.json();

    document.getElementById("status").innerText = "🔴 متوقف";

    document.getElementById("signal").innerText =
      data.message || "ربات متوقف شد";

    await getStatus();

  } catch (error) {
    document.getElementById("signal").innerText =
      "❌ اتصال به Backend برقرار نیست";
  }
}

async function getStatus() {
  try {
    const res = await fetch(API + "/status");
    const data = await res.json();

    document.getElementById("status").innerText =
      data.bot === "active" ? "🟢 فعال" : "🔴 متوقف";

    document.getElementById("balance").innerText =
      "💰 " + data.balance + " USDT";

    if (data.settings) {
      const risk = document.getElementById("risk");
      const capital = document.getElementById("capital");

      if (risk) {
        risk.value = data.settings.mode || "low-risk";
      }

      if (capital) {
        capital.value =
          data.settings.capital || data.balance;
      }
    }

  } catch (error) {
    document.getElementById("status").innerText =
      "⚠️ اتصال برقرار نیست";

    document.getElementById("signal").innerText =
      "Backend در دسترس نیست";
  }
}

async function getAnalysis() {
  try {
    const res = await fetch(API + "/analysis");
    const data = await res.json();

    if (data.error) {
      throw new Error(data.error);
    }

    const signal =
      document.getElementById("aiSignal");

    const risk =
      document.getElementById("riskLevel");

    const confidence =
      document.getElementById("confidence");

const marketTrend =
  document.getElementById("marketTrend");

    if (signal) {
      if (data.signal === "CHECK_BUY") {
        signal.innerText = "🟢 بررسی خرید";
      } else {
        signal.innerText = "🟡 انتظار";
      }
    }

    if (risk) {
      risk.innerText =
        data.risk === "LOW" ? "کم" : data.risk;
    }

    if (confidence) {
      confidence.innerText =
        data.confidence + "%";
    }

if (marketTrend) {
  if (data.trend === "UP") {
    marketTrend.innerText = "📈 صعودی";
  } else if (data.trend === "DOWN") {
    marketTrend.innerText = "📉 نزولی";
  } else {
    marketTrend.innerText = "➖ خنثی";
  }
}

  } catch (error) {

    const signal =
      document.getElementById("aiSignal");

    if (signal) {
      signal.innerText =
        "در انتظار تحلیل";
    }
  }
}

async function getBTCPrice() {
  try {
    const res = await fetch(API + "/price");
    const data = await res.json();

    if (!data.price) {
      return;
    }

    const priceElement =
      document.getElementById("btc-price");

    if (priceElement) {
      priceElement.innerText =
        Number(data.price).toLocaleString("en-US") +
        " USDT";
    }

  } catch (error) {

    const priceElement =
      document.getElementById("btc-price");

    if (priceElement) {
      priceElement.innerText =
        "قیمت در دسترس نیست";
    }
  }
}

async function saveSettings() {

  const risk =
    document.getElementById("risk");

  const capital =
    document.getElementById("capital");

  const mode =
    risk ? risk.value : "low-risk";

  const capitalValue =
    capital ? Number(capital.value) : 1000;

  document.getElementById("signal").innerText =
    "تنظیمات آماده ارسال است";

  console.log("Settings:", {
    mode: mode,
    capital: capitalValue
  });
}

getStatus();
getBTCPrice();
async function getPaperStatus() {
  try {
    const [paperRes, priceRes] = await Promise.all([
      fetch(API + "/paper-status"),
      fetch(API + "/price")
    ]);

    const data = await paperRes.json();
    const priceData = await priceRes.json();

    const status = document.getElementById("paperStatus");
    const position = document.getElementById("paperPosition");
    const entry = document.getElementById("paperEntryPrice");
    const profit = document.getElementById("paperProfit");

    const currentPrice = Number(priceData.price) || 0;
    const entryPrice = Number(data.entryPrice) || 0;
    const btcPosition = Number(data.position) || 0;

    if (btcPosition > 0 && entryPrice > 0) {
      if (status) status.innerText = "🟢 معامله باز";

      if (position) {
        position.innerText =
          btcPosition.toFixed(8) + " BTC";
      }

      if (entry) {
        entry.innerText =
          entryPrice.toFixed(2) + " USDT";
      }

      if (profit && currentPrice > 0) {
        const currentProfit =
          (currentPrice - entryPrice) * btcPosition;

        profit.innerText =
          currentProfit.toFixed(2) + " USDT";
      }

    } else {
      if (status) status.innerText = "⚪ بدون معامله";
      if (position) position.innerText = "0 BTC";
      if (entry) entry.innerText = "0 USDT";
      if (profit) profit.innerText = "0 USDT";
    }

  } catch (error) {
    console.log("Paper status error:", error.message);
  }
}

getAnalysis();
getPaperStatus();

setInterval(getBTCPrice, 15000);
setInterval(getAnalysis, 15000);
setInterval(getPaperStatus, 15000);
function showMarket() {
  const market = document.getElementById("marketTrend");

  if (market) {
    market.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}
