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
      document.getElementById("risk").value =
        data.settings.mode || "low-risk";

      document.getElementById("capital").value =
        data.settings.capital || data.balance;
    }

  } catch (error) {
    document.getElementById("status").innerText =
      "⚠️ اتصال برقرار نیست";

    document.getElementById("signal").innerText =
      "Backend در دسترس نیست";
  }
}

async function saveSettings() {
  const mode = document.getElementById("risk").value;
  const capital = Number(
    document.getElementById("capital").value
  );

  document.getElementById("signal").innerText =
    "تنظیمات آماده ارسال است";

  console.log("Settings:", {
    mode,
    capital
  });
}

getStatus();
