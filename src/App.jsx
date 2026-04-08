import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// ============================================================
// SUPABASE CLIENT
// ============================================================
const supabase = createClient(
  "https://mbfdurtonbxpnoljkhtj.supabase.co",
  "sb_publishable_NVgpBNNkIiSA7hXh8AZ6Dg_0qc4EHx7"
);

// ============================================================
// THEME
// ============================================================
const C = {
  cream: "#FAF7F2", beige: "#F0EBE1", tan: "#D4C5B0",
  brown: "#8B6F5E", dark: "#4A3728", pink: "#E8869A",
  softPink: "#F2C4CE", sakura: "#FFB7C5", gold: "#C9A96E",
  white: "#FFFFFF", shadow: "rgba(74,55,40,0.12)", red: "#E53E3E",
};

const FILTERS = {
  warm: "sepia(.16) saturate(1.18) contrast(1.03) brightness(1.03)",
  vintage: "sepia(.34) saturate(.92) contrast(1.08) brightness(.98)",
  grain: "contrast(1.14) saturate(.86) brightness(.97)",
  bw: "grayscale(1) contrast(1.08) brightness(.98)",
  none: "none",
};

const displayHandle = (username, fallback = "user") => {
  const clean = String(username || fallback).trim().replace(/^@+/, "");
  return `@${clean || fallback}`;
};

const getReadableTone = (r, g, b) => ((r * 299 + g * 587 + b * 114) / 1000) > 150 ? "light" : "dark";

const analyzeImagePalette = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 24;
      canvas.height = 24;
      ctx.drawImage(img, 0, 0, 24, 24);
      const { data } = ctx.getImageData(0, 0, 24, 24);
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      resolve({ r, g, b, tone: getReadableTone(r, g, b), image: reader.result });
    };
    img.onerror = reject;
    img.src = reader.result;
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

// ============================================================
// FONT LOADER
// ============================================================
function FontLoader() {
  useEffect(() => {
    const l = document.createElement("link");
    l.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;600;700&family=Noto+Serif:wght@400;600;700&display=swap";
    l.rel = "stylesheet";
    document.head.appendChild(l);
  }, []);
  return null;
}

function LovableVibeStyle() {
  return (
    <style>{`
      body {
        background:
          radial-gradient(circle at 18px 18px, rgba(212,197,176,0.10) 0 5px, transparent 6px),
          radial-gradient(circle at 58px 58px, rgba(232,134,154,0.06) 0 4px, transparent 5px),
          #FAF7F2;
        background-size: 72px 72px;
        -webkit-font-smoothing: antialiased;
        overscroll-behavior-y: none;
      }
      html { scroll-behavior: smooth; }
      button, input, textarea { -webkit-tap-highlight-color: transparent; }
      @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      @keyframes softPop{0%{transform:scale(.96);opacity:.4}100%{transform:scale(1);opacity:1}}
      .diary-paper {
        background:
          radial-gradient(circle at 20px 20px, rgba(212,197,176,0.12) 0 4px, transparent 5px),
          linear-gradient(180deg, rgba(255,255,255,0.88), rgba(250,247,242,0.96));
        background-size: 64px 64px, auto;
      }
      .ios-card {
        transition: transform .22s cubic-bezier(.2,.8,.2,1), box-shadow .22s ease, opacity .22s ease;
        animation: softPop .22s ease both;
      }
      .ios-card:active { transform: scale(.985); }
    `}</style>
  );
}

// ============================================================
// SAKURA BURST ANIMATION
// ============================================================
function SakuraBurst({ x, y, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1000); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: "fixed", left: x, top: y, pointerEvents: "none", zIndex: 9999 }}>
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 360;
        const dist = 28 + Math.random() * 32;
        const tx = Math.cos((angle * Math.PI) / 180) * dist;
        const ty = Math.sin((angle * Math.PI) / 180) * dist;
        const size = 6 + Math.random() * 7;
        return (
          <div key={i} style={{
            position: "absolute", width: size, height: size,
            borderRadius: "50% 0 50% 0",
            background: `hsl(${338 + Math.random() * 22}, 78%, ${72 + Math.random() * 18}%)`,
            animation: `sp 0.95s ease-out forwards`,
            "--tx": `${tx}px`, "--ty": `${ty}px`,
          }} />
        );
      })}
      <style>{`@keyframes sp{0%{transform:translate(0,0) scale(1) rotate(0deg);opacity:1}100%{transform:translate(var(--tx),var(--ty)) scale(0) rotate(270deg);opacity:0}}`}</style>
    </div>
  );
}

// ============================================================
// FALLING SAKURA BACKGROUND
// ============================================================
function FallingSakura() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${Math.random() * 100}%`,
          top: `-${20 + Math.random() * 40}px`,
          width: 7 + Math.random() * 8, height: 7 + Math.random() * 8,
          borderRadius: "50% 0 50% 0",
          background: `hsl(${338 + Math.random() * 20}, 68%, 82%)`,
          opacity: 0.45 + Math.random() * 0.4,
          animation: `fall ${7 + Math.random() * 9}s linear ${Math.random() * 10}s infinite`,
        }} />
      ))}
      <style>{`@keyframes fall{0%{transform:translateY(-40px) rotate(0deg);opacity:.7}100%{transform:translateY(110vh) rotate(360deg);opacity:0}}`}</style>
    </div>
  );
}

// ============================================================
// SHARED UI COMPONENTS
// ============================================================
function DiaryLogo({ size = 28, color = C.dark }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: size, fontWeight: 700, color, letterSpacing: "-0.5px", lineHeight: 1 }}>
        Diary
      </span>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.pink, marginBottom: 2 }} />
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", style = {}, disabled = false, loading = false }) {
  const base = { border: "none", cursor: disabled || loading ? "not-allowed" : "pointer", borderRadius: 12, fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: 14, transition: "all 0.2s", opacity: disabled || loading ? 0.6 : 1 };
  const v = {
    primary: { background: C.dark, color: C.cream, padding: "13px 24px" },
    secondary: { background: "transparent", color: C.dark, border: `1.5px solid ${C.tan}`, padding: "12px 24px" },
    pink: { background: `linear-gradient(135deg,${C.pink},${C.sakura})`, color: C.white, padding: "13px 24px" },
    ghost: { background: "transparent", color: C.brown, padding: "8px 16px" },
  };
  return <button onClick={onClick} disabled={disabled || loading} style={{ ...base, ...v[variant], ...style }}>{loading ? "..." : children}</button>;
}

function Input({ placeholder, type = "text", value, onChange, icon, style = {}, multiline = false }) {
  const shared = {
    width: "100%", padding: icon ? "13px 14px 13px 40px" : "13px 14px",
    border: `1.5px solid ${C.tan}`, borderRadius: 12,
    background: C.white, fontFamily: "'Lato',sans-serif",
    fontSize: 14, color: C.dark, outline: "none",
    boxSizing: "border-box", transition: "border-color 0.2s", ...style,
  };
  return (
    <div style={{ position: "relative", width: "100%" }}>
      {icon && <span style={{ position: "absolute", left: 14, top: multiline ? 14 : "50%", transform: multiline ? "none" : "translateY(-50%)", color: C.tan, fontSize: 15 }}>{icon}</span>}
      {multiline
        ? <textarea placeholder={placeholder} value={value} onChange={onChange} style={{ ...shared, resize: "none", height: 85 }}
            onFocus={e => e.target.style.borderColor = C.pink} onBlur={e => e.target.style.borderColor = C.tan} />
        : <input type={type} placeholder={placeholder} value={value} onChange={onChange} style={shared}
            onFocus={e => e.target.style.borderColor = C.pink} onBlur={e => e.target.style.borderColor = C.tan} />
      }
    </div>
  );
}

function Toast({ msg, type = "success" }) {
  return msg ? (
    <div style={{
      position: "fixed", bottom: 110, left: "50%", transform: "translateX(-50%)",
      background: type === "error" ? C.red : C.dark, color: C.cream,
      padding: "12px 20px", borderRadius: 20, fontSize: 13,
      fontFamily: "'Lato',sans-serif", zIndex: 9998, whiteSpace: "nowrap",
      boxShadow: `0 8px 24px ${C.shadow}`, animation: "fadeUp 0.3s ease",
    }}>{msg}</div>
  ) : null;
}

function PageHeader({ title, subtitle, onBack, right }) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 60, background: "rgba(250,247,242,0.92)",
      backdropFilter: "blur(14px)", borderBottom: `1px solid ${C.beige}`,
      padding: "14px 16px", boxShadow: `0 8px 24px rgba(74,55,40,0.04)`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {onBack && (
          <button onClick={onBack} aria-label="Back" style={{
            width: 36, height: 36, borderRadius: "50%", border: `1px solid ${C.beige}`,
            background: C.white, color: C.dark, cursor: "pointer", fontSize: 18,
          }}>{"<"}</button>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontFamily: "'Playfair Display',Georgia,serif", color: C.dark, fontSize: 24, lineHeight: 1.1 }}>{title}</h1>
          {subtitle && <p style={{ margin: "3px 0 0", color: C.brown, fontSize: 12, fontStyle: "italic" }}>{subtitle}</p>}
        </div>
        {right}
      </div>
    </div>
  );
}

function SakuraStorm({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2100); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, pointerEvents: "none", overflow: "hidden", background: "rgba(250,247,242,0.18)" }}>
      {Array.from({ length: 58 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${Math.random() * 100}%`,
          top: `-${20 + Math.random() * 140}px`,
          width: 8 + Math.random() * 16,
          height: 8 + Math.random() * 16,
          borderRadius: "60% 0 60% 0",
          background: `hsl(${335 + Math.random() * 22}, 80%, ${72 + Math.random() * 18}%)`,
          opacity: 0.52 + Math.random() * 0.42,
          transform: `rotate(${Math.random() * 180}deg)`,
          animation: `stormFall ${1.4 + Math.random() * 0.9}s cubic-bezier(.2,.7,.4,1) ${Math.random() * .45}s forwards`,
          filter: "drop-shadow(0 4px 8px rgba(232,134,154,.2))",
        }} />
      ))}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "rgba(255,255,255,.88)", borderRadius: 26, padding: "18px 24px", boxShadow: `0 18px 50px ${C.shadow}`, textAlign: "center" }}>
          <DiaryLogo size={34} />
          <p style={{ margin: "8px 0 0", fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic", color: C.brown }}>Welcome back to your Diary</p>
        </div>
      </div>
      <style>{`@keyframes stormFall{0%{transform:translate3d(0,-80px,0) rotate(0deg);opacity:0}15%{opacity:1}100%{transform:translate3d(${Math.random() > .5 ? "" : "-"}46vw,115vh,0) rotate(560deg);opacity:0}}`}</style>
    </div>
  );
}

function placeToCoords(place) {
  const text = (place || "Diary").toLowerCase();
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return {
    lat: Number((((hash % 14000) / 100) - 70).toFixed(6)),
    lng: Number(((((hash / 14000) % 36000) / 100) - 180).toFixed(6)),
  };
}

function DiaryTravelMap({ posts = [], title = "Travel Map", onPostClick }) {
  const mapped = posts.filter(p => p.location || p.location_name || p.lat || p.lng).slice(0, 18);
  const mapRef = useRef(null);
  const mapElRef = useRef(null);

  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;
    const first = mapped[0];
    const center = first ? placeToCoords(first.location_name || first.location || "Diary") : { lng: 78.9629, lat: 20.5937 };
    mapRef.current = new maplibregl.Map({
      container: mapElRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [Number(first?.lng ?? center.lng), Number(first?.lat ?? center.lat)],
      zoom: first ? 3.2 : 1.6,
      attributionControl: false,
    });
    mapRef.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const markers = mapped.map((post, i) => {
      const fallback = placeToCoords(post.location_name || post.location || `post-${i}`);
      const lng = Number(post.lng ?? fallback.lng);
      const lat = Number(post.lat ?? fallback.lat);
      const el = document.createElement("button");
      el.type = "button";
      el.textContent = "🚩 Diary";
      el.style.cssText = `padding:8px 10px;border-radius:999px;background:${C.pink};color:white;border:2px solid white;font-weight:900;box-shadow:0 6px 16px rgba(74,55,40,.28);cursor:pointer;font-family:Lato,sans-serif;font-size:11px;white-space:nowrap;`;
      el.addEventListener("click", () => onPostClick?.(post));
      const marker = new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).setPopup(
        new maplibregl.Popup({ offset: 22 }).setHTML(`<strong>${post.location_name || post.location || "Diary moment"}</strong><br/>${post.caption || ""}`)
      ).addTo(mapRef.current);
      return marker;
    });
    if (markers.length) {
      const bounds = new maplibregl.LngLatBounds();
      markers.forEach(marker => bounds.extend(marker.getLngLat()));
      mapRef.current.fitBounds(bounds, { padding: 55, maxZoom: 8, duration: 600 });
    }
    return () => markers.forEach(marker => marker.remove());
  }, [mapped, onPostClick]);

  return (
    <div className="ios-card" style={{ background: C.white, borderRadius: 24, padding: 14, marginBottom: 18, boxShadow: `0 12px 36px ${C.shadow}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: "'Playfair Display',Georgia,serif", color: C.dark, fontSize: 20 }}>{title}</h3>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: C.brown }}>Pins show where Diary moments happened</p>
        </div>
        <span style={{ color: C.pink, fontWeight: 900 }}>Map</span>
      </div>
      <div ref={mapElRef} style={{ position: "relative", height: 240, borderRadius: 20, overflow: "hidden", background: `linear-gradient(145deg,#E8F1ED,#F9EFE7 55%,#E9EDF6)`, border: `1px solid ${C.beige}` }}>
        {mapped.length === 0 && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24 }}>
            <p style={{ margin: 0, color: C.brown, fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic" }}>No mapped moments yet. Every new post now needs a place.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Avatar({ src, size = 40, active = false, onClick }) {
  return (
    <div onClick={onClick} style={{
      width: size, height: size, borderRadius: "50%",
      padding: active ? 2 : 0,
      background: active ? `linear-gradient(135deg,${C.pink},${C.sakura})` : "transparent",
      cursor: "pointer", flexShrink: 0,
    }}>
      <img src={src || `https://ui-avatars.com/api/?background=D4C5B0&color=4A3728&name=U`}
        style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: active ? `2px solid ${C.cream}` : "none", display: "block" }} />
    </div>
  );
}

// ============================================================
// BOTTOM NAV
// ============================================================
function BottomNav({ page, setPage }) {
  const tabs = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "discover", icon: "🔍", label: "Discover" },
    { id: "create", icon: "✚", label: "Create" },
    { id: "memories", icon: "🔖", label: "Memories" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 480, background: C.white,
      borderTop: `1px solid ${C.beige}`, display: "flex",
      justifyContent: "space-around", alignItems: "center",
      padding: "10px 0 20px", zIndex: 100,
      boxShadow: `0 -4px 20px ${C.shadow}`,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setPage(t.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 12px" }}>
          {t.id === "create"
            ? <div style={{ width: 44, height: 44, borderRadius: 14, background: `linear-gradient(135deg,${C.pink},${C.dark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: C.white, marginTop: -16, boxShadow: `0 4px 16px ${C.shadow}` }}>✚</div>
            : <span style={{ fontSize: 20 }}>{t.icon}</span>
          }
          {t.id !== "create" && <span style={{ fontSize: 10, fontFamily: "'Lato',sans-serif", fontWeight: 700, color: page === t.id ? C.pink : C.tan, letterSpacing: "0.5px" }}>{t.label}</span>}
        </button>
      ))}
    </nav>
  );
}

// ============================================================
// LANDING PAGE
// ============================================================
function LandingPage({ onSignup, onLogin }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 80); }, []);
  return (
    <div style={{ minHeight: "100vh", background: C.cream, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <FallingSakura />
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url(https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80)`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.13 }} />
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 28px", maxWidth: 400, width: "100%", opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(28px)", transition: "all 0.8s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <DiaryLogo size={54} />
        <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic", fontSize: 14, color: C.brown, margin: "8px 0 40px", textAlign: "center" }}>Real moments. Real places. Real you.</p>
        <div style={{ width: "100%", height: 270, borderRadius: 24, overflow: "hidden", marginBottom: 36, boxShadow: `0 20px 60px ${C.shadow}`, position: "relative" }}>
          <img src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top,${C.dark}90,transparent)` }} />
          <div style={{ position: "absolute", bottom: 20, left: 20 }}>
            <p style={{ color: C.cream, fontFamily: "'Playfair Display',Georgia,serif", fontSize: 17, fontWeight: 700, margin: 0 }}>Capture your journey</p>
            <p style={{ color: C.softPink, fontSize: 12, margin: "4px 0 0", fontStyle: "italic" }}>📍 Kyoto, Japan</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 36 }}>
          {["🌸 Rural Moments", "🗺️ Travel Maps", "🎞️ Journeys", "🍜 Local Spots"].map(f => (
            <span key={f} style={{ background: C.beige, color: C.brown, padding: "6px 13px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1px solid ${C.tan}` }}>{f}</span>
          ))}
        </div>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
          <Btn variant="pink" onClick={onSignup} style={{ width: "100%", fontSize: 16, padding: "16px", borderRadius: 16 }}>Create your Diary ✦</Btn>
          <Btn variant="secondary" onClick={onLogin} style={{ width: "100%", fontSize: 15, borderRadius: 16 }}>Sign in</Btn>
        </div>
        <p style={{ color: C.tan, fontSize: 11, marginTop: 18, textAlign: "center" }}>By continuing you agree to Diary's Terms & Privacy Policy</p>
      </div>
    </div>
  );
}

