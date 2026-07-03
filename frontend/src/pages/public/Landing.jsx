import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building, Shield, Users, CreditCard, ArrowRight, CheckCircle,
  MessageSquare, FileText, TrendingUp, DoorOpen, Bell, Smartphone, PieChart,
  X, ChevronDown, Lock, Zap
} from 'lucide-react';

/* ─────────────────────────────────────────────
   SVG ILLUSTRATIONS
───────────────────────────────────────────── */

const HouseIllustration = () => {
  // Window grid: 5 floors × 4 columns. 1 = amber lit, 0 = dark
  const floors = [
    { y: 83,  lit: [1, 0, 1, 1] },
    { y: 137, lit: [0, 1, 0, 1] },
    { y: 191, lit: [1, 1, 1, 0] },
    { y: 245, lit: [0, 0, 1, 1] },
    { y: 299, lit: [1, 1, 0, 0] },
  ];
  const colX = [167, 228, 289, 350];

  return (
    <svg viewBox="0 0 560 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <defs>
        <filter id="bshadow" x="-15%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="12" stdDeviation="20" floodColor="#C97D23" floodOpacity="0.12" />
          <feDropShadow dx="0" dy="4"  stdDeviation="6"  floodColor="#000000" floodOpacity="0.18" />
        </filter>
        <filter id="bgshadow">
          <feDropShadow dx="0" dy="4" stdDeviation="10" floodColor="#00000018" />
        </filter>
        <radialGradient id="glow" cx="50%" cy="60%" r="50%">
          <stop offset="0%"   stopColor="#C97D23" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#C97D23" stopOpacity="0"    />
        </radialGradient>
      </defs>

      {/* Ambient glow only — no background fill */}
      <ellipse cx="280" cy="280" rx="200" ry="210" fill="url(#glow)" />

      {/* Ground */}
      <rect x="80"  y="392" width="400" height="16" rx="4" fill="#E5E0D8" />
      <rect x="120" y="406" width="320" height="50" rx="0" fill="#ECE8E2" />
      {/* Pavement seams */}
      {[200, 280, 360].map(x => (
        <line key={x} x1={x} y1="406" x2={x} y2="456" stroke="#DDD9D2" strokeWidth="1" />
      ))}
      <line x1="120" y1="430" x2="440" y2="430" stroke="#DDD9D2" strokeWidth="1" />

      {/* ── Building ── */}
      <g filter="url(#bshadow)">
        {/* Main body */}
        <rect x="150" y="72" width="260" height="320" rx="5" fill="#1C1C1E" />
        {/* Roof cap */}
        <rect x="142" y="58" width="276" height="22" rx="6" fill="#141416" />
        {/* Subtle top edge highlight */}
        <rect x="150" y="78" width="260" height="2" fill="#2D2D30" />
        {/* Floor-plate lines */}
        {[126, 180, 234, 288, 342].map(y => (
          <rect key={y} x="150" y={y} width="260" height="1.5" fill="#252528" />
        ))}
        {/* Vertical facade grooves */}
        <rect x="278" y="72" width="4" height="320" fill="#161618" />
      </g>

      {/* ── Windows ── */}
      {floors.flatMap(({ y, lit }) =>
        colX.map((x, col) => (
          <g key={`${y}-${col}`}>
            {/* Recess shadow */}
            <rect x={x - 2} y={y - 2} width="46" height="36" rx="4" fill="#111113" />
            {/* Glass */}
            <rect x={x} y={y} width="42" height="32" rx="3"
              fill={lit[col] ? '#C97D23' : '#252528'}
              fillOpacity={lit[col] ? 0.9 : 1}
            />
            {/* Window cross */}
            <line x1={x + 21} y1={y}      x2={x + 21} y2={y + 32} stroke={lit[col] ? '#B06A1A' : '#2A2A2D'} strokeWidth="1.5" />
            <line x1={x}      y1={y + 16}  x2={x + 42} y2={y + 16} stroke={lit[col] ? '#B06A1A' : '#2A2A2D'} strokeWidth="1.5" />
            {/* Lit window highlight */}
            {lit[col] && <rect x={x + 2} y={y + 2} width="38" height="10" rx="2" fill="white" fillOpacity="0.14" />}
          </g>
        ))
      )}

      {/* ── Ground floor lobby ── */}
      <rect x="150" y="342" width="260" height="50" fill="#1A1A1C" />
      <rect x="150" y="342" width="260" height="2" fill="#252528" />
      {/* Glass façade panels */}
      <rect x="158" y="348" width="84"  height="38" rx="2" fill="#222225" />
      <rect x="158" y="348" width="84"  height="12" rx="2" fill="#2C2C30" />
      <rect x="318" y="348" width="84"  height="38" rx="2" fill="#222225" />
      <rect x="318" y="348" width="84"  height="12" rx="2" fill="#2C2C30" />
      {/* Door */}
      <rect x="250" y="346" width="60" height="46" rx="2" fill="#1A1A1C" />
      <rect x="252" y="348" width="26" height="42" rx="1" fill="#242428" />
      <rect x="282" y="348" width="26" height="42" rx="1" fill="#242428" />
      <circle cx="279" cy="370" r="3"  fill="#C97D23" fillOpacity="0.6" />
      <circle cx="283" cy="370" r="3"  fill="#C97D23" fillOpacity="0.6" />
      {/* Lobby name plate */}
      <rect x="258" y="348" width="44" height="9" rx="1" fill="#C97D23" fillOpacity="0.2" />
      <text x="280" y="356" textAnchor="middle" fontSize="6" fill="#C97D23" fontFamily="system-ui, sans-serif" fontWeight="700" letterSpacing="0.5">IMMEUBLE</text>

      {/* ── Rooftop ── */}
      {/* Water tank */}
      <rect x="336" y="38" width="40" height="24" rx="3" fill="#252528" />
      <rect x="330" y="34" width="52" height="8"  rx="2" fill="#1E1E21" />
      {[340, 350, 360, 370].map(x => (
        <rect key={x} x={x} y="26" width="4" height="10" rx="1" fill="#1E1E21" />
      ))}
      {/* Antenna */}
      <line x1="194" y1="58" x2="194" y2="22" stroke="#2D2D30" strokeWidth="2"   strokeLinecap="round" />
      <line x1="184" y1="36" x2="204" y2="36" stroke="#2D2D30" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="180" y1="44" x2="208" y2="44" stroke="#2D2D30" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="194" cy="22" r="3" fill="#C97D23" fillOpacity="0.7" />

      {/* ── Entrance path ── */}
      <rect x="245" y="392" width="70" height="14" fill="#D8D3CB" />

      {/* ────────────────────────────────────────
          Floating UI badges
      ──────────────────────────────────────── */}

      {/* Top-right · Rent Paid */}
      <g filter="url(#bgshadow)" transform="translate(400, 72)">
        <rect width="144" height="60" rx="12" fill="white" />
        <rect x="10" y="10" width="36" height="36" rx="9" fill="#F0FDF4" />
        <path d="M19 28 L25 34 L35 20" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <text x="54" y="27" fontSize="11" fontWeight="700" fill="#18181B" fontFamily="system-ui, sans-serif">Rent Paid</text>
        <text x="54" y="40" fontSize="9"  fill="#A1A1AA"  fontFamily="system-ui, sans-serif">45,000 XAF</text>
        <text x="54" y="52" fontSize="8"  fill="#C9C9CB"  fontFamily="system-ui, sans-serif">Room 3 · July 2026</text>
      </g>

      {/* Left · Occupancy */}
      <g filter="url(#bgshadow)" transform="translate(12, 150)">
        <rect width="130" height="60" rx="12" fill="white" />
        <rect x="10" y="10" width="36" height="36" rx="9" fill="#FEF3E7" />
        <rect x="18" y="32" width="6" height="10" rx="1.5" fill="#C97D23" />
        <rect x="27" y="26" width="6" height="16" rx="1.5" fill="#C97D23" />
        <rect x="36" y="20" width="6" height="22" rx="1.5" fill="#C97D23" />
        <text x="54" y="27" fontSize="10" fontWeight="700" fill="#18181B" fontFamily="system-ui, sans-serif">Occupancy</text>
        <text x="54" y="41" fontSize="13" fontWeight="800" fill="#C97D23" fontFamily="system-ui, sans-serif">9 / 12</text>
        <text x="54" y="53" fontSize="8"  fill="#A1A1AA"  fontFamily="system-ui, sans-serif">rooms occupied</text>
      </g>

      {/* Left-lower · Complaint */}
      <g filter="url(#bgshadow)" transform="translate(16, 278)">
        <rect width="138" height="56" rx="12" fill="white" />
        <rect x="10" y="10" width="34" height="34" rx="9" fill="#FFF7ED" />
        <circle cx="27" cy="20" r="7" fill="none" stroke="#C97D23" strokeWidth="1.5" />
        <text x="27" y="24" textAnchor="middle" fontSize="10" fontWeight="800" fill="#C97D23" fontFamily="system-ui, sans-serif">!</text>
        <text x="52" y="26" fontSize="10" fontWeight="700" fill="#18181B" fontFamily="system-ui, sans-serif">Complaint</text>
        <text x="52" y="38" fontSize="9"  fill="#A1A1AA"  fontFamily="system-ui, sans-serif">Water leak · Rm 4</text>
        <text x="52" y="50" fontSize="8"  fill="#C97D23"  fontFamily="system-ui, sans-serif" fontWeight="600">Pending →</text>
      </g>

      {/* Right · Monthly Income — dark */}
      <g filter="url(#bgshadow)" transform="translate(400, 196)">
        <rect width="148" height="72" rx="12" fill="#18181B" />
        <rect x="10" y="10" width="36" height="36" rx="9" fill="#C97D23" fillOpacity="0.15" />
        <polyline points="16,38 22,30 28,34 34,24 40,28" stroke="#C97D23" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="40" cy="28" r="3" fill="#C97D23" />
        <text x="54" y="25" fontSize="8"  fill="#71717A" fontFamily="system-ui, sans-serif" letterSpacing="0.4">THIS MONTH</text>
        <text x="54" y="42" fontSize="18" fontWeight="800" fill="white"   fontFamily="system-ui, sans-serif">405k</text>
        <text x="107" y="42" fontSize="10" fontWeight="700" fill="#C97D23" fontFamily="system-ui, sans-serif">XAF</text>
        <text x="54" y="57" fontSize="8"  fill="#52525B" fontFamily="system-ui, sans-serif">↑ 12% vs last month</text>
      </g>
    </svg>
  );
};

