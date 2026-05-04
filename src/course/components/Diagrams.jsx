// Diagrams: SVG illustrations for each module concept.
// All use conceptual, schematic style — not real chart data.

import React from 'react';

const COLORS = {
  bg: '#0a0b0f',
  axis: '#3f3f46',
  text: '#a1a1aa',
  textBright: '#e4e4e7',
  green: '#10b981',
  greenSoft: '#10b98140',
  red: '#f43f5e',
  redSoft: '#f43f5e40',
  blue: '#3b82f6',
  blueSoft: '#3b82f640',
  yellow: '#eab308',
  purple: '#a855f7',
  grid: '#27272a'
};

// Wrapper with consistent sizing/title
function DiagramFrame({ title, children, viewBox = '0 0 800 400' }) {
  return (
    <figure className="rounded-lg border border-zinc-800 bg-zinc-900/40 overflow-hidden">
      <div className="px-5 py-3 border-b border-zinc-800 text-xs font-medium uppercase tracking-wider text-zinc-400">
        {title}
      </div>
      <div className="p-2">
        <svg viewBox={viewBox} className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
          {children}
        </svg>
      </div>
    </figure>
  );
}

// ========================================================================
// PHASE 1 DIAGRAMS
// ========================================================================

function FuturesBasicsDiagram() {
  return (
    <DiagramFrame title="A futures contract: agreement now, settlement later">
      <line x1="100" y1="200" x2="700" y2="200" stroke={COLORS.axis} strokeWidth="2" />
      <line x1="100" y1="195" x2="100" y2="205" stroke={COLORS.axis} strokeWidth="2" />
      <line x1="700" y1="195" x2="700" y2="205" stroke={COLORS.axis} strokeWidth="2" />

      <text x="100" y="240" fill={COLORS.textBright} fontSize="14" textAnchor="middle" fontWeight="600">Today</text>
      <text x="100" y="260" fill={COLORS.text} fontSize="11" textAnchor="middle">Agreement signed</text>
      <text x="100" y="275" fill={COLORS.text} fontSize="11" textAnchor="middle">Price locked: $5800</text>

      <text x="700" y="240" fill={COLORS.textBright} fontSize="14" textAnchor="middle" fontWeight="600">Expiry (e.g. June)</text>
      <text x="700" y="260" fill={COLORS.text} fontSize="11" textAnchor="middle">Settlement</text>
      <text x="700" y="275" fill={COLORS.text} fontSize="11" textAnchor="middle">P/L = market - $5800</text>

      <circle cx="100" cy="200" r="8" fill={COLORS.green} />
      <circle cx="700" cy="200" r="8" fill={COLORS.blue} />

      <rect x="200" y="100" width="180" height="60" rx="6" fill={COLORS.bg} stroke={COLORS.green} strokeWidth="1.5" />
      <text x="290" y="130" fill={COLORS.green} fontSize="13" textAnchor="middle" fontWeight="600">BUYER</text>
      <text x="290" y="148" fill={COLORS.text} fontSize="11" textAnchor="middle">commits to buy</text>

      <rect x="420" y="100" width="180" height="60" rx="6" fill={COLORS.bg} stroke={COLORS.red} strokeWidth="1.5" />
      <text x="510" y="130" fill={COLORS.red} fontSize="13" textAnchor="middle" fontWeight="600">SELLER</text>
      <text x="510" y="148" fill={COLORS.text} fontSize="11" textAnchor="middle">commits to sell</text>

      <line x1="290" y1="160" x2="290" y2="200" stroke={COLORS.axis} strokeDasharray="3,3" strokeWidth="1" />
      <line x1="510" y1="160" x2="510" y2="200" stroke={COLORS.axis} strokeDasharray="3,3" strokeWidth="1" />

      <rect x="335" y="320" width="130" height="40" rx="6" fill={COLORS.bg} stroke={COLORS.purple} strokeWidth="1.5" />
      <text x="400" y="345" fill={COLORS.purple} fontSize="12" textAnchor="middle" fontWeight="600">CLEARINGHOUSE</text>

      <line x1="290" y1="200" x2="380" y2="320" stroke={COLORS.axis} strokeDasharray="3,3" strokeWidth="1" />
      <line x1="510" y1="200" x2="420" y2="320" stroke={COLORS.axis} strokeDasharray="3,3" strokeWidth="1" />
    </DiagramFrame>
  );
}

function ESSpecsDiagram() {
  const rows = [
    ['Symbol', 'ES (E-mini S&P 500)'],
    ['Point value', '$50 per index point'],
    ['Tick size', '0.25 points = $12.50'],
    ['Contract size at 5800', '$50 × 5800 = $290,000 notional'],
    ['Initial margin (overnight)', '~$13,000 per contract'],
    ['Day-trade margin', '~$400-1,000 per contract (broker-set)'],
    ['Trading hours', 'Sun 6pm ET — Fri 5pm ET, 1hr daily break'],
    ['Expiry', 'Quarterly: Mar / Jun / Sep / Dec']
  ];
  return (
    <DiagramFrame title="ES contract specifications" viewBox="0 0 800 380">
      <rect x="40" y="20" width="720" height="340" fill={COLORS.bg} stroke={COLORS.grid} rx="6" />
      {rows.map(([k, v], i) => (
        <g key={i} transform={`translate(0, ${50 + i * 38})`}>
          <line x1="60" y1="20" x2="740" y2="20" stroke={COLORS.grid} strokeWidth="0.5" />
          <text x="70" y="10" fill={COLORS.text} fontSize="13" fontWeight="500">{k}</text>
          <text x="730" y="10" fill={COLORS.textBright} fontSize="13" textAnchor="end" fontFamily="monospace">{v}</text>
        </g>
      ))}
    </DiagramFrame>
  );
}

function LeverageDrawdownDiagram() {
  // Bar chart of % gain needed to recover from each loss
  const losses = [10, 25, 40, 50, 70, 90];
  const recoveries = losses.map(l => Math.round((100 / (100 - l) - 1) * 100));
  const maxR = 1000;

  return (
    <DiagramFrame title="Drawdown asymmetry: % gain needed to recover">
      <line x1="100" y1="340" x2="740" y2="340" stroke={COLORS.axis} />
      <line x1="100" y1="40" x2="100" y2="340" stroke={COLORS.axis} />

      {losses.map((loss, i) => {
        const x = 130 + i * 105;
        const recovery = recoveries[i];
        const heightPct = Math.min(recovery / maxR, 1);
        const barH = heightPct * 280;
        const color = recovery <= 30 ? COLORS.green : recovery <= 100 ? COLORS.yellow : COLORS.red;
        return (
          <g key={i}>
            <rect x={x - 30} y={340 - barH} width="60" height={barH} fill={color} opacity="0.8" rx="2" />
            <text x={x} y={340 - barH - 8} fill={COLORS.textBright} fontSize="13" textAnchor="middle" fontWeight="600">
              {recovery >= 1000 ? '900%+' : `${recovery}%`}
            </text>
            <text x={x} y={360} fill={COLORS.text} fontSize="12" textAnchor="middle">
              -{loss}%
            </text>
          </g>
        );
      })}

      <text x="80" y="200" fill={COLORS.text} fontSize="11" textAnchor="end" transform="rotate(-90 80 200)">
        Gain needed to recover
      </text>
      <text x="420" y="385" fill={COLORS.text} fontSize="11" textAnchor="middle">
        Loss size (% of account)
      </text>
    </DiagramFrame>
  );
}

