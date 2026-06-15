/* Exercises — practical tasks. Learner submits PR links; Admin reviews. */
const { useState: useStateEx } = React;

const DIFF = { Beginner: 'badge-accent', Intermediate: 'badge-warn', Advanced: 'badge-danger' };

/* PR submit field reused in the card and the detail modal */
function SubmitBar({ ex, value, onChange, onSubmit, flashed, big }) {
  const locked = ex.status === 'approved';
  const submitted = ex.status === 'submitted';
  return (
    <div>
      <label className="label" style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Icon name="pixelarticons:git-branch" size={14} /> Submit GitHub PR / Branch Link
      </label>
      {locked ? (
        <div className="pixel-inset" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent)' }}>
          <Icon name="pixelarticons:check-double" size={16} />
          <span className="label" style={{ flex: 1, color: 'var(--accent)' }}>{ex.pr}</span>
          <span className="label faint">merged</span>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input className="input" style={{ flex: 1, minWidth: 220, fontSize: big ? 16 : 15 }}
            placeholder="github.com/acme/repo/pull/123" value={value} onChange={e => onChange(e.target.value)} />
          <button className={'btn ' + (flashed || !submitted ? 'btn-primary' : '')} onClick={onSubmit} disabled={!value}>
            {flashed ? <><Icon name="pixelarticons:check" size={14} /> Sent!</> :
             submitted ? <><Icon name="pixelarticons:reload" size={14} /> Re-submit</> :
             <><Icon name="pixelarticons:upload" size={14} /> Submit</>}
          </button>
        </div>
      )}
      {submitted && !flashed && <div className="label faint" style={{ marginTop: 8 }}><Icon name="pixelarticons:clock" size={12} /> Awaiting review</div>}
    </div>
  );
}

