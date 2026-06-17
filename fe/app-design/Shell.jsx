/* App shell: sidebar + header + routing + shared state. Owns the Portal. */
const { useState: useStateShell, useEffect: useEffectShell } = React;

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'pixelarticons:dashboard' },
  { id: 'tracks',    label: 'Learning Tracks', icon: 'pixelarticons:map' },
  { id: 'docs',      label: 'Documentation', icon: 'pixelarticons:book-open' },
  { id: 'exercises', label: 'Exercises', icon: 'pixelarticons:code' },
];

function Sidebar({ screen, onNav, role, collapsed }) {
  return (
    <aside style={{
      width: collapsed ? 64 : 232, flex: `0 0 ${collapsed ? 64 : 232}px`,
      background: 'var(--panel)', borderRight: '2px solid var(--border-2)',
      display: 'flex', flexDirection: 'column', transition: 'width .15s steps(3)',
    }}>
      {/* brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '18px 0' : '18px 18px', justifyContent: collapsed ? 'center' : 'flex-start', borderBottom: '2px solid var(--border)' }}>
        <div style={{ width: 34, height: 34, flex: '0 0 34px', display: 'grid', placeItems: 'center', background: 'var(--accent)', border: '2px solid var(--accent-ink)' }}>
          <Icon name="pixelarticons:command" size={20} color="var(--accent-ink)" />
        </div>
        {!collapsed && <div style={{ fontWeight: 700, fontSize: 18 }}>RAMP<span style={{ color: 'var(--accent)' }}>UP</span></div>}
      </div>

      <nav style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {!collapsed && <div className="label faint" style={{ padding: '6px 8px' }}>Menu</div>}
        {NAV.map(n => {
          const on = screen === n.id;
          return (
            <button key={n.id} onClick={() => onNav(n.id)} title={n.label} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: collapsed ? '11px 0' : '11px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              fontFamily: 'var(--font-label)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.02em',
              cursor: 'pointer', textAlign: 'left',
              background: on ? 'var(--accent)' : 'transparent',
              color: on ? 'var(--accent-ink)' : 'var(--muted)',
              border: '2px solid ' + (on ? 'var(--accent-ink)' : 'transparent'),
              boxShadow: on ? '3px 3px 0 0 var(--shadow)' : 'none',
            }}>
              <Icon name={n.icon} size={18} />{!collapsed && n.label}
            </button>
          );
        })}
      </nav>

      {/* role hint card */}
      {!collapsed && (
        <div style={{ padding: 12 }}>
          <div className="pixel-inset" style={{ padding: 12 }}>
            <div className="label faint">Viewing as</div>
            <div className="label" style={{ color: role === 'admin' ? 'var(--info)' : 'var(--accent)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name={role === 'admin' ? 'pixelarticons:user-x' : 'pixelarticons:user'} size={13} />
              {role === 'admin' ? 'Administrator' : 'Learner'}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function Header({ user, role, onRole, theme, onTheme, onCollapse, onLogout, crt, onCrt }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px',
      background: 'var(--panel)', borderBottom: '2px solid var(--border-2)', flexWrap: 'wrap',
    }}>
      <button className="btn btn-ghost btn-sm" onClick={onCollapse} aria-label="Toggle sidebar" style={{ padding: 8 }}><Icon name="pixelarticons:menu" size={16} /></button>

      {/* search */}
      <div className="pixel-inset" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', flex: 1, maxWidth: 340, minWidth: 120 }}>
        <Icon name="pixelarticons:search" size={14} color="var(--faint)" />
        <input placeholder="Quick search…" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: 'var(--font-pixel)', fontSize: 14, padding: '9px 0' }} />
        <span className="label faint" style={{ border: '2px solid var(--border)', padding: '2px 5px' }}>⌘K</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* role toggle (preview) */}
      <div className="pixel-inset" style={{ display: 'flex', padding: 3 }} title="Preview role">
        {[['learner', 'pixelarticons:user', 'Learner'], ['admin', 'pixelarticons:user-x', 'Admin']].map(([r, ic, t]) => (
          <button key={r} onClick={() => onRole(r)} className="label" style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', cursor: 'pointer', border: 'none',
            fontFamily: 'var(--font-label)', textTransform: 'uppercase',
            background: role === r ? 'var(--accent)' : 'transparent',
            color: role === r ? 'var(--accent-ink)' : 'var(--muted)',
          }}><Icon name={ic} size={13} />{t}</button>
        ))}
      </div>

      {/* crt toggle */}
      <button className="btn btn-ghost btn-sm" onClick={onCrt} title="CRT scanlines" style={{ padding: 9, color: crt ? 'var(--accent)' : 'var(--muted)' }}><Icon name="pixelarticons:image-multiple" size={16} /></button>
      {/* theme toggle */}
      <button className="btn btn-ghost btn-sm" onClick={onTheme} title="Toggle theme" style={{ padding: 9 }}>
        <Icon name={theme === 'dark' ? 'pixelarticons:sun' : 'pixelarticons:moon'} size={16} />
      </button>
      {/* bell */}
      <button className="btn btn-ghost btn-sm" style={{ padding: 9, position: 'relative' }}>
        <Icon name="pixelarticons:bell" size={16} />
        <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: 'var(--accent)', border: '1px solid var(--accent-ink)' }} />
      </button>

      {/* profile */}
      <div className="pixel-inset" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 5px 5px 12px' }}>
        <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
          <div className="label faint">{user.role}</div>
        </div>
        <Avatar name={user.name} hue={user.avatarHue} size={34} ring />
        <button className="btn btn-ghost btn-sm" onClick={onLogout} title="Sign out" style={{ padding: 7 }}><Icon name="pixelarticons:logout" size={14} /></button>
      </div>
    </header>
  );
}