function TradingDayDiagram() {
  const sessions = [
    { start: 0, end: 9, label: 'Asia (thin)', color: COLORS.grid, text: COLORS.text },
    { start: 9, end: 14.5, label: 'London / pre-market', color: COLORS.blueSoft, text: COLORS.blue },
    { start: 14.5, end: 15.5, label: 'Open: highest volume', color: COLORS.green, text: COLORS.bg },
    { start: 15.5, end: 16.5, label: 'Morning trend', color: COLORS.greenSoft, text: COLORS.green },
    { start: 16.5, end: 18.5, label: 'Lunch (chop)', color: COLORS.grid, text: COLORS.text },
    { start: 18.5, end: 21, label: 'Afternoon', color: COLORS.greenSoft, text: COLORS.green },
    { start: 21, end: 22, label: 'Last hour', color: COLORS.green, text: COLORS.bg },
    { start: 22, end: 24, label: 'Close / overnight', color: COLORS.grid, text: COLORS.text }
  ];

  return (
    <DiagramFrame title="ES trading day, hour by hour (ET)" viewBox="0 0 800 280">
      <line x1="50" y1="180" x2="770" y2="180" stroke={COLORS.axis} strokeWidth="1.5" />

      {sessions.map((s, i) => {
        const x1 = 50 + (s.start / 24) * 720;
        const x2 = 50 + (s.end / 24) * 720;
        return (
          <g key={i}>
            <rect x={x1} y={120} width={x2 - x1} height={60} fill={s.color} opacity="0.7" />
            <text x={(x1 + x2) / 2} y={156} fill={s.text === COLORS.bg ? '#0a0b0f' : s.text} fontSize="9" textAnchor="middle" fontWeight={s.text === COLORS.bg ? "700" : "400"}>
              {s.label}
            </text>
          </g>
        );
      })}

      {[0, 6, 9.5, 12, 16, 20, 24].map(h => (
        <g key={h}>
          <line x1={50 + (h / 24) * 720} y1="180" x2={50 + (h / 24) * 720} y2="190" stroke={COLORS.axis} />
          <text x={50 + (h / 24) * 720} y="210" fill={COLORS.text} fontSize="11" textAnchor="middle">
            {h === 9.5 ? '9:30am' : h === 0 ? '12am' : h === 12 ? '12pm' : h === 24 ? '12am' : `${h % 12 || 12}${h < 12 ? 'am' : 'pm'}`}
          </text>
        </g>
      ))}

      <text x="409" y="40" fill={COLORS.textBright} fontSize="13" textAnchor="middle" fontWeight="600">
        Beginner focus: 9:30am-11:30am ET
      </text>
      <line x1="335" y1="50" x2="335" y2="120" stroke={COLORS.green} strokeWidth="2" />
      <line x1="395" y1="50" x2="395" y2="120" stroke={COLORS.green} strokeWidth="2" />
      <line x1="335" y1="50" x2="395" y2="50" stroke={COLORS.green} strokeWidth="2" />

      <text x="400" y="255" fill={COLORS.text} fontSize="11" textAnchor="middle">
        Avoid: economic releases (8:30am), lunchtime (11:30-1:30), overnight thin sessions
      </text>
    </DiagramFrame>
  );
}

// ========================================================================
// PHASE 2 DIAGRAMS
// ========================================================================

function CandlesticksDiagram() {
  const candles = [
    { open: 100, close: 130, high: 140, low: 95, label: 'Bullish' },
    { open: 130, close: 100, high: 135, low: 90, label: 'Bearish' },
    { open: 105, close: 120, high: 145, low: 100, label: 'Long upper wick: rejection' },
    { open: 120, close: 105, high: 125, low: 70, label: 'Long lower wick: rejection' },
    { open: 110, close: 112, high: 130, low: 90, label: 'Doji: indecision' }
  ];

  const scaleY = (v) => 320 - ((v - 60) / 90) * 240;
  const positions = [120, 270, 420, 570, 720];

  return (
    <DiagramFrame title="Candle types: each tells a story of the period">
      <line x1="60" y1="80" x2="60" y2="340" stroke={COLORS.axis} />

      {candles.map((c, i) => {
        const x = positions[i];
        const isBull = c.close > c.open;
        const color = isBull ? COLORS.green : COLORS.red;
        const top = scaleY(c.high);
        const bot = scaleY(c.low);
        const bodyTop = scaleY(Math.max(c.open, c.close));
        const bodyBot = scaleY(Math.min(c.open, c.close));

        return (
          <g key={i}>
            <line x1={x} y1={top} x2={x} y2={bot} stroke={color} strokeWidth="1.5" />
            <rect x={x - 18} y={bodyTop} width="36" height={Math.max(bodyBot - bodyTop, 2)} fill={color} stroke={color} />
            <text x={x} y={365} fill={COLORS.text} fontSize="11" textAnchor="middle">
              {c.label}
            </text>
          </g>
        );
      })}
    </DiagramFrame>
  );
}

function SupportResistanceDiagram() {
  const path = "M 80 280 L 130 220 L 180 250 L 230 180 L 280 220 L 330 150 L 380 200 L 430 130 L 480 175 L 530 140 L 580 180 L 630 145 L 680 200 L 720 240";
  return (
    <DiagramFrame title="Support and resistance: zones, not lines">
      <line x1="60" y1="350" x2="740" y2="350" stroke={COLORS.axis} />
      <line x1="60" y1="50" x2="60" y2="350" stroke={COLORS.axis} />

      <rect x="60" y="120" width="680" height="20" fill={COLORS.redSoft} />
      <text x="70" y="115" fill={COLORS.red} fontSize="11">RESISTANCE ZONE</text>

      <rect x="60" y="245" width="680" height="20" fill={COLORS.greenSoft} />
      <text x="70" y="280" fill={COLORS.green} fontSize="11">SUPPORT ZONE</text>

      <path d={path} stroke={COLORS.textBright} strokeWidth="1.5" fill="none" />

      {[180, 280, 480].map((x, i) => (
        <circle key={i} cx={x} cy={i === 0 ? 250 : i === 1 ? 220 : 175} r="4" fill={COLORS.green} />
      ))}
      {[230, 330, 430, 530, 630].map((x, i) => (
        <circle key={i} cx={x} cy={[180, 150, 130, 140, 145][i]} r="4" fill={COLORS.red} />
      ))}

      <text x="400" y="380" fill={COLORS.text} fontSize="11" textAnchor="middle">
        Multiple touches = stronger level. More recent = more relevant.
      </text>
    </DiagramFrame>
  );
}

