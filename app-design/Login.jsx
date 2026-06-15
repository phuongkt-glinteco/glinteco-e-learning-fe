/* Login / Signup screen */
const { useState: useStateLogin } = React;

function GoogleGlyph({ size = 16 }) {
  // tiny pixel-block "G" mark drawn from rects (no smooth logo)
  const s = size / 8;
  const px = (x, y, c) => <rect key={x + '-' + y} x={x * s} y={y * s} width={s} height={s} fill={c} />;
  const B = '#4285F4', R = '#EA4335', Y = '#FBBC05', G = '#34A853';
  const cells = [
    [2,1,R],[3,1,R],[4,1,R],[1,2,R],[5,2,R],[1,3,Y],[1,4,B],[5,4,B],[6,4,B],
    [1,5,G],[5,5,B],[2,6,G],[3,6,G],[4,6,B],[5,3,B],[6,3,B],
  ];
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ imageRendering: 'pixelated' }}>{cells.map(([x,y,c]) => px(x,y,c))}</svg>;
}

function Login({ onAuth }) {
  const [mode, setMode] = useStateLogin('signin');
  const [email, setEmail] = useStateLogin('mina@acme.dev');
  const [pw, setPw] = useStateLogin('••••••••');
  const [loading, setLoading] = useStateLogin(false);

  const go = (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onAuth && onAuth(); }, 520);
  };

  return (
    <div className="dotgrid" style={{ minHeight: '100%', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div className="screen-enter" style={{ width: '100%', maxWidth: 408 }}>
        {/* brand mark */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 22 }}>
          <div className="pixel" style={{ width: 56, height: 56, display: 'grid', placeItems: 'center', background: 'var(--accent)', borderColor: 'var(--accent-ink)' }}>
            <Icon name="pixelarticons:command" size={30} color="var(--accent-ink)" />
          </div>
          <div className="h2" style={{ marginTop: 14, letterSpacing: '-0.01em' }}>RAMP&nbsp;<span style={{ color: 'var(--accent)' }}>UP</span></div>
          <div className="label faint" style={{ marginTop: 4 }}>Engineering Onboarding Portal</div>
        </div>

        <div className="pixel" style={{ padding: 24, background: 'var(--panel)' }}>
          {/* mode toggle */}
          <div className="pixel-inset" style={{ display: 'flex', padding: 3, marginBottom: 20 }}>
            {[['signin', 'Sign In'], ['signup', 'Create Account']].map(([m, t]) => (
              <button key={m} onClick={() => setMode(m)} className="label" style={{
                flex: 1, padding: '9px 0', cursor: 'pointer', border: 'none',
                fontFamily: 'var(--font-label)', textTransform: 'uppercase',
                background: mode === m ? 'var(--accent)' : 'transparent',
                color: mode === m ? 'var(--accent-ink)' : 'var(--muted)',
              }}>{t}</button>
            ))}
          </div>

          <form onSubmit={go} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'signup' && (
              <div className="field">
                <label className="label">Full Name</label>
                <input className="input" defaultValue="" placeholder="Ada Lovelace" />
              </div>
            )}
            <div className="field">
              <label className="label">Email</label>
              <input className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@acme.dev" />
            </div>
            <div className="field">
              <label className="label">Password</label>
              <input className="input" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" />
            </div>

            {mode === 'signin' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="label muted" style={{ display: 'flex', gap: 7, alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent)', width: 14, height: 14 }} /> Remember me
                </label>
                <a href="#" className="label" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Forgot?</a>
              </div>
            )}

            <button className="btn btn-primary btn-block" type="submit" disabled={loading} style={{ marginTop: 4, padding: '13px' }}>
              {loading ? <><Icon name="pixelarticons:loader" size={15} /> Loading…</> :
               mode === 'signin' ? <>Sign In <Icon name="pixelarticons:arrow-right" size={15} /></> :
               <>Create Account <Icon name="pixelarticons:arrow-right" size={15} /></>}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div className="pxdiv" style={{ flex: 1 }} />
            <span className="label faint">or</span>
            <div className="pxdiv" style={{ flex: 1 }} />
          </div>

          <button className="btn btn-block" onClick={go} style={{ background: 'var(--panel-2)' }}>
            <GoogleGlyph size={16} /> Continue with Google
          </button>
        </div>

        <p className="label faint" style={{ textAlign: 'center', marginTop: 18, lineHeight: 1.8 }}>
          By continuing you agree to the<br />Acme Engineering Handbook v2.6
        </p>
      </div>
    </div>
  );
}

Object.assign(window, { Login });