const DashboardMockup = () => (
  <svg viewBox="0 0 880 520" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <defs>
      <filter id="card-shadow" x="-5%" y="-5%" width="110%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#00000018" />
      </filter>
      <clipPath id="browser-clip">
        <rect width="880" height="520" rx="14" />
      </clipPath>
    </defs>
    <rect width="880" height="520" rx="14" fill="#E8E7E5" clipPath="url(#browser-clip)" />
    <rect width="880" height="38" fill="#DDDCDA" />
    <circle cx="22" cy="19" r="6" fill="#FF5F57" />
    <circle cx="42" cy="19" r="6" fill="#FFBD2E" />
    <circle cx="62" cy="19" r="6" fill="#28C840" />
    <rect x="96" y="10" width="480" height="18" rx="9" fill="#CCCBC9" />
    <text x="336" y="23" textAnchor="middle" fontSize="9" fill="#8A8A8A" fontFamily="system-ui, sans-serif">app.housetrack.cm/landlord/dashboard</text>
    <rect x="0" y="38" width="172" height="482" fill="#18181B" />
    <text x="18" y="67" fontSize="15" fontWeight="700" fill="#C97D23" fontFamily="system-ui, sans-serif" letterSpacing="-0.3">HouseTrack</text>
    <rect x="10" y="80" width="152" height="30" rx="6" fill="#C97D23" fillOpacity="0.18" />
    <rect x="22" y="91" width="10" height="10" rx="2" fill="#C97D23" />
    <text x="40" y="100" fontSize="11" fill="#C97D23" fontWeight="600" fontFamily="system-ui, sans-serif">Dashboard</text>
    {[
      { y: 122, label: 'Properties' },
      { y: 154, label: 'Tenants' },
      { y: 186, label: 'Payments' },
      { y: 218, label: 'Complaints' },
      { y: 250, label: 'Reports' },
    ].map(({ y, label }) => (
      <g key={label}>
        <rect x="22" y={y + 1} width="10" height="10" rx="2" fill="#52525B" />
        <text x="40" y={y + 10} fontSize="11" fill="#71717A" fontFamily="system-ui, sans-serif">{label}</text>
      </g>
    ))}
    <circle cx="30" cy="475" r="14" fill="#2D2D30" />
    <text x="30" y="479" textAnchor="middle" fontSize="10" fill="#C97D23" fontWeight="700" fontFamily="system-ui, sans-serif">NG</text>
    <text x="52" y="472" fontSize="10" fill="#E4E4E7" fontFamily="system-ui, sans-serif" fontWeight="600">M. Nguemo</text>
    <text x="52" y="484" fontSize="9" fill="#52525B" fontFamily="system-ui, sans-serif">Landlord</text>
    <rect x="172" y="38" width="708" height="482" fill="#F5F4F2" />
    <text x="196" y="70" fontSize="18" fontWeight="700" fill="#18181B" fontFamily="system-ui, sans-serif">Dashboard</text>
    <text x="196" y="85" fontSize="10" fill="#A1A1AA" fontFamily="system-ui, sans-serif">Thursday, 3 July 2026 · Yaoundé</text>
    {[
      { x: 196, label: 'PROPERTIES',    value: '3',       iconColor: '#C97D23', bg: '#FEF3E7' },
      { x: 366, label: 'TOTAL ROOMS',   value: '12',      iconColor: '#6366F1', bg: '#EEF2FF' },
      { x: 536, label: 'PAID THIS MONTH', value: '9',     iconColor: '#22C55E', bg: '#F0FDF4' },
      { x: 706, label: 'MONTHLY INCOME', value: '405k XAF', iconColor: '#22C55E', bg: '#F0FDF4' },
    ].map(({ x, label, value, iconColor, bg }) => (
      <g key={label} filter="url(#card-shadow)">
        <rect x={x} y="96" width="156" height="68" rx="8" fill="white" />
        <rect x={x + 10} y="106" width="26" height="26" rx="6" fill={bg} />
        <rect x={x + 16} y="112" width="14" height="14" rx="3" fill={iconColor} />
        <text x={x + 48} y="120" fontSize="8" fill="#A1A1AA" fontFamily="system-ui, sans-serif" letterSpacing="0.6">{label}</text>
        <text x={x + 48} y="136" fontSize="16" fontWeight="700" fill="#18181B" fontFamily="system-ui, sans-serif">{value}</text>
      </g>
    ))}
    <rect x="196" y="176" width="664" height="28" rx="6" fill="#FFF7ED" stroke="#FED7AA" strokeWidth="1" />
    <rect x="208" y="186" width="8" height="8" rx="4" fill="#C97D23" />
    <text x="224" y="194" fontSize="10" fill="#92400E" fontFamily="system-ui, sans-serif"><tspan fontWeight="600">2 overdue payments</tspan><tspan fill="#A1A1AA"> from previous months need attention.</tspan></text>
    <text x="836" y="194" fontSize="10" fill="#C97D23" fontWeight="600" fontFamily="system-ui, sans-serif" textAnchor="end">View →</text>
    <g filter="url(#card-shadow)">
      <rect x="196" y="216" width="664" height="260" rx="8" fill="white" />
    </g>
    <text x="216" y="240" fontSize="13" fontWeight="600" fill="#18181B" fontFamily="system-ui, sans-serif">Recent Payments</text>
    <text x="836" y="240" fontSize="10" fill="#C97D23" fontFamily="system-ui, sans-serif" textAnchor="end">View all →</text>
    <rect x="196" y="248" width="664" height="1" fill="#F4F4F5" />
    <rect x="196" y="249" width="664" height="24" fill="#FAFAFA" />
    {[
      { x: 216, label: 'TENANT' },
      { x: 436, label: 'ROOM' },
      { x: 536, label: 'MONTH' },
      { x: 636, label: 'AMOUNT' },
      { x: 756, label: 'STATUS' },
    ].map(({ x, label }) => (
      <text key={label} x={x} y="265" fontSize="8.5" fill="#A1A1AA" fontWeight="600" fontFamily="system-ui, sans-serif" letterSpacing="0.5">{label}</text>
    ))}
    {[
      { name: 'Abanda Paul',  initial: 'A', room: 'Room 3', month: '2026-07', amount: '45,000 XAF', status: 'Paid',    statusBg: '#F0FDF4', statusColor: '#16A34A' },
      { name: 'Fokou Marie',  initial: 'F', room: 'Room 7', month: '2026-07', amount: '30,000 XAF', status: 'Paid',    statusBg: '#F0FDF4', statusColor: '#16A34A' },
      { name: 'Nkomo Albert', initial: 'N', room: 'Room 1', month: '2026-07', amount: '50,000 XAF', status: 'Pending', statusBg: '#FFF7ED', statusColor: '#C97D23' },
      { name: 'Bello Fatima', initial: 'B', room: 'Room 9', month: '2026-07', amount: '35,000 XAF', status: 'Paid',    statusBg: '#F0FDF4', statusColor: '#16A34A' },
    ].map(({ name, initial, room, month, amount, status, statusBg, statusColor }, i) => {
      const y = 273 + i * 48;
      return (
        <g key={name}>
          <rect x="196" y={y} width="664" height="1" fill="#F4F4F5" />
          <rect x="196" y={y + 1} width="664" height="47" fill={i % 2 === 0 ? 'white' : '#FAFAFA'} />
          <circle cx="232" cy={y + 24} r="14" fill="#FEF3E7" />
          <text x="232" y={y + 28} textAnchor="middle" fontSize="11" fontWeight="700" fill="#C97D23" fontFamily="system-ui, sans-serif">{initial}</text>
          <text x="254" y={y + 20} fontSize="11" fontWeight="600" fill="#18181B" fontFamily="system-ui, sans-serif">{name}</text>
          <text x="436" y={y + 26} fontSize="11" fill="#71717A" fontFamily="system-ui, sans-serif">{room}</text>
          <text x="536" y={y + 26} fontSize="11" fill="#71717A" fontFamily="system-ui, sans-serif">{month}</text>
          <text x="636" y={y + 26} fontSize="11" fontWeight="600" fill="#18181B" fontFamily="system-ui, sans-serif">{amount}</text>
          <rect x="750" y={y + 14} width={status === 'Paid' ? 40 : 56} height="20" rx="10" fill={statusBg} />
          <text x={status === 'Paid' ? 770 : 778} y={y + 28} textAnchor="middle" fontSize="9" fontWeight="600" fill={statusColor} fontFamily="system-ui, sans-serif">{status}</text>
        </g>
      );
    })}
  </svg>
);