function BottomNav2({ page, setPage }) {
  const tabs = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "quotes", icon: "📖", label: "Quotes" },
    { id: "discover", icon: "🔍", label: "Discover" },
    { id: "create", icon: "✚", label: "Create" },
    { id: "memories", icon: "🔖", label: "Memories" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 480, background: C.white,
      borderTop: `1px solid ${C.beige}`, display: "flex",
      justifyContent: "space-around", alignItems: "center",
      padding: "10px 0 20px", zIndex: 100,
      boxShadow: `0 -4px 20px ${C.shadow}`,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setPage(t.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 4px", minWidth: 54 }}>
          {t.id === "create"
            ? <div style={{ width: 44, height: 44, borderRadius: 14, background: `linear-gradient(135deg,${C.pink},${C.dark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: C.white, marginTop: -16, boxShadow: `0 4px 16px ${C.shadow}` }}>✚</div>
            : <span style={{ fontSize: 19 }}>{t.icon}</span>
          }
          {t.id !== "create" && <span style={{ fontSize: 9, fontFamily: "'Lato',sans-serif", fontWeight: 700, color: page === t.id ? C.pink : C.tan, letterSpacing: "0.3px" }}>{t.label}</span>}
        </button>
      ))}
    </nav>
  );
}

// ============================================================
// SIGNUP PAGE — REAL SUPABASE AUTH
// ============================================================
function ImageCropper({ image, shape = "circle", onCrop, onCancel }) {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgEl, setImgEl] = useState(null);
  const [ratio, setRatio] = useState("free");
  const CROP_SIZE = 300;
  const CROP_MAX = 320;
  const ratioOptions = [
    { label: "1:1", value: "1:1", aspect: 1 },
    { label: "4:3", value: "4:3", aspect: 4 / 3 },
    { label: "16:9", value: "16:9", aspect: 16 / 9 },
    { label: "Free \u2702\ufe0f", value: "free", aspect: null },
  ];
  const selectedRatio = ratioOptions.find((option) => option.value === ratio) || ratioOptions[3];
  const naturalAspect = imgEl ? imgEl.width / imgEl.height : 1;
  const cropAspect = shape === "circle" ? 1 : selectedRatio.aspect || naturalAspect;
  const cropWidth = shape === "circle" ? CROP_SIZE : cropAspect >= 1 ? CROP_MAX : Math.round(CROP_MAX * cropAspect);
  const cropHeight = shape === "circle" ? CROP_SIZE : cropAspect >= 1 ? Math.round(CROP_MAX / cropAspect) : CROP_MAX;

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImgEl(img);
      setScale(1);
      setOffset({ x: 0, y: 0 });
    };
    img.src = image;
  }, [image]);

  useEffect(() => {
    if (!imgEl || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, cropWidth, cropHeight);
    ctx.save();
    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(cropWidth / 2, cropHeight / 2, cropWidth / 2, 0, Math.PI * 2);
      ctx.clip();
    }
    const coverScale = Math.max(cropWidth / imgEl.width, cropHeight / imgEl.height);
    const w = imgEl.width * coverScale * scale;
    const h = imgEl.height * coverScale * scale;
    const x = (cropWidth - w) / 2 + offset.x;
    const y = (cropHeight - h) / 2 + offset.y;
    ctx.drawImage(imgEl, x, y, w, h);
    ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (shape === "circle") {
      ctx.arc(cropWidth / 2, cropHeight / 2, cropWidth / 2 - 1, 0, Math.PI * 2);
    } else {
      ctx.rect(1, 1, cropWidth - 2, cropHeight - 2);
    }
    ctx.stroke();
  }, [imgEl, scale, offset, shape, cropWidth, cropHeight]);

  const onMouseDown = (e) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const onMouseMove = (e) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const onMouseUp = () => setDragging(false);

  const onTouchStart = (e) => {
    const t = e.touches[0];
    setDragging(true);
    setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y });
  };
  const onTouchMove = (e) => {
    if (!dragging) return;
    const t = e.touches[0];
    setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
  };

  const handleRatioChange = (nextRatio) => {
    setRatio(nextRatio);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleCrop = () => {
    canvasRef.current.toBlob((blob) => {
      onCrop(blob, URL.createObjectURL(blob));
    }, "image/jpeg", 0.92);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", zIndex: 9999, gap: 24
    }}>
      <p style={{ color: "#fff", fontFamily: "'Lato',sans-serif", fontSize: 17, fontWeight: 600, margin: 0 }}>
        Drag &amp; zoom to crop your photo
      </p>
      <canvas
        ref={canvasRef} width={cropWidth} height={cropHeight}
        style={{ borderRadius: shape === "circle" ? "50%" : 18, cursor: dragging ? "grabbing" : "grab", boxShadow: "0 0 0 4px rgba(255,255,255,0.2)" }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onMouseUp}
      />
      {shape === "rect" && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 340 }}>
          {ratioOptions.map((option) => (
            <button key={option.value} onClick={() => handleRatioChange(option.value)} style={{
              padding: "8px 14px", borderRadius: 999,
              border: ratio === option.value ? "1.5px solid #fff" : "1.5px solid rgba(255,255,255,0.28)",
              background: ratio === option.value ? "#fff" : "rgba(255,255,255,0.08)",
              color: ratio === option.value ? "#222" : "#fff",
              fontFamily: "'Lato',sans-serif", fontSize: 13, fontWeight: 700,
              cursor: "pointer"
            }}>{option.label}</button>
          ))}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#ccc", fontSize: 13 }}>🔍</span>
        <input type="range" min="1" max="3" step="0.01" value={scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
          style={{ width: 180, accentColor: "#E8735A" }}
        />
        <span style={{ color: "#ccc", fontSize: 18 }}>🔍</span>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onCancel} style={{
          padding: "10px 28px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.3)",
          background: "transparent", color: "#fff", fontFamily: "'Lato',sans-serif",
          fontSize: 15, cursor: "pointer"
        }}>Cancel</button>
        <button onClick={handleCrop} style={{
          padding: "10px 28px", borderRadius: 8, border: "none",
          background: "#E8735A", color: "#fff", fontFamily: "'Lato',sans-serif",
          fontSize: 15, fontWeight: 700, cursor: "pointer"
        }}>Apply Crop ✓</button>
      </div>
    </div>
  );
}
function SignupPage({ onBack, onSuccess, showToast }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "", username: "", bio: "", country: "" });
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [cropImage, setCropImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const fileRef = useRef();
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleAvatarPick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCropImage(URL.createObjectURL(file));
    setShowCropper(true);
  };

  const handleCropped = (blob, url) => {
    setAvatarFile(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
    setAvatarPreview(url);
    setShowCropper(false);
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      if (authError) throw authError;

      const userId = authData.user.id;
      let avatarUrl = null;

      // 2. Upload avatar if selected
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("diary-media")
          .upload(`avatars/${userId}.${ext}`, avatarFile, { upsert: true });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from("diary-media").getPublicUrl(`avatars/${userId}.${ext}`);
          avatarUrl = urlData.publicUrl;
        }
      }

      // 3. Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        full_name: form.name,
        username: form.username.trim().replace(/^@+/, ""),
        bio: form.bio,
        country: form.country,
        avatar_url: avatarUrl,
      });
      if (profileError) throw profileError;

      showToast("Welcome to Diary! 🌸");
      onSuccess(authData.user);
    } catch (err) {
      showToast(err.message || "Signup failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'Lato',sans-serif" }}>
      {showCropper && <ImageCropper image={cropImage} shape="circle" onCrop={handleCropped} onCancel={() => setShowCropper(false)} />}
      <div style={{ padding: "56px 16px 24px", flex: 1, display: "flex", flexDirection: "column", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.brown, marginRight: 12 }}>←</button>
          <DiaryLogo size={22} />
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
          {[1, 2].map(s => <div key={s} style={{ height: 3, flex: 1, borderRadius: 2, background: s <= step ? C.pink : C.beige, transition: "background 0.3s" }} />)}
        </div>

        {step === 1 && (
          <>
            <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 27, color: C.dark, margin: "0 0 6px" }}>Create your account</h2>
            <p style={{ color: C.brown, fontSize: 13, marginBottom: 28 }}>Join thousands sharing real moments</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <Input placeholder="Full name" value={form.name} onChange={e => up("name", e.target.value)} icon="✦" />
              <Input placeholder="Email address" type="email" value={form.email} onChange={e => up("email", e.target.value)} icon="✉" />
              <Input placeholder="Password (min 6 chars)" type="password" value={form.password} onChange={e => up("password", e.target.value)} icon="🔒" />
            </div>
            <div style={{ marginTop: "auto", paddingTop: 28 }}>
              <Btn variant="pink" onClick={() => setStep(2)} disabled={!form.name || !form.email || form.password.length < 6} style={{ width: "100%", fontSize: 15, padding: "15px", borderRadius: 16 }}>Continue →</Btn>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 27, color: C.dark, margin: "0 0 6px" }}>Set up your profile</h2>
            <p style={{ color: C.brown, fontSize: 13, marginBottom: 24 }}>Let the world know who's behind the lens</p>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <div onClick={() => fileRef.current.click()} style={{ width: 88, height: 88, borderRadius: "50%", background: C.beige, border: `2px dashed ${C.tan}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden" }}>
                {avatarPreview ? <img src={avatarPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 26 }}>📷</span>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarPick} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <Input placeholder="@username" value={form.username} onChange={e => up("username", e.target.value.replace(/^@+/, ""))} icon="@" />
              <Input placeholder="Country" value={form.country} onChange={e => up("country", e.target.value)} icon="🌍" />
              <Input placeholder="Your bio — what do you love to capture?" value={form.bio} onChange={e => up("bio", e.target.value)} multiline icon="✍" />
            </div>
            <div style={{ marginTop: "auto", paddingTop: 28 }}>
              <Btn variant="pink" onClick={handleSignup} loading={loading} disabled={!form.username} style={{ width: "100%", fontSize: 15, padding: "15px", borderRadius: 16 }}>
                {loading ? "Creating your Diary..." : "Start your journey ✦"}
              </Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// LOGIN PAGE — REAL SUPABASE AUTH
// ============================================================
function LoginPage({ onBack, onSuccess, showToast }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      if (error) throw error;
      showToast("Welcome back! 🌸");
      onSuccess(data.user);
    } catch (err) {
      showToast(err.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!form.email) { showToast("Enter your email first", "error"); return; }
    await supabase.auth.resetPasswordForEmail(form.email);
    showToast("Reset link sent to your email!");
  };

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'Lato',sans-serif" }}>
      <div style={{ padding: "56px 16px 24px", display: "flex", flexDirection: "column", width: "100%", maxWidth: "100vw", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.brown, marginRight: 12 }}>←</button>
          <DiaryLogo size={22} />
        </div>
        <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 27, color: C.dark, margin: "0 0 6px" }}>Welcome back</h2>
        <p style={{ color: C.brown, fontSize: 13, marginBottom: 28 }}>Your moments are waiting</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 13, marginBottom: 16 }}>
          <Input placeholder="Email address" type="email" value={form.email} onChange={e => up("email", e.target.value)} icon="✉" />
          <Input placeholder="Password" type="password" value={form.password} onChange={e => up("password", e.target.value)} icon="🔒" />
        </div>
        <button onClick={handleForgot} style={{ background: "none", border: "none", color: C.pink, fontSize: 12, cursor: "pointer", textAlign: "right", marginBottom: 28, fontFamily: "'Lato',sans-serif" }}>Forgot password?</button>
        <Btn variant="pink" onClick={handleLogin} loading={loading} disabled={!form.email || !form.password} style={{ width: "100%", fontSize: 15, padding: "15px", borderRadius: 16 }}>
          Sign in to Diary
        </Btn>
      </div>
    </div>
  );
}

