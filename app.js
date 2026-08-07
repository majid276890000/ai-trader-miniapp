const API = "http://localhost:3000";

async function startBot() {
  await fetch(API + "/start");
  document.getElementById("status").innerText = "🟢 فعال";
  document.getElementById("signal").innerText = "ربات شروع شد";
}

async function stopBot() {
  await fetch(API + "/stop");
  document.getElementById("status").innerText = "🔴 متوقف";
  document.getElementById("signal").innerText = "ربات متوقف شد";
}

async function getStatus() {
  const res = await fetch(API + "/status");
  const data = await res.json();

  document.getElementById("status").innerText =
    data.bot === "active" ? "🟢 فعال" : "🔴 متوقف";

  document.getElementById("balance").innerText =
    "💰 موجودی: " + data.balance;
}
getStatus();