const PhoneMockup = () => (
  <svg viewBox="0 0 260 520" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-w-[260px]">
    <defs>
      <clipPath id="screen-clip">
        <rect x="14" y="48" width="232" height="424" rx="4" />
      </clipPath>
    </defs>

    {/* Phone body */}
    <rect x="2" y="2" width="256" height="516" rx="36" fill="#18181B" />
    <rect x="10" y="10" width="240" height="500" rx="30" fill="#1C1C1E" />

    {/* Notch */}
    <rect x="90" y="14" width="80" height="20" rx="10" fill="#18181B" />

    {/* Screen area */}
    <rect x="14" y="48" width="232" height="424" rx="4" fill="#F5F4F2" clipPath="url(#screen-clip)" />

    {/* Status bar */}
    <rect x="14" y="48" width="232" height="28" fill="#F5F4F2" />
    <text x="28" y="65" fontSize="9" fontWeight="600" fill="#18181B" fontFamily="system-ui, sans-serif">9:41</text>
    <text x="228" y="65" fontSize="9" fill="#18181B" fontFamily="system-ui, sans-serif" textAnchor="end">●●●●</text>

    {/* App header */}
    <rect x="14" y="76" width="232" height="44" fill="white" />
    <text x="30" y="94" fontSize="10" fontWeight="700" fill="#C97D23" fontFamily="system-ui, sans-serif">HouseTrack</text>
    <text x="30" y="108" fontSize="9" fill="#A1A1AA" fontFamily="system-ui, sans-serif">My Dashboard</text>

    {/* Main content */}
    <rect x="14" y="120" width="232" height="352" fill="#F5F4F2" />

    {/* Rent due card */}
    <rect x="24" y="130" width="212" height="108" rx="10" fill="white" stroke="#FED7AA" strokeWidth="1.5" />
    <rect x="24" y="130" width="212" height="4" rx="10" fill="#C97D23" />
    <text x="36" y="154" fontSize="9" fontWeight="700" fill="#C97D23" fontFamily="system-ui, sans-serif" letterSpacing="0.5">RENT DUE · JULY 2026</text>
    <text x="36" y="178" fontSize="26" fontWeight="800" fill="#18181B" fontFamily="system-ui, sans-serif">45,000</text>
    <text x="148" y="178" fontSize="12" fill="#A1A1AA" fontFamily="system-ui, sans-serif">XAF</text>
    <text x="36" y="194" fontSize="9" fill="#A1A1AA" fontFamily="system-ui, sans-serif">Room 3 · Immeuble Mbarga</text>

    {/* Pay button */}
    <rect x="36" y="204" width="190" height="28" rx="8" fill="#C97D23" />
    <text x="131" y="222" textAnchor="middle" fontSize="11" fontWeight="700" fill="white" fontFamily="system-ui, sans-serif">Pay via Mobile Money</text>

    {/* Room info card */}
    <rect x="24" y="250" width="100" height="70" rx="8" fill="white" />
    <text x="34" y="268" fontSize="8" fill="#A1A1AA" fontFamily="system-ui, sans-serif" letterSpacing="0.4">MY ROOM</text>
    <text x="34" y="284" fontSize="14" fontWeight="700" fill="#18181B" fontFamily="system-ui, sans-serif">Room 3</text>
    <text x="34" y="296" fontSize="9" fill="#71717A" fontFamily="system-ui, sans-serif">Self-Contain</text>
    <text x="34" y="310" fontSize="9" fill="#A1A1AA" fontFamily="system-ui, sans-serif">Floor 2</text>

    {/* Issues card */}
    <rect x="136" y="250" width="100" height="70" rx="8" fill="white" />
    <text x="146" y="268" fontSize="8" fill="#A1A1AA" fontFamily="system-ui, sans-serif" letterSpacing="0.4">OPEN ISSUES</text>
    <text x="146" y="284" fontSize="14" fontWeight="700" fill="#18181B" fontFamily="system-ui, sans-serif">0</text>
    <text x="146" y="296" fontSize="9" fill="#22C55E" fontFamily="system-ui, sans-serif">All resolved</text>

    {/* Recent payments */}
    <text x="28" y="342" fontSize="11" fontWeight="600" fill="#18181B" fontFamily="system-ui, sans-serif">Recent Payments</text>

    {[
      { month: 'June 2026', amount: '45,000 XAF', color: '#22C55E', label: 'Paid' },
      { month: 'May 2026', amount: '45,000 XAF', color: '#22C55E', label: 'Paid' },
    ].map(({ month, amount, color, label }, i) => (
      <g key={month}>
        <rect x="24" y={356 + i * 46} width="212" height="38" rx="8" fill="white" />
        <text x="38" y={371 + i * 46} fontSize="10" fontWeight="600" fill="#18181B" fontFamily="system-ui, sans-serif">{month}</text>
        <text x="38" y={384 + i * 46} fontSize="9" fill="#A1A1AA" fontFamily="system-ui, sans-serif">{amount}</text>
        <rect x="186" y={360 + i * 46} width="40" height="18" rx="9" fill="#F0FDF4" />
        <text x="206" y={373 + i * 46} textAnchor="middle" fontSize="9" fontWeight="600" fill={color} fontFamily="system-ui, sans-serif">{label}</text>
      </g>
    ))}

    {/* Home indicator */}
    <rect x="104" y="500" width="52" height="4" rx="2" fill="#3F3F46" />
  </svg>
);

