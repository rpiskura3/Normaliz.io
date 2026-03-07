import { useState, useEffect } from "react";
import { normalizeEmail }  from "./normalizers/email.js";
import { normalizePhone }  from "./normalizers/phone.js";
import { normalizeHandle } from "./normalizers/handle.js";

// ── Top-level contact normalizer ──────────────────────────────────────────────
function normalizeContact(input) {
  const out = {};
  if (input.email)   out.email   = normalizeEmail(input.email);
  if (input.phone)   out.phone   = normalizePhone(input.phone);
  if (input.handles) {
    out.handles = {};
    for (const [platform, handle] of Object.entries(input.handles)) {
      out.handles[platform] = normalizeHandle(platform, handle);
    }
  }
  return out;
}

// ── UI helpers ────────────────────────────────────────────────────────────────
const DEFAULT_INPUT = `{
  "email": "John.Doe+sales@gmail.com",
  "phone": "(614) 555-1212",
  "handles": {
    "twitter": "@john_doe"
  }
}`;

function JsonToken({ text }) {
  const lines = text.split("\n");
  return (
    <div className="font-mono text-sm leading-relaxed">
      {lines.map((line, i) => {
        const colored = line
          .replace(/"([^"]+)"(?=\s*:)/g, '<span style="color:#7dd3fc">"$1"</span>')
          .replace(/:\s*"([^"]+)"/g, ': <span style="color:#86efac">"$1"</span>')
          .replace(/:\s*(true|false)/g, ': <span style="color:#f9a8d4">$1</span>')
          .replace(/:\s*(\d+\.?\d*)/g, ': <span style="color:#fcd34d">$1</span>');
        return <div key={i} dangerouslySetInnerHTML={{ __html: colored }} />;
      })}
    </div>
  );
}

function Badge({ label, color }) {
  const colors = {
    green: { background: "rgba(134,239,172,0.15)", color: "#86efac", border: "1px solid rgba(134,239,172,0.3)" },
    blue:  { background: "rgba(125,211,252,0.15)", color: "#7dd3fc", border: "1px solid rgba(125,211,252,0.3)" },
    amber: { background: "rgba(252,211,77,0.15)",  color: "#fcd34d", border: "1px solid rgba(252,211,77,0.3)"  },
    pink:  { background: "rgba(249,168,212,0.15)", color: "#f9a8d4", border: "1px solid rgba(249,168,212,0.3)" },
    slate: { background: "rgba(148,163,184,0.1)",  color: "#94a3b8", border: "1px solid rgba(148,163,184,0.2)" },
  };
  return (
    <span style={{
      ...colors[color] || colors.slate,
      fontSize: "0.62rem", padding: "2px 7px", borderRadius: "999px",
      fontFamily: "monospace", fontWeight: 600, letterSpacing: "0.05em",
    }}>
      {label}
    </span>
  );
}

function FieldCard({ icon, title, children }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "10px", padding: "16px 18px", marginBottom: "10px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "#94a3b8", fontSize: "0.72rem", fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        <span>{icon}</span><span>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
      <span style={{ color: "#64748b", fontSize: "0.75rem", fontFamily: "monospace" }}>{label}</span>
      <span style={{ color: accent || "#e2e8f0", fontSize: "0.78rem", fontFamily: "monospace", fontWeight: accent ? 600 : 400 }}>{String(value)}</span>
    </div>
  );
}