function Portal({ forceScreen, forceRole, forceTheme, embedded }) {
  const [authed, setAuthed] = useStateShell(!!embedded);
  const [screen, setScreen] = useStateShell(forceScreen || 'dashboard');
  const [role, setRole] = useStateShell(forceRole || 'learner');
  const [theme, setTheme] = useStateShell(forceTheme || 'dark');
  const [collapsed, setCollapsed] = useStateShell(false);
  const [crt, setCrt] = useStateShell(false);
  const [anim, setAnim] = useStateShell(0);

  const [exercises, setExercises] = useStateShell(window.EXERCISES);
  const [submissions, setSubmissions] = useStateShell(window.SUBMISSIONS);

  const user = window.PORTAL_USER[role];
  const isAdmin = role === 'admin';

  useEffectShell(() => { if (forceScreen) setScreen(forceScreen); }, [forceScreen]);
  useEffectShell(() => { if (forceRole) setRole(forceRole); }, [forceRole]);

  const nav = (s) => { setScreen(s); setAnim(a => a + 1); };
  const switchRole = (r) => { setRole(r); setAnim(a => a + 1); };

  // learner submits a PR
  const submitPR = (exId, link) => {
    setExercises(ex => ex.map(e => e.id === exId ? { ...e, status: 'submitted', pr: link } : e));
    setSubmissions(subs => {
      const ex = exercises.find(e => e.id === exId);
      const existing = subs.find(s => s.exercise === ex.title && s.who === window.PORTAL_USER.learner.name);
      if (existing) return subs.map(s => s === existing ? { ...s, pr: link, when: 'just now', status: 'submitted' } : s);
      return [{ id: 's' + Date.now(), who: window.PORTAL_USER.learner.name, hue: 162, exercise: ex.title, pr: link, when: 'just now', status: 'submitted' }, ...subs];
    });
  };

  // admin reviews
  const review = (subId, verdict) => {
    setSubmissions(subs => subs.map(s => s.id === subId ? { ...s, status: verdict, when: 'just now' } : s));
    setSubmissions(curr => {
      const sub = curr.find(s => s.id === subId);
      if (sub) setExercises(ex => ex.map(e => e.title === sub.exercise ? { ...e, status: verdict === 'approved' ? 'approved' : 'pending' } : e));
      return curr;
    });
  };

  const render = () => {
    if (screen === 'dashboard') return isAdmin
      ? <AdminDashboard onNav={nav} submissions={submissions} />
      : <LearnerDashboard user={user} onNav={nav} />;
    if (screen === 'tracks') return <Tracks isAdmin={isAdmin} />;
    if (screen === 'docs') return <Docs isAdmin={isAdmin} />;
    if (screen === 'exercises') return <Exercises isAdmin={isAdmin} exercises={exercises} onSubmitPR={submitPR} submissions={submissions} onReview={review} />;
    return null;
  };

  const wrap = (node) => (
    <div className={crt ? 'crt' : ''} data-theme={theme} style={{ height: embedded ? 'auto' : '100%', background: 'var(--bg)', color: 'var(--text)' }}>{node}</div>
  );

  if (!authed) return wrap(<Login onAuth={() => setAuthed(true)} />);

  return wrap(
    <div style={{ display: 'flex', height: embedded ? 'auto' : '100%', minHeight: embedded ? 720 : 0 }}>
      <Sidebar screen={screen} onNav={nav} role={role} collapsed={collapsed} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: embedded ? 'auto' : '100%' }}>
        <Header user={user} role={role} onRole={switchRole} theme={theme}
          onTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          onCollapse={() => setCollapsed(c => !c)} onLogout={() => setAuthed(false)}
          crt={crt} onCrt={() => setCrt(c => !c)} />
        <main style={{ flex: 1, overflow: embedded ? 'visible' : 'auto', padding: 28 }}>
          <div key={anim} className="screen-enter" style={{ maxWidth: 1100, margin: '0 auto' }}>
            {render()}
          </div>
        </main>
      </div>
    </div>
  );
}

Object.assign(window, { Portal, NAV });