const PropertyCards = () => (
  <svg viewBox="0 0 440 320" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <defs>
      <filter id="prop-shadow">
        <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#00000014" />
      </filter>
    </defs>

    {/* Background card (back) */}
    <rect x="40" y="30" width="340" height="200" rx="14" fill="#F0EDE9" transform="rotate(-4 210 130)" />

    {/* Middle card */}
    <rect x="30" y="20" width="340" height="200" rx="14" fill="#E8E4DF" transform="rotate(-1.5 210 120)" filter="url(#prop-shadow)" />

    {/* Main property card */}
    <g filter="url(#prop-shadow)">
      <rect x="20" y="20" width="340" height="200" rx="14" fill="white" />

      {/* Property image placeholder */}
      <rect x="20" y="20" width="340" height="110" rx="14" fill="#1C1C1E" />
      <rect x="20" y="100" width="340" height="30" fill="#1C1C1E" />

      {/* Building outline SVG inside card */}
      <rect x="80" y="36" width="70" height="80" rx="2" fill="#2D2D30" />
      <rect x="158" y="50" width="50" height="66" rx="2" fill="#252527" />
      <rect x="216" y="40" width="80" height="76" rx="2" fill="#2A2A2D" />
      <rect x="304" y="56" width="40" height="60" rx="2" fill="#232325" />

      {/* Windows */}
      {[90, 110, 130].map(x => [44, 62, 80].map(y => (
        <rect key={`${x}-${y}`} x={x} y={y} width="12" height="10" rx="1" fill="#C97D23" fillOpacity="0.7" />
      )))}
      {[164, 180].map(x => [58, 76].map(y => (
        <rect key={`${x}-${y}`} x={x} y={y} width="10" height="9" rx="1" fill="#C97D23" fillOpacity="0.5" />
      )))}
      {[224, 244, 264].map(x => [48, 66, 84].map(y => (
        <rect key={`${x}-${y}`} x={x} y={y} width="10" height="9" rx="1" fill="#C97D23" fillOpacity="0.6" />
      )))}

      {/* Occupied badge */}
      <rect x="32" y="30" width="72" height="20" rx="10" fill="#C97D23" />
      <text x="68" y="44" textAnchor="middle" fontSize="9" fontWeight="700" fill="white" fontFamily="system-ui, sans-serif">9/12 Occupied</text>

      {/* Card body */}
      <text x="36" y="154" fontSize="15" fontWeight="700" fill="#18181B" fontFamily="system-ui, sans-serif">Immeuble Mbarga</text>
      <text x="36" y="170" fontSize="10" fill="#71717A" fontFamily="system-ui, sans-serif">Bastos, Yaoundé · Apartment</text>

      {/* Stats row */}
      <text x="36" y="200" fontSize="10" fill="#A1A1AA" fontFamily="system-ui, sans-serif">12 rooms</text>
      <rect x="100" y="192" width="1" height="14" fill="#E4E4E7" />
      <text x="110" y="200" fontSize="10" fill="#A1A1AA" fontFamily="system-ui, sans-serif">9 tenants</text>
      <rect x="168" y="192" width="1" height="14" fill="#E4E4E7" />
      <text x="178" y="200" fontSize="10" fill="#A1A1AA" fontFamily="system-ui, sans-serif">405,000 XAF/mo</text>

      {/* View details */}
      <text x="330" y="200" fontSize="10" fill="#C97D23" fontWeight="600" fontFamily="system-ui, sans-serif" textAnchor="end">View →</text>
    </g>

    {/* Floating stat badge */}
    <g filter="url(#prop-shadow)">
      <rect x="270" y="188" width="150" height="56" rx="12" fill="white" />
      <rect x="282" y="200" width="24" height="24" rx="6" fill="#F0FDF4" />
      <rect x="288" y="206" width="12" height="12" rx="3" fill="#22C55E" />
      <text x="314" y="212" fontSize="9" fill="#A1A1AA" fontFamily="system-ui, sans-serif">This month</text>
      <text x="314" y="228" fontSize="13" fontWeight="700" fill="#18181B" fontFamily="system-ui, sans-serif">360,000 XAF</text>
    </g>
  </svg>
);

