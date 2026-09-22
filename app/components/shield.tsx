export function Shield({ scanning = false }: { scanning?: boolean }) {
  return (
    <div className={`sentinel-art ${scanning ? "scanning" : ""}`} aria-hidden="true">
      <div className="art-aura" />
      <div className="orbital orbital-a" />
      <div className="orbital orbital-b" />
      <div className="art-axis horizontal" />
      <div className="art-axis vertical" />
      <span className="art-cross cross-a">+</span><span className="art-cross cross-b">+</span>
      <div className="shield-object">
        <svg viewBox="0 0 320 360" fill="none">
          <defs>
            <linearGradient id="titanium" x1="48" y1="30" x2="290" y2="326" gradientUnits="userSpaceOnUse">
              <stop stopColor="#d8e3ef"/><stop offset=".2" stopColor="#677386"/><stop offset=".38" stopColor="#242e3e"/><stop offset=".61" stopColor="#929dab"/><stop offset=".79" stopColor="#354353"/><stop offset="1" stopColor="#a7b8c8"/>
            </linearGradient>
            <linearGradient id="obsidian" x1="70" y1="39" x2="251" y2="301" gradientUnits="userSpaceOnUse">
              <stop stopColor="#354355"/><stop offset=".3" stopColor="#172130"/><stop offset=".67" stopColor="#0d141e"/><stop offset="1" stopColor="#243e42"/>
            </linearGradient>
            <linearGradient id="silver-edge" x1="65" y1="33" x2="250" y2="322" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f0f7ff"/><stop offset=".32" stopColor="#a6bed9" stopOpacity=".5"/><stop offset=".6" stopColor="#5c7b8f" stopOpacity=".3"/><stop offset="1" stopColor="#9debd0"/>
            </linearGradient>
            <linearGradient id="shield-glass" x1="63" y1="34" x2="225" y2="255" gradientUnits="userSpaceOnUse">
              <stop stopColor="#e7f2ff" stopOpacity=".17"/><stop offset=".51" stopColor="#d1e6ff" stopOpacity=".02"/><stop offset=".52" stopColor="#000" stopOpacity=".05"/><stop offset="1" stopColor="#8de3c6" stopOpacity=".07"/>
            </linearGradient>
            <linearGradient id="sigil" x1="121" y1="106" x2="189" y2="230" gradientUnits="userSpaceOnUse">
              <stop stopColor="#e8f2fb"/><stop offset=".5" stopColor="#9fb9c5"/><stop offset="1" stopColor="#6dd9b4"/>
            </linearGradient>
            <filter id="signal-glow"><feGaussianBlur stdDeviation="5"/></filter>
            <clipPath id="shield-clip"><path d="M160 31 271 72v91c0 76-60 132-111 164C109 295 49 239 49 163V72Z"/></clipPath>
          </defs>
          <path d="m168 19 121 45v101c0 83-64 144-121 180C111 309 47 248 47 165V64Z" fill="#080d15" stroke="#3b4c5d" strokeWidth="2"/>
          <path d="M160 15 283 60v103c0 83-64 143-123 181C101 306 37 246 37 163V60Z" fill="url(#titanium)"/>
          <path d="M160 25 275 67v96c0 79-62 137-115 171C107 300 45 242 45 163V67Z" fill="url(#obsidian)" stroke="url(#silver-edge)" strokeWidth="1.5"/>
          <path d="M160 40 262 77v85c0 69-52 122-102 154C110 284 58 231 58 162V77Z" fill="url(#shield-glass)" stroke="#788f9f" strokeOpacity=".27"/>
          <path d="M160 40v276M58 162h204" stroke="#8fafc4" strokeOpacity=".07"/>
          <path d="M160 25 275 67M45 67 160 25" stroke="#e3edff" strokeOpacity=".65" strokeWidth="1.2"/>
          <path d="m137 112 62 35v22l-62-35v28l-18-10v-30l18-10Zm46 116-62-35v-22l62 35v-28l18 10v30l-18 10Z" fill="url(#sigil)"/>
          <path d="m119 171 82 47" stroke="#b7fce0" strokeWidth="3" opacity=".15" filter="url(#signal-glow)"/>
          <path d="M97 259c19 24 41 42 63 57 22-15 44-33 63-57" stroke="#76d7b3" strokeOpacity=".7"/>
          <circle cx="160" cy="267" r="3" fill="#8af4ca"/>
          <circle cx="160" cy="267" r="7" fill="#77e5bb" opacity=".2" filter="url(#signal-glow)"/>
          <g clipPath="url(#shield-clip)" className="shield-sweep"><rect x="20" y="150" width="290" height="1" fill="#9feacf" opacity=".7"/><rect x="20" y="140" width="290" height="20" fill="#6abf9e" opacity=".1" filter="url(#signal-glow)"/></g>
        </svg>
      </div>
      <div className="art-ground" />
      <div className="art-caption"><span className="signal-dot"/>SENTINEL CORE<span className="mono">01</span></div>
    </div>
  );
}