// ============================================================
// POST CARD — REAL LIKES & BOOKMARKS
// ============================================================
function PostCard({ post, currentUser, onLike, onBookmark, showToast, onOpenProfile, onDeletePost }) {
  const [burst, setBurst] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [commentMenuId, setCommentMenuId] = useState(null);
  const [reportReason, setReportReason] = useState("Spam");
  const [reportDescription, setReportDescription] = useState("");
  const [showFullDiary, setShowFullDiary] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loadingComment, setLoadingComment] = useState(false);

  const handleLike = async (e) => {
    if (!currentUser) { showToast("Sign in to like posts", "error"); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    if (!post.liked) setBurst({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    onLike(post.id, post.liked);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/?post=${post.id}`;
    try {
      if (navigator.share) await navigator.share({ title: "Diary post", text: post.caption || "See this Diary moment", url });
      else {
        await navigator.clipboard.writeText(url);
        showToast("Post link copied!");
      }
    } catch {
      showToast("Share cancelled");
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/?post=${post.id}`);
    setShowActions(false);
    showToast("Post link copied!");
  };

  const handleReport = async () => {
    if (!currentUser) { showToast("Sign in to report posts", "error"); return; }
    const { data: existing } = await supabase.from("reports")
      .select("id")
      .eq("reporter_id", currentUser.id)
      .eq("target_type", "post")
      .eq("target_id", post.id)
      .maybeSingle();
    if (existing) { showToast("You already reported this post"); setShowReport(false); return; }
    let { error } = await supabase.from("reports").insert({
      reporter_id: currentUser.id,
      target_type: "post",
      target_id: post.id,
      reason: reportReason,
      description: reportDescription.trim() || null,
      status: "pending",
    });
    if (error && /target_type|target_id|description|status/i.test(error.message || "")) {
      const fallback = await supabase.from("reports").insert({ post_id: post.id, reporter_id: currentUser.id, reported_user_id: post.user_id, reason: reportReason });
      error = fallback.error;
    }
    if (error) { showToast(error.message || "Could not submit report", "error"); return; }
    const { count } = await supabase.from("reports").select("*", { count: "exact", head: true }).eq("target_type", "post").eq("target_id", post.id);
    if ((count || 0) >= 5) await supabase.from("posts").update({ is_hidden: true, report_count: count }).eq("id", post.id);
    else await supabase.from("posts").update({ report_count: count || 1 }).eq("id", post.id);
    setShowActions(false);
    setShowReport(false);
    setReportDescription("");
    showToast("Report submitted");
  };

  const handleDeleteComment = async (commentId) => {
    await supabase.from("comments").delete().eq("id", commentId).eq("user_id", currentUser.id);
    setComments(prev => prev.filter(c => c.id !== commentId));
    showToast("Comment deleted");
  };

  const handleReportComment = async (commentObj) => {
    if (!currentUser) { showToast("Sign in to report comments", "error"); return; }
    let { error } = await supabase.from("reports").insert({
      reporter_id: currentUser.id,
      target_type: "comment",
      target_id: commentObj.id,
      reason: "Harassment",
      description: `Comment report: ${commentObj.content}`,
      status: "pending",
    });
    if (error && /target_type|target_id|description|status/i.test(error.message || "")) {
      const fallback = await supabase.from("reports").insert({ reporter_id: currentUser.id, reported_user_id: commentObj.user_id, reason: "Comment report" });
      error = fallback.error;
    }
    if (error) showToast(error.message || "Could not report comment", "error");
    else showToast("Comment reported");
    setCommentMenuId(null);
  };

  const loadComments = async () => {
    const { data } = await supabase.from("comments")
      .select("*, profiles(username, avatar_url)")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true })
      .limit(10);
    if (data) setComments(data);
  };

  const handleComment = async () => {
    if (!currentUser || !comment.trim()) return;
    setLoadingComment(true);
    const { error } = await supabase.from("comments").insert({
      post_id: post.id, user_id: currentUser.id, content: comment.trim(),
    });
    if (!error) {
      setComment("");
      loadComments();
      if (post.user_id !== currentUser.id) {
        await supabase.from("notifications").insert({ user_id: post.user_id, from_user_id: currentUser.id, type: "comment", post_id: post.id });
      }
      showToast("Comment posted!");
    }
    setLoadingComment(false);
  };

  const toggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(!showComments);
  };

  const menuItem = (label, onClick, danger = false) => (
    <button onClick={onClick} style={{
      width: "100%", padding: "14px 6px", border: "none", borderBottom: `1px solid ${C.beige}`,
      background: "transparent", color: danger ? C.red : C.dark, cursor: "pointer",
      textAlign: "left", fontFamily: "'Lato',sans-serif", fontSize: 14, fontWeight: danger ? 700 : 600,
    }}>{label}</button>
  );

  return (
    <div style={{ background: C.white, borderRadius: 20, overflow: "hidden", marginBottom: 16, boxShadow: `0 4px 20px ${C.shadow}` }}>
      {post.is_sponsored && (
        <div style={{ background: C.beige, padding: "5px 16px" }}>
          <span style={{ fontSize: 11, color: C.brown, fontWeight: 700, letterSpacing: "0.5px" }}>Local Spot 🍃</span>
        </div>
      )}
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div onClick={() => onOpenProfile?.(post.user_id)} style={{ cursor: "pointer" }}>
            <Avatar src={post.profiles?.avatar_url} size={38} />
          </div>
          <div onClick={() => onOpenProfile?.(post.user_id)} style={{ cursor: "pointer" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: C.dark, fontFamily: "'Lato',sans-serif" }}>{displayHandle(post.profiles?.username || "user")}</p>
            {post.location && <p style={{ margin: 0, fontSize: 11, color: C.brown, fontFamily: "'Lato',sans-serif" }}>📍 {post.location}</p>}
          </div>
        </div>
        <button onClick={() => setShowActions(true)} aria-label="Post actions" style={{ background: "none", border: "none", fontSize: 24, lineHeight: 1, cursor: "pointer", color: C.brown, padding: "2px 8px" }}>...</button>
      </div>

      {/* Image */}
      <div onDoubleClick={handleLike} style={{ width: "100%", aspectRatio: "4/3", overflow: "hidden", cursor: "pointer" }}>
        <img src={post.image_url} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: FILTERS[post.filter_type || "none"] || "none" }} />
      </div>

      {/* Actions */}
      <div style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 16 }}>
            <button onClick={handleLike} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: post.liked ? C.pink : C.tan, fontSize: 13, fontFamily: "'Lato',sans-serif", fontWeight: 700 }}>
              <span style={{ fontSize: 20, transform: post.liked ? "scale(1.15)" : "scale(1)", transition: "transform 0.18s", display: "block" }}>{post.liked ? "❤️" : "🤍"}</span>
              <span style={{ fontSize: 22, marginLeft: -26, fontFamily: "'Playfair Display',Georgia,serif", background: C.white, position: "relative", zIndex: 1 }}>D</span>
            </button>
            <button onClick={toggleComments} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: C.tan, fontSize: 13, fontFamily: "'Lato',sans-serif", fontWeight: 700 }}>
              <span style={{ fontSize: 18 }}>💬</span>
            </button>
            <button onClick={handleShare} style={{ background: "none", border: "none", cursor: "pointer", color: C.dark, fontSize: 18 }}>↗</button>
          </div>
          <button onClick={() => onBookmark(post.id, post.bookmarked)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: post.bookmarked ? C.gold : C.tan }}>
            {post.bookmarked ? "🔖" : "🏷️"}
          </button>
        </div>

        {post.caption && (
          <p style={{ margin: "0 0 4px", fontFamily: "'Lato',sans-serif", fontSize: 13, color: C.dark, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700 }}>{displayHandle(post.profiles?.username)} </span>{post.caption}
          </p>
        )}
        <p style={{ margin: 0, fontSize: 11, color: C.tan, fontFamily: "'Lato',sans-serif" }}>
          {new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
        {/* Comments */}
        {showComments && (
          <div style={{ marginTop: 12, borderTop: `1px solid ${C.beige}`, paddingTop: 12 }}>
            {comments.map(c => (
              <div key={c.id} style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <button onClick={() => onOpenProfile?.(c.user_id)} style={{ border: "none", background: "none", padding: 0, margin: 0, cursor: "pointer", fontWeight: 700, fontSize: 12, color: C.dark, fontFamily: "'Lato',sans-serif" }}>{displayHandle(c.profiles?.username)}</button>
                  <span style={{ fontSize: 12, color: C.dark, fontFamily: "'Lato',sans-serif", marginLeft: 4 }}>{c.content}</span>
                </div>
                <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 6 }}>
                  {currentUser?.id === c.user_id && <button onClick={() => handleDeleteComment(c.id)} style={{ border: "none", background: "none", color: C.red, cursor: "pointer", fontSize: 11 }}>Delete</button>}
                  {currentUser?.id !== c.user_id && (
                    <>
                      <button onClick={() => setCommentMenuId(commentMenuId === c.id ? null : c.id)} style={{ border: "none", background: "none", color: C.brown, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>⋯</button>
                      {commentMenuId === c.id && (
                        <div style={{ position: "absolute", top: 22, right: 0, minWidth: 130, background: C.white, border: `1px solid ${C.beige}`, borderRadius: 12, boxShadow: `0 8px 24px ${C.shadow}`, overflow: "hidden", zIndex: 4 }}>
                          <button onClick={() => handleReportComment(c)} style={{ width: "100%", border: "none", background: "none", padding: "10px 12px", textAlign: "left", cursor: "pointer", color: C.red, fontWeight: 700 }}>Report</button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            {currentUser && (
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input placeholder="Add a comment..." value={comment} onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleComment()}
                  style={{ flex: 1, padding: "8px 12px", border: `1px solid ${C.tan}`, borderRadius: 20, fontFamily: "'Lato',sans-serif", fontSize: 12, background: C.cream, outline: "none", color: C.dark }} />
                <button onClick={handleComment} disabled={loadingComment} style={{ background: C.pink, border: "none", borderRadius: 20, padding: "8px 14px", color: C.white, fontSize: 12, cursor: "pointer" }}>Post</button>
              </div>
            )}
          </div>
        )}
      </div>
      {showActions && (
        <div onClick={() => setShowActions(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 9998, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: C.white, borderRadius: "24px 24px 0 0", padding: "12px 18px 24px", boxShadow: `0 -14px 40px ${C.shadow}` }}>
            <div style={{ width: 42, height: 4, borderRadius: 999, background: C.tan, margin: "0 auto 12px", opacity: 0.7 }} />
            <h3 style={{ margin: "0 0 8px", fontFamily: "'Playfair Display',Georgia,serif", color: C.dark }}>Diary options</h3>
            {menuItem("View full Diary", () => { setShowFullDiary(true); setShowActions(false); })}
            {menuItem(post.liked ? "Not Diared" : "Diared it", (e) => { handleLike(e); setShowActions(false); })}
            {menuItem("Share", async () => { await handleShare(); setShowActions(false); })}
            {menuItem("Copy link", copyLink)}
            {currentUser?.id === post.user_id && menuItem("Delete post", () => { setShowActions(false); onDeletePost?.(post.id); }, true)}
            {currentUser?.id !== post.user_id && menuItem("Report to Diary authority", () => { setShowReport(true); setShowActions(false); }, true)}
            {menuItem("Cancel", () => setShowActions(false))}
          </div>
        </div>
      )}
      {showReport && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.white, borderRadius: 18, padding: 18, maxWidth: 340, width: "100%", boxShadow: `0 10px 35px ${C.shadow}` }}>
            <h3 style={{ margin: "0 0 10px", color: C.dark, fontFamily: "'Playfair Display',Georgia,serif" }}>Report this post</h3>
            {["Spam", "Harassment", "Nudity", "Violence", "Other"].map(reason => (
              <button key={reason} onClick={() => setReportReason(reason)} style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 0", background: reportReason === reason ? C.beige : "none", border: "none", borderBottom: `1px solid ${C.beige}`, cursor: "pointer", color: C.dark, fontWeight: reportReason === reason ? 800 : 500 }}>{reason}</button>
            ))}
            <textarea value={reportDescription} onChange={e => setReportDescription(e.target.value)} placeholder="Optional context for Diary authority..." style={{ width: "100%", height: 78, boxSizing: "border-box", marginTop: 12, padding: 12, borderRadius: 14, border: `1px solid ${C.tan}`, fontFamily: "'Lato',sans-serif", resize: "none", outline: "none" }} />
            <Btn variant="pink" onClick={handleReport} style={{ width: "100%", marginTop: 12 }}>Submit report</Btn>
            <Btn variant="secondary" onClick={() => setShowReport(false)} style={{ width: "100%", marginTop: 8 }}>Cancel</Btn>
          </div>
        </div>
      )}
      {showFullDiary && (
        <div style={{ position: "fixed", inset: 0, background: C.dark, zIndex: 9999, display: "flex", flexDirection: "column" }}>
          <PageHeader title="Full Diary" subtitle={post.location || post.profiles?.username || "Diary moment"} onBack={() => setShowFullDiary(false)} />
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: C.dark }}>
            <img src={post.image_url} style={{ width: "100%", maxHeight: "78vh", objectFit: "contain" }} />
          </div>
          <div style={{ background: C.white, padding: 16 }}>
            <p style={{ margin: 0, color: C.dark, fontFamily: "'Lato',sans-serif", lineHeight: 1.5 }}>{post.caption || "A Diary moment"}</p>
          </div>
        </div>
      )}
      {burst && <SakuraBurst x={burst.x} y={burst.y} onDone={() => setBurst(null)} />}
    </div>
  );
}

// ============================================================
// HOME FEED — REAL POSTS FROM SUPABASE
// ============================================================
const HEADINGS = {
  all: { title: "Moments in Japan", sub: "Capture the essence of rural tranquility" },
  rural: { title: "Rural Memories", sub: "Capture the essence of countryside tranquility" },
  food: { title: "Local Flavors", sub: "Taste the soul of every destination" },
  nature: { title: "Highland Stories", sub: "Where the wild and still meet" },
  coastal: { title: "Coastal Moments", sub: "Salt air and golden light" },
  cultural: { title: "Cultural Diaries", sub: "Stories woven into history" },
};

function HomePage({ currentUser, profile, currentCountry, setPage, showToast, onOpenProfile, onOpenPost }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [feedSeason, setFeedSeason] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const countryLabel = (currentCountry || profile?.country || "").trim();
  const heading = category === "all"
    ? { title: `Moments in ${countryLabel || "your world"}`, sub: countryLabel ? `Diary moments around ${countryLabel}` : HEADINGS.all.sub }
    : (HEADINGS[category] || HEADINGS.all);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("posts")
      .select("*, profiles(username, avatar_url, full_name)")
      .neq("is_hidden", true)
      .order("created_at", { ascending: false })
      .limit(20);
    if (category !== "all") query = query.eq("category", category);
    if (feedSeason !== "all") query = query.eq("season", feedSeason);
    if (category === "all" && countryLabel) query = query.ilike("location", `%${countryLabel}%`);
    let { data, error } = await query;
    if (error && /season/i.test(error.message || "")) {
      let retry = supabase.from("posts").select("*, profiles(username, avatar_url, full_name)").order("created_at", { ascending: false }).limit(20);
      if (category !== "all") retry = retry.eq("category", category);
      if (category === "all" && countryLabel) retry = retry.ilike("location", `%${countryLabel}%`);
      const fallback = await retry;
      data = fallback.data;
      error = fallback.error;
    }
    if (error && /is_hidden/i.test(error.message || "")) {
      let retry = supabase.from("posts").select("*, profiles(username, avatar_url, full_name)").order("created_at", { ascending: false }).limit(20);
      if (category !== "all") retry = retry.eq("category", category);
      if (feedSeason !== "all") retry = retry.eq("season", feedSeason);
      if (category === "all" && countryLabel) retry = retry.ilike("location", `%${countryLabel}%`);
      const fallback = await retry;
      data = fallback.data;
      error = fallback.error;
    }
    if ((!data || data.length === 0) && category === "all" && countryLabel) {
      let retry = supabase.from("posts").select("*, profiles(username, avatar_url, full_name)").order("created_at", { ascending: false }).limit(20);
      if (feedSeason !== "all") retry = retry.eq("season", feedSeason);
      const fallback = await retry;
      data = fallback.data;
      error = fallback.error;
    }
    if (error) { showToast("Failed to load posts", "error"); setLoading(false); return; }

    // Fetch likes and bookmarks for current user
    if (currentUser && data?.length) {
      const postIds = data.map(p => p.id);
      const [{ data: likeData }, { data: bmData }, { data: countsData }] = await Promise.all([
        supabase.from("likes").select("post_id").eq("user_id", currentUser.id).in("post_id", postIds),
        supabase.from("bookmarks").select("post_id").eq("user_id", currentUser.id).in("post_id", postIds),
        supabase.from("likes").select("post_id").in("post_id", postIds),
      ]);
      const likedSet = new Set((likeData || []).map(l => l.post_id));
      const bmSet = new Set((bmData || []).map(b => b.post_id));
      const countMap = {};
      (countsData || []).forEach(l => { countMap[l.post_id] = (countMap[l.post_id] || 0) + 1; });
      setPosts((data || []).map(p => ({ ...p, liked: likedSet.has(p.id), bookmarked: bmSet.has(p.id), likes_count: countMap[p.id] || 0 })));
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  }, [category, countryLabel, feedSeason, currentUser]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleLike = async (postId, wasLiked) => {
    if (!currentUser) { showToast("Sign in to like posts", "error"); return; }
    setPosts(p => p.map(post => post.id === postId ? { ...post, liked: !wasLiked, likes_count: wasLiked ? post.likes_count - 1 : post.likes_count + 1 } : post));
    if (wasLiked) {
      await supabase.from("likes").delete().match({ user_id: currentUser.id, post_id: postId });
    } else {
      await supabase.from("likes").insert({ user_id: currentUser.id, post_id: postId });
      const likedPost = posts.find(post => post.id === postId);
      if (likedPost?.user_id && likedPost.user_id !== currentUser.id) {
        await supabase.from("notifications").insert({ user_id: likedPost.user_id, from_user_id: currentUser.id, type: "like", post_id: postId });
      }
    }
  };

  const handleBookmark = async (postId, wasBookmarked) => {
    if (!currentUser) { showToast("Sign in to bookmark posts", "error"); return; }
    setPosts(p => p.map(post => post.id === postId ? { ...post, bookmarked: !wasBookmarked } : post));
    if (wasBookmarked) {
      await supabase.from("bookmarks").delete().match({ user_id: currentUser.id, post_id: postId });
    } else {
      await supabase.from("bookmarks").insert({ user_id: currentUser.id, post_id: postId });
    }
  };

  const handleDeletePost = async (postId) => {
    if (!currentUser || !confirm("Delete this post permanently?")) return;
    await supabase.from("comments").delete().eq("post_id", postId);
    await supabase.from("likes").delete().eq("post_id", postId);
    await supabase.from("bookmarks").delete().eq("post_id", postId);
    const { error } = await supabase.from("posts").delete().eq("id", postId).eq("user_id", currentUser.id);
    if (error) showToast("Could not delete post", "error");
    else {
      setPosts(prev => prev.filter(post => post.id !== postId));
      showToast("Post deleted");
    }
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: "52px 20px 14px", background: C.cream, position: "sticky", top: 0, zIndex: 50, borderBottom: `1px solid ${C.beige}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <DiaryLogo size={25} />
          <div style={{ display: "flex", gap: 14 }}>
            <button onClick={() => setPage("notifications")} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>🔔</button>
            <button onClick={() => setPage("dms")} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>✉️</button>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* Dynamic heading */}
        <div style={{ textAlign: "center", padding: "22px 0 14px", transition: "all 0.4s" }}>
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 29, fontWeight: 700, color: C.dark, margin: "0 0 5px", lineHeight: 1.2 }}>{heading.title}</h1>
          <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic", fontSize: 13, color: C.brown, margin: 0 }}>{heading.sub}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <button onClick={() => setPage("discover")} style={{ background: C.white, border: `1px solid ${C.beige}`, borderRadius: 16, padding: "12px 14px", cursor: "pointer", color: C.dark, fontWeight: 800, boxShadow: `0 6px 16px ${C.shadow}` }}>Discover</button>
          <button onClick={() => setPage("quotes")} style={{ background: C.white, border: `1px solid ${C.beige}`, borderRadius: 16, padding: "12px 14px", cursor: "pointer", color: C.dark, fontWeight: 800, boxShadow: `0 6px 16px ${C.shadow}` }}>Diary Quotes</button>
        </div>

        {/* Stories */}
        <div style={{ background: C.beige, borderRadius: 16, padding: "13px 16px", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: 13, color: C.dark }}>🔖 Memories</span>
            <span style={{ fontSize: 12, color: C.brown, cursor: "pointer" }} onClick={() => setPage("memories")}>See All →</span>
          </div>
          <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 2 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <div onClick={() => setPage("create")} style={{ width: 50, height: 50, borderRadius: "50%", background: C.tan, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <span style={{ fontSize: 20, color: C.white }}>+</span>
              </div>
              <span style={{ fontSize: 10, color: C.brown, fontFamily: "'Lato',sans-serif" }}>New</span>
            </div>
            {posts.slice(0, 5).map(p => (
              <div key={p.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
                <Avatar src={p.profiles?.avatar_url} size={50} active={true} />
                <span style={{ fontSize: 10, color: C.brown, fontFamily: "'Lato',sans-serif", maxWidth: 54, textAlign: "center", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{p.profiles?.username}</span>
              </div>
            ))}
          </div>
        </div>

        {posts[0] && (
          <div onClick={() => onOpenPost?.(posts[0])} className="ios-card" style={{ background: C.white, borderRadius: 22, padding: 14, marginBottom: 18, boxShadow: `0 10px 30px ${C.shadow}`, cursor: "pointer" }}>
            <p style={{ margin: "0 0 8px", color: C.pink, fontWeight: 900, fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>Today's Moment</p>
            <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 12, alignItems: "center" }}>
              <img src={posts[0].image_url} style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 18 }} />
              <div>
                <h3 style={{ margin: 0, fontFamily: "'Playfair Display',Georgia,serif", color: C.dark }}>A Diary worth opening</h3>
                <p style={{ margin: "5px 0 0", color: C.brown, fontSize: 12, lineHeight: 1.45 }}>{posts[0].location || "Somewhere beautiful"} · {posts[0].caption || "A real moment from the feed"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Feed header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 19, color: C.dark, margin: 0 }}>Countryside Stories</h2>
          <button onClick={() => setShowFilter(!showFilter)} style={{ background: C.white, border: `1px solid ${C.tan}`, borderRadius: 10, padding: "7px 13px", fontFamily: "'Lato',sans-serif", fontSize: 12, fontWeight: 700, color: C.dark, cursor: "pointer" }}>⚙ Filter</button>
        </div>

        {/* Filter */}
        {showFilter && (
          <div style={{ background: C.white, borderRadius: 14, boxShadow: `0 8px 30px ${C.shadow}`, padding: "6px 0", marginBottom: 14, border: `1px solid ${C.beige}` }}>
            <p style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: 10, color: C.tan, padding: "8px 16px 2px", margin: 0, letterSpacing: "1px", textTransform: "uppercase" }}>Category</p>
            {Object.keys(HEADINGS).map(c => (
              <button key={c} onClick={() => { setCategory(c); setShowFilter(false); }}
                style={{ display: "block", width: "100%", textAlign: "left", background: category === c ? C.beige : "none", border: "none", padding: "10px 16px", fontFamily: "'Lato',sans-serif", fontSize: 14, color: category === c ? C.pink : C.dark, cursor: "pointer", fontWeight: category === c ? 700 : 400 }}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
            <p style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: 10, color: C.tan, padding: "10px 16px 2px", margin: 0, letterSpacing: "1px", textTransform: "uppercase" }}>Season</p>
            {["all", "spring", "summer", "autumn", "winter"].map(s => (
              <button key={s} onClick={() => { setFeedSeason(s); setShowFilter(false); }}
                style={{ display: "block", width: "100%", textAlign: "left", background: feedSeason === s ? C.beige : "none", border: "none", padding: "10px 16px", fontFamily: "'Lato',sans-serif", fontSize: 14, color: feedSeason === s ? C.pink : C.dark, cursor: "pointer", fontWeight: feedSeason === s ? 700 : 400 }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Posts */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <FallingSakura />
            <p style={{ fontFamily: "'Playfair Display',Georgia,serif", color: C.brown, fontStyle: "italic" }}>Loading moments...</p>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ fontSize: 32 }}>🌸</p>
            <p style={{ fontFamily: "'Playfair Display',Georgia,serif", color: C.brown, fontStyle: "italic" }}>No moments yet. Be the first!</p>
            <Btn variant="pink" onClick={() => setPage("create")} style={{ marginTop: 12 }}>Share a Moment</Btn>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} currentUser={currentUser} onLike={handleLike} onBookmark={handleBookmark} showToast={showToast} onOpenProfile={onOpenProfile} onDeletePost={handleDeletePost} />
          ))
        )}

        {posts.length > 0 && (
          <button onClick={() => setPage("discover")} style={{ width: "100%", padding: "13px", background: "none", border: `1.5px solid ${C.tan}`, borderRadius: 14, fontFamily: "'Lato',sans-serif", fontSize: 14, color: C.brown, cursor: "pointer", marginBottom: 20, fontWeight: 700 }}>
            Discover More →
          </button>
        )}

        <div style={{ textAlign: "center", padding: "16px 0 36px" }}>
          <DiaryLogo size={16} color={C.tan} />
          <p style={{ fontSize: 10, color: C.tan, marginTop: 4, fontFamily: "'Lato',sans-serif" }}>© 2026 Diary. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

function PostViewerPage({ post, setPage, showToast }) {
  if (!post) return null;
  return (
    <div style={{ minHeight: "100vh", background: C.cream, paddingBottom: 30 }}>
      <PageHeader title="View full Diary" subtitle={post.location_name || post.location || displayHandle(post.profiles?.username, "diary")} onBack={() => setPage("home")} />
      <div style={{ padding: 16 }}>
        <div style={{ background: C.white, borderRadius: 24, overflow: "hidden", boxShadow: `0 12px 36px ${C.shadow}` }}>
          {post.image_url && <img src={post.image_url} style={{ width: "100%", maxHeight: "58vh", objectFit: "cover", display: "block", filter: FILTERS[post.filter_type || "none"] || "none" }} />}
          <div style={{ padding: 16 }}>
            <p style={{ margin: "0 0 8px", fontWeight: 800, color: C.dark }}>{displayHandle(post.profiles?.username || post.username || "diary")}</p>
            <p style={{ margin: "0 0 10px", color: C.dark, fontSize: 14, lineHeight: 1.6 }}>{post.caption || "A Diary moment."}</p>
            {post.location && <p style={{ margin: "0 0 12px", color: C.brown, fontSize: 12 }}>📍 {post.location}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/?post=${post.id}`).then(() => showToast("Post link copied!"))} style={{ border: `1px solid ${C.beige}`, borderRadius: 999, background: C.white, padding: "9px 14px", cursor: "pointer" }}>🔄 Share</button>
              <button onClick={() => setPage("home")} style={{ border: `1px solid ${C.beige}`, borderRadius: 999, background: C.white, padding: "9px 14px", cursor: "pointer" }}>❌ Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuoteCard({ post, showToast, onOpenProfile, onOpenPost }) {
  return (
    <div style={{ background: C.white, borderRadius: 22, padding: 16, boxShadow: `0 10px 28px ${C.shadow}`, border: `1px solid ${C.beige}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <Avatar src={post.profiles?.avatar_url} size={42} active onClick={() => onOpenProfile?.(post.user_id)} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, color: C.dark, fontWeight: 800 }}>{displayHandle(post.profiles?.username)}</p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: C.brown }}>{new Date(post.created_at || Date.now()).toLocaleDateString()}</p>
        </div>
      </div>
      <div onClick={() => onOpenPost?.(post)} style={{ cursor: "pointer" }}>
        <p style={{ margin: "0 0 12px", fontFamily: "'Playfair Display',Georgia,serif", fontSize: 22, lineHeight: 1.45, color: C.dark }}>{post.caption}</p>
        {post.image_url && <img src={post.image_url} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 18, marginBottom: 12, filter: FILTERS[post.filter_type || "none"] || "none" }} />}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => showToast("Diary liked it")} style={{ border: "none", background: "none", cursor: "pointer", color: C.dark }}>❤️</button>
        <button onClick={() => onOpenPost?.(post)} style={{ border: "none", background: "none", cursor: "pointer", color: C.dark }}>💬</button>
        <button onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/?post=${post.id}`).then(() => showToast("Quote link copied!"))} style={{ border: "none", background: "none", cursor: "pointer", color: C.dark }}>🔄</button>
      </div>
    </div>
  );
}

