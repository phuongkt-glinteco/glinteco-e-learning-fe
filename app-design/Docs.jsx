/* Documentation — searchable/filterable resource library. Learner + Admin */
const { useState: useStateDocs } = React;

function Docs({ isAdmin }) {
  const [docs, setDocs] = useStateDocs(window.DOCS);
  const [q, setQ] = useStateDocs('');
  const [active, setActive] = useStateDocs([]);
  const [modal, setModal] = useStateDocs(false);
  const [form, setForm] = useStateDocs({ title: '', url: '', tags: [] });
  const [view, setView] = useStateDocs('grid');
  const [tags, setTags] = useStateDocs(window.TAGS);
  const [newTag, setNewTag] = useStateDocs('');

  // admin: register a brand-new tag (assigns a color, joins chip list + filters)
  const createTag = () => {
    const name = newTag.trim().replace(/\s+/g, ' ');
    if (!name) return;
    if (!tags.some(t => t.toLowerCase() === name.toLowerCase())) {
      const palette = ['accent', 'info', 'warn', 'danger', 'muted'];
      window.TAG_COLOR[name] = palette[tags.length % palette.length];
      setTags([...tags, name]);
    }
    if (!form.tags.includes(name)) setForm({ ...form, tags: [...form.tags, name] });
    setNewTag('');
  };

  const toggleTag = (t) => setActive(active.includes(t) ? active.filter(x => x !== t) : [...active, t]);

  const filtered = docs.filter(d => {
    const matchQ = !q || (d.title + ' ' + d.url).toLowerCase().includes(q.toLowerCase());
    const matchT = !active.length || active.some(t => d.tags.includes(t));
    return matchQ && matchT;
  });

  const addDoc = () => {
    setDocs([{ id: 'n' + Date.now(), kind: 'Link', updated: 'just now', ...form, tags: form.tags.length ? form.tags : ['Frontend'] }, ...docs]);
    setForm({ title: '', url: '', tags: [] });
    setModal(false);
  };

  return (
    <div>
      <SectionHead kicker={isAdmin ? 'Resource Manager' : 'Documentations'} title="Resource Library">
        {isAdmin && <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}><Icon name="pixelarticons:plus" size={14} /> Add Document</button>}
      </SectionHead>

      {/* search + view toggle */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <div className="pixel-inset" style={{ flex: 1, minWidth: 240, display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px' }}>
          <Icon name="pixelarticons:search" size={16} color="var(--faint)" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search docs, runbooks, references…" style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)',
            fontFamily: 'var(--font-pixel)', fontSize: 15, padding: '12px 0',
          }} />
          {q && <button onClick={() => setQ('')} className="btn btn-ghost btn-sm" style={{ padding: 4 }}><Icon name="pixelarticons:close" size={13} /></button>}
        </div>
        <div className="pixel-inset" style={{ display: 'flex', padding: 3 }}>
          {[['grid', 'pixelarticons:grid'], ['list', 'pixelarticons:list']].map(([v, ic]) => (
            <button key={v} onClick={() => setView(v)} className="btn btn-ghost btn-sm" style={{ boxShadow: 'none', borderColor: 'transparent', background: view === v ? 'var(--accent)' : 'transparent', color: view === v ? 'var(--accent-ink)' : 'var(--muted)' }}>
              <Icon name={ic} size={15} />
            </button>
          ))}
        </div>
      </div>

      {/* filter chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <span className="label faint" style={{ marginRight: 2 }}><Icon name="pixelarticons:filter" size={13} /> Filter</span>
        {tags.map(t => (
          <button key={t} className="chip" data-on={active.includes(t)} onClick={() => toggleTag(t)}>{t}</button>
        ))}
        {active.length > 0 && <button className="label" onClick={() => setActive([])} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--font-label)' }}>clear</button>}
        <span className="label faint" style={{ marginLeft: 'auto' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="pixel" style={{ padding: 48, textAlign: 'center', background: 'var(--panel)' }}>
          <Icon name="pixelarticons:search" size={36} color="var(--faint)" />
          <div className="h3" style={{ marginTop: 12 }}>No matches</div>
          <div className="label faint" style={{ marginTop: 6 }}>Try a different keyword or clear filters.</div>
        </div>
      ) : view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtered.map(d => (
            <a key={d.id} href="#" onClick={e => e.preventDefault()} className="pixel pop" style={{ padding: 16, textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--panel)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-muted">{d.kind}</span>
                <Icon name="pixelarticons:external-link" size={15} color="var(--faint)" />
              </div>
              <div className="h3" style={{ lineHeight: 1.25 }}>{d.title}</div>
              <div className="label" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <Icon name="pixelarticons:link" size={13} />{d.url}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>{d.tags.map(t => <Tag key={t} name={t} />)}</div>
              <div className="label faint" style={{ borderTop: '2px solid var(--border)', paddingTop: 10 }}>Updated {d.updated}</div>
            </a>
          ))}
        </div>
      ) : (
        <div className="pixel" style={{ background: 'var(--panel)' }}>
          {filtered.map((d, i) => (
            <a key={d.id} href="#" onClick={e => e.preventDefault()} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', textDecoration: 'none', color: 'inherit', borderBottom: i < filtered.length - 1 ? '2px solid var(--border)' : 'none' }}>
              <Icon name="pixelarticons:file" size={20} color="var(--accent)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{d.title}</div>
                <div className="label faint" style={{ marginTop: 2 }}>{d.url} · updated {d.updated}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>{d.tags.map(t => <Tag key={t} name={t} />)}</div>
              <Icon name="pixelarticons:external-link" size={15} color="var(--faint)" />
            </a>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Document">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Caching Strategy Guide" />
          </div>
          <div className="field">
            <label className="label">Reference URL</label>
            <input className="input" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="wiki/… or https://…" />
          </div>
          <div className="field">
            <label className="label">Assign Tags</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {tags.map(t => (
                <button key={t} className="chip" data-on={form.tags.includes(t)} onClick={() => setForm({ ...form, tags: form.tags.includes(t) ? form.tags.filter(x => x !== t) : [...form.tags, t] })}>{t}</button>
              ))}
            </div>
            <span className="label faint" style={{ marginTop: 4 }}>Tap to assign</span>
          </div>

          {/* create a brand-new tag */}
          <div className="field">
            <label className="label">Create New Tag</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" value={newTag} onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); createTag(); } }}
                placeholder="e.g. GraphQL" style={{ flex: 1 }} />
              <button className="btn" onClick={createTag} disabled={!newTag.trim()}><Icon name="pixelarticons:plus" size={14} /> Add Tag</button>
            </div>
            <span className="label faint" style={{ marginTop: 4 }}>New tags get a color and show up in filters instantly</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={addDoc} disabled={!form.title || !form.url}><Icon name="pixelarticons:plus" size={14} /> Add to Library</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

Object.assign(window, { Docs });