function TrendStructureDiagram() {
  return (
    <DiagramFrame title="Trend structure: HH / HL / LH / LL">
      <line x1="60" y1="350" x2="740" y2="350" stroke={COLORS.axis} />
      <line x1="60" y1="50" x2="60" y2="350" stroke={COLORS.axis} />

      <text x="200" y="80" fill={COLORS.green} fontSize="13" textAnchor="middle" fontWeight="600">UPTREND: HH + HL</text>
      <path d="M 80 320 L 140 240 L 180 280 L 240 180 L 280 220 L 340 130" stroke={COLORS.green} strokeWidth="2" fill="none" />
      <circle cx="140" cy="240" r="3" fill={COLORS.green} />
      <text x="135" y="232" fill={COLORS.green} fontSize="10">H1</text>
      <circle cx="180" cy="280" r="3" fill={COLORS.green} />
      <text x="175" y="298" fill={COLORS.green} fontSize="10">L1</text>
      <circle cx="240" cy="180" r="3" fill={COLORS.green} />
      <text x="232" y="172" fill={COLORS.green} fontSize="10">HH</text>
      <circle cx="280" cy="220" r="3" fill={COLORS.green} />
      <text x="270" y="238" fill={COLORS.green} fontSize="10">HL</text>
      <circle cx="340" cy="130" r="3" fill={COLORS.green} />
      <text x="335" y="122" fill={COLORS.green} fontSize="10">HH</text>

      <text x="580" y="80" fill={COLORS.red} fontSize="13" textAnchor="middle" fontWeight="600">DOWNTREND: LH + LL</text>
      <path d="M 460 130 L 510 220 L 560 180 L 620 280 L 660 240 L 720 320" stroke={COLORS.red} strokeWidth="2" fill="none" />
      <circle cx="460" cy="130" r="3" fill={COLORS.red} />
      <circle cx="510" cy="220" r="3" fill={COLORS.red} />
      <text x="500" y="238" fill={COLORS.red} fontSize="10">L1</text>
      <circle cx="560" cy="180" r="3" fill={COLORS.red} />
      <text x="555" y="172" fill={COLORS.red} fontSize="10">LH</text>
      <circle cx="620" cy="280" r="3" fill={COLORS.red} />
      <text x="615" y="298" fill={COLORS.red} fontSize="10">LL</text>
      <circle cx="660" cy="240" r="3" fill={COLORS.red} />
      <text x="655" y="232" fill={COLORS.red} fontSize="10">LH</text>
      <circle cx="720" cy="320" r="3" fill={COLORS.red} />
      <text x="715" y="338" fill={COLORS.red} fontSize="10">LL</text>

      <text x="400" y="385" fill={COLORS.text} fontSize="11" textAnchor="middle">
        Trend changes: uptrend ends with LL after HH; downtrend ends with HH after LL.
      </text>
    </DiagramFrame>
  );
}

function KeyLevelsDiagram() {
  return (
    <DiagramFrame title="Key intraday levels for ES" viewBox="0 0 800 380">
      <line x1="60" y1="340" x2="740" y2="340" stroke={COLORS.axis} />

      {[
        { y: 100, label: 'PDH (Prior Day High)', color: COLORS.red },
        { y: 150, label: 'ONH (Overnight High)', color: COLORS.yellow },
        { y: 200, label: 'VWAP (intraday mean)', color: COLORS.purple },
        { y: 250, label: 'ONL (Overnight Low)', color: COLORS.yellow },
        { y: 300, label: 'PDL (Prior Day Low)', color: COLORS.green }
      ].map((l, i) => (
        <g key={i}>
          <line x1="60" y1={l.y} x2="740" y2={l.y} stroke={l.color} strokeWidth="1.5" strokeDasharray={i === 2 ? "" : "5,3"} />
          <rect x="540" y={l.y - 10} width="180" height="20" fill={COLORS.bg} stroke={l.color} strokeWidth="1" />
          <text x="630" y={l.y + 4} fill={l.color} fontSize="11" textAnchor="middle">{l.label}</text>
        </g>
      ))}

      <path d="M 80 320 L 110 290 L 140 310 L 170 270 L 200 240 L 230 210 L 260 230 L 290 200 L 320 220 L 350 195 L 380 215 L 410 180 L 440 195 L 470 165 L 500 175 L 530 145 L 540 130"
        stroke={COLORS.textBright} strokeWidth="1.2" fill="none" />

      <text x="400" y="370" fill={COLORS.text} fontSize="11" textAnchor="middle">
        Mark these every day. They are the levels institutional flow watches.
      </text>
    </DiagramFrame>
  );
}

function PatternsDiagram() {
  return (
    <DiagramFrame title="Three patterns that work (only at meaningful levels)" viewBox="0 0 800 380">
      <text x="135" y="40" fill={COLORS.textBright} fontSize="12" textAnchor="middle" fontWeight="600">Rejection at level</text>
      <line x1="40" y1="180" x2="230" y2="180" stroke={COLORS.red} strokeWidth="1.2" strokeDasharray="3,3" />
      <text x="190" y="175" fill={COLORS.red} fontSize="9">PDH</text>
      <line x1="135" y1="100" x2="135" y2="240" stroke={COLORS.red} strokeWidth="1.5" />
      <rect x="120" y="180" width="30" height="60" fill={COLORS.red} />
      <text x="135" y="280" fill={COLORS.text} fontSize="10" textAnchor="middle">Long upper wick at PDH</text>
      <text x="135" y="295" fill={COLORS.text} fontSize="10" textAnchor="middle">→ short, stop above wick</text>

      <text x="400" y="40" fill={COLORS.textBright} fontSize="12" textAnchor="middle" fontWeight="600">Failed breakout</text>
      <line x1="305" y1="160" x2="495" y2="160" stroke={COLORS.red} strokeWidth="1.2" strokeDasharray="3,3" />
      <text x="455" y="155" fill={COLORS.red} fontSize="9">level</text>
      <path d="M 320 220 L 350 180 L 380 130 L 410 150 L 440 200 L 470 230" stroke={COLORS.red} strokeWidth="1.5" fill="none" />
      <circle cx="380" cy="130" r="4" fill={COLORS.red} />
      <text x="380" y="120" fill={COLORS.red} fontSize="9" textAnchor="middle">break</text>
      <circle cx="440" cy="200" r="4" fill={COLORS.red} />
      <text x="450" y="200" fill={COLORS.red} fontSize="9">reclaim</text>
      <text x="400" y="280" fill={COLORS.text} fontSize="10" textAnchor="middle">Break, fail, reclaim below</text>
      <text x="400" y="295" fill={COLORS.text} fontSize="10" textAnchor="middle">→ short, stop above failed high</text>

      <text x="660" y="40" fill={COLORS.textBright} fontSize="12" textAnchor="middle" fontWeight="600">HL support test</text>
      <line x1="565" y1="200" x2="755" y2="200" stroke={COLORS.green} strokeWidth="1.2" strokeDasharray="3,3" />
      <text x="715" y="195" fill={COLORS.green} fontSize="9">HL</text>
      <path d="M 580 130 L 610 170 L 640 220 L 670 200 L 700 150 L 730 110" stroke={COLORS.green} strokeWidth="1.5" fill="none" />
      <circle cx="640" cy="220" r="4" fill={COLORS.green} />
      <text x="640" y="240" fill={COLORS.green} fontSize="9" textAnchor="middle">test &amp; hold</text>
      <text x="660" y="280" fill={COLORS.text} fontSize="10" textAnchor="middle">Pullback to HL holds</text>
      <text x="660" y="295" fill={COLORS.text} fontSize="10" textAnchor="middle">→ long, stop below test</text>

      <text x="400" y="350" fill={COLORS.text} fontSize="11" textAnchor="middle">
        Pattern is the trigger. The level is the trade. The trend is the direction.
      </text>
    </DiagramFrame>
  );
}