function RulesApplied({ rules }) {
  if (!rules || rules.length === 0) return null;
  return (
    <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 4 }}>
      {rules.map((r) => <Badge key={r} label={r} color="slate" />)}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function App() {
  const [inputText, setInputText] = useState(DEFAULT_INPUT);
  const [output, setOutput]       = useState(null);
  const [rawOutput, setRawOutput] = useState("");
  const [error, setError]         = useState(null);
  const [tab, setTab]             = useState("visual");
  const [running, setRunning]     = useState(false);
  const [flash, setFlash]         = useState(false);

  function run() {
    setError(null);
    setRunning(true);
    setFlash(false);
    setTimeout(() => {
      try {
        const parsed = JSON.parse(inputText);
        const result = normalizeContact(parsed);
        setOutput(result);
        setRawOutput(JSON.stringify(result, null, 2));
        setFlash(true);
      } catch (e) {
        setError("Invalid JSON: " + e.message);
        setOutput(null);
      }
      setRunning(false);
    }, 320);
  }

  useEffect(() => { run(); }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#080c14", color: "#e2e8f0", fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #06b6d4, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⬡</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", letterSpacing: "-0.02em" }}>
              normaliz<span style={{ color: "#06b6d4" }}>.io</span>
            </div>
            <div style={{ fontSize: "0.65rem", color: "#475569", fontFamily: "monospace", letterSpacing: "0.05em" }}>API SANDBOX · v0.2.0 · rules engine</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Badge label="REST" color="blue" />
          <Badge label="JSON" color="green" />
          <Badge label="FREE TIER" color="amber" />
        </div>
      </div>

      {/* Endpoint bar */}
      <div style={{ padding: "12px 32px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ background: "rgba(6,182,212,0.15)", color: "#06b6d4", fontFamily: "monospace", fontSize: "0.7rem", fontWeight: 700, padding: "3px 8px", borderRadius: 4, letterSpacing: "0.05em" }}>POST</span>
        <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#64748b" }}>
          https://api.normaliz.io<span style={{ color: "#94a3b8" }}>/v1/normalize</span>
        </span>
      </div>

      {/* Body */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "calc(100vh - 120px)" }}>

        {/* Left: Input */}
        <div style={{ borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 24px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", fontFamily: "monospace", color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>request body</span>
            <span style={{ fontSize: "0.68rem", color: "#334155", fontFamily: "monospace" }}>application/json</span>
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run(); }}
              style={{ width: "100%", height: "100%", background: "transparent", border: "none", outline: "none", resize: "none", padding: "20px 24px", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.7, boxSizing: "border-box" }}
              spellCheck={false}
            />
          </div>
          <div style={{ padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={run} disabled={running} style={{ background: running ? "rgba(6,182,212,0.3)" : "linear-gradient(135deg, #06b6d4, #3b82f6)", border: "none", borderRadius: 7, color: "#fff", fontWeight: 700, fontSize: "0.8rem", padding: "9px 22px", cursor: running ? "not-allowed" : "pointer", letterSpacing: "0.02em" }}>
              {running ? "Normalizing…" : "▶  Run"}
            </button>
            <span style={{ fontSize: "0.65rem", color: "#334155", fontFamily: "monospace" }}>⌘ + Enter</span>
            {error && <span style={{ fontSize: "0.7rem", color: "#f87171", fontFamily: "monospace" }}>⚠ {error}</span>}
          </div>
        </div>

        {/* Right: Output */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 24px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", fontFamily: "monospace", color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>response</span>
            <div style={{ display: "flex", gap: 0, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, overflow: "hidden" }}>
              {["visual", "raw"].map((t) => (
                <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? "rgba(6,182,212,0.2)" : "transparent", border: "none", color: tab === t ? "#06b6d4" : "#475569", fontSize: "0.68rem", fontFamily: "monospace", letterSpacing: "0.06em", textTransform: "uppercase", padding: "5px 12px", cursor: "pointer" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
            {!output && !error && <div style={{ color: "#334155", fontFamily: "monospace", fontSize: "0.8rem", marginTop: 20 }}>Awaiting request…</div>}

            {output && tab === "raw" && (
              <div style={{ transition: "opacity 0.3s", opacity: flash ? 1 : 0.5 }}>
                <JsonToken text={rawOutput} />
              </div>
            )}

            {output && tab === "visual" && (
              <div style={{ transition: "opacity 0.4s", opacity: flash ? 1 : 0.4 }}>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
                  <span style={{ color: "#4ade80", fontFamily: "monospace", fontSize: "0.72rem", fontWeight: 600 }}>200 OK</span>
                  <span style={{ color: "#334155", fontFamily: "monospace", fontSize: "0.68rem" }}>· {Object.keys(output).length} fields normalized</span>
                </div>

                {/* Email */}
                {output.email && (
                  <FieldCard icon="✉" title="email">
                    {output.email.error
                      ? <Row label="error" value={output.email.error} accent="#f87171" />
                      : <>
                          <Row label="input"     value={output.email.input} />
                          <Row label="canonical" value={output.email.canonical} accent="#06b6d4" />
                          <Row label="domain"    value={output.email.domain} />

                          {/* Confidence bar */}
                          <div style={{ marginTop: 12, marginBottom: 4 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                              <span style={{ fontSize: "0.68rem", fontFamily: "monospace", color: "#475569" }}>confidence</span>
                              <span style={{ fontSize: "0.72rem", fontFamily: "monospace", color: output.email.confidence >= 0.90 ? "#4ade80" : output.email.confidence >= 0.75 ? "#fcd34d" : "#f87171", fontWeight: 700 }}>
                                {Math.round(output.email.confidence * 100)}%
                              </span>
                            </div>
                            <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                              <div style={{
                                height: "100%", borderRadius: 2,
                                width: `${Math.round(output.email.confidence * 100)}%`,
                                background: output.email.confidence >= 0.90 ? "#4ade80" : output.email.confidence >= 0.75 ? "#fcd34d" : "#f87171",
                                transition: "width 0.4s ease",
                              }} />
                            </div>
                          </div>

                          {/* Fuzzy corrections applied */}
                          {output.email.corrections?.length > 0 && (
                            <div style={{ marginTop: 10, padding: "8px 10px", background: "rgba(252,211,77,0.05)", border: "1px solid rgba(252,211,77,0.15)", borderRadius: 6 }}>
                              <div style={{ fontSize: "0.62rem", fontFamily: "monospace", color: "#92400e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>⚠ fuzzy corrections applied</div>
                              {output.email.corrections.map((c, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                                  <span style={{ fontSize: "0.7rem", fontFamily: "monospace", color: "#78716c" }}>
                                    {c.rule}: <span style={{ color: "#f87171" }}>{c.from}</span> → <span style={{ color: "#86efac" }}>{c.to}</span>
                                  </span>
                                  <span style={{ fontSize: "0.65rem", fontFamily: "monospace", color: "#78716c" }}>×{c.weight}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                            {output.email.is_alias && <Badge label="ALIAS STRIPPED" color="pink" />}
                            {output.email.corrections?.length > 0 && <Badge label="FUZZY CORRECTED" color="amber" />}
                          </div>
                          <RulesApplied rules={output.email.rules_applied} />
                        </>
                    }
                  </FieldCard>
                )}

                {/* Phone */}
                {output.phone && (
                  <FieldCard icon="📞" title="phone">
                    <Row label="input" value={output.phone.input} />
                    {output.phone.normalized
                      ? <>
                          <Row label="normalized" value={output.phone.normalized} accent="#06b6d4" />
                          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                            <Badge label={output.phone.country} color="blue" />
                            <Badge label={output.phone.type?.toUpperCase()} color={output.phone.type === "mobile" ? "green" : "amber"} />
                          </div>
                          <RulesApplied rules={output.phone.rules_applied} />
                        </>
                      : <Row label="error" value={output.phone.error} accent="#f87171" />
                    }
                  </FieldCard>
                )}

                {/* Handles */}
                {output.handles && Object.keys(output.handles).length > 0 && (
                  <FieldCard icon="@" title="handles">
                    {Object.entries(output.handles).map(([platform, data]) => (
                      <div key={platform} style={{ marginBottom: 12 }}>
                        <div style={{ color: "#475569", fontFamily: "monospace", fontSize: "0.68rem", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{platform}</div>
                        <Row label="input"     value={data.input} />
                        <Row label="canonical" value={data.canonical} accent="#06b6d4" />
                        <RulesApplied rules={data.rules_applied} />
                      </div>
                    ))}
                  </FieldCard>
                )}

              </div>
            )}
          </div>

          {output && (
            <div style={{ padding: "10px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 20 }}>
              {[["latency", "~8ms"], ["fields", Object.keys(output).length], ["credits used", "1"]].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: "0.6rem", fontFamily: "monospace", color: "#334155", textTransform: "uppercase", letterSpacing: "0.08em" }}>{k}</div>
                  <div style={{ fontSize: "0.78rem", fontFamily: "monospace", color: "#64748b" }}>{v}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