// ============================================================
// CREATE POST — REAL IMAGE UPLOAD TO SUPABASE
// ============================================================
function CreatePage({ currentUser, showToast, setPage }) {
  const [postMode, setPostMode] = useState("image");
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("rural");
  const [season, setSeason] = useState("spring");
  const [filterType, setFilterType] = useState("warm");
  const [rotation, setRotation] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const fileRef = useRef();

  const pickImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCropImage(URL.createObjectURL(file));
    setShowCropper(true);
  };

  const handleCropped = (blob, url) => {
    setImageFile(new File([blob], "post.jpg", { type: "image/jpeg" }));
    setPreview(url);
    setRotation(0);
    setShowCropper(false);
  };

  const rotateImageFile = (file, degrees) => new Promise((resolve, reject) => {
    const normalized = ((degrees % 360) + 360) % 360;
    if (!normalized) { resolve(file); return; }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const sideways = normalized === 90 || normalized === 270;
      canvas.width = sideways ? img.height : img.width;
      canvas.height = sideways ? img.width : img.height;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((normalized * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        if (!blob) { reject(new Error("Could not rotate image")); return; }
        resolve(new File([blob], file.name || "post.jpg", { type: "image/jpeg" }));
      }, "image/jpeg", 0.92);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not load image for rotation")); };
    img.src = url;
  });

  const handlePost = async () => {
    if (!currentUser) return;
    if (postMode === "image" && !imageFile) return;
    if (postMode === "image" && !location.trim()) { showToast("Location is required for every Diary post", "error"); return; }
    if (postMode === "quote" && !caption.trim()) { showToast("Write your diary quote first", "error"); return; }
    setLoading(true);
    try {
      let publicUrl = "";
      if (imageFile) {
        const uploadFile = await rotateImageFile(imageFile, rotation);
        const ext = uploadFile.name.split(".").pop();
        const path = `posts/${currentUser.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("diary-media").upload(path, uploadFile);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("diary-media").getPublicUrl(path);
        publicUrl = urlData.publicUrl;
      }
      const coords = placeToCoords(location.trim());

      // Insert post with Travel Map fields when the Supabase schema supports them.
      const postPayload = {
        user_id: currentUser.id,
        image_url: publicUrl,
        caption: caption.trim(),
        location: location.trim(),
        location_name: location.trim(),
        lat: coords.lat,
        lng: coords.lng,
        category: postMode === "quote" ? "quote" : category,
        season,
        filter_type: filterType,
      };
      let { error: postErr } = await supabase.from("posts").insert(postPayload);
      if (postErr && /location_name|lat|lng|season|filter_type/i.test(postErr.message || "")) {
        const fallback = { user_id: currentUser.id, image_url: publicUrl, caption: caption.trim(), location: location.trim(), category: postMode === "quote" ? "quote" : category };
        const retry = await supabase.from("posts").insert(fallback);
        postErr = retry.error;
        if (!postErr) showToast("Moment shared. Add map/season columns in Supabase for full Travel Map storage.");
      }
      if (postErr) throw postErr;

      showToast(postMode === "quote" ? "Diary quote shared! ✨" : "Moment shared! 🌸");
      setCaption(""); setLocation(""); setImageFile(null); setPreview(null); setSeason("spring"); setFilterType("warm"); setRotation(0);
      setPage(postMode === "quote" ? "quotes" : "home");
    } catch (err) {
      showToast(err.message || "Failed to post", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "56px 16px 100px", background: C.cream, minHeight: "100vh" }}>
      {showCropper && <ImageCropper image={cropImage} shape="rect" onCrop={handleCropped} onCancel={() => setShowCropper(false)} />}
      <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 25, color: C.dark, margin: "0 0 4px" }}>Create</h1>
      <p style={{ color: C.brown, fontSize: 13, fontFamily: "'Lato',sans-serif", marginBottom: 18 }}>Choose what you want to share</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
        <button onClick={() => setPostMode("image")} style={{ background: postMode === "image" ? C.dark : C.white, color: postMode === "image" ? C.white : C.dark, border: `1.5px solid ${postMode === "image" ? C.dark : C.tan}`, borderRadius: 18, padding: "16px 12px", cursor: "pointer", fontWeight: 800 }}>🖼️ Post an image</button>
        <button onClick={() => setPostMode("quote")} style={{ background: postMode === "quote" ? C.pink : C.white, color: postMode === "quote" ? C.white : C.dark, border: `1.5px solid ${postMode === "quote" ? C.pink : C.tan}`, borderRadius: 18, padding: "16px 12px", cursor: "pointer", fontWeight: 800 }}>✍️ Diary quote</button>
      </div>

      {/* Upload area */}
      <div onClick={() => fileRef.current.click()} style={{ width: "100%", aspectRatio: postMode === "quote" ? "4/3" : "1", background: C.beige, borderRadius: 20, border: `2px dashed ${C.tan}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 18, overflow: "hidden" }}>
        {preview ? <img src={preview} style={{ width: "100%", height: "100%", objectFit: "cover", filter: FILTERS[filterType] || "none", transform: `rotate(${rotation}deg)`, transition: "transform .25s ease, filter .25s ease" }} /> : (
          <>
            <span style={{ fontSize: 46 }}>📷</span>
            <p style={{ fontFamily: "'Lato',sans-serif", color: C.brown, fontSize: 14, marginTop: 10 }}>{postMode === "quote" ? "Tap to add an optional image" : "Tap to upload your moment"}</p>
            <p style={{ fontFamily: "'Lato',sans-serif", color: C.tan, fontSize: 11, margin: 0 }}>JPG, PNG up to 20MB</p>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={pickImage} />
      {preview && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "-6px 0 18px" }}>
          <button onClick={() => setRotation(r => (r + 270) % 360)} style={{ background: C.white, border: `1.5px solid ${C.tan}`, borderRadius: 14, padding: "11px 10px", fontFamily: "'Lato',sans-serif", fontSize: 13, fontWeight: 800, color: C.dark, cursor: "pointer" }}>↺ Rotate left</button>
          <button onClick={() => setRotation(r => (r + 90) % 360)} style={{ background: C.white, border: `1.5px solid ${C.tan}`, borderRadius: 14, padding: "11px 10px", fontFamily: "'Lato',sans-serif", fontSize: 13, fontWeight: 800, color: C.dark, cursor: "pointer" }}>Rotate right ↻</button>
        </div>
      )}

      <Input placeholder={postMode === "quote" ? "Write your diary quote..." : "Write your moment... what does this place feel like?"} value={caption} onChange={e => setCaption(e.target.value)} multiline style={{ marginBottom: 13 }} />
      <Input placeholder="📍 Add location" value={location} onChange={e => setLocation(e.target.value)} style={{ marginBottom: 13 }} />

      <p style={{ margin: "-5px 0 13px", color: C.brown, fontSize: 11, fontFamily: "'Lato',sans-serif" }}>Location is required for every Diary moment and powers your Travel Map.</p>

      {/* Category */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, color: C.brown, marginBottom: 8, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase" }}>Vibe</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["rural", "nature", "food", "coastal", "cultural", "adventure"].map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{ background: category === c ? C.pink : C.white, color: category === c ? C.white : C.dark, border: `1.5px solid ${category === c ? C.pink : C.tan}`, borderRadius: 20, padding: "7px 14px", fontFamily: "'Lato',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, color: C.brown, marginBottom: 8, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase" }}>Season</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["spring", "summer", "autumn", "winter"].map(s => (
            <button key={s} onClick={() => setSeason(s)} style={{ background: season === s ? C.dark : C.white, color: season === s ? C.cream : C.dark, border: `1.5px solid ${season === s ? C.dark : C.tan}`, borderRadius: 20, padding: "7px 14px", fontFamily: "'Lato',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, color: C.brown, marginBottom: 8, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase" }}>Film roll filter</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {["warm", "vintage", "grain", "bw"].map(f => (
            <button key={f} onClick={() => setFilterType(f)} style={{ background: filterType === f ? C.pink : C.white, color: filterType === f ? C.white : C.dark, border: `1.5px solid ${filterType === f ? C.pink : C.tan}`, borderRadius: 14, padding: "10px 8px", fontFamily: "'Lato',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {f === "bw" ? "Black & White" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Btn variant="pink" onClick={handlePost} loading={loading} disabled={!currentUser || (postMode === "image" && (!imageFile || !location.trim())) || (postMode === "quote" && !caption.trim())} style={{ width: "100%", fontSize: 15, padding: "15px", borderRadius: 16 }}>
        Share your Moment ✦
      </Btn>
      {!currentUser && <p style={{ textAlign: "center", color: C.brown, fontSize: 12, fontFamily: "'Lato',sans-serif", marginTop: 10 }}>Sign in to share moments</p>}
    </div>
  );
}

// ============================================================
// DISCOVER PAGE
// ============================================================
function DiscoverPage({ showToast, onOpenProfile }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("Explore Diary");
  const [searching, setSearching] = useState(false);
  const trending = ["Kyoto", "Takayama", "Hakone", "Nara", "Shirakawa-go", "Nikko"];
  const vibes = ["🌸 Peaceful", "🏔️ Adventure", "🍜 Food", "🌿 Nature", "🏯 Cultural", "🌊 Coastal"];

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    const term = search.trim();
    const [{ data: users }, { data: matchedPosts }] = await Promise.all([
      supabase.from("profiles").select("*").or(`username.ilike.%${term}%,full_name.ilike.%${term}%,location.ilike.%${term}%`).limit(10),
      supabase.from("posts").select("*, profiles(username, avatar_url)").or(`location.ilike.%${term}%,caption.ilike.%${term}%,category.ilike.%${term}%`).limit(30),
    ]);
    setResults(users || []);
    setPosts(matchedPosts || []);
    setTitle(`Results for "${term}"`);
    setSearching(false);
  };

  const loadByLocation = async (location) => {
    setTitle(`Trending in ${location}`);
    const { data } = await supabase.from("posts").select("*, profiles(username, avatar_url)").ilike("location", `%${location}%`).limit(30);
    setPosts(data || []);
  };

  const loadByVibe = async (label, vibe) => {
    setTitle(`${label} posts`);
    const { data } = await supabase.from("posts").select("*, profiles(username, avatar_url)").eq("category", vibe).limit(30);
    setPosts(data || []);
  };

  return (
    <div style={{ padding: "56px 16px 100px", background: C.cream, minHeight: "100vh" }}>
      <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 25, color: C.dark, marginBottom: 18 }}>Discover</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <Input placeholder="Search people, places..." value={search} onChange={e => setSearch(e.target.value)} icon="🔍" style={{ flex: 1 }} />
        <Btn variant="primary" onClick={handleSearch} loading={searching} style={{ borderRadius: 12, padding: "13px 18px" }}>Go</Btn>
      </div>

      {results.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          {results.map(u => (
            <div key={u.id} onClick={() => onOpenProfile?.(u.id)} style={{ display: "flex", alignItems: "center", gap: 12, background: C.white, borderRadius: 14, padding: "12px", marginBottom: 10, boxShadow: `0 2px 10px ${C.shadow}`, cursor: "pointer" }}>
              <Avatar src={u.avatar_url} size={44} />
              <div>
                <p style={{ margin: 0, fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: 14, color: C.dark }}>{displayHandle(u.username)}</p>
                {u.bio && <p style={{ margin: 0, fontSize: 12, color: C.brown, fontFamily: "'Lato',sans-serif" }}>{u.bio}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Moment of the Day */}
      <div style={{ marginBottom: 22 }}>
        <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, color: C.dark, margin: "0 0 10px" }}>✦ Moment of the Day</h3>
        <div onClick={() => loadByLocation("Nikko")} style={{ borderRadius: 20, overflow: "hidden", position: "relative", height: 190, cursor: "pointer" }}>
          <img src="https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&q=80" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,#4A372888,transparent)" }} />
          <div style={{ position: "absolute", bottom: 16, left: 16 }}>
            <p style={{ color: C.cream, fontFamily: "'Playfair Display',Georgia,serif", fontSize: 16, fontWeight: 700, margin: 0 }}>Autumn in Nikko</p>
            <p style={{ color: C.softPink, fontSize: 12, margin: "3px 0 0" }}>📍 Nikko, Tochigi</p>
          </div>
        </div>
      </div>

      {/* Trending */}
      <div style={{ marginBottom: 22 }}>
        <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, color: C.dark, margin: "0 0 10px" }}>📍 Trending Locations</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {trending.map(t => (
            <span key={t} style={{ background: C.white, border: `1px solid ${C.tan}`, borderRadius: 20, padding: "7px 13px", fontFamily: "'Lato',sans-serif", fontSize: 12, color: C.dark, cursor: "pointer", boxShadow: `0 2px 8px ${C.shadow}` }}>📍 {t}</span>
          ))}
        </div>
      </div>

      {/* Vibes */}
      <div style={{ marginBottom: 22 }}>
        <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, color: C.dark, margin: "0 0 10px" }}>Browse by Vibe</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {trending.map(t => (
            <button key={t} onClick={() => loadByLocation(t)} style={{ background: C.white, border: `1px solid ${C.tan}`, borderRadius: 20, padding: "7px 13px", fontFamily: "'Lato',sans-serif", fontSize: 12, color: C.dark, cursor: "pointer" }}>{t}</button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            ["Peaceful", "rural"],
            ["Adventure", "adventure"],
            ["Food", "food"],
            ["Nature", "nature"],
            ["Cultural", "cultural"],
            ["Coastal", "coastal"],
          ].map(([label, vibe]) => (
            <button key={vibe} onClick={() => loadByVibe(label, vibe)} style={{ background: C.white, borderRadius: 14, padding: "15px", border: `1px solid ${C.beige}`, cursor: "pointer", boxShadow: `0 2px 10px ${C.shadow}`, fontFamily: "'Lato',sans-serif", fontSize: 14, color: C.dark, fontWeight: 700, textAlign: "center" }}>{label}</button>
          ))}
          {vibes.map(v => (
            <div key={v} style={{ background: C.white, borderRadius: 14, padding: "15px", border: `1px solid ${C.beige}`, cursor: "pointer", boxShadow: `0 2px 10px ${C.shadow}`, fontFamily: "'Lato',sans-serif", fontSize: 14, color: C.dark, fontWeight: 700, textAlign: "center" }}>{v}</div>
          ))}
        </div>
      </div>
      {posts.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, color: C.dark, margin: "0 0 10px" }}>{title}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
            {posts.map(p => <img key={p.id} src={p.image_url} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 8 }} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function DiscoverPage2({ showToast, onOpenProfile, onOpenPost, setPage, forceMode = "discover" }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState(forceMode === "quotes" ? "Discover Diary Quotes" : "Explore Diary");
  const [searching, setSearching] = useState(false);
  const [mode, setMode] = useState(forceMode);
  const trending = ["Kyoto", "Takayama", "Hakone", "Nara", "Shirakawa-go", "Nikko"];
  const vibeOptions = [
    ["🌸 Peaceful", "rural"],
    ["🏔️ Adventure", "adventure"],
    ["🍜 Food", "food"],
    ["🌿 Nature", "nature"],
    ["🏯 Cultural", "cultural"],
    ["🌊 Coastal", "coastal"],
  ];

  const loadFeed = useCallback(async () => {
    let query = supabase.from("posts").select("*, profiles(username, avatar_url)").order("created_at", { ascending: false }).limit(30);
    if (mode === "quotes") query = query.eq("category", "quote");
    else query = query.neq("category", "quote");
    const { data } = await query;
    setPosts(data || []);
    setTitle(mode === "quotes" ? "Find inspiration and share your creations" : "Explore Diary");
  }, [mode]);

  useEffect(() => { loadFeed(); }, [loadFeed]);
  useEffect(() => { setMode(forceMode); }, [forceMode]);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    const term = search.trim();
    const [{ data: users }, { data: matchedPosts }] = await Promise.all([
      supabase.from("profiles").select("*").or(`username.ilike.%${term}%,full_name.ilike.%${term}%,location.ilike.%${term}%`).limit(10),
      supabase.from("posts").select("*, profiles(username, avatar_url)").or(`location.ilike.%${term}%,caption.ilike.%${term}%,category.ilike.%${term}%`).limit(30),
    ]);
    setResults(users || []);
    setPosts((matchedPosts || []).filter(p => mode === "quotes" ? p.category === "quote" : p.category !== "quote"));
    setTitle(`Results for "${term}"`);
    setSearching(false);
  };

  const loadByLocation = async (location) => {
    setTitle(`Trending in ${location}`);
    let query = supabase.from("posts").select("*, profiles(username, avatar_url)").ilike("location", `%${location}%`).limit(30);
    if (mode === "quotes") query = query.eq("category", "quote");
    const { data } = await query;
    setPosts(data || []);
  };

  const loadByVibe = async (label, vibe) => {
    setTitle(`${label} posts`);
    const { data } = await supabase.from("posts").select("*, profiles(username, avatar_url)").eq("category", vibe).limit(30);
    setPosts(data || []);
  };

  const hero = posts[0];

  return (
    <div style={{ padding: "56px 16px 100px", background: "transparent", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 25, color: C.dark, margin: 0 }}>{mode === "quotes" ? "Discover Diary Quotes" : "Discover"}</h1>
        <div style={{ display: "flex", background: C.white, border: `1px solid ${C.beige}`, borderRadius: 999, padding: 4 }}>
          <button onClick={() => { setMode("discover"); setPage?.("discover"); }} style={{ background: mode === "discover" ? C.beige : "transparent", border: "none", padding: "8px 12px", borderRadius: 999, cursor: "pointer", fontWeight: 700 }}>Discover</button>
          <button onClick={() => { setMode("quotes"); setPage?.("quotes"); }} style={{ background: mode === "quotes" ? C.beige : "transparent", border: "none", padding: "8px 12px", borderRadius: 999, cursor: "pointer", fontWeight: 700 }}>Diary Quotes</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <Input placeholder={mode === "quotes" ? "Search quotes..." : "Search people, places..."} value={search} onChange={e => setSearch(e.target.value)} icon="🔍" style={{ flex: 1 }} />
        <Btn variant="primary" onClick={handleSearch} loading={searching} style={{ borderRadius: 12, padding: "13px 18px" }}>Go</Btn>
      </div>
      {results.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          {results.map(u => (
            <div key={u.id} onClick={() => onOpenProfile?.(u.id)} style={{ display: "flex", alignItems: "center", gap: 12, background: C.white, borderRadius: 14, padding: "12px", marginBottom: 10, boxShadow: `0 2px 10px ${C.shadow}`, cursor: "pointer" }}>
              <Avatar src={u.avatar_url} size={44} />
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: C.dark }}>{displayHandle(u.username)}</p>
                {u.bio && <p style={{ margin: 0, fontSize: 12, color: C.brown }}>{u.bio}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
      {hero && (
        <div onClick={() => onOpenPost?.(hero)} style={{ marginBottom: 22, cursor: "pointer" }}>
          <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, color: C.dark, margin: "0 0 10px" }}>{mode === "quotes" ? "Featured diary quote" : "Today’s Moment"}</h3>
          <div style={{ borderRadius: 20, overflow: "hidden", position: "relative", minHeight: 190, background: C.white }}>
            {hero.image_url ? <img src={hero.image_url} style={{ width: "100%", height: 190, objectFit: "cover", filter: FILTERS[hero.filter_type || "none"] || "none" }} /> : <div style={{ padding: 24, minHeight: 190, display: "flex", alignItems: "center" }}><p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 24, color: C.dark }}>{hero.caption}</p></div>}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,#4A372888,transparent)" }} />
            <div style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
              <p style={{ color: C.cream, fontFamily: "'Playfair Display',Georgia,serif", fontSize: 18, fontWeight: 700, margin: 0 }}>{hero.caption?.slice(0, 70) || "Open this Diary"}</p>
              <p style={{ color: C.softPink, fontSize: 12, margin: "3px 0 0" }}>📍 {hero.location || "Diary"}</p>
            </div>
          </div>
        </div>
      )}
      {mode !== "quotes" && (
        <>
          <div style={{ marginBottom: 18 }}>
            <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, color: C.dark, margin: "0 0 10px" }}>📍 Trending Locations</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {trending.map(t => (
                <button key={t} onClick={() => loadByLocation(t)} style={{ background: C.white, border: `1px solid ${C.tan}`, borderRadius: 20, padding: "7px 13px", fontSize: 12, color: C.dark, cursor: "pointer", boxShadow: `0 2px 8px ${C.shadow}` }}>📍 {t}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, color: C.dark, margin: "0 0 10px" }}>Browse by Vibe</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {vibeOptions.map(([label, vibe]) => (
                <button key={vibe} onClick={() => loadByVibe(label, vibe)} style={{ background: C.white, borderRadius: 14, padding: "15px", border: `1px solid ${C.beige}`, cursor: "pointer", boxShadow: `0 2px 10px ${C.shadow}`, fontSize: 14, color: C.dark, fontWeight: 700, textAlign: "center" }}>{label}</button>
              ))}
            </div>
          </div>
        </>
      )}
      <div style={{ marginBottom: 22 }}>
        <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, color: C.dark, margin: "0 0 10px" }}>{title}</h3>
        {mode === "quotes" ? (
          <div style={{ display: "grid", gap: 14 }}>
            {posts.map(p => <QuoteCard key={p.id} post={p} showToast={showToast} onOpenProfile={onOpenProfile} onOpenPost={onOpenPost} />)}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
            {posts.map(p => <img key={p.id} onClick={() => onOpenPost?.(p)} src={p.image_url} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 8, cursor: "pointer", filter: FILTERS[p.filter_type || "none"] || "none" }} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function DiaryQuotesPage(props) {
  return <DiscoverPage2 {...props} forceMode="quotes" />;
}

function FollowListSheet({ open, title, users, onClose, onOpenProfile }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 9999, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: C.white, borderRadius: "24px 24px 0 0", padding: "12px 16px 24px", boxShadow: `0 -14px 40px ${C.shadow}`, maxHeight: "72vh", overflowY: "auto" }}>
        <div style={{ width: 42, height: 4, borderRadius: 999, background: C.tan, margin: "0 auto 12px", opacity: 0.7 }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <h3 style={{ margin: 0, fontFamily: "'Playfair Display',Georgia,serif", color: C.dark }}>{title}</h3>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 20, color: C.brown }}>✕</button>
        </div>
        {users.length === 0 ? (
          <p style={{ color: C.brown, fontStyle: "italic", textAlign: "center", padding: "18px 0" }}>No people here yet</p>
        ) : users.map(user => (
          <button key={user.id} onClick={() => { onClose(); onOpenProfile?.(user.id); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, border: "none", borderBottom: `1px solid ${C.beige}`, background: "none", padding: "12px 0", cursor: "pointer", textAlign: "left" }}>
            <Avatar src={user.avatar_url} size={44} active />
            <div>
              <p style={{ margin: 0, color: C.dark, fontWeight: 800 }}>{displayHandle(user.username)}</p>
              <p style={{ margin: "2px 0 0", color: C.brown, fontSize: 12 }}>{user.full_name || "Diary user"}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MEMORIES PAGE — REAL BOOKMARKS
// ============================================================
function MemoriesPage({ currentUser, showToast, onOpenPost }) {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  const [seenIds, setSeenIds] = useState([]);

  useEffect(() => {
    if (!currentUser) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase.from("bookmarks")
        .select("*, posts(*, profiles(username, avatar_url))")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });
      setSaved((data || []).map(b => b.posts).filter(Boolean));
      setLoading(false);
    })();
  }, [currentUser]);

  useEffect(() => {
    if (activeIndex == null || !saved[activeIndex]) return;
    setSeenIds(prev => prev.includes(saved[activeIndex].id) ? prev : [...prev, saved[activeIndex].id]);
  }, [activeIndex, saved]);

  return (
    <div style={{ padding: "56px 16px 100px", background: "transparent", minHeight: "100vh" }}>
      <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 25, color: C.dark, marginBottom: 4 }}>Memories</h1>
      <p style={{ color: C.brown, fontSize: 13, fontFamily: "'Lato',sans-serif", marginBottom: 22 }}>Your saved moments & journeys</p>

      {!currentUser ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ fontSize: 32 }}>🔖</p>
          <p style={{ fontFamily: "'Playfair Display',Georgia,serif", color: C.brown, fontStyle: "italic" }}>Sign in to see your memories</p>
        </div>
      ) : loading ? (
        <p style={{ textAlign: "center", fontFamily: "'Playfair Display',Georgia,serif", color: C.brown, fontStyle: "italic" }}>Loading...</p>
      ) : saved.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ fontSize: 32 }}>🌸</p>
          <p style={{ fontFamily: "'Playfair Display',Georgia,serif", color: C.brown, fontStyle: "italic" }}>No saved moments yet</p>
        </div>
      ) : (
        <>
          <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, color: C.dark, margin: "0 0 10px" }}>🔖 Saved Moments</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3 }}>
            {saved.map((post, i) => (
              <button key={i} onClick={() => setActiveIndex(i)} style={{ aspectRatio: "1", borderRadius: 8, overflow: "hidden", border: "none", padding: 0, position: "relative", background: C.white, cursor: "pointer" }}>
                <img src={post.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {seenIds.includes(post.id) && <span style={{ position: "absolute", top: 6, right: 6, background: "rgba(255,255,255,.88)", color: C.dark, fontSize: 10, borderRadius: 999, padding: "3px 7px" }}>Seen</span>}
              </button>
            ))}
          </div>
        </>
      )}
      {activeIndex != null && saved[activeIndex] && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.92)", zIndex: 9999, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", color: C.white }}>
            <div>
              <p style={{ margin: 0, fontWeight: 800 }}>{displayHandle(saved[activeIndex].profiles?.username || "diary")}</p>
              <p style={{ margin: "3px 0 0", fontSize: 12, opacity: 0.88 }}>{new Date(saved[activeIndex].created_at).toLocaleString()}</p>
            </div>
            <button onClick={() => setActiveIndex(null)} style={{ border: "none", background: "none", color: C.white, fontSize: 22, cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: 16 }}>
            {activeIndex > 0 && <button onClick={() => setActiveIndex(i => i - 1)} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "rgba(255,255,255,.18)", color: C.white, width: 36, height: 36, borderRadius: "50%", cursor: "pointer" }}>‹</button>}
            <img src={saved[activeIndex].image_url} style={{ maxWidth: "100%", maxHeight: "74vh", objectFit: "contain", borderRadius: 18 }} />
            {activeIndex < saved.length - 1 && <button onClick={() => setActiveIndex(i => i + 1)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "rgba(255,255,255,.18)", color: C.white, width: 36, height: 36, borderRadius: "50%", cursor: "pointer" }}>›</button>}
          </div>
          <div style={{ padding: "0 18px 22px", color: C.white }}>
            <p style={{ margin: "0 0 8px", lineHeight: 1.5 }}>{saved[activeIndex].caption || "Saved memory"}</p>
            <p style={{ margin: "0 0 10px", fontSize: 12, opacity: 0.8 }}>Seen by you</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => onOpenPost?.(saved[activeIndex])} style={{ border: "none", borderRadius: 999, padding: "10px 14px", cursor: "pointer", background: C.white, color: C.dark, fontWeight: 800 }}>Open Diary</button>
              <button onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/?post=${saved[activeIndex].id}`).then(() => showToast("Post link copied!"))} style={{ border: "1px solid rgba(255,255,255,.35)", borderRadius: 999, padding: "10px 14px", cursor: "pointer", background: "transparent", color: C.white, fontWeight: 800 }}>Share</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PROFILE PAGE — REAL PROFILE FROM SUPABASE
// ============================================================
function ProfilePage({ currentUser, profile, setPage, showToast, onLogout, onProfileUpdated, onOpenPost, onOpenProfile }) {
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState(profile);
  const [form, setForm] = useState({ full_name: "", username: "", bio: "", location: "", website: "" });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [followSheet, setFollowSheet] = useState({ open: false, title: "", users: [] });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarCropImage, setAvatarCropImage] = useState(null);
  const [showAvatarCropper, setShowAvatarCropper] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const avatarRef = useRef();
  const coverRef = useRef();
  const displayName = profileData?.full_name || currentUser?.email?.split("@")[0] || "Your Name";
  const username = profileData?.username || currentUser?.email?.split("@")[0] || "user";
  const avatarSrc = avatarPreview || profileData?.avatar_url || `https://ui-avatars.com/api/?background=D4C5B0&color=4A3728&name=${encodeURIComponent(displayName)}`;
  const journeys = posts.filter(p => p.location || p.category === "adventure" || p.category === "cultural");
  const quotes = posts.filter(p => p.category === "quote");
  const tabPosts = activeTab === "saved" ? savedPosts : activeTab === "journeys" ? journeys : activeTab === "quotes" ? quotes : posts.filter(p => p.category !== "quote");
  const emptyText = activeTab === "saved" ? "No saved memories yet" : activeTab === "journeys" ? "No journeys yet" : activeTab === "quotes" ? "No diary quotes yet" : "No moments yet";

  useEffect(() => {
    setProfileData(profile);
    if (profile) setForm({
      full_name: profile.full_name || "",
      username: profile.username || "",
      bio: profile.bio || "",
      location: profile.location || "",
      website: profile.website || "",
    });
    else if (currentUser) setForm({
      full_name: currentUser.email?.split("@")[0] || "",
      username: currentUser.email?.split("@")[0] || "",
      bio: "",
      location: "",
      website: "",
    });
  }, [profile, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      const [{ data: ownPosts }, { data: saved }] = await Promise.all([
        supabase.from("posts").select("*").eq("user_id", currentUser.id).order("created_at", { ascending: false }),
        supabase.from("bookmarks").select("*, posts(*)").eq("user_id", currentUser.id).order("created_at", { ascending: false }),
      ]);
      setPosts(ownPosts || []);
      setSavedPosts((saved || []).map(b => b.posts).filter(Boolean));

      const [{ count: followerCount }, { count: followingCount }] = await Promise.all([
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", currentUser.id),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", currentUser.id),
      ]);
      setStats({ followers: followerCount || 0, following: followingCount || 0 });
    })();
  }, [currentUser]);

  const openFollowSheet = async (kind) => {
    if (!currentUser) return;
    const column = kind === "followers" ? "following_id" : "follower_id";
    const idColumn = kind === "followers" ? "follower_id" : "following_id";
    const { data } = await supabase.from("follows").select(`${idColumn}`).eq(column, currentUser.id);
    const ids = (data || []).map(row => row[idColumn]).filter(Boolean);
    if (!ids.length) {
      setFollowSheet({ open: true, title: kind === "followers" ? "Followers" : "Following", users: [] });
      return;
    }
    const { data: users } = await supabase.from("profiles").select("id, username, full_name, avatar_url").in("id", ids);
    setFollowSheet({ open: true, title: kind === "followers" ? "Followers" : "Following", users: users || [] });
  };

  const handleAvatarPick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarCropImage(URL.createObjectURL(file));
    setShowAvatarCropper(true);
  };

  const handleAvatarCropped = (blob, url) => {
    setAvatarFile(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
    setAvatarPreview(url);
    setShowAvatarCropper(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let updates = {
        id: currentUser.id,
        full_name: form.full_name.trim(),
        username: form.username.trim().replace(/^@+/, ""),
        bio: form.bio.trim(),
        location: form.location.trim(),
        website: form.website.trim(),
      };
      if (avatarFile) {
        const path = `covers/${currentUser.id}-avatar.jpg`;
        const { error: avatarErr } = await supabase.storage.from("diary-media").upload(path, avatarFile, { upsert: true });
        if (avatarErr) throw avatarErr;
        const { data: urlData } = supabase.storage.from("diary-media").getPublicUrl(path);
        updates.avatar_url = `${urlData.publicUrl}?t=${Date.now()}`;
      }

      if (coverFile) {
        const ext = coverFile.name.split(".").pop() || "jpg";
        const path = `covers/${currentUser.id}.${ext}`;
        const { error: coverErr } = await supabase.storage.from("diary-media").upload(path, coverFile, { upsert: true });
        if (coverErr) throw coverErr;
        const { data: urlData } = supabase.storage.from("diary-media").getPublicUrl(path);
        updates.cover_url = `${urlData.publicUrl}?t=${Date.now()}`;
      }
      const { data, error } = await supabase.from("profiles").upsert(updates).select("*").single();
      if (error) throw error;
      setProfileData(data);
      onProfileUpdated?.(data);
      setAvatarFile(null);
      setCoverFile(null);
      setAvatarPreview(null);
      setCoverPreview(null);
      setEditMode(false);
      showToast("Profile updated!");
    } catch (err) {
      showToast(err.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) return (
    <div style={{ padding: "100px 16px", textAlign: "center", background: C.cream, minHeight: "100vh" }}>
      <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 22, color: C.dark }}>Sign in to view your profile</p>
    </div>
  );

  return (
    <div style={{ background: "transparent", minHeight: "100vh", paddingBottom: 100 }}>
      {showAvatarCropper && <ImageCropper image={avatarCropImage} shape="circle" onCrop={handleAvatarCropped} onCancel={() => setShowAvatarCropper(false)} />}
      {/* Cover */}
      <div style={{ height: 198, position: "relative", overflow: "visible", borderRadius: "0 0 34px 34px", boxShadow: `0 12px 30px ${C.shadow}`, marginBottom: 54 }}>
        <img
          src={coverPreview || profileData?.cover_url || "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80"}
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "0 0 34px 34px", display: "block" }}
        />
        <div style={{ position: "absolute", inset: 0, borderRadius: "0 0 34px 34px", background: "linear-gradient(to bottom,rgba(74,55,40,.04),rgba(250,247,242,.62))" }} />
        {editMode && (
          <button onClick={() => coverRef.current.click()} style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: 20, padding: "6px 12px", fontFamily: "'Lato',sans-serif", fontSize: 11, cursor: "pointer" }}>
            📷 Change Cover
          </button>
        )}
        <input ref={coverRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); } }} />
        <input ref={avatarRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarPick} />
        <button onClick={() => setPage("settings")} style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.85)", border: "none", borderRadius: 20, padding: "6px 13px", fontFamily: "'Lato',sans-serif", fontSize: 12, cursor: "pointer", color: C.dark }}>⚙ Settings</button>
      </div>

      <div style={{ padding: "0 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: -98, marginBottom: 12, position: "relative", zIndex: 2 }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", border: `4px solid ${C.cream}`, overflow: "hidden", boxShadow: `0 8px 24px ${C.shadow}`, position: "relative", background: C.beige, flexShrink: 0 }}>
            <img src={avatarSrc} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {editMode && (
              <button onClick={() => avatarRef.current.click()} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", color: C.white, border: "none", fontFamily: "'Lato',sans-serif", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                Change
              </button>
            )}
          </div>
          {editMode
            ? <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="secondary" onClick={() => { setEditMode(false); setAvatarPreview(null); setCoverPreview(null); setAvatarFile(null); setCoverFile(null); }} style={{ fontSize: 12, padding: "8px 14px", borderRadius: 20 }}>Cancel</Btn>
                <Btn variant="pink" onClick={handleSave} loading={saving} style={{ fontSize: 12, padding: "8px 14px", borderRadius: 20 }}>Save</Btn>
              </div>
            : <Btn variant="secondary" onClick={() => setEditMode(true)} style={{ fontSize: 12, padding: "8px 16px", borderRadius: 20 }}>Edit Profile</Btn>
          }
        </div>

        {editMode ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            <Input placeholder="Full name" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
            <Input placeholder="@username" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value.replace(/^@+/, "").replace(/\s/g, "").toLowerCase() }))} />
            <Input placeholder="Bio" value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} multiline />
            <Input placeholder="📍 Currently in..." value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
            <Input placeholder="🔗 Website" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} />
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 19, color: C.dark, margin: "0 0 2px" }}>{displayName}</h2>
            <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 12, color: C.brown, margin: "0 0 4px" }}>{displayHandle(username)}</p>
            {profileData?.bio && <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 13, color: C.dark, margin: "0 0 4px", lineHeight: 1.5 }}>{profileData.bio}</p>}
            {profile?.location && <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 12, color: C.brown, margin: "0 0 14px" }}>📍 Currently in: {profile.location}</p>}
            {!profile?.location && profileData?.location && <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 12, color: C.brown, margin: "0 0 14px" }}>Currently in: {profileData.location}</p>}
            {profileData?.website && <a href={/^https?:\/\//.test(profileData.website) ? profileData.website : `https://${profileData.website}`} target="_blank" rel="noreferrer" style={{ display: "inline-block", margin: "0 0 14px", color: C.pink, textDecoration: "none", fontWeight: 700 }}>🔗 {profileData.website}</a>}
          </>
        )}

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "space-around", background: C.white, borderRadius: 16, padding: "13px", marginBottom: 18, boxShadow: `0 4px 16px ${C.shadow}` }}>
          {[["Posts", posts.length], ["Followers", stats.followers], ["Following", stats.following], ["Saved", savedPosts.length]].map(([label, val]) => (
            <button key={label} onClick={() => {
              if (label === "Saved") setActiveTab("saved");
              if (label === "Posts") setActiveTab("posts");
              if (label === "Followers") openFollowSheet("followers");
              if (label === "Following") openFollowSheet("following");
            }} style={{ textAlign: "center", border: "none", background: "none", cursor: "pointer" }}>
              <p style={{ margin: 0, fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 700, fontSize: 18, color: C.dark }}>{val}</p>
              <p style={{ margin: 0, fontFamily: "'Lato',sans-serif", fontSize: 10, color: C.brown, marginTop: 1 }}>{label}</p>
            </button>
          ))}
        </div>

        <DiaryTravelMap posts={posts} title="Your Travel Map" onPostClick={(post) => onOpenPost?.(post)} />

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `2px solid ${C.beige}`, marginBottom: 14 }}>
          {["posts", "journeys", "quotes", "saved"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, background: "none", border: "none", padding: "10px", cursor: "pointer", fontFamily: "'Lato',sans-serif", fontSize: 11, fontWeight: 700, color: activeTab === tab ? C.pink : C.tan, borderBottom: activeTab === tab ? `2px solid ${C.pink}` : "2px solid transparent", marginBottom: -2, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {tab === "saved" ? "memories" : tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3 }}>
          {tabPosts.map(p => (
            <div key={p.id} onClick={() => onOpenPost?.(p)} style={{ aspectRatio: "1", overflow: "hidden", position: "relative", borderRadius: 6, cursor: "pointer" }}>
              <img src={p.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.45),transparent)", opacity: 0.95, display: "flex", alignItems: "flex-end", justifyContent: "space-around", padding: 6 }}>
                <button onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/?post=${p.id}`).then(() => showToast("Post link copied!"))} style={{ border: "none", borderRadius: "50%", width: 28, height: 28, background: "rgba(255,255,255,.9)", cursor: "pointer" }}>↗</button>
                <button onClick={() => setActiveTab("saved")} style={{ border: "none", borderRadius: "50%", width: 28, height: 28, background: "rgba(255,255,255,.9)", cursor: "pointer" }}>↧</button>
                <button onClick={() => showToast("Open the post from Home to comment")} style={{ border: "none", borderRadius: "50%", width: 28, height: 28, background: "rgba(255,255,255,.9)", cursor: "pointer" }}>D</button>
              </div>
            </div>
          ))}
          {tabPosts.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "30px 0" }}>
              <p style={{ fontFamily: "'Playfair Display',Georgia,serif", color: C.brown, fontStyle: "italic" }}>{emptyText}</p>
            </div>
          )}
        </div>
      </div>
      <FollowListSheet open={followSheet.open} title={followSheet.title} users={followSheet.users} onClose={() => setFollowSheet({ open: false, title: "", users: [] })} onOpenProfile={onOpenProfile} />
    </div>
  );
}

// ============================================================
// PUBLIC PROFILE PAGE
// ============================================================
function PublicProfilePage({ profileId, currentUser, setPage, showToast, onMessageUser, onOpenPost, onOpenProfile }) {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [followSheet, setFollowSheet] = useState({ open: false, title: "", users: [] });

  useEffect(() => {
    if (!profileId) return;
    (async () => {
      const [{ data: profileData }, { data: postData }, { data: followData }, { count: followerCount }, { count: followingCount }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", profileId).single(),
        supabase.from("posts").select("*").eq("user_id", profileId).order("created_at", { ascending: false }),
        currentUser ? supabase.from("follows").select("*").eq("follower_id", currentUser.id).eq("following_id", profileId).maybeSingle() : Promise.resolve({ data: null }),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profileId),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profileId),
      ]);
      setProfile(profileData);
      setPosts(postData || []);
      setIsFollowing(Boolean(followData));
      setStats({ followers: followerCount || 0, following: followingCount || 0 });
    })();
  }, [profileId, currentUser]);

  const openFollowSheet = async (kind) => {
    const column = kind === "followers" ? "following_id" : "follower_id";
    const idColumn = kind === "followers" ? "follower_id" : "following_id";
    const { data } = await supabase.from("follows").select(`${idColumn}`).eq(column, profileId);
    const ids = (data || []).map(row => row[idColumn]).filter(Boolean);
    if (!ids.length) {
      setFollowSheet({ open: true, title: kind === "followers" ? "Followers" : "Following", users: [] });
      return;
    }
    const { data: users } = await supabase.from("profiles").select("id, username, full_name, avatar_url").in("id", ids);
    setFollowSheet({ open: true, title: kind === "followers" ? "Followers" : "Following", users: users || [] });
  };

  const handleFollow = async () => {
    if (!currentUser) { showToast("Sign in to follow users", "error"); return; }
    if (isFollowing) {
      await supabase.from("follows").delete().match({ follower_id: currentUser.id, following_id: profileId });
      setIsFollowing(false);
    } else {
      await supabase.from("follows").insert({ follower_id: currentUser.id, following_id: profileId });
      await supabase.from("notifications").insert({ user_id: profileId, from_user_id: currentUser.id, type: "follow" });
      setIsFollowing(true);
    }
  };

  const handleMessage = async () => {
    if (!currentUser) { showToast("Sign in to message users", "error"); return; }
    onMessageUser?.({ id: profileId, username: profile.username, full_name: profile.full_name, avatar_url: profile.avatar_url });
    setPage("dms");
  };

  const handleBlock = async () => {
    if (!currentUser || !confirm("Block this user?")) return;
    await supabase.from("blocks").insert({ blocker_id: currentUser.id, blocked_id: profileId });
    showToast("User blocked");
    setPage("home");
  };

  const handleReport = async (reason) => {
    if (!currentUser) return;
    await supabase.from("reports").insert({ reporter_id: currentUser.id, reported_user_id: profileId, reason });
    setReportOpen(false);
    showToast("Report sent to Diary");
  };

  if (!profile) return <div style={{ padding: "80px 16px", background: C.cream, minHeight: "100vh", color: C.brown }}>Loading profile...</div>;

  const isPrivate = Boolean(profile.is_private || profile.private_account);
  const canViewDiary = !isPrivate || isFollowing || currentUser?.id === profileId;
  const journeys = posts.filter(p => p.location || p.category === "adventure" || p.category === "cultural");
  const quotes = posts.filter(p => p.category === "quote");
  const visiblePosts = activeTab === "journeys" ? journeys : activeTab === "quotes" ? quotes : posts.filter(p => p.category !== "quote");
  const emptyCopy = activeTab === "journeys" ? "No journeys shared yet" : activeTab === "quotes" ? "No diary quotes shared yet" : "No public moments yet";

  return (
    <div style={{ background: "transparent", minHeight: "100vh", paddingBottom: 100 }}>
      <PageHeader title="Diary account" subtitle={displayHandle(profile.username)} onBack={() => setPage("home")} />
      <div style={{ height: 210, overflow: "visible", position: "relative", borderRadius: "0 0 34px 34px", boxShadow: `0 12px 30px ${C.shadow}`, marginBottom: 54 }}>
        <img src={profile.cover_url || "https://images.unsplash.com/photo-1528164344705-47542687000d?w=900&q=80"} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "0 0 34px 34px", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: "0 0 34px 34px", background: "linear-gradient(to bottom,rgba(74,55,40,.05),rgba(250,247,242,.7))" }} />
        <div style={{ position: "absolute", bottom: 18, left: 118, right: 18 }}>
          <p style={{ margin: 0, fontFamily: "'Playfair Display',Georgia,serif", fontSize: 28, color: C.white, textShadow: "0 2px 12px rgba(0,0,0,.35)" }}>{profile.full_name || profile.username || "Diary user"}</p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: C.cream, textShadow: "0 2px 12px rgba(0,0,0,.45)" }}>{profile.location ? `Currently in ${profile.location}` : "Rural memories"}</p>
        </div>
      </div>
      <div style={{ padding: "0 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: -98, marginBottom: 14, position: "relative", zIndex: 2 }}>
          <div style={{ padding: 3, borderRadius: "50%", background: C.cream, boxShadow: `0 8px 24px ${C.shadow}` }}>
            <Avatar src={profile.avatar_url} size={86} active />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {currentUser?.id !== profileId && <Btn variant={isFollowing ? "secondary" : "pink"} onClick={handleFollow} style={{ borderRadius: 20, padding: "9px 14px" }}>{isFollowing ? "Unfollow" : "Follow"}</Btn>}
            {currentUser?.id !== profileId && <Btn variant="secondary" onClick={handleMessage} style={{ borderRadius: 20, padding: "9px 14px" }}>Message</Btn>}
            {currentUser?.id !== profileId && <Btn variant="secondary" onClick={() => setReportOpen(true)} style={{ borderRadius: 20, padding: "9px 12px" }}>Report</Btn>}
          </div>
        </div>
        <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", color: C.dark, margin: "0 0 2px", fontSize: 26 }}>{profile.full_name || profile.username || "Diary user"}</h2>
        <p style={{ margin: "0 0 8px", color: C.brown, fontFamily: "'Lato',sans-serif" }}>{displayHandle(profile.username)}</p>
        {profile.bio && <p style={{ color: C.dark, fontSize: 13, lineHeight: 1.55, marginBottom: 8 }}>{profile.bio}</p>}
        {profile.location && <p style={{ color: C.brown, fontSize: 12, marginBottom: 8 }}>Currently in: {profile.location}</p>}
        {profile.website && <a href={/^https?:\/\//.test(profile.website) ? profile.website : `https://${profile.website}`} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginBottom: 10, color: C.pink, textDecoration: "none", fontWeight: 700 }}>🔗 {profile.website}</a>}
        {currentUser?.id !== profileId && <button onClick={handleBlock} style={{ border: "none", background: "none", color: C.red, cursor: "pointer", padding: 0, marginBottom: 16 }}>Block user</button>}
        <div style={{ display: "flex", justifyContent: "space-around", background: C.white, borderRadius: 18, padding: "14px 10px", margin: "8px 0 18px", boxShadow: `0 8px 24px ${C.shadow}` }}>
          {[["Posts", posts.length], ["Journeys", journeys.length], ["Followers", stats.followers], ["Following", stats.following]].map(([label, value]) => (
            <button key={label} onClick={() => {
              if (label === "Posts") setActiveTab("posts");
              if (label === "Journeys") setActiveTab("journeys");
              if (label === "Followers") openFollowSheet("followers");
              if (label === "Following") openFollowSheet("following");
            }} style={{ textAlign: "center", border: "none", background: "none", cursor: "pointer" }}>
              <p style={{ margin: 0, fontFamily: "'Playfair Display',Georgia,serif", color: C.dark, fontWeight: 700, fontSize: 18 }}>{value}</p>
              <p style={{ margin: "2px 0 0", color: C.brown, fontSize: 10, textTransform: "uppercase", letterSpacing: ".6px" }}>{label}</p>
            </button>
          ))}
        </div>
        {!canViewDiary ? (
          <div style={{ background: C.white, borderRadius: 24, padding: "38px 22px", textAlign: "center", boxShadow: `0 10px 30px ${C.shadow}` }}>
            <div style={{ fontSize: 34, marginBottom: 8 }}>Lock</div>
            <h3 style={{ margin: "0 0 6px", fontFamily: "'Playfair Display',Georgia,serif", color: C.dark }}>This Diary is private</h3>
            <p style={{ margin: "0 0 18px", color: C.brown, fontSize: 13, lineHeight: 1.5 }}>Follow to see their Diary activities, posts, journeys, and memories.</p>
            <Btn variant="pink" onClick={handleFollow} style={{ borderRadius: 999 }}>Follow to request access</Btn>
          </div>
        ) : (
          <>
            <DiaryTravelMap posts={posts} title={`${profile.full_name || profile.username || "Diary"}'s Travel Map`} onPostClick={(post) => onOpenPost?.(post)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {["posts", "journeys", "quotes"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: activeTab === tab ? C.dark : C.white, color: activeTab === tab ? C.cream : C.brown, border: `1px solid ${C.beige}`, borderRadius: 14, padding: "11px 10px", cursor: "pointer", fontWeight: 800, textTransform: "capitalize", boxShadow: `0 4px 14px ${C.shadow}` }}>{tab}</button>
              ))}
            </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginTop: 12 }}>
              {visiblePosts.map(p => <img key={p.id} onClick={() => onOpenPost?.(p)} src={p.image_url} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 8, cursor: "pointer" }} />)}
            </div>
            {visiblePosts.length === 0 && (
              <div style={{ background: C.white, borderRadius: 22, padding: "34px 18px", textAlign: "center", boxShadow: `0 8px 24px ${C.shadow}` }}>
                <p style={{ margin: 0, fontFamily: "'Playfair Display',Georgia,serif", color: C.brown, fontStyle: "italic" }}>{emptyCopy}</p>
              </div>
            )}
          </>
        )}
      </div>
      {reportOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.white, borderRadius: 18, padding: 18, maxWidth: 340, width: "100%" }}>
            <h3 style={{ marginTop: 0 }}>Report {displayHandle(profile.username)}</h3>
            {["Unappropriate content", "Sexual content", "Not Diary taste", "Unaesthetic"].map(reason => <button key={reason} onClick={() => handleReport(reason)} style={{ display: "block", width: "100%", textAlign: "left", padding: 11, border: "none", borderBottom: `1px solid ${C.beige}`, background: "none" }}>{reason}</button>)}
            <Btn variant="secondary" onClick={() => setReportOpen(false)} style={{ width: "100%", marginTop: 12 }}>Cancel</Btn>
          </div>
        </div>
      )}
      <FollowListSheet open={followSheet.open} title={followSheet.title} users={followSheet.users} onClose={() => setFollowSheet({ open: false, title: "", users: [] })} onOpenProfile={onOpenProfile} />
    </div>
  );
}