const ReceiptSVG = () => (
  <svg viewBox="0 0 340 196" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <defs>
      <filter id="r-shadow">
        <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#00000014" />
      </filter>
    </defs>
    {/* Card body */}
    <g filter="url(#r-shadow)">
      <rect x="10" y="10" width="320" height="176" rx="10" fill="white" />
      {/* Perforated top edge */}
      {Array.from({ length: 18 }).map((_, i) => (
        <circle key={i} cx={28 + i * 17} cy="10" r="5" fill="#F5F4F2" />
      ))}
    </g>
    {/* Header band */}
    <rect x="10" y="10" width="320" height="36" rx="10" fill="#18181B" />
    <rect x="10" y="36" width="320" height="10" fill="#18181B" />
    <text x="26" y="33" fontSize="11" fontWeight="800" fill="#C97D23" fontFamily="system-ui, sans-serif" letterSpacing="-0.3">HouseTrack</text>
    <text x="194" y="33" fontSize="9" fill="#71717A" fontFamily="system-ui, sans-serif" textAnchor="end">OFFICIAL RECEIPT</text>
    <text x="324" y="33" fontSize="9" fontWeight="700" fill="#52525B" fontFamily="system-ui, sans-serif" textAnchor="end">#HT-2026-047</text>

    {/* Receipt rows */}
    {[
      { label: 'Tenant',  value: 'Abanda Paul' },
      { label: 'Room',    value: 'Room 3 — Immeuble Mbarga' },
      { label: 'Period',  value: 'July 2026' },
    ].map(({ label, value }, i) => (
      <g key={label}>
        <rect x="10" y={56 + i * 30} width="320" height="30" fill={i % 2 === 0 ? 'white' : '#FAFAF9'} />
        <text x="26"  y={75 + i * 30} fontSize="9"  fill="#A1A1AA" fontFamily="system-ui, sans-serif" letterSpacing="0.3">{label.toUpperCase()}</text>
        <text x="130" y={75 + i * 30} fontSize="10" fill="#18181B" fontFamily="system-ui, sans-serif" fontWeight="600">{value}</text>
      </g>
    ))}

    {/* Amount row */}
    <rect x="10" y="146" width="320" height="32" fill="#F9F9F8" />
    <text x="26"  y="166" fontSize="9"  fill="#A1A1AA" fontFamily="system-ui, sans-serif" letterSpacing="0.3">AMOUNT</text>
    <text x="130" y="166" fontSize="15" fill="#18181B" fontFamily="system-ui, sans-serif" fontWeight="800">45,000 XAF</text>

    {/* PAID stamp */}
    <rect x="238" y="150" width="70" height="24" rx="12" fill="#F0FDF4" />
    <text x="273" y="166" textAnchor="middle" fontSize="10" fontWeight="800" fill="#16A34A" fontFamily="system-ui, sans-serif" letterSpacing="0.5">✓ PAID</text>

    {/* Footer */}
    <rect x="10" y="178" width="320" height="8" rx="10" fill="#F5F4F2" />
    <text x="170" y="185" textAnchor="middle" fontSize="7.5" fill="#C9C9CB" fontFamily="system-ui, sans-serif">Generated automatically · HouseTrack · 3 Jul 2026</text>
  </svg>
);

/* ─────────────────────────────────────────────
   SECTION COMPONENTS
───────────────────────────────────────────── */

const FEATURES = [
  { icon: Building,      title: 'Property Management',       desc: 'Add unlimited properties and rooms. Track occupancy, room types, and rent amounts — all from one dashboard.' },
  { icon: Users,         title: 'Tenant Management',         desc: 'Register tenants, assign rooms, record move-in dates, and manage vacating — with a full history for each tenant.' },
  { icon: CreditCard,    title: 'Mobile Money Payments',     desc: 'Collect rent via MTN MoMo & Orange Money through Notchpay. Payments confirm automatically — no manual checking.' },
  { icon: FileText,      title: 'Auto-Generated Receipts',   desc: 'Every completed payment creates a numbered receipt tenants can access and download from their own dashboard.' },
  { icon: MessageSquare, title: 'Complaint Tracking',        desc: 'Tenants submit issues directly. Track each one from Submitted → In Progress → Resolved, with no phone calls needed.' },
  { icon: TrendingUp,    title: 'Monthly Reports',           desc: 'Occupancy rate, total income, paid vs unpaid tenants, and overdue balances — summarised the moment you open the app.' },
];

const STEPS = [
  { title: 'Create your account',          desc: 'Sign up as a landlord in under a minute. No credit card required.' },
  { title: 'Add your properties and rooms', desc: 'Register each building, add its rooms, and set rent amounts. Takes about two minutes per property.' },
  { title: 'Register your tenants',        desc: 'Add tenants by name and phone. They get access to their own dashboard and can pay from there.' },
  { title: 'Collect rent, track everything', desc: 'Tenants pay via Mobile Money. Receipts and reports are generated automatically.' },
];