// ========================================================================
// PHASE 3 DIAGRAMS
// ========================================================================

function RiskTableDiagram() {
  const stops = [3, 5, 7, 10, 15];
  const accountSizes = [25000, 50000, 100000];
  return (
    <DiagramFrame title="Position sizing: 1% risk → contracts at each stop distance" viewBox="0 0 800 380">
      <text x="160" y="50" fill={COLORS.textBright} fontSize="12" fontWeight="600" textAnchor="middle">Stop (pts)</text>
      {accountSizes.map((acc, ai) => (
        <text key={ai} x={300 + ai * 150} y="50" fill={COLORS.textBright} fontSize="12" fontWeight="600" textAnchor="middle">
          ${acc.toLocaleString()}
        </text>
      ))}

      <line x1="60" y1="65" x2="740" y2="65" stroke={COLORS.grid} />
      <line x1="220" y1="40" x2="220" y2="350" stroke={COLORS.grid} />

      {stops.map((stop, si) => {
        const y = 95 + si * 50;
        return (
          <g key={si}>
            <text x="160" y={y} fill={COLORS.text} fontSize="13" textAnchor="middle" fontFamily="monospace">{stop}</text>
            {accountSizes.map((acc, ai) => {
              const risk = acc * 0.01;
              const contracts = Math.floor(risk / (stop * 50));
              const color = contracts === 0 ? COLORS.red : contracts <= 3 ? COLORS.green : COLORS.yellow;
              return (
                <text key={ai} x={300 + ai * 150} y={y} fill={color} fontSize="14" fontWeight="600" textAnchor="middle" fontFamily="monospace">
                  {contracts === 0 ? '— (use MES)' : `${contracts} ES`}
                </text>
              );
            })}
            <line x1="60" y1={y + 15} x2="740" y2={y + 15} stroke={COLORS.grid} strokeWidth="0.5" />
          </g>
        );
      })}
      <text x="400" y="370" fill={COLORS.text} fontSize="11" textAnchor="middle">
        Tighter stop = more contracts. Wider stop = fewer. Risk dollars stay constant.
      </text>
    </DiagramFrame>
  );
}

function StopPlacementDiagram() {
  return (
    <DiagramFrame title="Stop goes where structure invalidates, not where dollar feels right">
      <line x1="60" y1="350" x2="740" y2="350" stroke={COLORS.axis} />

      <path d="M 80 280 L 120 260 L 160 290 L 200 240 L 240 270 L 280 200 L 320 230 L 360 170 L 400 200 L 440 140"
        stroke={COLORS.textBright} strokeWidth="1.5" fill="none" />

      <line x1="60" y1="290" x2="500" y2="290" stroke={COLORS.green} strokeWidth="1.2" strokeDasharray="3,3" />
      <text x="510" y="294" fill={COLORS.green} fontSize="11">Support / swing low</text>

      <circle cx="160" cy="290" r="4" fill={COLORS.green} />
      <text x="160" y="280" fill={COLORS.green} fontSize="10" textAnchor="middle">test</text>

      <circle cx="280" cy="200" r="6" fill={COLORS.blue} stroke={COLORS.textBright} strokeWidth="2" />
      <text x="295" y="195" fill={COLORS.blue} fontSize="11">ENTRY long</text>

      <line x1="60" y1="305" x2="500" y2="305" stroke={COLORS.red} strokeWidth="1.5" strokeDasharray="2,2" />
      <text x="510" y="309" fill={COLORS.red} fontSize="11">STOP — 2-3 ticks below support</text>

      <text x="400" y="385" fill={COLORS.text} fontSize="11" textAnchor="middle">
        If structural stop produces too much $ risk, reduce SIZE — not stop distance. Never widen after entry.
      </text>
    </DiagramFrame>
  );
}

function ExpectancyDiagram() {
  return (
    <DiagramFrame title="Expectancy = (Win% × Avg Win R) − (Loss% × Avg Loss R)" viewBox="0 0 800 380">
      <text x="400" y="60" fill={COLORS.textBright} fontSize="14" textAnchor="middle" fontWeight="600">
        Three real systems with the same 50% win rate
      </text>

      {[
        { label: 'Avg win 1R / Avg loss 1R', exp: 0, color: COLORS.yellow, sub: 'Break even' },
        { label: 'Avg win 1.5R / Avg loss 1R', exp: 0.25, color: COLORS.green, sub: 'Profitable' },
        { label: 'Avg win 0.7R / Avg loss 1R', exp: -0.15, color: COLORS.red, sub: 'Bleeds capital' }
      ].map((sys, i) => {
        const y = 130 + i * 75;
        const barW = Math.abs(sys.exp) * 800;
        const startX = sys.exp >= 0 ? 400 : 400 - barW;
        return (
          <g key={i}>
            <text x="60" y={y} fill={COLORS.textBright} fontSize="12" fontWeight="500">{sys.label}</text>
            <text x="60" y={y + 16} fill={COLORS.text} fontSize="10">{sys.sub}</text>
            <line x1="400" y1={y - 10} x2="400" y2={y + 30} stroke={COLORS.axis} strokeWidth="0.5" />
            <rect x={startX} y={y + 5} width={barW} height={20} fill={sys.color} opacity="0.8" rx="2" />
            <text x={sys.exp >= 0 ? 400 + barW + 10 : 400 - barW - 10}
                  y={y + 20}
                  fill={sys.color}
                  fontSize="13"
                  fontWeight="600"
                  textAnchor={sys.exp >= 0 ? 'start' : 'end'}
                  fontFamily="monospace">
              {sys.exp > 0 ? '+' : ''}{sys.exp.toFixed(2)}R/trade
            </text>
          </g>
        );
      })}

      <text x="400" y="360" fill={COLORS.text} fontSize="11" textAnchor="middle">
        Win rate alone tells you nothing. Reward/risk × win rate is the truth.
      </text>
    </DiagramFrame>
  );
}

