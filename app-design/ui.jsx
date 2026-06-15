/* shared pixel-art UI primitives */
const { useState, useEffect, useRef } = React;

/* icon wrapper — pixelarticons via iconify web component */
function Icon({ name, size = 16, color, style }) {
  return <iconify-icon icon={name} style={{ fontSize: size + 'px', color, ...style }}></iconify-icon>;
}

/* blocky pixel avatar built from initials on a hued tile */
function Avatar({ name, hue = 162, size = 40, ring = false }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('');
  return (
    <div style={{
      width: size, height: size, flex: `0 0 ${size}px`,
      display: 'grid', placeItems: 'center',
      fontFamily: 'var(--font-label)', fontSize: size * 0.32,
      color: `oklch(0.16 0.04 ${hue})`,
      background: `oklch(0.74 0.15 ${hue})`,
      border: '2px solid ' + (ring ? 'var(--accent)' : `oklch(0.45 0.08 ${hue})`),
      boxShadow: 'inset 2px 2px 0 0 oklch(0.85 0.12 ' + hue + '), 2px 2px 0 0 var(--shadow)',
      imageRendering: 'pixelated',
    }}>{initials}</div>
  );
}

/* segmented HP-style progress bar */
function HPBar({ value, segments = 20, warn = false }) {
  const filled = Math.round((value / 100) * segments);
  return (
    <div className={'hpbar' + (warn ? ' warn' : '')}>
      {Array.from({ length: segments }).map((_, i) =>
        <i key={i} className={i < filled ? '' : 'off'} />
      )}
    </div>
  );
}

/* pixel circular meter — stepped conic ring */
function CircleMeter({ value, size = 132, label }) {
  const steps = 24;
  const lit = Math.round((value / 100) * steps);
  const seg = 360 / steps;
  const stops = [];
  for (let i = 0; i < steps; i++) {
    const c = i < lit ? 'var(--accent)' : 'var(--panel-2)';
    stops.push(`${c} ${i * seg}deg ${(i + 1) * seg - 2}deg, transparent ${(i + 1) * seg - 2}deg ${(i + 1) * seg}deg`);
  }
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: `conic-gradient(${stops.join(',')})`,
        imageRendering: 'pixelated',
      }} />
      <div style={{
        position: 'absolute', inset: size * 0.20, background: 'var(--panel)',
        border: '2px solid var(--border-2)', display: 'grid', placeItems: 'center',
        textAlign: 'center', lineHeight: 1,
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-label)', fontSize: size * 0.20, color: 'var(--accent)' }}>{value}<span style={{ fontSize: size * 0.10 }}>%</span></div>
          {label && <div className="label" style={{ color: 'var(--muted)', marginTop: 4, fontSize: 8 }}>{label}</div>}
        </div>
      </div>
    </div>
  );
}

/* status badge for tracks / exercises */
function StatusBadge({ status }) {
  const map = {
    completed:   ['badge-accent', 'pixelarticons:check', 'Completed'],
    in_progress: ['badge-warn', 'pixelarticons:clock', 'In Progress'],
    locked:      ['badge-muted', 'pixelarticons:lock', 'Locked'],
    approved:    ['badge-accent', 'pixelarticons:check-double', 'Approved'],
    submitted:   ['badge-info', 'pixelarticons:upload', 'Submitted'],
    pending:     ['badge-muted', 'pixelarticons:more-horizontal', 'Pending'],
    changes:     ['badge-danger', 'pixelarticons:reload', 'Changes Req.'],
  };
  const [cls, icon, text] = map[status] || map.pending;
  return <span className={'badge ' + cls}><Icon name={icon} size={12} />{text}</span>;
}

function Tag({ name }) {
  const c = (window.TAG_COLOR || {})[name] || 'muted';
  return <span className={'badge badge-' + c}>{name}</span>;
}

/* time estimate badge */
function TimeBadge({ time }) {
  return <span className="badge badge-muted"><Icon name="pixelarticons:clock" size={12} />{time}</span>;
}

/* simple modal in pixel frame */
function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 500, background: 'oklch(0 0 0 / 0.55)',
      display: 'grid', placeItems: 'center', padding: 24,
    }}>
      <div className="pixel pop" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: width, background: 'var(--panel)', maxHeight: '88vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '2px solid var(--border)' }}>
          <div className="h3">{title}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close"><Icon name="pixelarticons:close" size={14} /></button>
        </div>
        <div style={{ padding: 18 }}>{children}</div>
      </div>
    </div>
  );
}

/* section header used across screens */
function SectionHead({ kicker, title, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
      <div>
        {kicker && <div className="kicker" style={{ marginBottom: 6 }}>{kicker}</div>}
        <div className="h2">{title}</div>
      </div>
      {children && <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>{children}</div>}
    </div>
  );
}

/* a labelled stat tile */
function Stat({ label, value, sub, icon, accent }) {
  return (
    <div className="pixel" style={{ padding: 16, background: 'var(--panel)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="label" style={{ color: 'var(--muted)' }}>{label}</div>
        {icon && <Icon name={icon} size={18} color={accent ? 'var(--accent)' : 'var(--faint)'} />}
      </div>
      <div style={{ fontFamily: 'var(--font-label)', fontSize: 30, marginTop: 12, color: accent ? 'var(--accent)' : 'var(--text)' }}>{value}</div>
      {sub && <div className="label faint" style={{ marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

Object.assign(window, {
  Icon, Avatar, HPBar, CircleMeter, StatusBadge, Tag, TimeBadge, Modal, SectionHead, Stat,
});
