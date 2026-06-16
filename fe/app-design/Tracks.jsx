/* Learning Tracks — vertical stepper timeline. Learner + Admin */
const { useState: useStateTracks } = React;

function TrackNode({ track, isAdmin, idx, onAddAfter, onEdit }) {
  const statusColor = {
    completed: 'var(--accent)', in_progress: 'var(--warn)', locked: 'var(--faint)',
  }[track.status];

  return (
    <div style={{ display: 'flex', gap: 18, position: 'relative' }}>
      {/* rail + node */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 56px' }}>
        <div className="pixel-sm" style={{
          width: 56, height: 56, display: 'grid', placeItems: 'center', flex: '0 0 56px',
          background: track.status === 'locked' ? 'var(--panel-2)' : 'var(--panel)',
          borderColor: statusColor,
          boxShadow: track.status === 'in_progress' ? '0 0 0 3px var(--warn-soft), 3px 3px 0 0 var(--shadow)' : undefined,
        }}>
          <Icon name={track.status === 'locked' ? 'pixelarticons:lock' : track.icon} size={26} color={statusColor} />
        </div>
        <div style={{ flex: 1, width: 4, background: 'var(--border)', marginTop: 4, minHeight: 28,
          backgroundImage: 'repeating-linear-gradient(0deg, var(--border) 0 5px, transparent 5px 9px)', backgroundColor: 'transparent' }} />
      </div>

      {/* card */}
      <div className="pixel" style={{ flex: 1, padding: 18, marginBottom: 4, background: 'var(--panel)', opacity: track.status === 'locked' ? 0.7 : 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <div className="label faint">Milestone {String(idx + 1).padStart(2, '0')}</div>
            <div className="h3" style={{ marginTop: 6 }}>{track.title}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <TimeBadge time={track.time} />
            <StatusBadge status={track.status} />
          </div>
        </div>
        <p className="muted" style={{ marginTop: 10 }}>{track.desc}</p>

        {track.status === 'in_progress' && (
          <div style={{ marginTop: 14, maxWidth: 380 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="label faint">Lesson {track.done}/{track.lessons}</span>
              <span className="label" style={{ color: 'var(--warn)' }}>{Math.round(track.done / track.lessons * 100)}%</span>
            </div>
            <HPBar value={track.done / track.lessons * 100} segments={track.lessons * 3} warn />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, gap: 10, flexWrap: 'wrap' }}>
          <span className="label faint"><Icon name="pixelarticons:book-open" size={13} /> {track.lessons} lessons</span>
          {isAdmin ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => onEdit(track)}><Icon name="pixelarticons:edit" size={13} /> Edit</button>
              <button className="btn btn-ghost btn-sm"><Icon name="pixelarticons:eye" size={13} /> Preview</button>
            </div>
          ) : (
            <button className={'btn btn-sm ' + (track.status === 'locked' ? '' : 'btn-primary')} disabled={track.status === 'locked'}>
              {track.status === 'completed' ? <><Icon name="pixelarticons:reload" size={13} /> Review</> :
               track.status === 'in_progress' ? <><Icon name="pixelarticons:play" size={13} /> Continue</> :
               <><Icon name="pixelarticons:lock" size={13} /> Locked</>}
            </button>
          )}
        </div>
      </div>

      {/* admin add-between */}
      {isAdmin && (
        <button className="btn btn-ghost btn-sm" onClick={() => onAddAfter(idx)} title="Add milestone here" style={{
          position: 'absolute', left: 16, bottom: -14, zIndex: 2, padding: '4px 8px',
          background: 'var(--bg)', borderStyle: 'dashed',
        }}>
          <Icon name="pixelarticons:plus" size={13} /> Add
        </button>
      )}
    </div>
  );
}

function Tracks({ isAdmin }) {
  const [tracks, setTracks] = useStateTracks(window.TRACKS);
  const [modal, setModal] = useStateTracks(null); // {mode, idx, track}
  const [form, setForm] = useStateTracks({ title: '', time: '1h', desc: '', lessons: 4 });

  const openAdd = (idx) => { setForm({ title: '', time: '1h', desc: '', lessons: 4 }); setModal({ mode: 'add', idx }); };
  const openEdit = (track) => { setForm({ title: track.title, time: track.time, desc: track.desc, lessons: track.lessons }); setModal({ mode: 'edit', track }); };

  const save = () => {
    if (modal.mode === 'add') {
      const nt = { id: 'n' + Date.now(), status: 'locked', icon: 'pixelarticons:flag', ...form };
      const next = [...tracks];
      next.splice(modal.idx + 1, 0, nt);
      setTracks(next);
    } else {
      setTracks(tracks.map(t => t === modal.track ? { ...t, ...form } : t));
    }
    setModal(null);
  };

  const done = tracks.filter(t => t.status === 'completed').length;

  return (
    <div>
      <SectionHead kicker={isAdmin ? 'Curriculum Editor' : 'Core Knowledge'} title="Learning Tracks">
        {isAdmin
          ? <button className="btn btn-primary btn-sm" onClick={() => openAdd(tracks.length - 1)}><Icon name="pixelarticons:plus" size={14} /> Add Milestone</button>
          : <span className="badge badge-accent"><Icon name="pixelarticons:trophy" size={12} /> {done}/{tracks.length} cleared</span>}
      </SectionHead>

      {/* overview bar */}
      <div className="pixel" style={{ padding: 16, marginBottom: 22, display: 'flex', alignItems: 'center', gap: 16, background: 'var(--panel)', flexWrap: 'wrap' }}>
        <Icon name="pixelarticons:map" size={28} color="var(--accent)" />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="label faint" style={{ marginBottom: 6 }}>Track Path Progress</div>
          <HPBar value={done / tracks.length * 100} segments={tracks.length * 4} />
        </div>
        <div className="label" style={{ color: 'var(--accent)' }}>{Math.round(done / tracks.length * 100)}% COMPLETE</div>
      </div>

      <div style={{ maxWidth: 720 }}>
        {/* start node */}
        <div style={{ display: 'flex', gap: 18, marginBottom: 4 }}>
          <div style={{ flex: '0 0 56px', display: 'flex', justifyContent: 'center' }}>
            <div className="badge badge-accent" style={{ height: 'fit-content' }}><Icon name="pixelarticons:flag" size={12} /> START</div>
          </div>
          <div className="label faint" style={{ paddingTop: 4 }}>Your journey to production-ready, one milestone at a time.</div>
        </div>
        <div style={{ width: 4, height: 18, marginLeft: 26, backgroundImage: 'repeating-linear-gradient(0deg, var(--border) 0 5px, transparent 5px 9px)' }} />

        {tracks.map((t, i) => (
          <TrackNode key={t.id} track={t} idx={i} isAdmin={isAdmin} onAddAfter={openAdd} onEdit={openEdit} />
        ))}

        {/* finish node */}
        <div style={{ display: 'flex', gap: 18, marginTop: 8 }}>
          <div style={{ flex: '0 0 56px', display: 'flex', justifyContent: 'center' }}>
            <div className="pixel-sm" style={{ width: 56, height: 56, display: 'grid', placeItems: 'center', background: 'var(--panel-2)', borderColor: 'var(--border-2)' }}>
              <Icon name="pixelarticons:trophy" size={26} color="var(--faint)" />
            </div>
          </div>
          <div style={{ paddingTop: 14 }}>
            <div className="h3">Production Ready</div>
            <div className="label faint" style={{ marginTop: 4 }}>Ship your first feature to main 🚀</div>
          </div>
        </div>
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'add' ? 'Add Milestone' : 'Edit Milestone'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label className="label">Milestone Title</label>
            <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. GraphQL Gateway" />
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <div className="field" style={{ flex: 1 }}>
              <label className="label">Est. Time</label>
              <input className="input" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} placeholder="2h" />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label className="label">Lessons</label>
              <input className="input" type="number" value={form.lessons} onChange={e => setForm({ ...form, lessons: +e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label className="label">Core Content</label>
            <textarea className="input" rows={3} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="What this milestone covers…" style={{ fontFamily: 'var(--font-pixel)', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={!form.title}><Icon name="pixelarticons:save" size={14} /> Save Milestone</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

Object.assign(window, { Tracks });