function DrawdownCurveDiagram() {
  // Show two equity curves: 1% risk vs 5% risk, both with same win/loss sequence
  const seq = [1, 1, -1, 1, -1, -1, -1, -1, -1, 1, 1, -1, 1, 1, -1, 1, -1, -1, 1, 1];
  let eq1 = 100, eq5 = 100;
  const points1 = [{x: 0, y: 100}];
  const points5 = [{x: 0, y: 100}];
  seq.forEach((s, i) => {
    eq1 *= 1 + s * 0.01;
    eq5 *= 1 + s * 0.05;
    points1.push({ x: i + 1, y: eq1 });
    points5.push({ x: i + 1, y: eq5 });
  });

  const scaleX = (x) => 80 + (x / seq.length) * 640;
  const scaleY = (v) => 60 + ((150 - v) / 100) * 280;

  const path1 = 'M ' + points1.map(p => `${scaleX(p.x)} ${scaleY(p.y)}`).join(' L ');
  const path5 = 'M ' + points5.map(p => `${scaleX(p.x)} ${scaleY(p.y)}`).join(' L ');

  return (
    <DiagramFrame title="Same trade sequence, different sizing: drawdown asymmetry in action">
      <line x1="80" y1="340" x2="720" y2="340" stroke={COLORS.axis} />
      <line x1="80" y1="40" x2="80" y2="340" stroke={COLORS.axis} />

      <line x1="80" y1={scaleY(100)} x2="720" y2={scaleY(100)} stroke={COLORS.axis} strokeDasharray="3,3" strokeWidth="0.5" />
      <text x="65" y={scaleY(100) + 4} fill={COLORS.text} fontSize="10" textAnchor="end">100</text>

      <path d={path1} stroke={COLORS.green} strokeWidth="2" fill="none" />
      <path d={path5} stroke={COLORS.red} strokeWidth="2" fill="none" />

      <rect x="500" y="60" width="200" height="50" fill={COLORS.bg} stroke={COLORS.grid} rx="4" />
      <line x1="515" y1="78" x2="540" y2="78" stroke={COLORS.green} strokeWidth="2" />
      <text x="550" y="82" fill={COLORS.green} fontSize="11">1% risk per trade</text>
      <line x1="515" y1="98" x2="540" y2="98" stroke={COLORS.red} strokeWidth="2" />
      <text x="550" y="102" fill={COLORS.red} fontSize="11">5% risk per trade</text>

      <text x="400" y="375" fill={COLORS.text} fontSize="11" textAnchor="middle">
        Identical sequence of W/L. Sizing alone determines if you survive variance.
      </text>
    </DiagramFrame>
  );
}

// ========================================================================
// PHASE 4 DIAGRAMS
// ========================================================================

function AuctionDiagram() {
  return (
    <DiagramFrame title="Balance vs imbalance: two market modes">
      <text x="200" y="50" fill={COLORS.textBright} fontSize="13" textAnchor="middle" fontWeight="600">BALANCE (range, ~65% of days)</text>

      <line x1="60" y1="350" x2="350" y2="350" stroke={COLORS.axis} />
      <line x1="80" y1="100" x2="350" y2="100" stroke={COLORS.red} strokeDasharray="3,3" strokeWidth="0.8" />
      <line x1="80" y1="280" x2="350" y2="280" stroke={COLORS.green} strokeDasharray="3,3" strokeWidth="0.8" />

      <path d="M 80 250 L 110 180 L 140 210 L 170 130 L 200 200 L 230 150 L 260 230 L 290 170 L 320 240"
        stroke={COLORS.textBright} strokeWidth="1.5" fill="none" />

      {/* Bell curve volume */}
      <path d="M 360 350 Q 360 280 370 240 Q 380 180 390 160 Q 400 130 410 160 Q 420 180 430 240 Q 440 280 440 350 Z"
        fill={COLORS.purple} opacity="0.4" />

      <text x="200" y="380" fill={COLORS.text} fontSize="11" textAnchor="middle">Mean-reversion works · fade extremes</text>

      <text x="600" y="50" fill={COLORS.textBright} fontSize="13" textAnchor="middle" fontWeight="600">IMBALANCE (trend, ~15% of days)</text>

      <line x1="460" y1="350" x2="750" y2="350" stroke={COLORS.axis} />

      <path d="M 480 320 L 510 280 L 540 290 L 570 220 L 600 240 L 630 170 L 660 190 L 690 110 L 720 100"
        stroke={COLORS.green} strokeWidth="1.8" fill="none" />

      {/* Skewed volume */}
      <path d="M 730 350 L 730 200 L 740 180 L 740 120 L 750 100 L 750 350 Z"
        fill={COLORS.purple} opacity="0.4" />

      <text x="600" y="380" fill={COLORS.text} fontSize="11" textAnchor="middle">Continuation works · ride the trend</text>
    </DiagramFrame>
  );
}

