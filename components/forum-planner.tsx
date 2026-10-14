'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, FileDown, Search, UserPlus, X } from 'lucide-react';

type Result = {
  speaker_id: string; name: string; evidence_type: 'explicit_specialty' | 'thematic_participation';
  reason: string; excerpt: string; matched_concepts: string[]; matched_tags: string[];
  forum: { id: string; title: string; date: string | null; url: string }; limitations: string[];
};

const examples = ['gestión pública', 'literatura', 'experto en IA y gestión pública', 'IA aplicada a educación', 'ciberseguridad para empresas'];
const storageKey = 'unir-ponentes:forum-shortlist:v1';

export function ForumPlanner() {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [requested, setRequested] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [shortlist, setShortlist] = useState<Result[]>([]);
  const [status, setStatus] = useState('');
  const [aiConcepts, setAiConcepts] = useState<string[]>([]);
  const [aiNote, setAiNote] = useState('');

  useEffect(() => {
    try { const saved = JSON.parse(window.localStorage.getItem(storageKey) || '[]'); if (Array.isArray(saved)) setShortlist(saved); } catch { /* Optional session convenience. */ }
  }, []);
  useEffect(() => { try { window.localStorage.setItem(storageKey, JSON.stringify(shortlist)); } catch { /* The search is still usable without local storage. */ } }, [shortlist]);
  useEffect(() => {
    if (!submitted) return;
    let active = true;
    setStatus('Contrastando el archivo de Foros UNIR…');
    fetch(`/api/foros/search?q=${encodeURIComponent(submitted)}`)
      .then(async response => ({ response, data: await response.json() }))
      .then(({ response, data }) => {
        if (!active) return;
        setResults(data.results || []);
        setStatus(data.note || (response.ok ? '' : 'No se pudo consultar el archivo de Foros UNIR.'));
      })
      .catch(() => active && setStatus('No se pudo consultar el archivo de Foros UNIR.'));
    return () => { active = false; };
  }, [submitted]);

  const selectedIds = useMemo(() => new Set(shortlist.map(person => person.speaker_id)), [shortlist]);
  const search = async (term: string) => {
    const clean = term.trim(); if (!clean) return;
    setValue(clean); setRequested(clean); setResults([]); setAiConcepts([]); setAiNote(''); setStatus('Interpretando el encargo…');
    try {
      const response = await fetch('/api/foros/interpret', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: clean }) });
      const data = await response.json();
      if (!response.ok) throw new Error('No se pudo interpretar la consulta.');
      setAiConcepts(Array.isArray(data.concepts) ? data.concepts : []);
      setAiNote(data.used_ai ? (data.clarification || 'Consulta interpretada con IA antes de contrastarla con el archivo.') : (data.note || 'Consulta enviada directamente al archivo verificado.'));
      setSubmitted(typeof data.normalized_query === 'string' && data.normalized_query.trim() ? data.normalized_query : clean);
    } catch {
      setAiNote('No se pudo interpretar la consulta con IA; se ha usado la búsqueda verificada.');
      setSubmitted(clean);
    }
  };
  const toggle = (result: Result) => setShortlist(current => current.some(item => item.speaker_id === result.speaker_id) ? current.filter(item => item.speaker_id !== result.speaker_id) : [...current, result]);
  const downloadBrief = () => {
    const lines = ['# Propuesta de ponentes · Foro UNIR', '', `Búsqueda: ${submitted || 'Sin consulta'}`, `Generado: ${new Date().toLocaleDateString('es-ES')}`, '', ...shortlist.flatMap((person, index) => [
      `## ${index + 1}. ${person.name}`,
      `- Evidencia: ${person.evidence_type === 'explicit_specialty' ? 'Especialidad publicada' : 'Participación temática'}`,
      `- Encaje: ${person.matched_concepts.join(' + ')}`,
      `- Motivo: ${person.reason}`,
      `- Fuente: ${person.forum.title}${person.forum.date ? ` (${person.forum.date})` : ''}`,
      `- URL: ${person.forum.url}`,
      '',
    ])];
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'propuesta-ponentes-foro-unir.md'; link.click(); URL.revokeObjectURL(url);
  };

  return <section className="forum-planner">
    <div className="forum-planner-hero">
      <p className="eyebrow">PLANIFICADOR DE FOROS · ARCHIVO VERIFICADO</p>
      <h2>¿Qué foro quieres construir?</h2>
      <p>Describe el tema y el perfil. Cruzamos la petición con participaciones y especialidades publicadas, y solo proponemos perfiles con evidencia.</p>
      <form onSubmit={event => { event.preventDefault(); search(value); }}>
        <input aria-label="Tema o encargo del nuevo foro" value={value} onChange={event => setValue(event.target.value)} placeholder="Ej. experto en IA y gestión pública" />
        <button className="new-button" type="submit"><Search size={16} />Buscar ponentes</button>
      </form>
      <div className="forum-planner-examples">{examples.map(example => <button key={example} type="button" onClick={() => search(example)}>{example}</button>)}</div>
    </div>
    <div className="forum-planner-layout">
      <div className="forum-planner-results" aria-live="polite">
        {submitted && <div className="planner-result-title"><div><p>ENCARGO</p><h3>«{requested || submitted}»</h3><span>{status || `${results.length} perfiles con evidencia suficiente.`}</span>{aiNote&&<small className="planner-ai-note">{aiConcepts.length ? `IA interpretó: ${aiConcepts.join(' + ')}. ` : ''}{aiNote}</small>}</div><span className="planner-rule">En búsquedas combinadas, todos los temas deben aparecer en la evidencia.</span></div>}
        {submitted && !results.length && !status && <p className="empty">No hay perfiles acreditados para este encargo. Prueba con un tema más amplio o revisa el archivo de foros.</p>}
        {results.map(result => <article className="planner-result" key={`${result.speaker_id}:${result.forum.id}`}>
          <div className="planner-result-head"><div><span className={`evidence-pill ${result.evidence_type}`}>{result.evidence_type === 'explicit_specialty' ? 'Especialidad publicada' : 'Participación temática'}</span><h3>{result.name}</h3></div><button className={selectedIds.has(result.speaker_id) ? 'planner-added' : ''} onClick={() => toggle(result)}>{selectedIds.has(result.speaker_id) ? 'En selección' : <><UserPlus size={15} />Añadir</>}</button></div>
          <div className="planner-concepts">{result.matched_concepts.map(concept => <span key={concept}>{concept}</span>)}</div>
          <p>{result.reason}</p><blockquote>{result.excerpt}</blockquote>
          <footer><a href={result.forum.url} target="_blank" rel="noreferrer">{result.forum.title}{result.forum.date ? ` · ${result.forum.date}` : ''}<ArrowUpRight size={13} /></a>{result.limitations.map(limit => <em key={limit}>{limit}</em>)}</footer>
        </article>)}
      </div>
      <aside className="forum-shortlist"><div><p>SELECCIÓN DEL FORO</p><h3>{shortlist.length} {shortlist.length === 1 ? 'ponente' : 'ponentes'}</h3><span>Una preselección no invita ni acredita disponibilidad.</span></div>{shortlist.length ? <><ol>{shortlist.map(person => <li key={person.speaker_id}><div><b>{person.name}</b><small>{person.matched_concepts.join(' · ')}</small></div><button aria-label={`Quitar a ${person.name}`} onClick={() => toggle(person)}><X size={15} /></button></li>)}</ol><button className="new-button planner-download" onClick={downloadBrief}><FileDown size={16} />Descargar propuesta</button></> : <p className="shortlist-empty">Añade candidatos para crear una propuesta trazable con fuentes.</p>}</aside>
    </div>
  </section>;
}
