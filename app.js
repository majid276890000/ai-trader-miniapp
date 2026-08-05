function startBot() {
  document.getElementById("status").innerText = "🟢 فعال";
  document.getElementById("signal").innerText = "در حال تحلیل بازار...";
}

function stopBot() {
  document.getElementById("status").innerText = "🔴 متوقف";
  document.getElementById("signal").innerText = "ربات متوقف شد.";
}