function DomTapeDiagram() {
  const dom = [
    { price: '5803.00', bid: 0, ask: 220 },
    { price: '5802.75', bid: 0, ask: 180 },
    { price: '5802.50', bid: 0, ask: 250 },
    { price: '5802.25', bid: 0, ask: 150 },
    { price: '5802.00', bid: 0, ask: 320 },
    { price: '5801.75', bid: 200, ask: 0 },
    { price: '5801.50', bid: 280, ask: 0 },
    { price: '5801.25', bid: 150, ask: 0 },
    { price: '5801.00', bid: 350, ask: 0 },
    { price: '5800.75', bid: 220, ask: 0 }
  ];
  const tape = [
    { t: '09:32:14', p: '5802.00', s: 5, side: 'ask' },
    { t: '09:32:14', p: '5802.00', s: 12, side: 'ask' },
    { t: '09:32:13', p: '5801.75', s: 1, side: 'bid' },
    { t: '09:32:13', p: '5801.75', s: 85, side: 'ask' },
    { t: '09:32:12', p: '5801.75', s: 2, side: 'ask' },
    { t: '09:32:11', p: '5801.50', s: 22, side: 'bid' },
    { t: '09:32:10', p: '5801.50', s: 8, side: 'bid' }
  ];

  return (
    <DiagramFrame title="DOM (left) and Time & Sales (right)" viewBox="0 0 800 420">
      {/* DOM */}
      <text x="180" y="40" fill={COLORS.textBright} fontSize="12" fontWeight="600" textAnchor="middle">DOM (Order Book)</text>
      <text x="80" y="65" fill={COLORS.green} fontSize="10" fontWeight="500">BID</text>
      <text x="180" y="65" fill={COLORS.text} fontSize="10" textAnchor="middle">PRICE</text>
      <text x="280" y="65" fill={COLORS.red} fontSize="10" textAnchor="end">ASK</text>

      {dom.map((row, i) => {
        const y = 90 + i * 28;
        const isAtSpread = (i === 4 || i === 5);
        return (
          <g key={i}>
            {row.bid > 0 && (
              <>
                <rect x={180 - row.bid / 4} y={y - 12} width={row.bid / 4} height="20" fill={COLORS.green} opacity="0.3" />
                <text x="80" y={y + 2} fill={COLORS.green} fontSize="11" fontFamily="monospace">{row.bid}</text>
              </>
            )}
            {row.ask > 0 && (
              <>
                <rect x={180} y={y - 12} width={row.ask / 4} height="20" fill={COLORS.red} opacity="0.3" />
                <text x="280" y={y + 2} fill={COLORS.red} fontSize="11" fontFamily="monospace" textAnchor="end">{row.ask}</text>
              </>
            )}
            <text x="180" y={y + 2} fill={isAtSpread ? COLORS.textBright : COLORS.text} fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight={isAtSpread ? "700" : "400"}>{row.price}</text>
          </g>
        );
      })}

      {/* Tape */}
      <text x="600" y="40" fill={COLORS.textBright} fontSize="12" fontWeight="600" textAnchor="middle">Time &amp; Sales</text>
      <text x="430" y="65" fill={COLORS.text} fontSize="10">TIME</text>
      <text x="540" y="65" fill={COLORS.text} fontSize="10">PRICE</text>
      <text x="640" y="65" fill={COLORS.text} fontSize="10">SIZE</text>
      <text x="730" y="65" fill={COLORS.text} fontSize="10" textAnchor="end">SIDE</text>

      {tape.map((t, i) => {
        const y = 90 + i * 28;
        const isAggressiveBig = t.s >= 50;
        return (
          <g key={i}>
            <text x="430" y={y + 2} fill={COLORS.text} fontSize="11" fontFamily="monospace">{t.t}</text>
            <text x="540" y={y + 2} fill={COLORS.text} fontSize="11" fontFamily="monospace">{t.p}</text>
            <text x="640" y={y + 2} fill={isAggressiveBig ? COLORS.textBright : COLORS.text} fontSize="11" fontFamily="monospace" fontWeight={isAggressiveBig ? "700" : "400"}>{t.s}</text>
            <text x="730" y={y + 2} fill={t.side === 'ask' ? COLORS.green : COLORS.red} fontSize="11" fontFamily="monospace" textAnchor="end" fontWeight="500">
              {t.side === 'ask' ? 'BUY' : 'SELL'}
            </text>
          </g>
        );
      })}

      <text x="400" y="395" fill={COLORS.text} fontSize="11" textAnchor="middle">
        Hitting ask = buyer aggressive. Hitting bid = seller aggressive. Watch the size.
      </text>
    </DiagramFrame>
  );
}

function VolumeProfileDiagram() {
  return (
    <DiagramFrame title="Volume profile: where consensus formed">
      <line x1="60" y1="350" x2="600" y2="350" stroke={COLORS.axis} />
      <line x1="60" y1="50" x2="60" y2="350" stroke={COLORS.axis} />

      {/* Price action */}
      <path d="M 80 300 L 110 250 L 140 280 L 170 200 L 200 230 L 230 180 L 260 210 L 290 160 L 320 195 L 350 170 L 380 200 L 410 175 L 440 215 L 470 190 L 500 250 L 530 280 L 560 320"
        stroke={COLORS.textBright} strokeWidth="1.2" fill="none" />

      {/* Profile bars on right */}
      <line x1="610" y1="50" x2="610" y2="350" stroke={COLORS.grid} />
      <text x="700" y="40" fill={COLORS.text} fontSize="11" textAnchor="middle">Volume Profile</text>

      {[
        { y: 100, w: 30 },
        { y: 130, w: 50 },
        { y: 160, w: 75 },
        { y: 190, w: 130, isPOC: true },
        { y: 220, w: 100 },
        { y: 250, w: 60 },
        { y: 280, w: 40 },
        { y: 310, w: 25 }
      ].map((b, i) => (
        <g key={i}>
          <rect x={615} y={b.y - 10} width={b.w} height="20" fill={b.isPOC ? COLORS.purple : COLORS.purple} opacity={b.isPOC ? 1 : 0.4} />
          {b.isPOC && <text x={620 + b.w + 8} y={b.y + 4} fill={COLORS.purple} fontSize="10" fontWeight="600">POC</text>}
        </g>
      ))}

      {/* Value area lines */}
      <line x1="60" y1="160" x2="600" y2="160" stroke={COLORS.yellow} strokeDasharray="2,2" strokeWidth="0.8" />
      <text x="68" y="155" fill={COLORS.yellow} fontSize="9">VAH</text>
      <line x1="60" y1="250" x2="600" y2="250" stroke={COLORS.yellow} strokeDasharray="2,2" strokeWidth="0.8" />
      <text x="68" y="245" fill={COLORS.yellow} fontSize="9">VAL</text>

      <text x="400" y="385" fill={COLORS.text} fontSize="11" textAnchor="middle">
        POC = highest volume price · VA (Value Area) = central 70% of volume
      </text>
    </DiagramFrame>
  );
}

function MarketProfileDiagram() {
  // Simulated TPO chart
  const tpoData = [
    { y: 80, letters: 'A' },
    { y: 105, letters: 'AB' },
    { y: 130, letters: 'ABC' },
    { y: 155, letters: 'ABCD' },
    { y: 180, letters: 'ABCDE' },
    { y: 205, letters: 'ABCDEF', isPOC: true },
    { y: 230, letters: 'ABCDEFG', isPOC: true },
    { y: 255, letters: 'CDEFGH' },
    { y: 280, letters: 'DEFGHI' },
    { y: 305, letters: 'FGHIJ' },
    { y: 330, letters: 'HIJK' }
  ];

  return (
    <DiagramFrame title="Market profile (TPO): time at price">
      <line x1="60" y1="370" x2="740" y2="370" stroke={COLORS.axis} />
      <line x1="60" y1="50" x2="60" y2="370" stroke={COLORS.axis} />

      {tpoData.map((row, i) => (
        <g key={i}>
          {row.letters.split('').map((letter, j) => (
            <text key={j} x={120 + j * 22} y={row.y + 4}
                  fill={row.isPOC ? COLORS.purple : COLORS.text}
                  fontSize="14" fontFamily="monospace"
                  fontWeight={row.isPOC ? "600" : "400"}>
              {letter}
            </text>
          ))}
        </g>
      ))}

      {/* Highlight wide rows */}
      <rect x="115" y="195" width="160" height="50" fill={COLORS.purple} opacity="0.1" rx="3" />
      <text x="500" y="222" fill={COLORS.purple} fontSize="11" fontWeight="500">← Wide row = fair value (consensus)</text>

      <text x="500" y="100" fill={COLORS.text} fontSize="11">← Narrow row = price rejected</text>

      <text x="400" y="395" fill={COLORS.text} fontSize="11" textAnchor="middle">
        Each letter = 30-min period. Width tells you where time was spent.
      </text>
    </DiagramFrame>
  );
}