const LANDLORD_BENEFITS = [
  'See every property, room, and tenant in one place',
  "Know who has paid and who hasn\'t — at a glance",
  'Receive rent via MTN MoMo or Orange Money',
  'Auto-generated numbered receipts, no paper',
  'Manage maintenance complaints without calls',
  'Monthly income and occupancy summaries',
];

const TENANT_BENEFITS = [
  'View your room, rent amount, and move-in date',
  'Pay rent directly from your mobile phone',
  'Download official receipts for every payment',
  'Report maintenance issues to your landlord',
  'Track the status of your complaints',
  'Works on any phone or laptop — no app to install',
];

const TESTIMONIALS = [
  {
    quote: "Before HouseTrack I was keeping everything in a notebook. Now I can see which tenants haven't paid without calling anyone. It's changed how I run things.",
    name: 'Emmanuel T.',
    role: 'Landlord — 3 properties, Yaoundé',
    initial: 'E',
  },
  {
    quote: "My tenants used to lose their paper receipts and argue about payments. Now everything is in the system — dates, amounts, confirmation. No more disputes.",
    name: 'Martine A.',
    role: 'Landlord — 2 buildings, Douala',
    initial: 'M',
  },
  {
    quote: "As a tenant I can pay rent from my phone and get a receipt immediately. No more going to find the landlord with cash. Very convenient.",
    name: 'Patrick N.',
    role: 'Tenant — Bastos, Yaoundé',
    initial: 'P',
  },
];

const METRICS = [
  { value: '2',       label: 'Mobile Money networks supported',  icon: Smartphone },
  { value: '0',       label: 'Spreadsheets or notebooks needed', icon: FileText },
  { value: '< 2 min', label: 'To add a property and go live',   icon: Zap },
  { value: '100%',    label: 'Paperless — receipts are digital', icon: CheckCircle },
];

const BEFORE = [
  'Chase tenants by WhatsApp and phone calls every month',
  'Track payments in a notebook or on paper',
  'Collect cash, issue handwritten receipts that get lost',
  'No record of maintenance issues — only phone calls',
  'Guess your total income until end of month',
  'No way to know occupancy without visiting',
];

const AFTER = [
  'Tenants pay directly — you\'re notified when rent clears',
  'Every payment logged with date, amount, and confirmation',
  'Receipts auto-generated, numbered, always online',
  'Complaints tracked from Submitted to Resolved',
  'Monthly income report ready the moment you log in',
  'Occupancy rate visible at a glance from any device',
];

const FAQS = [
  { q: 'Is HouseTrack free to use?', a: 'Signing up and managing your properties is free. Payments go through Notchpay which charges standard Mobile Money processing fees — there is no extra fee from HouseTrack.' },
  { q: 'Do tenants need to download an app?', a: 'No. HouseTrack is a Progressive Web App (PWA). It works in any browser on any smartphone or laptop — no download required.' },
  { q: 'How do tenants get access to their dashboard?', a: 'You register them as a landlord by adding their name and phone number, then assigning them a room. They receive a link to set their password and log in.' },
  { q: 'What if a tenant pays rent in cash?', a: 'You can record manual payments directly in the dashboard. A numbered receipt is still auto-generated and available to the tenant immediately.' },
  { q: 'Can I manage multiple properties?', a: 'Yes. There is no limit on properties or rooms. Each property is tracked separately with its own rooms, tenants, and payment history.' },
];

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */

const Landing = () => {
  const [openFaq, setOpenFaq] = useState(null);
  return (
    <div className="min-h-screen bg-background text-text-primary">

      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-accent tracking-tight">HouseTrack</span>
          <div className="hidden md:flex items-center gap-8">
            {[['Features', '#features'], ['How it Works', '#how-it-works'], ['For Tenants', '#tenants']].map(([label, href]) => (
              <a key={label} href={href} className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                {label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-text-primary hover:text-accent transition-colors px-3 py-2">
              Sign In
            </Link>
            <Link to="/register" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-accent text-white rounded-btn text-sm font-semibold hover:bg-[#B8711A] transition-colors">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-[1280px] mx-auto px-6 pt-16 pb-10 md:pt-24 md:pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-accent-light text-accent px-4 py-1.5 rounded-pill text-xs font-bold mb-7 tracking-wide uppercase">
              <Smartphone size={13} />
              Built for Cameroon landlords
            </div>
            <h1 className="text-[44px] md:text-[56px] font-black leading-[1.05] mb-6 tracking-tight text-text-primary">
              Run your rentals<br />
              like a <span className="text-accent">business.</span>
            </h1>
            <p className="text-base text-text-secondary leading-relaxed max-w-md mb-9">
              HouseTrack replaces WhatsApp messages, paper receipts, and phone calls with a single dashboard — properties, tenants, Mobile Money payments, and complaints, all tracked automatically.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent text-white rounded-btn text-sm font-bold hover:bg-[#B8711A] transition-all active:scale-[0.98] shadow-lg shadow-accent/20">
                Start for Free <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3.5 bg-surface border border-border text-text-primary rounded-btn text-sm font-semibold hover:bg-surface-alt transition-all">
                Sign In
              </Link>
            </div>
            {/* Mini social proof */}
            <div className="flex items-center gap-4 text-xs text-text-tertiary">
              <span className="flex items-center gap-1.5"><CheckCircle size={13} className="text-success" /> Free to start</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={13} className="text-success" /> MTN &amp; Orange Money</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={13} className="text-success" /> No paperwork</span>
            </div>
          </div>

          {/* Right: house illustration */}
          <div className="relative lg:translate-y-4">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent rounded-[40px] blur-3xl scale-110" />
            <div className="relative">
              <HouseIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* ── Payment providers strip ── */}
      <section className="border-y border-border bg-surface mt-16">
        <div className="max-w-[1280px] mx-auto px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-widest">Payments powered by</p>
            <div className="flex flex-wrap items-center gap-8">
              {[
                { label: 'MTN MoMo', color: '#FFCC00', text: '#18181B' },
                { label: 'Orange Money', color: '#FF6600', text: 'white' },
                { label: 'Notchpay', color: '#C97D23', text: 'white' },
              ].map(({ label, color, text }) => (
                <span key={label} className="flex items-center gap-2 text-sm font-bold text-text-secondary">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                  {label}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-6 text-xs text-text-tertiary">
              <span><strong className="text-text-primary">100%</strong> paperless</span>
              <span><strong className="text-text-primary">Real-time</strong> confirmation</span>
              <span><strong className="text-text-primary">Auto</strong> receipts</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Metrics ── */}
      <section className="max-w-[1280px] mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {METRICS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 bg-accent-light rounded-btn flex items-center justify-center mb-4 group-hover:bg-accent transition-colors">
                <Icon size={20} className="text-accent group-hover:text-white transition-colors" />
              </div>
              <p className="text-4xl font-black text-text-primary mb-1.5 tracking-tight">{value}</p>
              <p className="text-xs text-text-tertiary leading-snug max-w-[120px]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-[1280px] mx-auto px-6 py-20 md:py-28">
        <div className="mb-14">
          <p className="text-xs font-bold text-accent uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">Everything in one place.</h2>
          <p className="text-text-secondary max-w-md">No spreadsheets. No paper receipts. No confusion about who paid and who didn't.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="bg-surface border border-border rounded-card p-6 hover:border-accent/30 hover:shadow-card-hover transition-all group">
              <div className="w-10 h-10 bg-accent-light rounded-btn flex items-center justify-center mb-5 group-hover:bg-accent group-hover:scale-110 transition-all">
                <f.icon size={18} className="text-accent group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-sm font-bold mb-2 text-text-primary">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Before vs After ── */}
      <section className="max-w-[1280px] mx-auto px-6 pb-20 md:pb-28">
        <div className="mb-12">
          <p className="text-xs font-bold text-accent uppercase tracking-widest mb-3">The difference</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">Why landlords switch.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before */}
          <div className="bg-surface border border-border rounded-card p-8">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-8 h-8 bg-danger-light rounded-full flex items-center justify-center flex-shrink-0">
                <X size={14} className="text-danger" />
              </div>
              <h3 className="font-bold text-text-primary">Without HouseTrack</h3>
            </div>
            <div className="space-y-4">
              {BEFORE.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-danger-light flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X size={9} className="text-danger" />
                  </div>
                  <span className="text-sm text-text-secondary">{item}</span>
                </div>
              ))}
            </div>
          </div>
          {/* After */}
          <div className="bg-[#18181B] border border-accent/20 rounded-card p-8">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle size={14} className="text-accent" />
              </div>
              <h3 className="font-bold text-white">With HouseTrack</h3>
            </div>
            <div className="space-y-4">
              {AFTER.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle size={9} className="text-accent" />
                  </div>
                  <span className="text-sm text-zinc-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Dark App Preview ── */}
      <section className="bg-[#0F0F0F] py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-accent uppercase tracking-widest mb-3">The Dashboard</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
              Your entire portfolio,<br />one screen.
            </h2>
            <p className="text-zinc-400 max-w-md mx-auto text-sm leading-relaxed">
              See who has paid, who owes, which rooms are vacant, and which complaints need attention — the moment you log in.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Glow */}
            <div className="absolute inset-x-20 top-4 h-32 bg-accent/20 blur-3xl rounded-full" />
            <div className="relative rounded-[14px] overflow-hidden ring-1 ring-white/10 shadow-2xl">
              <DashboardMockup />
            </div>
          </div>

          {/* Three callout points below */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto text-center">
            {[
              { icon: Bell,   label: 'Overdue alerts',       desc: 'Instantly see tenants who haven\'t paid from previous months.' },
              { icon: Shield, label: 'Secure by default',    desc: 'Each landlord only sees their own properties and tenants.' },
              { icon: PieChart, label: 'Monthly summaries',  desc: 'Income, occupancy, and complaint stats update automatically.' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="w-10 h-10 bg-zinc-800 rounded-btn flex items-center justify-center mb-3">
                  <Icon size={18} className="text-accent" />
                </div>
                <p className="text-sm font-bold text-white mb-1">{label}</p>
                <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mobile Money Section ── */}
      <section className="max-w-[1280px] mx-auto px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Phone mockup */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/10 blur-3xl rounded-full scale-75" />
              <div className="relative">
                <PhoneMockup />
              </div>
            </div>
          </div>

          {/* Text */}
          <div>
            <p className="text-xs font-bold text-accent uppercase tracking-widest mb-4">Mobile Payments</p>
            <h2 className="text-3xl md:text-4xl font-black mb-5 tracking-tight leading-tight">
              Tenants pay from<br />their phone.<br />
              <span className="text-accent">You get notified instantly.</span>
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed mb-8 max-w-md">
              When a tenant pays rent via MTN MoMo or Orange Money, Notchpay confirms the transaction automatically. No need to check your phone or call the bank — the dashboard updates in real time and a receipt is generated immediately.
            </p>
            <div className="space-y-3 mb-8">
              {[
                'Tenants pay from their dashboard — no cash, no trips',
                'Payment confirmed instantly via webhook — not manually',
                'Numbered receipt available to tenant immediately',
                'Partial payments tracked, balance shown clearly',
                'All payment history accessible anytime',
              ].map(item => (
                <div key={item} className="flex items-start gap-3 text-sm">
                  <CheckCircle size={15} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-text-primary">{item}</span>
                </div>
              ))}
            </div>
            <Link to="/register" className="inline-flex items-center gap-2 px-7 py-3 bg-accent text-white rounded-btn text-sm font-bold hover:bg-[#B8711A] transition-colors">
              Set up your account <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section id="how-it-works" className="bg-surface border-y border-border">
        <div className="max-w-[1280px] mx-auto px-6 py-20 md:py-28">
          <div className="mb-14">
            <p className="text-xs font-bold text-accent uppercase tracking-widest mb-3">Getting Started</p>
            <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">Up and running in minutes.</h2>
            <p className="text-text-secondary max-w-md text-sm">No training needed. If you can use a phone, you can use HouseTrack.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-[calc(100%-8px)] w-full h-px bg-border" />
                )}
                <div className="w-10 h-10 rounded-btn bg-accent-light flex items-center justify-center mb-4 text-sm font-black text-accent">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="text-sm font-bold mb-2 text-text-primary">{step.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-5">{step.desc}</p>

                {/* Mini UI preview */}
                {i === 0 && (
                  <div className="bg-background border border-border rounded-lg p-3 space-y-2">
                    <div className="h-2 rounded-full bg-border w-3/4" />
                    <div className="h-2 rounded-full bg-border w-full" />
                    <div className="h-2 rounded-full bg-border w-2/3" />
                    <div className="mt-3 h-7 rounded-btn bg-accent w-full" />
                  </div>
                )}
                {i === 1 && (
                  <div className="bg-background border border-border rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded bg-accent-light flex-shrink-0" />
                      <div className="h-2 rounded-full bg-border flex-1" />
                    </div>
                    {[1, 2, 3].map(r => (
                      <div key={r} className="flex gap-1.5">
                        <div className="h-2 rounded-full bg-border flex-1" />
                        <div className="h-2 rounded-full bg-border w-1/3" />
                      </div>
                    ))}
                    <div className="mt-2 flex gap-1.5">
                      <div className="h-6 rounded-btn bg-accent flex-1" />
                      <div className="h-6 rounded-btn border border-border flex-1" />
                    </div>
                  </div>
                )}
                {i === 2 && (
                  <div className="bg-background border border-border rounded-lg p-3 space-y-2.5">
                    {['A', 'F', 'N'].map((letter, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0">
                          <span className="text-[9px] font-bold text-accent">{letter}</span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="h-1.5 rounded-full bg-border w-4/5" />
                          <div className="h-1.5 rounded-full bg-border w-1/2" />
                        </div>
                        <div className="h-4 w-9 rounded-pill bg-success-light flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
                {i === 3 && (
                  <div className="bg-background border border-border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="h-2 rounded-full bg-border w-2/5" />
                      <div className="h-4 w-10 rounded-pill bg-success-light" />
                    </div>
                    <p className="text-xl font-black text-accent leading-none">45,000</p>
                    <p className="text-[9px] text-text-tertiary mt-0.5">XAF · Room 3 · July 2026</p>
                    <div className="mt-2.5 h-6 rounded-btn bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-accent">Receipt generated ✓</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="max-w-[1280px] mx-auto px-6 py-20 md:py-28">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-accent uppercase tracking-widest mb-3">From landlords</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">What people are saying.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ quote, name, role, initial }) => (
            <div key={name} className="bg-surface border border-border rounded-card p-7 flex flex-col gap-5">
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#C97D23">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-text-secondary leading-relaxed flex-1">"{quote}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <div className="w-9 h-9 bg-accent-light rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-accent">{initial}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{name}</p>
                  <p className="text-xs text-text-tertiary">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-[1280px] mx-auto px-6 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16">
            <div>
              <p className="text-xs font-bold text-accent uppercase tracking-widest mb-3">FAQ</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Common questions.</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Something else on your mind?{' '}
                <a href="mailto:arreyewube273@gmail.com" className="text-accent font-semibold hover:underline">
                  Send us a message.
                </a>
              </p>
            </div>
            <div className="space-y-2">
              {FAQS.map((faq, i) => (
                <div key={i} className="border border-border rounded-card overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface-alt transition-colors"
                  >
                    <span className="text-sm font-semibold text-text-primary pr-4">{faq.q}</span>
                    <ChevronDown
                      size={16}
                      className={`text-text-tertiary flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 text-sm text-text-secondary leading-relaxed border-t border-border pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── For Landlords & Tenants ── */}
      <section id="tenants" className="bg-surface border-t border-border">
        <div className="max-w-[1280px] mx-auto px-6 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Landlords */}
            <div className="border border-border rounded-card p-8">
              <div className="w-11 h-11 bg-accent-light rounded-btn flex items-center justify-center mb-5">
                <Building size={20} className="text-accent" />
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tight">For Landlords</h3>
              <p className="text-text-secondary text-sm mb-7 leading-relaxed">
                Stop tracking rent in a notebook. Get real-time visibility into every property, room, and tenant — from your phone.
              </p>
              <ul className="space-y-3 mb-8">
                {LANDLORD_BENEFITS.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle size={15} className="text-success flex-shrink-0 mt-0.5" />
                    <span className="text-text-primary">{b}</span>
                  </li>
                ))}
              </ul>
              {/* Receipt preview */}
              <div className="my-7">
                <ReceiptSVG />
              </div>
              <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-btn text-sm font-bold hover:bg-[#B8711A] transition-colors">
                Register as Landlord <ArrowRight size={15} />
              </Link>
            </div>

            {/* Tenants */}
            <div className="border border-border rounded-card p-8">
              <div className="w-11 h-11 bg-success-light rounded-btn flex items-center justify-center mb-5">
                <DoorOpen size={20} className="text-success" />
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tight">For Tenants</h3>
              <p className="text-text-secondary text-sm mb-7 leading-relaxed">
                Pay rent from your phone, get official receipts, and report issues directly — no more chasing the landlord.
              </p>
              <ul className="space-y-3 mb-8">
                {TENANT_BENEFITS.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle size={15} className="text-success flex-shrink-0 mt-0.5" />
                    <span className="text-text-primary">{b}</span>
                  </li>
                ))}
              </ul>

              {/* Property cards illustration */}
              <div className="mt-6">
                <PropertyCards />
              </div>

              <p className="text-xs text-text-tertiary mt-4">
                Tenant accounts are created by your landlord. Ask them to register you on HouseTrack.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-accent overflow-hidden relative">
        {/* Decorative circles */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -right-8 -bottom-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute right-64 top-8 w-40 h-40 rounded-full bg-white/5" />

        <div className="relative max-w-[1280px] mx-auto px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-5 leading-tight tracking-tight">
              Take control of your<br />rental business today.
            </h2>
            <p className="text-white/75 text-sm mb-9 leading-relaxed max-w-md">
              Join landlords in Cameroon already managing their properties on HouseTrack. Free to start, no credit card required.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <Link to="/register" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-accent rounded-btn text-sm font-black hover:bg-white/90 transition-colors shadow-lg">
                Get Started Free <ArrowRight size={17} />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 px-10 py-4 border border-white/30 text-white rounded-btn text-sm font-semibold hover:bg-white/10 transition-colors">
                Sign In
              </Link>
            </div>
            {/* Trust row */}
            <div className="flex flex-wrap gap-5">
              {[
                { icon: Lock,         label: 'Secure & encrypted' },
                { icon: Smartphone,   label: 'Works on any device' },
                { icon: CheckCircle,  label: 'No credit card needed' },
                { icon: Shield,       label: 'Your data stays yours' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-2 text-xs text-white/70">
                  <Icon size={13} className="text-white/50" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-surface">
        <div className="max-w-[1280px] mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <span className="text-base font-black text-accent tracking-tight">HouseTrack</span>
              <p className="text-xs text-text-tertiary mt-1.5 max-w-xs leading-relaxed">
                Rental management for landlords in Cameroon. Properties, tenants, Mobile Money payments — all in one place.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-8 text-sm">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold text-text-tertiary uppercase tracking-wide mb-1">Platform</p>
                <Link to="/register" className="text-text-secondary hover:text-text-primary transition-colors">Register</Link>
                <Link to="/login" className="text-text-secondary hover:text-text-primary transition-colors">Sign In</Link>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold text-text-tertiary uppercase tracking-wide mb-1">Payment</p>
                <span className="text-text-secondary">MTN MoMo</span>
                <span className="text-text-secondary">Orange Money</span>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-text-tertiary">© 2026 HouseTrack. All rights reserved.</p>
            <p className="text-xs text-text-tertiary">Powered by Notchpay · Built in Cameroon</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
