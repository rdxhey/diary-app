import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

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

// ============================================================
// FONT LOADER
// ============================================================
function FontLoader() {
  useEffect(() => {
    const l = document.createElement("link");
    l.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;600;700&display=swap";
    l.rel = "stylesheet";
    document.head.appendChild(l);
  }, []);
  return null;
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

// ============================================================
// SIGNUP PAGE — REAL SUPABASE AUTH
// ============================================================
function ImageCropper({ image, onCrop, onCancel, shape = "circle" }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [imgEl, setImgEl] = useState(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropBox, setCropBox] = useState({ x: 40, y: 40, w: 220, h: 220 });
  const [resizing, setResizing] = useState(null);
  const CANVAS = 300;

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImgEl(img);
      if (shape !== "circle") {
        const aspect = img.width / img.height;
        const w = aspect >= 1 ? 220 : 140;
        const h = aspect >= 1 ? w / aspect : w * (img.height / img.width);
        const cx = (CANVAS - w) / 2;
        const cy = (CANVAS - h) / 2;
        setCropBox({ x: cx, y: cy, w, h });
      }
    };
    img.src = image;
  }, [image]);

  useEffect(() => {
    if (!imgEl || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, CANVAS, CANVAS);

    // Draw image
    const w = imgEl.width * scale;
    const h = imgEl.height * scale;
    const x = (CANVAS - w) / 2 + offset.x;
    const y = (CANVAS - h) / 2 + offset.y;
    ctx.drawImage(imgEl, x, y, w, h);

    // Dim outside crop
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, CANVAS, CANVAS);

    if (shape === "circle") {
      // Circular cutout
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(CANVAS / 2, CANVAS / 2, CANVAS / 2 - 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.arc(CANVAS / 2, CANVAS / 2, CANVAS / 2 - 8, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(imgEl, x, y, w, h);
      ctx.restore();
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(CANVAS / 2, CANVAS / 2, CANVAS / 2 - 8, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Freeform rect cutout
      const { x: bx, y: by, w: bw, h: bh } = cropBox;
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillRect(bx, by, bw, bh);
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.rect(bx, by, bw, bh);
      ctx.clip();
      ctx.drawImage(imgEl, x, y, w, h);
      ctx.restore();

      // Border
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);

      // Grid lines
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 0.5;
      for (let i = 1; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(bx + (bw / 3) * i, by); ctx.lineTo(bx + (bw / 3) * i, by + bh); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx, by + (bh / 3) * i); ctx.lineTo(bx + bw, by + (bh / 3) * i); ctx.stroke();
      }

      // Corner handles
      const hs = 10;
      ctx.fillStyle = "#fff";
      [[bx, by], [bx + bw - hs, by], [bx, by + bh - hs], [bx + bw - hs, by + bh - hs]].forEach(([hx, hy]) => {
        ctx.fillRect(hx, hy, hs, hs);
      });
    }
  }, [imgEl, scale, offset, cropBox, shape]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS / rect.width;
    const scaleY = CANVAS / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const getHandle = (pos) => {
    const { x: bx, y: by, w: bw, h: bh } = cropBox;
    const hs = 18;
    if (pos.x < bx + hs && pos.y < by + hs) return "tl";
    if (pos.x > bx + bw - hs && pos.y < by + hs) return "tr";
    if (pos.x < bx + hs && pos.y > by + bh - hs) return "bl";
    if (pos.x > bx + bw - hs && pos.y > by + bh - hs) return "br";
    if (pos.x >= bx && pos.x <= bx + bw && pos.y >= by && pos.y <= by + bh) return "move";
    return null;
  };

  const onDown = (e) => {
    const pos = getPos(e);
    if (shape !== "circle") {
      const handle = getHandle(pos);
      if (handle) {
        setResizing(handle);
        setDragStart(pos);
        return;
      }
    }
    setDragging(true);
    setDragStart({ x: pos.x - offset.x, y: pos.y - offset.y });
  };

  const onMove = (e) => {
    const pos = getPos(e);
    if (resizing) {
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;
      setDragStart(pos);
      setCropBox(b => {
        let { x, y, w, h } = b;
        if (resizing === "tl") { x += dx; y += dy; w -= dx; h -= dy; }
        if (resizing === "tr") { y += dy; w += dx; h -= dy; }
        if (resizing === "bl") { x += dx; w -= dx; h += dy; }
        if (resizing === "br") { w += dx; h += dy; }
        if (resizing === "move") { x += dx; y += dy; }
        w = Math.max(60, w); h = Math.max(60, h);
        x = Math.max(0, Math.min(x, CANVAS - w));
        y = Math.max(0, Math.min(y, CANVAS - h));
        return { x, y, w, h };
      });
      return;
    }
    if (!dragging) return;
    setOffset({ x: pos.x - dragStart.x, y: pos.y - dragStart.y });
  };

  const onUp = () => { setDragging(false); setResizing(null); };

  const handleCrop = () => {
    const out = document.createElement("canvas");
    if (shape === "circle") {
      out.width = CANVAS - 16; out.height = CANVAS - 16;
      const ctx = out.getContext("2d");
      const w = imgEl.width * scale;
      const h = imgEl.height * scale;
      const x = (CANVAS - w) / 2 + offset.x - 8;
      const y = (CANVAS - h) / 2 + offset.y - 8;
      ctx.drawImage(imgEl, x, y, w, h);
    } else {
      const { x: bx, y: by, w: bw, h: bh } = cropBox;
      out.width = bw; out.height = bh;
      const ctx = out.getContext("2d");
      const w = imgEl.width * scale;
      const h = imgEl.height * scale;
      const ix = (CANVAS - w) / 2 + offset.x;
      const iy = (CANVAS - h) / 2 + offset.y;
      ctx.drawImage(imgEl, ix - bx, iy - by, w, h);
    }
    out.toBlob(blob => onCrop(blob, URL.createObjectURL(blob)), "image/jpeg", 0.92);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999, gap: 20 }}>
      <p style={{ color: "#fff", fontFamily: "'Lato',sans-serif", fontSize: 16, fontWeight: 600, margin: 0 }}>
        {shape === "circle" ? "Drag to position your photo" : "Drag corners to crop freely"}
      </p>
      <canvas
        ref={canvasRef} width={CANVAS} height={CANVAS}
        style={{ width: 300, height: 300, cursor: resizing === "move" || dragging ? "grabbing" : "crosshair", touchAction: "none" }}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#aaa", fontSize: 12 }}>🔍</span>
        <input type="range" min="0.3" max="4" step="0.01" value={scale}
          onChange={e => setScale(parseFloat(e.target.value))}
          style={{ width: 180, accentColor: "#E8869A" }} />
        <span style={{ color: "#aaa", fontSize: 18 }}>🔍</span>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onCancel} style={{ padding: "10px 28px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.3)", background: "transparent", color: "#fff", fontFamily: "'Lato',sans-serif", fontSize: 15, cursor: "pointer" }}>Cancel</button>
        <button onClick={handleCrop} style={{ padding: "10px 28px", borderRadius: 8, border: "none", background: "#E8869A", color: "#fff", fontFamily: "'Lato',sans-serif", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Apply Crop ✓</button>
      </div>
    </div>
  );
}

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
        ref={canvasRef} width={CROP_SIZE} height={CROP_SIZE}
        style={{ borderRadius: "50%", cursor: dragging ? "grabbing" : "grab", boxShadow: "0 0 0 4px rgba(255,255,255,0.2)" }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onMouseUp}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#ccc", fontSize: 13 }}>🔍</span>
        <input type="range" min="0.5" max="3" step="0.01" value={scale}
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
  const [form, setForm] = useState({ name: "", email: "", password: "", username: "", bio: "" });
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
        username: form.username,
        bio: form.bio,
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
      {showCropper && <ImageCropper image={cropImage} aspect={1} onCrop={handleCropped} onCancel={() => setShowCropper(false)} />}
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
              <Input placeholder="@username" value={form.username} onChange={e => up("username", e.target.value)} icon="@" />
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
function PostCard({ post, currentUser, onLike, onBookmark, showToast }) {
  const [burst, setBurst] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loadingComment, setLoadingComment] = useState(false);

  const handleLike = async (e) => {
    if (!currentUser) { showToast("Sign in to like posts", "error"); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    if (!post.liked) setBurst({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    onLike(post.id, post.liked);
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
      showToast("Comment posted!");
    }
    setLoadingComment(false);
  };

  const toggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(!showComments);
  };

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
          <Avatar src={post.profiles?.avatar_url} size={38} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: C.dark, fontFamily: "'Lato',sans-serif" }}>{post.profiles?.username || "user"}</p>
            {post.location && <p style={{ margin: 0, fontSize: 11, color: C.brown, fontFamily: "'Lato',sans-serif" }}>📍 {post.location}</p>}
          </div>
        </div>
        <button style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: C.tan }}>⋯</button>
      </div>

      {/* Image */}
      <div style={{ width: "100%", aspectRatio: "4/3", overflow: "hidden" }}>
        <img src={post.image_url} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>

      {/* Actions */}
      <div style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 16 }}>
            <button onClick={handleLike} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: post.liked ? C.pink : C.tan, fontSize: 13, fontFamily: "'Lato',sans-serif", fontWeight: 700 }}>
              <span style={{ fontSize: 20, transform: post.liked ? "scale(1.15)" : "scale(1)", transition: "transform 0.18s", display: "block" }}>{post.liked ? "❤️" : "🤍"}</span>
              {post.likes_count || 0}
            </button>
            <button onClick={toggleComments} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: C.tan, fontSize: 13, fontFamily: "'Lato',sans-serif", fontWeight: 700 }}>
              <span style={{ fontSize: 18 }}>💬</span> {post.comments_count || 0}
            </button>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: C.tan, fontSize: 18 }}>↗️</button>
          </div>
          <button onClick={() => onBookmark(post.id, post.bookmarked)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: post.bookmarked ? C.gold : C.tan }}>
            {post.bookmarked ? "🔖" : "🏷️"}
          </button>
        </div>

        {post.caption && (
          <p style={{ margin: "0 0 4px", fontFamily: "'Lato',sans-serif", fontSize: 13, color: C.dark, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700 }}>{post.profiles?.username} </span>{post.caption}
          </p>
        )}
        <p style={{ margin: 0, fontSize: 11, color: C.tan, fontFamily: "'Lato',sans-serif" }}>
          {new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>

        {/* Comments */}
        {showComments && (
          <div style={{ marginTop: 12, borderTop: `1px solid ${C.beige}`, paddingTop: 12 }}>
            {comments.map(c => (
              <div key={c.id} style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: C.dark, fontFamily: "'Lato',sans-serif" }}>{c.profiles?.username} </span>
                <span style={{ fontSize: 12, color: C.dark, fontFamily: "'Lato',sans-serif" }}>{c.content}</span>
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

function HomePage({ currentUser, profile, setPage, showToast }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const heading = HEADINGS[category] || HEADINGS.all;

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("posts")
      .select("*, profiles(username, avatar_url, full_name)")
      .order("created_at", { ascending: false })
      .limit(20);
    if (category !== "all") query = query.eq("category", category);
    const { data, error } = await query;
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
  }, [category, currentUser]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleLike = async (postId, wasLiked) => {
    if (!currentUser) { showToast("Sign in to like posts", "error"); return; }
    setPosts(p => p.map(post => post.id === postId ? { ...post, liked: !wasLiked, likes_count: wasLiked ? post.likes_count - 1 : post.likes_count + 1 } : post));
    if (wasLiked) {
      await supabase.from("likes").delete().match({ user_id: currentUser.id, post_id: postId });
    } else {
      await supabase.from("likes").insert({ user_id: currentUser.id, post_id: postId });
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
            <PostCard key={post.id} post={post} currentUser={currentUser} onLike={handleLike} onBookmark={handleBookmark} showToast={showToast} />
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

// ============================================================
// CREATE POST — REAL IMAGE UPLOAD TO SUPABASE
// ============================================================
function CreatePage({ currentUser, showToast, setPage }) {
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("rural");
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
    setShowCropper(false);
  };

  const handlePost = async () => {
    if (!imageFile || !currentUser) return;
    setLoading(true);
    try {
      // Upload image
      const ext = imageFile.name.split(".").pop();
      const path = `posts/${currentUser.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("diary-media").upload(path, imageFile);
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from("diary-media").getPublicUrl(path);

      // Insert post
      const { error: postErr } = await supabase.from("posts").insert({
        user_id: currentUser.id,
        image_url: urlData.publicUrl,
        caption: caption.trim(),
        location: location.trim(),
        category,
      });
      if (postErr) throw postErr;

      showToast("Moment shared! 🌸");
      setCaption(""); setLocation(""); setImageFile(null); setPreview(null);
      setPage("home");
    } catch (err) {
      showToast(err.message || "Failed to post", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "56px 16px 100px", background: C.cream, minHeight: "100vh" }}>
      {showCropper && <ImageCropper image={cropImage} aspect={4/3} onCrop={handleCropped} onCancel={() => setShowCropper(false)} />}
      <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 25, color: C.dark, margin: "0 0 4px" }}>New Moment</h1>
      <p style={{ color: C.brown, fontSize: 13, fontFamily: "'Lato',sans-serif", marginBottom: 22 }}>Share a real moment with the world</p>

      {/* Upload area */}
      <div onClick={() => fileRef.current.click()} style={{ width: "100%", aspectRatio: "1", background: C.beige, borderRadius: 20, border: `2px dashed ${C.tan}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 18, overflow: "hidden" }}>
        {preview ? <img src={preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (
          <>
            <span style={{ fontSize: 46 }}>📷</span>
            <p style={{ fontFamily: "'Lato',sans-serif", color: C.brown, fontSize: 14, marginTop: 10 }}>Tap to upload your moment</p>
            <p style={{ fontFamily: "'Lato',sans-serif", color: C.tan, fontSize: 11, margin: 0 }}>JPG, PNG up to 20MB</p>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={pickImage} />

      <Input placeholder="Write your moment... what does this place feel like?" value={caption} onChange={e => setCaption(e.target.value)} multiline style={{ marginBottom: 13 }} />
      <Input placeholder="📍 Add location" value={location} onChange={e => setLocation(e.target.value)} style={{ marginBottom: 13 }} />

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

      <Btn variant="pink" onClick={handlePost} loading={loading} disabled={!imageFile || !currentUser} style={{ width: "100%", fontSize: 15, padding: "15px", borderRadius: 16 }}>
        Share your Moment ✦
      </Btn>
      {!currentUser && <p style={{ textAlign: "center", color: C.brown, fontSize: 12, fontFamily: "'Lato',sans-serif", marginTop: 10 }}>Sign in to share moments</p>}
    </div>
  );
}

// ============================================================
// DISCOVER PAGE
// ============================================================
function DiscoverPage({ showToast }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const trending = ["Kyoto", "Takayama", "Hakone", "Nara", "Shirakawa-go", "Nikko"];
  const vibes = ["🌸 Peaceful", "🏔️ Adventure", "🍜 Food", "🌿 Nature", "🏯 Cultural", "🌊 Coastal"];

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    const { data } = await supabase.from("profiles").select("*").ilike("username", `%${search}%`).limit(10);
    setResults(data || []);
    setSearching(false);
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
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, background: C.white, borderRadius: 14, padding: "12px", marginBottom: 10, boxShadow: `0 2px 10px ${C.shadow}` }}>
              <Avatar src={u.avatar_url} size={44} />
              <div>
                <p style={{ margin: 0, fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: 14, color: C.dark }}>@{u.username}</p>
                {u.bio && <p style={{ margin: 0, fontSize: 12, color: C.brown, fontFamily: "'Lato',sans-serif" }}>{u.bio}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Moment of the Day */}
      <div style={{ marginBottom: 22 }}>
        <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, color: C.dark, margin: "0 0 10px" }}>✦ Moment of the Day</h3>
        <div style={{ borderRadius: 20, overflow: "hidden", position: "relative", height: 190 }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {vibes.map(v => (
            <div key={v} style={{ background: C.white, borderRadius: 14, padding: "15px", border: `1px solid ${C.beige}`, cursor: "pointer", boxShadow: `0 2px 10px ${C.shadow}`, fontFamily: "'Lato',sans-serif", fontSize: 14, color: C.dark, fontWeight: 700, textAlign: "center" }}>{v}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MEMORIES PAGE — REAL BOOKMARKS
// ============================================================
function MemoriesPage({ currentUser, showToast }) {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div style={{ padding: "56px 16px 100px", background: C.cream, minHeight: "100vh" }}>
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
              <div key={i} style={{ aspectRatio: "1", borderRadius: 8, overflow: "hidden" }}>
                <img src={post.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// PROFILE PAGE — REAL PROFILE FROM SUPABASE
// ============================================================
function ProfilePage({ currentUser, profile, setPage, showToast, onLogout }) {
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ full_name: "", bio: "", location: "" });
  const [saving, setSaving] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const coverRef = useRef();

  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name || "", bio: profile.bio || "", location: profile.location || "" });
  }, [profile]);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      const { data } = await supabase.from("posts").select("*").eq("user_id", currentUser.id).order("created_at", { ascending: false });
      setPosts(data || []);
    })();
  }, [currentUser]);

  const handleSave = async () => {
    setSaving(true);
    let updates = { ...form };
    if (coverFile) {
      const ext = coverFile.name.split(".").pop();
      const path = `covers/${currentUser.id}.${ext}`;
      await supabase.storage.from("diary-media").upload(path, coverFile, { upsert: true });
      const { data: urlData } = supabase.storage.from("diary-media").getPublicUrl(path);
      updates.cover_url = urlData.publicUrl;
    }
    const { error } = await supabase.from("profiles").update(updates).eq("id", currentUser.id);
    if (error) showToast("Failed to save", "error");
    else showToast("Profile updated! 🌸");
    setSaving(false);
    setEditMode(false);
  };

  if (!currentUser) return (
    <div style={{ padding: "100px 16px", textAlign: "center", background: C.cream, minHeight: "100vh" }}>
      <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 22, color: C.dark }}>Sign in to view your profile</p>
    </div>
  );

  return (
    <div style={{ background: C.cream, minHeight: "100vh", paddingBottom: 100 }}>
      {/* Cover */}
      <div style={{ height: 155, position: "relative", overflow: "hidden" }}>
        <img
          src={coverPreview || profile?.cover_url || "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80"}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent,#FAF7F266)" }} />
        {editMode && (
          <button onClick={() => coverRef.current.click()} style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: 20, padding: "6px 12px", fontFamily: "'Lato',sans-serif", fontSize: 11, cursor: "pointer" }}>
            📷 Change Cover
          </button>
        )}
        <input ref={coverRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); } }} />
        <button onClick={() => setPage("settings")} style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.85)", border: "none", borderRadius: 20, padding: "6px 13px", fontFamily: "'Lato',sans-serif", fontSize: 12, cursor: "pointer", color: C.dark }}>⚙ Settings</button>
      </div>

      <div style={{ padding: "0 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: -34, marginBottom: 10 }}>
          <div style={{ width: 78, height: 78, borderRadius: "50%", border: `3px solid ${C.cream}`, overflow: "hidden", boxShadow: `0 4px 16px ${C.shadow}` }}>
            <img src={profile?.avatar_url || `https://ui-avatars.com/api/?background=D4C5B0&color=4A3728&name=${profile?.username || "U"}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          {editMode
            ? <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="secondary" onClick={() => setEditMode(false)} style={{ fontSize: 12, padding: "8px 14px", borderRadius: 20 }}>Cancel</Btn>
                <Btn variant="pink" onClick={handleSave} loading={saving} style={{ fontSize: 12, padding: "8px 14px", borderRadius: 20 }}>Save</Btn>
              </div>
            : <Btn variant="secondary" onClick={() => setEditMode(true)} style={{ fontSize: 12, padding: "8px 16px", borderRadius: 20 }}>Edit Profile</Btn>
          }
        </div>

        {editMode ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            <Input placeholder="Full name" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
            <Input placeholder="Bio" value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} multiline />
            <Input placeholder="📍 Currently in..." value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 19, color: C.dark, margin: "0 0 2px" }}>{profile?.full_name || "Your Name"}</h2>
            <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 12, color: C.brown, margin: "0 0 4px" }}>@{profile?.username}</p>
            {profile?.bio && <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 13, color: C.dark, margin: "0 0 4px", lineHeight: 1.5 }}>{profile.bio}</p>}
            {profile?.location && <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 12, color: C.brown, margin: "0 0 14px" }}>📍 Currently in: {profile.location}</p>}
          </>
        )}

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "space-around", background: C.white, borderRadius: 16, padding: "13px", marginBottom: 18, boxShadow: `0 4px 16px ${C.shadow}` }}>
          {[["Posts", posts.length], ["Followers", "0"], ["Following", "0"]].map(([label, val]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 700, fontSize: 18, color: C.dark }}>{val}</p>
              <p style={{ margin: 0, fontFamily: "'Lato',sans-serif", fontSize: 10, color: C.brown, marginTop: 1 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `2px solid ${C.beige}`, marginBottom: 14 }}>
          {["posts", "journeys", "saved"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, background: "none", border: "none", padding: "10px", cursor: "pointer", fontFamily: "'Lato',sans-serif", fontSize: 11, fontWeight: 700, color: activeTab === tab ? C.pink : C.tan, borderBottom: activeTab === tab ? `2px solid ${C.pink}` : "2px solid transparent", marginBottom: -2, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3 }}>
          {posts.map(p => (
            <div key={p.id} style={{ aspectRatio: "1", overflow: "hidden" }}>
              <img src={p.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
          {posts.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "30px 0" }}>
              <p style={{ fontFamily: "'Playfair Display',Georgia,serif", color: C.brown, fontStyle: "italic" }}>No moments yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SETTINGS PAGE
// ============================================================
function SettingsPage({ onLogout, setPage, showToast }) {
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
              <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: i < s.items.length - 1 ? `1px solid ${C.beige}` : "none", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 17 }}>{item.icon}</span>
                  <span style={{ fontFamily: "'Lato',sans-serif", fontSize: 14, color: item.danger ? C.red : C.dark, fontWeight: item.danger ? 700 : 400 }}>{item.label}</span>
                </div>
                <span style={{ color: C.tan }}>›</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <Btn variant="secondary" onClick={onLogout} style={{ width: "100%", borderRadius: 16, padding: "13px", fontSize: 14 }}>Sign Out</Btn>
    </div>
  );
}

// ============================================================
// NOTIFICATIONS PAGE
// ============================================================
function NotificationsPage({ currentUser }) {
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
      <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 25, color: C.dark, marginBottom: 18 }}>Notifications</h1>
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
            <span style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: 15, color: C.dark }}>@{active.username}</span>
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
                <p style={{ margin: 0, fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: 13, color: C.dark }}>@{c.username}</p>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: C.brown, fontFamily: "'Lato',sans-serif" }}>{c.lastMsg}</p>
              </div>
            </div>
          ))}
        </>
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
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  };

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data);
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

  const navPages = ["home", "discover", "create", "memories", "profile"];
  const showNav = navPages.includes(page);

  if (screen === "loading") return (
    <div style={{ minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <FontLoader />
      <FallingSakura />
      <DiaryLogo size={42} />
      <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic", color: C.brown, marginTop: 10 }}>Loading your moments...</p>
    </div>
  );

  return (
    <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", background: C.cream, minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <FontLoader />
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <Toast msg={toast.msg} type={toast.type} />

      {screen === "landing" && <LandingPage onSignup={() => setScreen("signup")} onLogin={() => setScreen("login")} />}
      {screen === "signup" && <SignupPage onBack={() => setScreen("landing")} onSuccess={user => { setCurrentUser(user); setScreen("app"); setPage("home"); }} showToast={showToast} />}
      {screen === "login" && <LoginPage onBack={() => setScreen("landing")} onSuccess={user => { setCurrentUser(user); setScreen("app"); setPage("home"); }} showToast={showToast} />}

      {screen === "app" && (
        <>
          {page === "home" && <HomePage currentUser={currentUser} profile={profile} setPage={setPage} showToast={showToast} />}
          {page === "discover" && <DiscoverPage showToast={showToast} />}
          {page === "create" && <CreatePage currentUser={currentUser} showToast={showToast} setPage={setPage} />}
          {page === "memories" && <MemoriesPage currentUser={currentUser} showToast={showToast} />}
          {page === "profile" && <ProfilePage currentUser={currentUser} profile={profile} setPage={setPage} showToast={showToast} onLogout={handleLogout} />}
          {page === "settings" && <SettingsPage onLogout={handleLogout} setPage={setPage} showToast={showToast} />}
          {page === "notifications" && <NotificationsPage currentUser={currentUser} />}
          {page === "dms" && <DMsPage currentUser={currentUser} />}
          {showNav && <BottomNav page={page} setPage={setPage} />}
        </>
      )}
    </div>
  );
}