// ========================================================================
// PHASE 5 DIAGRAMS
// ========================================================================

function PlaybookDiagram() {
  return (
    <DiagramFrame title="A setup is: trigger + level + trend + exit rules">
      <rect x="60" y="60" width="680" height="280" fill={COLORS.bg} stroke={COLORS.grid} rx="8" />

      {[
        { x: 100, y: 100, w: 280, h: 60, title: 'TRIGGER', body: 'Specific price action at a key level (e.g. 5-min close above VWAP after rejection)', color: COLORS.green },
        { x: 420, y: 100, w: 280, h: 60, title: 'LEVEL', body: 'Why this price matters (PDH, VWAP, support — institutional reference)', color: COLORS.blue },
        { x: 100, y: 180, w: 280, h: 60, title: 'TREND', body: 'Higher-timeframe direction must align (1H trend = your direction)', color: COLORS.yellow },
        { x: 420, y: 180, w: 280, h: 60, title: 'STOP & TARGET', body: 'Stop at structural invalidation. Target ≥ 2R or next structural level.', color: COLORS.purple }
      ].map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={COLORS.bg} stroke={b.color} strokeWidth="1.5" rx="4" />
          <text x={b.x + 12} y={b.y + 22} fill={b.color} fontSize="13" fontWeight="700">{b.title}</text>
          <text x={b.x + 12} y={b.y + 44} fill={COLORS.text} fontSize="11">{b.body}</text>
        </g>
      ))}

      <text x="400" y="300" fill={COLORS.textBright} fontSize="12" textAnchor="middle" fontWeight="600">
        All four together = setup. Any one missing = skip.
      </text>
    </DiagramFrame>
  );
}

function BacktestFlowDiagram() {
  return (
    <DiagramFrame title="The path: backtest → sim → live small → scale">
      {[
        { x: 70, y: 200, label: 'BACKTEST', sub: '100+ historical', sub2: 'occurrences', color: COLORS.blue },
        { x: 240, y: 200, label: 'SIM', sub: '50+ trades', sub2: '+0.2R+ expectancy', color: COLORS.purple },
        { x: 410, y: 200, label: 'LIVE SMALL', sub: '50+ live trades', sub2: 'minimum size', color: COLORS.yellow },
        { x: 580, y: 200, label: 'SCALE', sub: 'with evidence', sub2: 'of edge', color: COLORS.green }
      ].map((s, i, arr) => (
        <g key={i}>
          <rect x={s.x} y={s.y - 50} width="140" height="100" fill={COLORS.bg} stroke={s.color} strokeWidth="1.5" rx="6" />
          <text x={s.x + 70} y={s.y - 20} fill={s.color} fontSize="13" textAnchor="middle" fontWeight="700">{s.label}</text>
          <text x={s.x + 70} y={s.y + 4} fill={COLORS.text} fontSize="10" textAnchor="middle">{s.sub}</text>
          <text x={s.x + 70} y={s.y + 22} fill={COLORS.text} fontSize="10" textAnchor="middle">{s.sub2}</text>
          {i < arr.length - 1 && (
            <path d={`M ${s.x + 145} 200 L ${arr[i + 1].x - 5} 200`} stroke={COLORS.text} strokeWidth="1.5" markerEnd="url(#arrow)" />
          )}
        </g>
      ))}

      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill={COLORS.text} />
        </marker>
      </defs>

      <text x="400" y="320" fill={COLORS.text} fontSize="11" textAnchor="middle">
        Each step earns the next. Skipping steps = paying tuition the hard way.
      </text>
    </DiagramFrame>
  );
}

function SimToLiveDiagram() {
  return (
    <DiagramFrame title="Sim vs live: expect 10-30% performance degradation">
      <line x1="80" y1="320" x2="720" y2="320" stroke={COLORS.axis} />
      <line x1="80" y1="60" x2="80" y2="320" stroke={COLORS.axis} />

      <text x="65" y="80" fill={COLORS.text} fontSize="10" textAnchor="end">+0.5R</text>
      <text x="65" y="200" fill={COLORS.text} fontSize="10" textAnchor="end">+0.2R</text>
      <text x="65" y="320" fill={COLORS.text} fontSize="10" textAnchor="end">0R</text>

      <line x1="80" y1="200" x2="720" y2="200" stroke={COLORS.grid} strokeDasharray="3,3" strokeWidth="0.5" />

      <rect x="180" y="120" width="100" height="200" fill={COLORS.purple} opacity="0.6" rx="4" />
      <text x="230" y="105" fill={COLORS.purple} fontSize="13" textAnchor="middle" fontWeight="600">SIM</text>
      <text x="230" y="345" fill={COLORS.text} fontSize="11" textAnchor="middle">Expectancy +0.4R</text>

      <rect x="500" y="180" width="100" height="140" fill={COLORS.yellow} opacity="0.6" rx="4" />
      <text x="550" y="165" fill={COLORS.yellow} fontSize="13" textAnchor="middle" fontWeight="600">LIVE</text>
      <text x="550" y="345" fill={COLORS.text} fontSize="11" textAnchor="middle">Expectancy +0.25R</text>

      <path d="M 290 220 L 480 220" stroke={COLORS.red} strokeWidth="2" markerEnd="url(#arrow2)" />
      <text x="385" y="210" fill={COLORS.red} fontSize="11" textAnchor="middle">~30% degradation</text>

      <defs>
        <marker id="arrow2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill={COLORS.red} />
        </marker>
      </defs>

      <text x="400" y="385" fill={COLORS.text} fontSize="11" textAnchor="middle">
        Slippage, psychology, latency. Plan for it. Start at minimum size.
      </text>
    </DiagramFrame>
  );
}

function ReviewLoopDiagram() {
  return (
    <DiagramFrame title="The review loop: how improvement actually compounds">
      <circle cx="400" cy="200" r="140" fill="none" stroke={COLORS.grid} strokeWidth="1" />

      {[
        { angle: -90, label: 'TRADE', sub: 'execute playbook', color: COLORS.green },
        { angle: 0, label: 'JOURNAL', sub: 'log every trade', color: COLORS.blue },
        { angle: 90, label: 'REVIEW', sub: 'weekly + monthly', color: COLORS.purple },
        { angle: 180, label: 'ADJUST', sub: 'concrete actions', color: COLORS.yellow }
      ].map((s, i) => {
        const x = 400 + Math.cos(s.angle * Math.PI / 180) * 140;
        const y = 200 + Math.sin(s.angle * Math.PI / 180) * 140;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="50" fill={COLORS.bg} stroke={s.color} strokeWidth="2" />
            <text x={x} y={y - 5} fill={s.color} fontSize="13" textAnchor="middle" fontWeight="700">{s.label}</text>
            <text x={x} y={y + 12} fill={COLORS.text} fontSize="10" textAnchor="middle">{s.sub}</text>
          </g>
        );
      })}

      {/* Arrows around the circle */}
      {[0, 90, 180, 270].map((angle, i) => {
        const r1 = 140;
        const startAngle = angle - 35;
        const endAngle = angle - 55;
        const x1 = 400 + Math.cos(startAngle * Math.PI / 180) * r1;
        const y1 = 200 + Math.sin(startAngle * Math.PI / 180) * r1;
        const x2 = 400 + Math.cos(endAngle * Math.PI / 180) * r1;
        const y2 = 200 + Math.sin(endAngle * Math.PI / 180) * r1;
        return <path key={i} d={`M ${x1} ${y1} L ${x2} ${y2}`} stroke={COLORS.text} strokeWidth="1.5" markerEnd="url(#arrowR)" />;
      })}

      <defs>
        <marker id="arrowR" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill={COLORS.text} />
        </marker>
      </defs>
    </DiagramFrame>
  );
}