/* full-detail modal for a single exercise */
function ExerciseDetail({ ex, onClose, value, onChange, onSubmit, flashed }) {
  if (!ex) return null;
  const resources = (ex.resources || []).map(id => window.DOCS.find(d => d.id === id)).filter(Boolean);
  return (
    <Modal open={!!ex} onClose={onClose} title={ex.title} width={680}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* meta row */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Tag name={ex.tag} />
          <span className={'badge ' + (DIFF[ex.difficulty] || 'badge-muted')}><Icon name="pixelarticons:chart" size={12} />{ex.difficulty}</span>
          <TimeBadge time={ex.est} />
          <span className="badge badge-muted"><Icon name="pixelarticons:zap" size={12} />{ex.xp} XP</span>
          <span style={{ marginLeft: 'auto' }}><StatusBadge status={ex.status} /></span>
        </div>

        <div className="label faint" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="pixelarticons:map" size={13} /> {ex.track}
        </div>

        {/* overview */}
        <div>
          <div className="kicker" style={{ marginBottom: 8 }}>Overview</div>
          <p style={{ lineHeight: 1.6 }}>{ex.overview}</p>
        </div>

        {/* acceptance criteria */}
        <div>
          <div className="kicker" style={{ marginBottom: 10 }}>Acceptance Criteria</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ex.objectives.map((o, i) => (
              <div key={i} className="pixel-inset" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '9px 12px' }}>
                <span style={{ width: 16, height: 16, flex: '0 0 16px', marginTop: 2, display: 'grid', placeItems: 'center', border: '2px solid var(--accent)', background: ex.status === 'approved' ? 'var(--accent)' : 'transparent' }}>
                  {ex.status === 'approved' && <Icon name="pixelarticons:check" size={11} color="var(--accent-ink)" />}
                </span>
                <span style={{ flex: 1, lineHeight: 1.45 }}>{o}</span>
              </div>
            ))}
          </div>
        </div>

        {/* steps */}
        <div>
          <div className="kicker" style={{ marginBottom: 10 }}>How to Approach It</div>
          <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, counterReset: 'step' }}>
            {ex.steps.map((s, i) => (
              <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span className="label" style={{ flex: '0 0 24px', height: 24, display: 'grid', placeItems: 'center', background: 'var(--panel-2)', border: '2px solid var(--border-2)', color: 'var(--accent)' }}>{i + 1}</span>
                <span style={{ flex: 1, lineHeight: 1.45, paddingTop: 3 }}>{s}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* resources */}
        {resources.length > 0 && (
          <div>
            <div className="kicker" style={{ marginBottom: 10 }}>Helpful Resources</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {resources.map(d => (
                <a key={d.id} href="#" onClick={e => e.preventDefault()} className="pixel-inset" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', textDecoration: 'none', color: 'inherit' }}>
                  <Icon name="pixelarticons:file" size={16} color="var(--accent)" />
                  <span style={{ flex: 1 }}>{d.title}</span>
                  <Icon name="pixelarticons:external-link" size={14} color="var(--faint)" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* hint */}
        {ex.hint && (
          <div className="pixel-inset" style={{ padding: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Icon name="pixelarticons:lightbulb-on" size={18} color="var(--warn)" />
            <div>
              <div className="label" style={{ color: 'var(--warn)', marginBottom: 4 }}>Hint</div>
              <p style={{ lineHeight: 1.5 }}>{ex.hint}</p>
            </div>
          </div>
        )}

        <div className="pxdiv" />
        <SubmitBar ex={ex} value={value} onChange={onChange} onSubmit={onSubmit} flashed={flashed} big />
      </div>
    </Modal>
  );
}

/* ---------- LEARNER ---------- */
function LearnerExercises({ exercises, onSubmitPR }) {
  const [drafts, setDrafts] = useStateEx({});
  const [flash, setFlash] = useStateEx(null);
  const [openId, setOpenId] = useStateEx(null);

  const draftOf = (ex) => drafts[ex.id] ?? ex.pr ?? '';
  const setDraft = (ex, v) => setDrafts({ ...drafts, [ex.id]: v });

  const submit = (ex) => {
    const link = (draftOf(ex) || '').trim();
    if (!link) return;
    onSubmitPR(ex.id, link);
    setFlash(ex.id);
    setTimeout(() => setFlash(null), 1400);
  };

  const cleared = exercises.filter(e => e.status === 'approved').length;
  const selected = exercises.find(e => e.id === openId) || null;

  return (
    <div>
      <SectionHead kicker="Practical Tasks" title="Exercises">
        <span className="badge badge-accent"><Icon name="pixelarticons:trophy" size={12} /> {cleared}/{exercises.length} approved</span>
      </SectionHead>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {exercises.map(ex => {
          const locked = ex.status === 'approved';
          const submitted = ex.status === 'submitted';
          return (
            <div key={ex.id} className="pixel" style={{ background: 'var(--panel)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
                {/* left accent rail */}
                <div style={{ flex: '0 0 6px', background: locked ? 'var(--accent)' : submitted ? 'var(--info)' : 'var(--border-2)' }} />
                <div style={{ flex: 1, padding: 20, minWidth: 280 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Tag name={ex.tag} />
                        <span className={'badge ' + (DIFF[ex.difficulty] || 'badge-muted')}><Icon name="pixelarticons:chart" size={12} />{ex.difficulty}</span>
                        <span className="label faint">{ex.track}</span>
                      </div>
                      <button onClick={() => setOpenId(ex.id)} className="h3" style={{ marginTop: 10, background: 'none', border: 'none', padding: 0, color: 'var(--text)', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-pixel)' }}>{ex.title}</button>
                    </div>
                    <StatusBadge status={ex.status} />
                  </div>

                  <div className="pixel-inset" style={{ padding: 14, marginTop: 14 }}>
                    <div className="label faint" style={{ marginBottom: 6 }}><Icon name="pixelarticons:notes" size={13} /> Instructions</div>
                    <p style={{ lineHeight: 1.55 }}>{ex.brief}</p>
                  </div>

                  {/* meta + details */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                    <TimeBadge time={ex.est} />
                    <span className="badge badge-muted"><Icon name="pixelarticons:zap" size={12} />{ex.xp} XP</span>
                    <span className="label faint"><Icon name="pixelarticons:list" size={12} /> {ex.objectives.length} criteria</span>
                    <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setOpenId(ex.id)}>
                      <Icon name="pixelarticons:article" size={14} /> View Details
                    </button>
                  </div>

                  {/* submit area */}
                  <div style={{ marginTop: 16 }}>
                    <SubmitBar ex={ex} value={draftOf(ex)} onChange={v => setDraft(ex, v)} onSubmit={() => submit(ex)} flashed={flash === ex.id} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ExerciseDetail ex={selected} onClose={() => setOpenId(null)}
        value={selected ? draftOf(selected) : ''}
        onChange={v => selected && setDraft(selected, v)}
        onSubmit={() => selected && submit(selected)}
        flashed={flash === openId} />
    </div>
  );
}

/* ---------- ADMIN ---------- */
function AdminExercises({ submissions, onReview, exercises }) {
  const [tab, setTab] = useStateEx('queue');
  const queue = submissions.filter(s => s.status === 'submitted');
  const reviewed = submissions.filter(s => s.status !== 'submitted');

  return (
    <div>
      <SectionHead kicker="Submission Review" title="Exercises">
        <button className="btn btn-primary btn-sm"><Icon name="pixelarticons:plus" size={14} /> New Exercise</button>
      </SectionHead>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
        <Stat label="In Queue" value={queue.length} sub="awaiting review" icon="pixelarticons:inbox" accent />
        <Stat label="Reviewed Today" value={reviewed.length} sub="keep it moving" icon="pixelarticons:check-double" />
        <Stat label="Live Exercises" value={exercises.length} sub="across 3 tracks" icon="pixelarticons:code" />
      </div>

      {/* tabs */}
      <div className="pixel-inset" style={{ display: 'inline-flex', padding: 3, marginBottom: 16 }}>
        {[['queue', 'Review Queue', queue.length], ['done', 'Reviewed', reviewed.length]].map(([t, label, n]) => (
          <button key={t} onClick={() => setTab(t)} className="btn btn-ghost btn-sm" style={{ boxShadow: 'none', borderColor: 'transparent', background: tab === t ? 'var(--accent)' : 'transparent', color: tab === t ? 'var(--accent-ink)' : 'var(--muted)' }}>
            {label} ({n})
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(tab === 'queue' ? queue : reviewed).map(s => (
          <div key={s.id} className="pixel" style={{ padding: 16, background: 'var(--panel)' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <Avatar name={s.who} hue={s.hue} size={40} />
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{s.who}</div>
                    <div className="label faint" style={{ marginTop: 2 }}>{s.exercise}</div>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                <a href="#" onClick={e => e.preventDefault()} className="pixel-inset" style={{ marginTop: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--accent)' }}>
                  <Icon name="pixelarticons:git-branch" size={15} />
                  <span className="label" style={{ flex: 1, color: 'var(--accent)' }}>{s.pr}</span>
                  <Icon name="pixelarticons:external-link" size={14} color="var(--faint)" />
                </a>
                {s.status === 'submitted' && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => onReview(s.id, 'approved')}><Icon name="pixelarticons:check" size={13} /> Approve</button>
                    <button className="btn btn-sm" onClick={() => onReview(s.id, 'changes')} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}><Icon name="pixelarticons:reload" size={13} /> Request Changes</button>
                    <span className="label faint" style={{ marginLeft: 'auto', alignSelf: 'center' }}>{s.when}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {(tab === 'queue' ? queue : reviewed).length === 0 && (
          <div className="pixel" style={{ padding: 40, textAlign: 'center', background: 'var(--panel)' }}>
            <Icon name="pixelarticons:check-double" size={34} color="var(--accent)" />
            <div className="h3" style={{ marginTop: 10 }}>Queue is clear</div>
            <div className="label faint" style={{ marginTop: 6 }}>No submissions waiting on you. Nice.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Exercises({ isAdmin, ...props }) {
  return isAdmin ? <AdminExercises {...props} /> : <LearnerExercises {...props} />;
}

Object.assign(window, { Exercises, LearnerExercises, AdminExercises });
