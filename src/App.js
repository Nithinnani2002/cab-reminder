import { useState, useEffect, useRef } from "react";

const SMS_MESSAGES = [
  "Hey Dedee! 🚕 It's Sunday — don't forget to book your Wipro cabs for the whole week! Book them now before the window closes! Reply DONE when finished 💕",
  "Dedee! 🚨 Second reminder — have you booked your Wipro cabs yet?? Please do it now! Reply DONE when done 😄",
  "DEDEE. 😤 Third reminder. WIPRO. CABS. BOOK. NOW. PLEASE. Reply DONE when done 🙏",
  "FINAL WARNING 🚨🚨 Book your Wipro cabs RIGHT NOW or you will be stuck next week!! Reply DONE!! 🚕💨",
];

export default function App() {
  const [active, setActive] = useState(true);
  const [log, setLog] = useState(["⏰ System ready — waiting for 6:00 PM..."]);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [nextSlot, setNextSlot] = useState("");
  const slotRef = useRef(0);

  function addLog(msg) {
    const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    setLog(prev => [`${now} — ${msg}`, ...prev].slice(0, 30));
  }

  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const target = new Date();
      target.setHours(18, 0, 0, 0);
      if (target < now) {
        setCountdown("⏰ Time passed!");
        setNextSlot("Reminder already fired or missed");
        return;
      }
      const diff = target - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${m}m ${s}s`);
      setNextSlot("Today — 6:00 PM");
    }
    updateCountdown();
    const t = setInterval(updateCountdown, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    async function checkAndFire() {
      if (!active) return;
      const now = new Date();
      const hour = now.getHours();
      const min = now.getMinutes();
      if (hour === 18 && min === 0) {
        if (slotRef.current === 0) {
          slotRef.current = 1;
          await fireReminder(0);
        }
      }
    }
    const t = setInterval(checkAndFire, 10000); // checks every 10 sec so it doesn't miss
    return () => clearInterval(t);
  }, [active]);

  async function fireReminder(slot) {
    const msg = SMS_MESSAGES[Math.min(slot, SMS_MESSAGES.length - 1)];
    addLog(`🚀 Firing reminder...`);

    // SMS
    try {
      const r = await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const d = await r.json();
      addLog(d.ok ? "✅ SMS sent!" : "❌ SMS failed: " + d.error);
    } catch (e) {
      addLog("❌ SMS error: " + e.message);
    }

    // Email
    try {
      const r = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const d = await r.json();
      addLog(d.ok ? "✅ Email sent!" : "❌ Email failed: " + d.error);
    } catch (e) {
      addLog("❌ Email error: " + e.message);
    }
  }

  async function testNow() {
    setSending(true);
    addLog("🧪 Sending test...");
    await fireReminder(0);
    setSending(false);
  }

  function toggleActive() {
    if (active) { setActive(false); addLog("🛑 Reminders STOPPED"); }
    else { setActive(true); slotRef.current = 0; addLog("✅ Reminders ACTIVATED"); }
  }

  const s = {
    page: { background: "#0f0f0f", color: "#f0f0f0", fontFamily: "system-ui,sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px" },
    box: { width: "100%", maxWidth: "400px" },
    card: { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "16px", padding: "20px", marginBottom: "12px" },
    label: { fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#666", marginBottom: "12px" },
    stopBtn: { width: "100%", padding: "18px", background: "#ef4444", border: "none", borderRadius: "12px", color: "white", fontSize: "17px", fontWeight: "700", cursor: "pointer", marginBottom: "8px" },
    startBtn: { width: "100%", padding: "18px", background: "#22c55e", border: "none", borderRadius: "12px", color: "white", fontSize: "17px", fontWeight: "700", cursor: "pointer", marginBottom: "8px" },
    testBtn: { width: "100%", padding: "12px", background: "transparent", border: "1px solid #333", borderRadius: "10px", color: "#888", fontSize: "13px", cursor: "pointer" },
    row: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #222", fontSize: "13px" },
    logLine: { fontSize: "12px", color: "#777", padding: "5px 0", borderBottom: "1px solid #1f1f1f" },
  };

  return (
    <div style={s.page}>
      <style>{`button:hover{opacity:.85} button:active{transform:scale(.98)} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      <div style={s.box}>
        <div style={{ textAlign: "center", margin: "16px 0 24px" }}>
          <div style={{ fontSize: "26px", fontWeight: "700" }}>🚕 Dedee's Cab Reminder</div>
          <div style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>Wipro weekly booking reminder system</div>
        </div>

        <div style={s.card}>
          <div style={s.label}>Status</div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: active ? "#22c55e" : "#ef4444", animation: active ? "pulse 1.5s infinite" : "none" }} />
            <span style={{ color: active ? "#22c55e" : "#ef4444", fontWeight: "600" }}>{active ? "Reminders are ACTIVE" : "Reminders are STOPPED"}</span>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#fff" }}>{countdown}</div>
            <div style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>{nextSlot}</div>
          </div>
        </div>

        <div style={s.card}>
          <div style={s.label}>📅 Today's Schedule</div>
          <div style={s.row}>
            <span style={{ color: "#fff", fontWeight: "500" }}>6:00 PM</span>
            <span style={{ color: "#888" }}>SMS + Email 📧</span>
          </div>
          <div style={{ fontSize: "11px", color: "#444", marginTop: "10px" }}>⚠️ Keep this tab open!</div>
        </div>

        <div style={s.card}>
          <div style={s.label}>🎮 Control</div>
          <button style={active ? s.stopBtn : s.startBtn} onClick={toggleActive}>
            {active ? "🛑 SHE'S DONE — STOP ALL REMINDERS" : "▶️ ACTIVATE REMINDERS AGAIN"}
          </button>
          <button style={s.testBtn} onClick={testNow} disabled={sending}>
            {sending ? "⏳ Sending test..." : "🧪 Test — send reminder right now"}
          </button>
        </div>

        <div style={s.card}>
          <div style={s.label}>📋 Activity Log</div>
          {log.map((e, i) => <div key={i} style={s.logLine}>{e}</div>)}
        </div>

        <div style={{ textAlign: "center", fontSize: "11px", color: "#333", paddingBottom: "24px" }}>
          ⚠️ Keep this tab open until 6 PM • Built with love 💕
        </div>
      </div>
    </div>
  );
}