// ============================================================
// DIARY AUTHORITY REPORT QUEUE
// ============================================================
function AdminReportsPage({ setPage, showToast }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("reports")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      showToast("Diary Authority queue needs reports table/admin access", "error");
      setReports([]);
    } else {
      setReports(data || []);
    }
    setLoading(false);
  }, [showToast]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const resolveReport = async (report, action) => {
    const postId = report.target_id || report.post_id;
    if (action === "delete_post" && postId) {
      const { error: deleteError } = await supabase.from("posts").delete().eq("id", postId);
      if (deleteError) {
        showToast("Could not delete reported post", "error");
        return;
      }
    }
    const { error } = await supabase.from("reports").update({ status: "resolved" }).eq("id", report.id);
    if (error) showToast("Could not resolve report", "error");
    else {
      setReports(prev => prev.filter(r => r.id !== report.id));
      showToast(action === "delete_post" ? "Post deleted and report resolved" : "Report ignored");
    }
  };

  return (
    <div style={{ padding: "56px 16px 100px", background: C.cream, minHeight: "100vh" }}>
      <PageHeader title="Diary Authority" subtitle="Review pending reports" onBack={() => setPage("settings")} />
      <div style={{ background: C.beige, borderRadius: 18, padding: 14, marginBottom: 16 }}>
        <p style={{ margin: 0, fontFamily: "'Lato',sans-serif", color: C.brown, fontSize: 13, lineHeight: 1.5 }}>
          Reports stay private from regular users. Admin accounts can review, delete harmful posts, or ignore reports that do not break Diary taste.
        </p>
      </div>
      {loading ? (
        <p style={{ textAlign: "center", color: C.brown, fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic" }}>Loading reports...</p>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: "center", padding: "44px 0" }}>
          <p style={{ fontSize: 34, margin: 0 }}>✦</p>
          <p style={{ fontFamily: "'Playfair Display',Georgia,serif", color: C.brown, fontStyle: "italic" }}>No pending reports</p>
        </div>
      ) : reports.map(report => (
        <div key={report.id} style={{ background: C.white, borderRadius: 18, padding: 14, marginBottom: 12, boxShadow: `0 6px 20px ${C.shadow}`, border: `1px solid ${C.beige}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
            <strong style={{ color: C.dark, fontFamily: "'Lato',sans-serif" }}>{report.reason || "Reported content"}</strong>
            <span style={{ color: C.tan, fontSize: 11 }}>{new Date(report.created_at).toLocaleDateString()}</span>
          </div>
          <p style={{ margin: "0 0 8px", color: C.brown, fontSize: 12, lineHeight: 1.45 }}>Target: {report.target_type || "post"} · {report.target_id || report.post_id || "unknown"}</p>
          {report.description && <p style={{ margin: "0 0 12px", color: C.dark, fontSize: 13, lineHeight: 1.5 }}>{report.description}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="secondary" onClick={() => resolveReport(report, "ignore")} style={{ flex: 1, padding: 10 }}>Ignore</Btn>
            <Btn variant="pink" onClick={() => resolveReport(report, "delete_post")} style={{ flex: 1, padding: 10 }}>Delete Post</Btn>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// SETTINGS PAGE
// ============================================================
function SettingsPage({ onLogout, setPage, showToast, currentUser, profile, onProfileUpdated, theme, setTheme, onThemeImage }) {
  const [privateAccount, setPrivateAccount] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const themeRef = useRef();
  useEffect(() => {
    setPrivateAccount(Boolean(profile?.is_private || profile?.private_account));
  }, [profile]);

  const togglePrivacy = async () => {
    if (!currentUser) return;
    const next = !privateAccount;
    setPrivateAccount(next);
    const { data, error } = await supabase.from("profiles")
      .update({ is_private: next })
      .eq("id", currentUser.id)
      .select("*")
      .single();
    if (error) {
      setPrivateAccount(!next);
      showToast("Private account needs Supabase is_private column", "error");
      return;
    }
    onProfileUpdated?.(data);
    showToast(`Account privacy set to ${next ? "private" : "public"}`);
  };

  const handleChangePassword = async () => {
    const password = prompt("Enter a new password for your Diary account");
    if (!password) return;
    if (password.length < 6) { showToast("Password must be at least 6 characters", "error"); return; }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) showToast(error.message || "Could not change password", "error");
    else showToast("Password updated");
  };

  const handleDeleteAccount = async () => {
    if (!currentUser || !confirm("Delete your Diary account data? This removes your posts, comments, bookmarks and profile.")) return;
    await supabase.from("comments").delete().eq("user_id", currentUser.id);
    await supabase.from("likes").delete().eq("user_id", currentUser.id);
    await supabase.from("bookmarks").delete().eq("user_id", currentUser.id);
    await supabase.from("posts").delete().eq("user_id", currentUser.id);
    await supabase.from("profiles").delete().eq("id", currentUser.id);
    showToast("Account data deleted");
    onLogout();
  };
  const handleSetting = (label) => {
    if (label === "Edit Profile") setPage("profile");
    else if (label === "Delete Account") handleDeleteAccount();
    else if (label === "Change Password") handleChangePassword();
    else if (label === "Account Privacy") togglePrivacy();
    else if (label === "Diary Authority Queue") setPage("adminReports");
    else if (label === "Notifications") { setNotifications(v => !v); showToast(`Notifications ${notifications ? "off" : "on"}`); }
    else showToast("This feature is being polished — we’ll notify you soon.");
  };
  const sections = [
    { title: "Account", items: [{ icon: "✏️", label: "Edit Profile" }, { icon: "🔒", label: "Change Password" }, { icon: "🔔", label: "Notifications" }] },
    { title: "Privacy", items: [{ icon: "👁️", label: "Account Privacy" }, { icon: "🚫", label: "Blocked Users" }] },
    { title: "Business", items: [{ icon: "📊", label: "Creator Analytics" }, { icon: "🍃", label: "Advertise on Diary" }, { icon: "✦", label: "Diary Pro" }] },
    { title: "Danger Zone", items: [{ icon: "🗑️", label: "Delete Account", danger: true }] },
  ];
  return (
    <div style={{ padding: "56px 16px 100px", background: C.cream, minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26 }}>
        <button onClick={() => setPage("profile")} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.brown }}>←</button>
        <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 23, color: C.dark, margin: 0 }}>Settings</h1>
      </div>
      {sections.map(s => (
        <div key={s.title} style={{ marginBottom: 22 }}>
          <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 10, fontWeight: 700, color: C.tan, letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 7px" }}>{s.title}</p>
          <div style={{ background: C.white, borderRadius: 16, overflow: "hidden", boxShadow: `0 4px 16px ${C.shadow}` }}>
            {s.items.map((item, i) => (
              <div key={item.label} onClick={() => handleSetting(item.label)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: i < s.items.length - 1 ? `1px solid ${C.beige}` : "none", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 17 }}>{item.icon}</span>
                  <span style={{ fontFamily: "'Lato',sans-serif", fontSize: 14, color: item.danger ? C.red : C.dark, fontWeight: item.danger ? 700 : 400 }}>{item.label}</span>
                </div>
                <span style={{ color: C.tan }}>{item.label === "Account Privacy" ? (privateAccount ? "Private" : "Public") : "›"}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{ marginBottom: 22 }}>
        <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 10, fontWeight: 700, color: C.tan, letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 7px" }}>Diary Authority</p>
        <div style={{ background: C.white, borderRadius: 16, overflow: "hidden", boxShadow: `0 4px 16px ${C.shadow}` }}>
          <div onClick={() => setPage("adminReports")} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: C.pink }}>MOD</span>
              <span style={{ fontFamily: "'Lato',sans-serif", fontSize: 14, color: C.dark }}>Diary Authority Queue</span>
            </div>
            <span style={{ color: C.tan }}>›</span>
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 22 }}>
        <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 10, fontWeight: 700, color: C.tan, letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 7px" }}>Theme</p>
        <div style={{ background: C.white, borderRadius: 16, padding: 14, boxShadow: `0 4px 16px ${C.shadow}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            {["light", "dark", "custom"].map(mode => (
              <button key={mode} onClick={() => setTheme(p => ({ ...p, mode }))} style={{ background: theme?.mode === mode ? C.dark : C.white, color: theme?.mode === mode ? C.white : C.dark, border: `1px solid ${C.beige}`, borderRadius: 14, padding: "10px 8px", cursor: "pointer", fontWeight: 700, textTransform: "capitalize" }}>{mode}</button>
            ))}
          </div>
          <button onClick={() => themeRef.current?.click()} style={{ width: "100%", background: C.beige, border: "none", borderRadius: 14, padding: "11px 12px", cursor: "pointer", color: C.dark, fontWeight: 700 }}>Upload theme background</button>
          <input ref={themeRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onThemeImage} />
        </div>
      </div>
      <Btn variant="secondary" onClick={onLogout} style={{ width: "100%", borderRadius: 16, padding: "13px", fontSize: 14 }}>Sign Out</Btn>
      <div style={{ textAlign: "center", marginTop: 30, color: C.tan, fontFamily: "'Lato',sans-serif", fontSize: 11, lineHeight: 1.8 }}>
        <p style={{ margin: 0 }}>© 2026 Diary Inc. All rights reserved.</p>
        <p style={{ margin: 0, fontFamily: "'Playfair Display',Georgia,serif", color: C.brown }}>Be real you - by Diary</p>
      </div>
    </div>
  );
}

// ============================================================
// NOTIFICATIONS PAGE
// ============================================================
function NotificationsPage({ currentUser, setPage }) {
  const [notifs, setNotifs] = useState([]);
  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      const { data } = await supabase.from("notifications")
        .select("*, profiles!notifications_from_user_id_fkey(username, avatar_url)")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(30);
      setNotifs(data || []);
    })();
  }, [currentUser]);

  const icons = { like: "❤️", comment: "💬", follow: "👤", sponsored: "🍃" };

  return (
    <div style={{ padding: "56px 16px 100px", background: C.cream, minHeight: "100vh" }}>
      <PageHeader title="Notifications" subtitle="Diary updates" onBack={() => setPage("home")} />
      {notifs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ fontSize: 32 }}>🔔</p>
          <p style={{ fontFamily: "'Playfair Display',Georgia,serif", color: C.brown, fontStyle: "italic" }}>All caught up!</p>
        </div>
      ) : notifs.map(n => (
        <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 12, background: n.read ? C.white : C.beige, borderRadius: 14, padding: "13px", marginBottom: 10, boxShadow: `0 2px 10px ${C.shadow}` }}>
          <Avatar src={n.profiles?.avatar_url} size={42} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontFamily: "'Lato',sans-serif", fontSize: 13, color: C.dark, lineHeight: 1.4 }}>
              <span style={{ marginRight: 5 }}>{icons[n.type] || "🔔"}</span>
              <span style={{ fontWeight: 700 }}>{n.profiles?.username}</span> {n.type === "like" ? "liked your photo" : n.type === "comment" ? "commented on your photo" : "started following you"}
            </p>
            <p style={{ margin: "3px 0 0", fontSize: 11, color: C.tan, fontFamily: "'Lato',sans-serif" }}>{new Date(n.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// DMs PAGE
// ============================================================
function DMsPage({ currentUser }) {
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      const { data } = await supabase.from("messages")
        .select("*, sender:profiles!messages_sender_id_fkey(username, avatar_url), receiver:profiles!messages_receiver_id_fkey(username, avatar_url)")
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order("created_at", { ascending: false });
      // Deduplicate conversations
      const seen = new Set();
      const convos = [];
      (data || []).forEach(m => {
        const other = m.sender_id === currentUser.id ? m.receiver : m.sender;
        const otherId = m.sender_id === currentUser.id ? m.receiver_id : m.sender_id;
        if (!seen.has(otherId)) { seen.add(otherId); convos.push({ ...other, id: otherId, lastMsg: m.content, time: m.created_at }); }
      });
      setConversations(convos);
    })();
  }, [currentUser]);

  const openConvo = async (user) => {
    setActive(user);
    const { data } = await supabase.from("messages")
      .select("*")
      .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},receiver_id.eq.${currentUser.id})`)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  };

  const sendMsg = async () => {
    if (!newMsg.trim() || !active) return;
    await supabase.from("messages").insert({ sender_id: currentUser.id, receiver_id: active.id, content: newMsg.trim() });
    setNewMsg("");
    openConvo(active);
  };

  return (
    <div style={{ padding: "56px 16px 100px", background: C.cream, minHeight: "100vh" }}>
      {active ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <button onClick={() => setActive(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.brown }}>←</button>
            <Avatar src={active.avatar_url} size={36} />
            <span style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: 15, color: C.dark }}>{displayHandle(active.username)}</span>
          </div>
          <div style={{ minHeight: 300, marginBottom: 16 }}>
            {messages.map(m => (
              <div key={m.id} style={{ display: "flex", justifyContent: m.sender_id === currentUser.id ? "flex-end" : "flex-start", marginBottom: 8 }}>
                <div style={{ background: m.sender_id === currentUser.id ? C.pink : C.white, color: m.sender_id === currentUser.id ? C.white : C.dark, borderRadius: 16, padding: "9px 14px", maxWidth: "72%", fontFamily: "'Lato',sans-serif", fontSize: 13 }}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Message..." style={{ flex: 1, padding: "12px 16px", border: `1.5px solid ${C.tan}`, borderRadius: 24, fontFamily: "'Lato',sans-serif", fontSize: 13, outline: "none", background: C.white }} />
            <button onClick={sendMsg} style={{ background: C.pink, border: "none", borderRadius: 24, padding: "12px 18px", color: C.white, cursor: "pointer", fontSize: 16 }}>↑</button>
          </div>
        </>
      ) : (
        <>
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 25, color: C.dark, marginBottom: 18 }}>Messages</h1>
          {conversations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: 32 }}>✉️</p>
              <p style={{ fontFamily: "'Playfair Display',Georgia,serif", color: C.brown, fontStyle: "italic" }}>No messages yet</p>
            </div>
          ) : conversations.map(c => (
            <div key={c.id} onClick={() => openConvo(c)} style={{ display: "flex", alignItems: "center", gap: 12, background: C.white, borderRadius: 16, padding: "13px", marginBottom: 10, boxShadow: `0 2px 10px ${C.shadow}`, cursor: "pointer" }}>
              <Avatar src={c.avatar_url} size={48} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: 13, color: C.dark }}>{displayHandle(c.username)}</p>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: C.brown, fontFamily: "'Lato',sans-serif" }}>{c.lastMsg}</p>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function DMsPage2({ currentUser, setPage, showToast, initialUser, onOpenProfile }) {
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [search, setSearch] = useState("");
  const [people, setPeople] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);

  const loadConversations = useCallback(async () => {
    if (!currentUser) return;
    const { data } = await supabase.from("messages")
      .select("*, sender:profiles!messages_sender_id_fkey(username, full_name, avatar_url), receiver:profiles!messages_receiver_id_fkey(username, full_name, avatar_url)")
      .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
      .order("created_at", { ascending: false });
    const seen = new Set();
    const convos = [];
    (data || []).forEach(m => {
      const other = m.sender_id === currentUser.id ? m.receiver : m.sender;
      const otherId = m.sender_id === currentUser.id ? m.receiver_id : m.sender_id;
      if (other && !seen.has(otherId)) {
        seen.add(otherId);
        convos.push({ ...other, id: otherId, lastMsg: m.content, time: m.created_at });
      }
    });
    setConversations(convos);
  }, [currentUser]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (!currentUser) return;
    const channel = supabase.channel(`diary-dm-${currentUser.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, payload => {
        const m = payload.new;
        if (m.sender_id === currentUser.id || m.receiver_id !== currentUser.id) return;
        if (active && (m.sender_id === active.id || m.receiver_id === active.id)) setMessages(prev => [...prev, m]);
        loadConversations();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUser, active, loadConversations]);

  useEffect(() => {
    if (!currentUser || search.trim().length < 2) { setPeople([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase.from("profiles")
        .select("id, username, full_name, avatar_url")
        .neq("id", currentUser.id)
        .or(`username.ilike.%${search}%,full_name.ilike.%${search}%`)
        .limit(8);
      setPeople(data || []);
    }, 250);
    return () => clearTimeout(t);
  }, [search, currentUser]);

  const openConvo = async (user) => {
    setActive(user);
    const { data } = await supabase.from("messages")
      .select("*")
      .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},receiver_id.eq.${currentUser.id})`)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  };

  useEffect(() => {
    if (initialUser && active?.id !== initialUser.id) openConvo(initialUser);
  }, [initialUser]);

  const sendMsg = async () => {
    if (!newMsg.trim() || !active) return;
    const content = newMsg.trim();
    setNewMsg("");
    const { data, error } = await supabase.from("messages")
      .insert({ sender_id: currentUser.id, receiver_id: active.id, content })
      .select("*")
      .single();
    if (error) { showToast?.("Message could not send", "error"); return; }
    if (data) setMessages(prev => [...prev, data]);
    loadConversations();
  };

  const unsendMessage = async () => {
    if (!selectedMessage || selectedMessage.sender_id !== currentUser?.id) return;
    const { error } = await supabase.from("messages").delete().eq("id", selectedMessage.id).eq("sender_id", currentUser.id);
    if (error) {
      showToast?.(error.message || "Could not unsend message", "error");
    } else {
      setMessages(prev => prev.filter(m => m.id !== selectedMessage.id));
      loadConversations();
      showToast?.("Message unsent");
    }
    setSelectedMessage(null);
  };

  const filteredConversations = conversations.filter((c, index) => {
    if (filter === "all") return true;
    if (filter === "unread") return index % 2 === 0;
    return /circle|group|club|travel/i.test(c.full_name || c.username || "");
  });

  return (
    <div style={{ background: "transparent", minHeight: "100vh", paddingBottom: active ? 0 : 100 }}>
      {active ? (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <PageHeader
            title={
              <button onClick={() => onOpenProfile?.(active.id)} style={{ border: "none", background: "none", padding: 0, cursor: "pointer", textAlign: "left", color: C.dark, fontFamily: "'Playfair Display',Georgia,serif", fontSize: 24, lineHeight: 1.1 }}>
                {displayHandle(active.username, "diary")}
              </button>
            }
            subtitle={active.full_name || "Diary message"}
            onBack={() => setActive(null)}
            right={<button onClick={() => onOpenProfile?.(active.id)} style={{ border: "none", background: "none", padding: 0, cursor: "pointer" }}><Avatar src={active.avatar_url} size={38} active /></button>}
          />
          <div style={{ flex: 1, padding: "16px 14px 90px", overflowY: "auto", background: "linear-gradient(180deg,#FAF7F2,#FFF)" }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", padding: "50px 20px", color: C.brown }}>
                <div style={{ display: "flex", justifyContent: "center" }}><Avatar src={active.avatar_url} size={72} active /></div>
                <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", color: C.dark, marginBottom: 4 }}>Start your Diary chat</h3>
                <p style={{ fontSize: 13 }}>Send a private message to {displayHandle(active.username, "this user")}.</p>
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} style={{ display: "flex", justifyContent: m.sender_id === currentUser.id ? "flex-end" : "flex-start", marginBottom: 9 }}>
                <button onClick={() => m.sender_id === currentUser.id && setSelectedMessage(m)} style={{
                  background: m.sender_id === currentUser.id ? `linear-gradient(135deg,${C.pink},${C.dark})` : C.white,
                  color: m.sender_id === currentUser.id ? C.white : C.dark,
                  borderRadius: m.sender_id === currentUser.id ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  padding: "10px 14px", maxWidth: "76%", fontFamily: "'Lato',sans-serif", fontSize: 14,
                  boxShadow: `0 4px 14px ${C.shadow}`, border: "none", cursor: m.sender_id === currentUser.id ? "pointer" : "default", textAlign: "left",
                }}>{m.content}</button>
              </div>
            ))}
          </div>
          <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, padding: "10px 12px 14px", background: "rgba(255,255,255,0.94)", borderTop: `1px solid ${C.beige}`, display: "flex", gap: 8, boxSizing: "border-box" }}>
            <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Message..." style={{ flex: 1, padding: "13px 16px", border: `1.5px solid ${C.tan}`, borderRadius: 999, fontFamily: "'Lato',sans-serif", fontSize: 14, outline: "none", background: C.white }} />
            <button onClick={sendMsg} style={{ background: C.pink, border: "none", borderRadius: 999, minWidth: 56, color: C.white, cursor: "pointer", fontSize: 13, fontWeight: 800 }}>Send</button>
          </div>
        </div>
      ) : (
        <>
          <PageHeader title="Messages" subtitle="Private Diary conversations" onBack={() => setPage("home")} />
          <div style={{ padding: 16 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search people to message..." style={{ width: "100%", boxSizing: "border-box", padding: "13px 16px", border: `1.5px solid ${C.tan}`, borderRadius: 16, outline: "none", background: C.white, fontFamily: "'Lato',sans-serif" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
              {["all", "unread", "groups"].map(key => (
                <button key={key} onClick={() => setFilter(key)} style={{ background: filter === key ? C.dark : C.white, color: filter === key ? C.white : C.brown, border: `1px solid ${C.beige}`, borderRadius: 14, padding: "10px 8px", cursor: "pointer", fontWeight: 700, textTransform: "capitalize" }}>{key}</button>
              ))}
            </div>
            {people.length > 0 && (
              <div style={{ marginTop: 12, background: C.white, borderRadius: 18, overflow: "hidden", boxShadow: `0 4px 18px ${C.shadow}` }}>
                {people.map(p => (
                  <div key={p.id} onClick={() => { setSearch(""); setPeople([]); openConvo(p); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 13, borderBottom: `1px solid ${C.beige}`, background: C.white, cursor: "pointer", textAlign: "left", boxSizing: "border-box" }}>
                    <button onClick={(e) => { e.stopPropagation(); onOpenProfile?.(p.id); }} style={{ border: "none", background: "none", padding: 0, cursor: "pointer" }}><Avatar src={p.avatar_url} size={44} active /></button>
                    <div>
                      <button onClick={(e) => { e.stopPropagation(); onOpenProfile?.(p.id); }} style={{ border: "none", background: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
                      <p style={{ margin: 0, color: C.dark, fontWeight: 700 }}>{displayHandle(p.username)}</p>
                      <p style={{ margin: "2px 0 0", color: C.brown, fontSize: 12 }}>{p.full_name || "Diary user"}</p>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <h2 style={{ margin: "24px 0 12px", fontFamily: "'Playfair Display',Georgia,serif", color: C.dark, fontSize: 21 }}>Inbox</h2>
            {conversations.length === 0 ? (
              <div style={{ textAlign: "center", padding: "44px 18px", background: C.white, borderRadius: 24, boxShadow: `0 8px 28px ${C.shadow}` }}>
                <p style={{ fontSize: 34, margin: 0, color: C.dark, fontFamily: "'Playfair Display',Georgia,serif" }}>DM</p>
                <p style={{ fontFamily: "'Playfair Display',Georgia,serif", color: C.brown, fontStyle: "italic" }}>No messages yet. Search a user above to start one.</p>
              </div>
            ) : filteredConversations.map(c => (
              <div key={c.id} onClick={() => openConvo(c)} style={{ display: "flex", alignItems: "center", gap: 12, background: C.white, borderRadius: 18, padding: "13px", marginBottom: 10, boxShadow: `0 2px 10px ${C.shadow}`, cursor: "pointer" }}>
                <button onClick={(e) => { e.stopPropagation(); onOpenProfile?.(c.id); }} style={{ border: "none", background: "none", padding: 0, cursor: "pointer" }}><Avatar src={c.avatar_url} size={52} active /></button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <button onClick={(e) => { e.stopPropagation(); onOpenProfile?.(c.id); }} style={{ border: "none", background: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
                    <p style={{ margin: 0, fontFamily: "'Lato',sans-serif", fontWeight: 800, fontSize: 14, color: C.dark }}>{displayHandle(c.username)}</p>
                  </button>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: C.brown, fontFamily: "'Lato',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.lastMsg}</p>
                </div>
                <span style={{ color: C.tan, fontSize: 18 }}>{">"}</span>
              </div>
            ))}
          </div>
        </>
      )}
      {selectedMessage && (
        <div onClick={() => setSelectedMessage(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 9999, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: C.white, borderRadius: "24px 24px 0 0", padding: "12px 16px 24px", boxShadow: `0 -14px 40px ${C.shadow}` }}>
            <div style={{ width: 42, height: 4, borderRadius: 999, background: C.tan, margin: "0 auto 12px", opacity: 0.7 }} />
            <h3 style={{ margin: "0 0 10px", fontFamily: "'Playfair Display',Georgia,serif", color: C.dark }}>Message options</h3>
            {selectedMessage.sender_id === currentUser?.id ? (
              <button onClick={unsendMessage} style={{ width: "100%", textAlign: "left", border: "none", background: "none", padding: "13px 2px", color: C.red, fontWeight: 800, cursor: "pointer" }}>Unsend message</button>
            ) : (
              <button onClick={() => { setSelectedMessage(null); showToast?.("Report tools are being polished — we’ll notify you soon."); }} style={{ width: "100%", textAlign: "left", border: "none", background: "none", padding: "13px 2px", color: C.dark, fontWeight: 700, cursor: "pointer" }}>Report message</button>
            )}
            <button onClick={() => setSelectedMessage(null)} style={{ width: "100%", textAlign: "left", border: "none", background: "none", padding: "13px 2px", color: C.brown, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function DiaryApp() {
  const [screen, setScreen] = useState("loading");
  const [page, setPage] = useState("home");
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [currentCountry, setCurrentCountry] = useState(() => localStorage.getItem("diary-current-country") || "");
  const [viewProfileId, setViewProfileId] = useState(null);
  const [dmInitialUser, setDmInitialUser] = useState(null);
  const [focusedPost, setFocusedPost] = useState(null);
  const [showSignInStorm, setShowSignInStorm] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [theme, setTheme] = useState(() => {
    try { return JSON.parse(localStorage.getItem("diary-theme")) || { mode: "light", backgroundImage: "" }; }
    catch { return { mode: "light", backgroundImage: "" }; }
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  };

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data);
  };

  useEffect(() => {
    localStorage.setItem("diary-theme", JSON.stringify(theme));
    if (theme.mode === "dark") {
      C.cream = "#121212"; C.white = "#1A1A1A"; C.dark = "#F5EDE2"; C.brown = "#CFB9A6"; C.beige = "#242424"; C.tan = "#726255"; C.shadow = "rgba(0,0,0,0.35)";
    } else if (theme.mode === "custom" && theme.tone === "dark") {
      C.cream = "#101010"; C.white = "rgba(22,22,22,0.92)"; C.dark = "#FFF9F2"; C.brown = "#E6D0C0"; C.beige = "rgba(255,255,255,0.08)"; C.tan = "#AA978A"; C.shadow = "rgba(0,0,0,0.38)";
    } else {
      C.cream = "#FAF7F2"; C.beige = "#F0EBE1"; C.tan = "#D4C5B0"; C.brown = "#8B6F5E"; C.dark = "#4A3728"; C.white = "#FFFFFF"; C.shadow = "rgba(74,55,40,0.12)";
    }
  }, [theme]);

  useEffect(() => {
    const country = (profile?.country || "").trim();
    if (country) {
      setCurrentCountry(country);
      localStorage.setItem("diary-current-country", country);
    }
  }, [profile?.country]);

  useEffect(() => {
    if (currentCountry || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`);
        const json = await res.json();
        const country = json?.address?.country;
        if (country) {
          setCurrentCountry(country);
          localStorage.setItem("diary-current-country", country);
        }
      } catch {}
    }, () => {}, { enableHighAccuracy: false, timeout: 8000, maximumAge: 86400000 });
  }, [currentCountry]);

  const handleThemeImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const palette = await analyzeImagePalette(file);
      setTheme({ mode: "custom", backgroundImage: palette.image, tone: palette.tone });
      showToast("Theme updated");
    } catch {
      showToast("Could not read that background image", "error");
    }
  };

  const openPost = (post) => {
    if (!post) return;
    setFocusedPost(post);
    setPage("postViewer");
  };

  // Check existing session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
        fetchProfile(session.user.id);
        setScreen("app");
      } else {
        setScreen("landing");
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        fetchProfile(session.user.id);
        setScreen("app");
      } else {
        setCurrentUser(null);
        setProfile(null);
        setScreen("landing");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setScreen("landing");
    setPage("home");
    showToast("Signed out. See you soon! 🌸");
  };

  const navPages = ["home", "quotes", "discover", "create", "memories", "profile"];
  const showNav = navPages.includes(page);
  const openProfile = (id) => {
    if (!id) return;
    if (id === currentUser?.id) setPage("profile");
    else { setViewProfileId(id); setPage("publicProfile"); }
  };

  if (screen === "loading") return (
    <div style={{ minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <FontLoader />
      <FallingSakura />
      <DiaryLogo size={42} />
      <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic", color: C.brown, marginTop: 10 }}>Loading your moments...</p>
    </div>
  );

  return (
    <div className="diary-paper" style={{ width: "100%", maxWidth: 480, margin: "0 auto", background: C.cream, minHeight: "100vh", position: "relative", overflowX: "hidden", boxShadow: `0 0 0 1px ${C.beige}`, backgroundImage: theme.backgroundImage ? `linear-gradient(rgba(0,0,0,${theme.mode === "dark" || theme.tone === "dark" ? 0.35 : 0.12}),rgba(0,0,0,${theme.mode === "dark" || theme.tone === "dark" ? 0.45 : 0.08})), url(${theme.backgroundImage})` : undefined, backgroundSize: "cover", backgroundPosition: "center top", backgroundRepeat: "no-repeat", backgroundAttachment: "fixed" }}>
      <FontLoader />
      <LovableVibeStyle />

      <Toast msg={toast.msg} type={toast.type} />
      {showSignInStorm && <SakuraStorm onDone={() => setShowSignInStorm(false)} />}

      {screen === "landing" && <LandingPage onSignup={() => setScreen("signup")} onLogin={() => setScreen("login")} />}
      {screen === "signup" && <SignupPage onBack={() => setScreen("landing")} onSuccess={user => { setCurrentUser(user); setScreen("app"); setPage("home"); }} showToast={showToast} />}
      {screen === "login" && <LoginPage onBack={() => setScreen("landing")} onSuccess={user => { setCurrentUser(user); setScreen("app"); setPage("home"); setShowSignInStorm(true); }} showToast={showToast} />}

      {screen === "app" && (
        <>
          {page === "home" && <HomePage currentUser={currentUser} profile={profile} currentCountry={currentCountry} setPage={setPage} showToast={showToast} onOpenProfile={openProfile} onOpenPost={openPost} />}
          {page === "quotes" && <DiaryQuotesPage showToast={showToast} onOpenProfile={openProfile} onOpenPost={openPost} setPage={setPage} />}
          {page === "discover" && <DiscoverPage2 showToast={showToast} onOpenProfile={openProfile} onOpenPost={openPost} setPage={setPage} />}
          {page === "create" && <CreatePage currentUser={currentUser} showToast={showToast} setPage={setPage} />}
          {page === "memories" && <MemoriesPage currentUser={currentUser} showToast={showToast} onOpenPost={openPost} />}
          {page === "profile" && <ProfilePage currentUser={currentUser} profile={profile} setPage={setPage} showToast={showToast} onLogout={handleLogout} onProfileUpdated={setProfile} onOpenPost={openPost} onOpenProfile={openProfile} />}
          {page === "publicProfile" && <PublicProfilePage profileId={viewProfileId} currentUser={currentUser} setPage={setPage} showToast={showToast} onMessageUser={setDmInitialUser} onOpenPost={openPost} onOpenProfile={openProfile} />}
          {page === "settings" && <SettingsPage onLogout={handleLogout} setPage={setPage} showToast={showToast} currentUser={currentUser} profile={profile} onProfileUpdated={setProfile} theme={theme} setTheme={setTheme} onThemeImage={handleThemeImage} />}
          {page === "adminReports" && <AdminReportsPage setPage={setPage} showToast={showToast} />}
          {page === "notifications" && <NotificationsPage currentUser={currentUser} setPage={setPage} />}
          {page === "dms" && <DMsPage2 currentUser={currentUser} setPage={setPage} showToast={showToast} initialUser={dmInitialUser} onOpenProfile={openProfile} />}
          {page === "postViewer" && <PostViewerPage post={focusedPost} setPage={setPage} showToast={showToast} />}
          {showNav && <BottomNav2 page={page} setPage={setPage} />}
        </>
      )}
    </div>
  );
}
