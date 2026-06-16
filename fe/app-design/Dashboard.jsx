/* Dashboard overview — Learner + Admin */

function LearnerDashboard({ user, onNav }) {
  const tracks = window.TRACKS;
  const completed = tracks.filter(t => t.status === 'completed').length;
  const overall = 46;
  const current = tracks.find(t => t.status === 'in_progress');
  const recent = window.RECENT_DOCS.map(id => window.DOCS.find(d => d.id === id));

  return (
    <div>
      <SectionHead kicker={'Welcome back, ' + user.name.split(' ')[0]} title="Your Onboarding HQ" />

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', gap: 16 }}>
        {/* progress hero */}
        <div className="pixel" style={{ padding: 20, gridRow: 'span 2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: 'var(--panel)' }}>
          <div className="label faint">Overall Completion</div>
          <CircleMeter value={overall} size={150} label="Onboarded" />
          <div style={{ width: '100%' }}>
            <HPBar value={overall} segments={24} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span className="label faint">{completed}/{tracks.length} tracks</span>
              <span className="label" style={{ color: 'var(--accent)' }}>LVL {user.level}</span>
            </div>
          </div>
        </div>

        <Stat label="XP Earned" value={user.xp.toLocaleString()} sub="+180 this week" icon="pixelarticons:zap" accent />
        <Stat label="Day Streak" value="6" sub="Keep it alive" icon="pixelarticons:flame" />
        <Stat label="Exercises" value="1 / 3" sub="1 awaiting review" icon="pixelarticons:code" />
        <Stat label="Saved Docs" value="12" sub="3 unread" icon="pixelarticons:bookmark" />
      </div>

      {/* continue learning */}
      <div className="pixel" style={{ marginTop: 16, padding: 0, background: 'linear-gradient(0deg, var(--panel), var(--panel))', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'stretch', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 360px', padding: 22 }}>
            <div className="kicker">Continue Learning</div>
            <div className="h2" style={{ marginTop: 8 }}>{current.title}</div>
            <p className="muted" style={{ marginTop: 8, maxWidth: 460 }}>{current.desc}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <TimeBadge time={current.time} />
              <StatusBadge status={current.status} />
              <span className="label faint">Lesson {current.done + 1} of {current.lessons}</span>
            </div>
            <div style={{ marginTop: 16, maxWidth: 360 }}>
              <HPBar value={(current.done / current.lessons) * 100} segments={current.lessons * 3} warn />
            </div>
            <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={() => onNav('tracks')}>
              <Icon name="pixelarticons:play" size={15} /> Resume Track
            </button>
          </div>
          <div style={{ flex: '0 0 220px', display: 'grid', placeItems: 'center', background: 'var(--bg)', borderLeft: '2px solid var(--border)', minHeight: 200 }}>
            <Icon name={current.icon} size={92} color="var(--accent)" />
          </div>
        </div>
      </div>

      {/* recent docs */}
      <div style={{ marginTop: 16 }}>
        <SectionHead title="Recent Documents">
          <button className="btn btn-ghost btn-sm" onClick={() => onNav('docs')}>View Library <Icon name="pixelarticons:arrow-right" size={13} /></button>
        </SectionHead>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {recent.map(d => (
            <button key={d.id} className="pixel" onClick={() => onNav('docs')} style={{ padding: 16, textAlign: 'left', cursor: 'pointer', background: 'var(--panel)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Icon name="pixelarticons:file" size={20} color="var(--accent)" />
                <Icon name="pixelarticons:external-link" size={14} color="var(--faint)" />
              </div>
              <div className="h3" style={{ lineHeight: 1.25 }}>{d.title}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{d.tags.map(t => <Tag key={t} name={t} />)}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ onNav, submissions }) {
  const pending = submissions.filter(s => s.status === 'submitted');
  return (
    <div>
      <SectionHead kicker="Cohort: Spring 2026 · 14 engineers" title="Program Overview">
        <button className="btn btn-ghost btn-sm"><Icon name="pixelarticons:download" size={13} /> Export</button>
        <button className="btn btn-primary btn-sm" onClick={() => onNav('exercises')}><Icon name="pixelarticons:inbox" size={13} /> Review Queue ({pending.length})</button>
      </SectionHead>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <Stat label="Active Learners" value="14" sub="3 new this week" icon="pixelarticons:users" accent />
        <Stat label="Avg Completion" value="58%" sub="+12% vs last cohort" icon="pixelarticons:chart" />
        <Stat label="Pending Review" value={pending.length} sub="oldest 3h ago" icon="pixelarticons:inbox" />
        <Stat label="Avg Ramp Time" value="11d" sub="target: 14d" icon="pixelarticons:clock" accent />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginTop: 16 }}>
        {/* submissions feed */}
        <div className="pixel" style={{ background: 'var(--panel)' }}>
          <div style={{ padding: '16px 18px', borderBottom: '2px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="h3">Recent Submissions</div>
            <span className="label faint">live feed</span>
          </div>
          <div>
            {submissions.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: i < submissions.length - 1 ? '2px solid var(--border)' : 'none' }}>
                <Avatar name={s.who} hue={s.hue} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{s.who}</div>
                  <div className="label faint" style={{ marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.exercise}</div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <StatusBadge status={s.status} />
                  <span className="label faint">{s.when}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* cohort progress */}
        <div className="pixel" style={{ background: 'var(--panel)', padding: 18 }}>
          <div className="h3" style={{ marginBottom: 16 }}>Track Completion</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {window.TRACKS.map((t, i) => {
              const pct = [92, 74, 51, 23, 9][i];
              return (
                <div key={t.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span className="label" style={{ color: 'var(--muted)' }}>{t.title}</span>
                    <span className="label" style={{ color: 'var(--accent)' }}>{pct}%</span>
                  </div>
                  <HPBar value={pct} segments={20} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LearnerDashboard, AdminDashboard });