// ========================================================================
// PHASE 6 DIAGRAMS
// ========================================================================

function PsychologyDiagram() {
  return (
    <DiagramFrame title="The four failure modes that get most traders">
      {[
        { x: 80, y: 100, title: 'TILT', body: 'Degraded judgment after losses. Cure: pre-committed daily limits.', color: COLORS.red },
        { x: 420, y: 100, title: 'REVENGE', body: 'Forcing trades to "get back" at the market. Cure: cooldown + max trades/day cap.', color: COLORS.red },
        { x: 80, y: 220, title: 'FOMO / CHASING', body: 'Entering late after a move. Cure: pre-defined entry triggers.', color: COLORS.yellow },
        { x: 420, y: 220, title: 'OVERCONFIDENCE', body: 'Sizing up after wins. Cure: sizing fixed by math, not by recent results.', color: COLORS.yellow }
      ].map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.y} width="300" height="100" fill={COLORS.bg} stroke={b.color} strokeWidth="1.5" rx="6" />
          <text x={b.x + 16} y={b.y + 28} fill={b.color} fontSize="14" fontWeight="700">{b.title}</text>
          <text x={b.x + 16} y={b.y + 56} fill={COLORS.text} fontSize="11">
            <tspan x={b.x + 16} dy="0">{b.body.split('. ')[0]}.</tspan>
            <tspan x={b.x + 16} dy="18">{b.body.split('. ').slice(1).join('. ')}</tspan>
          </text>
        </g>
      ))}

      <text x="400" y="380" fill={COLORS.textBright} fontSize="11" textAnchor="middle" fontWeight="500">
        Pre-commitment beats willpower. Always.
      </text>
    </DiagramFrame>
  );
}

function TopstepRulesDiagram() {
  const rows = [
    ['Profit target', '$3,000'],
    ['Trailing drawdown', '$2,000 (trails up with new highs, never down)'],
    ['Daily loss limit', '$1,000'],
    ['Min trading days', '5'],
    ['Max contracts (ES)', '5'],
    ['EOD position rule', 'Close all by 4:10pm CT'],
    ['Consistency rule', 'No single day > ~50% of profits'],
    ['Cost', '~$150/month per evaluation'],
    ['Profit split (funded)', '100% first $5K, then 90%']
  ];
  return (
    <DiagramFrame title="Topstep $50K Combine: rules at a glance (verify current at topstep.com)" viewBox="0 0 800 380">
      <rect x="40" y="20" width="720" height="340" fill={COLORS.bg} stroke={COLORS.grid} rx="6" />
      {rows.map(([k, v], i) => (
        <g key={i} transform={`translate(0, ${50 + i * 35})`}>
          <line x1="60" y1="20" x2="740" y2="20" stroke={COLORS.grid} strokeWidth="0.5" />
          <text x="70" y="10" fill={COLORS.text} fontSize="12" fontWeight="500">{k}</text>
          <text x="730" y="10" fill={COLORS.textBright} fontSize="12" textAnchor="end" fontFamily="monospace">{v}</text>
        </g>
      ))}
    </DiagramFrame>
  );
}

function GraduationChecklistDiagram() {
  const sections = [
    { label: 'Foundations', items: 3, color: COLORS.blue },
    { label: 'Risk discipline', items: 4, color: COLORS.green },
    { label: 'Validated playbook', items: 4, color: COLORS.purple },
    { label: 'Journal habit', items: 4, color: COLORS.yellow },
    { label: 'Psychology', items: 4, color: COLORS.red },
    { label: 'Prop readiness', items: 4, color: COLORS.textBright }
  ];

  return (
    <DiagramFrame title="The graduation checklist: 23 items across 6 sections" viewBox="0 0 800 380">
      {sections.map((s, i) => (
        <g key={i} transform={`translate(60, ${60 + i * 45})`}>
          <rect x="0" y="0" width="120" height="30" fill={s.color} opacity="0.2" stroke={s.color} strokeWidth="1.5" rx="4" />
          <text x="60" y="20" fill={s.color} fontSize="12" textAnchor="middle" fontWeight="600">{s.label}</text>
          {Array.from({ length: s.items }).map((_, j) => (
            <rect key={j} x={140 + j * 35} y="5" width="22" height="22" fill={COLORS.bg} stroke={s.color} strokeWidth="1.5" rx="3" />
          ))}
        </g>
      ))}

      <text x="400" y="350" fill={COLORS.text} fontSize="11" textAnchor="middle">
        All 23 boxes must be honestly checked before prop eval.
      </text>
    </DiagramFrame>
  );
}

// ========================================================================
// MAIN EXPORT
// ========================================================================

const diagrams = {
  // Phase 1
  futures_basics: FuturesBasicsDiagram,
  es_specs: ESSpecsDiagram,
  leverage_drawdown: LeverageDrawdownDiagram,
  trading_day: TradingDayDiagram,
  // Phase 2
  candlesticks: CandlesticksDiagram,
  support_resistance: SupportResistanceDiagram,
  trend_structure: TrendStructureDiagram,
  key_levels: KeyLevelsDiagram,
  patterns: PatternsDiagram,
  // Phase 3
  risk_table: RiskTableDiagram,
  stop_placement: StopPlacementDiagram,
  expectancy: ExpectancyDiagram,
  drawdown_curve: DrawdownCurveDiagram,
  // Phase 4
  auction: AuctionDiagram,
  dom_tape: DomTapeDiagram,
  volume_profile: VolumeProfileDiagram,
  market_profile: MarketProfileDiagram,
  // Phase 5
  playbook: PlaybookDiagram,
  backtest_flow: BacktestFlowDiagram,
  sim_to_live: SimToLiveDiagram,
  review_loop: ReviewLoopDiagram,
  // Phase 6
  psychology: PsychologyDiagram,
  topstep_rules: TopstepRulesDiagram,
  graduation_checklist: GraduationChecklistDiagram
};

export function Diagram({ id }) {
  const Component = diagrams[id];
  if (!Component) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-8 text-center text-zinc-500 text-sm">
        Diagram: {id}
      </div>
    );
  }
  return <Component />;
}
