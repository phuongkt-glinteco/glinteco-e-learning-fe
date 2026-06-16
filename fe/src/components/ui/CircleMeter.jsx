import React from 'react';

export default function CircleMeter({ value, size = 132, label }) {
  const steps = 24;
  const lit = Math.round((value / 100) * steps);
  const seg = 360 / steps;
  const stops = [];
  for (let i = 0; i < steps; i++) {
    const c = i < lit ? '#2563EB' : '#E2E8F0'; // Primary Blue or Gray border
    stops.push(`${c} ${i * seg}deg ${(i + 1) * seg - 2}deg, transparent ${(i + 1) * seg - 2}deg ${(i + 1) * seg}deg`);
  }

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <div
        className="w-full h-full rounded-full"
        style={{
          background: `conic-gradient(${stops.join(',')})`,
        }}
      />
      <div
        className="absolute bg-white rounded-full border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm"
        style={{
          inset: `${size * 0.18}px`,
        }}
      >
        <div className="font-bold text-[#0F172A]" style={{ fontSize: `${size * 0.18}px` }}>
          {value}
          <span className="text-[10px] text-[#64748B] font-normal">%</span>
        </div>
        {label && (
          <div className="text-[#64748B] font-medium tracking-wider uppercase" style={{ fontSize: `${size * 0.075}px`, marginTop: '2px' }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
