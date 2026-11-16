import { useEffect, useMemo, useState } from 'react'
import { Home, FolderOpen, Plus, WandSparkles, UserRound, Search, Bell, ArrowUpRight, Play, Image, Video, Mic2, Sparkles, Clock3, MoreHorizontal, ChevronRight, SlidersHorizontal, Layers3, Download, Settings, Menu, X, Check, Trash2 } from 'lucide-react'

const initialProjects = [
  { id: 1, title: 'Neon Dreams', type: 'Video', status: 'In progress', updated: '2 hours ago', color: 'violet', icon: 'video' },
  { id: 2, title: 'Brand Identity Kit', type: 'Design', status: 'Ready', updated: 'Yesterday', color: 'blue', icon: 'image' },
  { id: 3, title: 'Midnight Stories', type: 'Story', status: 'Draft', updated: '2 days ago', color: 'pink', icon: 'story' },
]
const nav = [{ id: 'home', label: 'Home', Icon: Home }, { id: 'projects', label: 'Projects', Icon: FolderOpen }, { id: 'create', label: 'Create', Icon: Plus }, { id: 'studio', label: 'Studio', Icon: WandSparkles }, { id: 'profile', label: 'Profile', Icon: UserRound }]

function App() {
  const [page, setPage] = useState('home')
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('zenvora.projects.v1')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
    } catch {}
    return initialProjects.map(project => ({ ...project, prompt: '', scenes: [] }))
  })
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    try { return Number(localStorage.getItem('zenvora.selected-project.v1')) || null }
    catch { return null }
  })
  const [sceneDraft, setSceneDraft] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [prompt, setPrompt] = useState('')
  const [kind, setKind] = useState('Video')
  const [toast, setToast] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const filtered = useMemo(() => projects.filter(p => (p.title.toLowerCase().includes(query.toLowerCase())) && (filter === 'All' || p.type === filter)), [projects, query, filter])
  const selectedProject = projects.find(project => project.id === selectedProjectId) || null
  const selectedScenes = selectedProject?.scenes || []
  useEffect(() => {
    try { localStorage.setItem('zenvora.projects.v1', JSON.stringify(projects)) } catch {}
  }, [projects])
  useEffect(() => {
    try {
      if (selectedProjectId) localStorage.setItem('zenvora.selected-project.v1', String(selectedProjectId))
      else localStorage.removeItem('zenvora.selected-project.v1')
    } catch {}
  }, [selectedProjectId])
  const notify = (msg) => { setToast(msg); window.setTimeout(() => setToast(''), 2400) }
  const openProject = (id) => { setSelectedProjectId(id); setSceneDraft(''); setPage('studio') }
  const createProject = () => {
    if (!prompt.trim()) return notify('Add a short idea first')
    const p = { id: Date.now(), title: prompt.trim().slice(0, 32), prompt: prompt.trim(), type: kind, status: 'Draft', updated: 'Just now', color: kind === 'Image' ? 'blue' : kind === 'Story' ? 'pink' : 'violet', icon: kind.toLowerCase(), scenes: [] }
    setProjects(current => [p, ...current])
    setSelectedProjectId(p.id)
    setPrompt('')
    setPage('studio')
    notify('Project created — add your first scene')
  }
  const addScene = () => {
    if (!sceneDraft.trim()) return notify('Write a scene idea first')
    if (!selectedProject) return notify('Open a project first')
    const scene = { id: Date.now(), prompt: sceneDraft.trim(), createdAt: new Date().toISOString() }
    setProjects(current => current.map(project => project.id === selectedProject.id ? { ...project, scenes: [...(project.scenes || []), scene], status: 'In progress', updated: 'Just now' } : project))
    setSceneDraft('')
    notify('Scene added to your project')
  }
  const removeScene = (sceneId) => {
    if (!selectedProject) return
    setProjects(current => current.map(project => project.id === selectedProject.id ? { ...project, scenes: (project.scenes || []).filter(scene => scene.id !== sceneId), updated: 'Just now' } : project))
    notify('Scene removed')
  }
  const pageTitle = nav.find(n => n.id === page)?.label || 'Home'

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark"><Sparkles size={19}/></div><span>ZENVORA</span><small>STUDIO</small></div><div className="workspace"><div className="avatar">Z</div><div><b>My workspace</b><small>Free plan</small></div><MoreHorizontal size={18}/></div><nav>{nav.map(({id,label,Icon}) => <button key={id} className={page===id?'nav-item active':'nav-item'} onClick={()=>setPage(id)}><Icon size={18}/>{label}{id==='create'&&<span className="nav-plus">+</span>}</button>)}</nav><div className="sidebar-bottom"><div className="upgrade-card"><div className="glow-icon"><Sparkles size={17}/></div><b>Make more magic</b><p>Unlock your creative flow with more studio tools.</p><button onClick={()=>notify('Plans are coming soon')}>Explore plans <ArrowUpRight size={14}/></button></div><button className="nav-item muted" onClick={()=>notify('Settings are coming soon')}><Settings size={18}/> Settings</button><div className="user-mini"><div className="avatar small">U</div><div><b>Your account</b><small>Free workspace</small></div><MoreHorizontal size={18}/></div></div></aside>
    <main className="main-area"><header className="topbar"><button className="mobile-menu" onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?<X/>:<Menu/>}</button><div className="crumb">Workspace <ChevronRight size={14}/> <b>{pageTitle}</b></div><div className="top-actions"><span className="status-pill"><i/> All systems normal</span><button className="icon-btn" aria-label="Notifications" onClick={()=>notify('You are all caught up')}><Bell size={18}/></button><div className="avatar small">U</div></div></header>
    {menuOpen&&<div className="mobile-nav">{nav.map(({id,label,Icon})=><button key={id} onClick={()=>{setPage(id);setMenuOpen(false)}}><Icon size={18}/>{label}</button>)}</div>}
    <div className="content">
      {page==='home'&&<><section className="welcome-row"><div><div className="eyebrow"><Sparkles size={13}/> YOUR CREATIVE UNIVERSE</div><h1>Make something<br/><span>remarkable.</span></h1><p className="subhead">Your ideas deserve a beautiful place to become real.</p></div><div className="welcome-art"><div className="orb orb-one"/><div className="orb orb-two"/><div className="art-core"><Sparkles size={38}/></div><span className="orbit-label">CREATE WITHOUT LIMITS</span></div></section>
      <section className="quick-create"><div className="section-kicker">START CREATING</div><h2>What are we making today?</h2><div className="create-options"><button onClick={()=>{setKind('Video');setPage('create')}}><span className="option-icon purple"><Video/></span><b>AI Video</b><small>Stories in motion</small><ArrowUpRight size={16}/></button><button onClick={()=>{setKind('Image');setPage('create')}}><span className="option-icon blue"><Image/></span><b>AI Image</b><small>Visualize ideas</small><ArrowUpRight size={16}/></button><button onClick={()=>{setKind('Story');setPage('create')}}><span className="option-icon orange"><Mic2/></span><b>Story & Voice</b><small>Give ideas a voice</small><ArrowUpRight size={16}/></button></div></section>
      <section className="section-block"><div className="section-heading"><div><div className="section-kicker">YOUR WORKSPACE</div><h2>Recent projects</h2></div><button className="text-link" onClick={()=>setPage('projects')}>View all <ArrowUpRight size={15}/></button></div><div className="project-grid">{projects.slice(0,3).map(p=><ProjectCard key={p.id} project={p} onOpen={()=>openProject(p.id)}/>)}</div></section></>}
      {page==='projects'&&<><div className="page-heading"><div><div className="section-kicker">YOUR CREATIVE LIBRARY</div><h1>Projects</h1><p>Everything you make, all in one place.</p></div><button className="primary-btn" onClick={()=>setPage('create')}><Plus size={17}/> New project</button></div><div className="toolbar"><div className="search-box"><Search size={17}/><input placeholder="Search projects..." value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="filters">{['All','Video','Image','Story','Design'].map(f=><button key={f} className={filter===f?'filter active-filter':'filter'} onClick={()=>setFilter(f)}>{f}</button>)}</div><button className="icon-btn filter-icon" onClick={()=>notify('More filters coming soon')}><SlidersHorizontal size={17}/></button></div><div className="project-grid">{filtered.map(p=><ProjectCard key={p.id} project={p} onOpen={()=>openProject(p.id)}/>)}</div>{filtered.length===0&&<div className="empty"><FolderOpen size={30}/><b>No projects found</b><span>Try another search or create something new.</span></div>}</>}
      {page==='create'&&<><div className="page-heading"><div><div className="section-kicker">TURN THOUGHT INTO FORM</div><h1>Create</h1><p>Start with an idea. We'll shape it together.</p></div></div><div className="create-layout"><div className="create-panel"><label className="field-label">CHOOSE YOUR CANVAS</label><div className="kind-grid">{[{name:'Video',Icon:Video,desc:'Motion & stories'},{name:'Image',Icon:Image,desc:'Art & visuals'},{name:'Story',Icon:Mic2,desc:'Words & voice'}].map(({name,Icon,desc})=><button className={kind===name?'kind-card selected':'kind-card'} key={name} onClick={()=>setKind(name)}><Icon size={21}/><b>{name}</b><small>{desc}</small>{kind===name&&<Check className="kind-check" size={16}/>}</button>)}</div><label className="field-label" htmlFor="idea">DESCRIBE YOUR IDEA</label><textarea id="idea" value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="A cinematic shot of a quiet futuristic city at blue hour..."/><div className="prompt-footer"><span><Sparkles size={14}/> Be as imaginative as you like</span><span>{prompt.length}/500</span></div><button className="primary-btn full" onClick={createProject}><Sparkles size={17}/> Create draft <ArrowUpRight size={16}/></button><p className="fine-print">Demo mode: this creates a local project draft. AI generation will be connected in a later phase.</p></div><div className="inspiration-panel"><div className="inspire-art"><div className="inspire-sun"/><div className="inspire-mountain m1"/><div className="inspire-mountain m2"/><div className="inspire-stars">✦　·　✧</div></div><div className="section-kicker">A LITTLE INSPIRATION</div><h3>Every great creation<br/>starts with a spark.</h3><p>Don't worry about getting it perfect. Start somewhere, then explore.</p></div></div></>}
      {page==='studio'&&<><div className="page-heading"><div><div className="section-kicker">CREATIVE WORKSPACE</div><h1>{selectedProject ? selectedProject.title : 'Studio'}</h1><p>{selectedProject ? 'Build your idea one scene at a time.' : 'Open a project or create your first one.'}</p></div><span className="draft-badge">● {selectedProject ? selectedProject.status : 'Ready'}</span></div>{selectedProject ? <><div className="studio-board"><div className="studio-toolbar"><span><Layers3 size={17}/> {selectedProject.title}</span><div><button className="icon-btn" aria-label="Export project" onClick={()=>notify('Export is planned for a later phase')}><Download size={17}/></button><button className="primary-btn compact" onClick={()=>document.getElementById('scene-idea')?.focus()}><Plus size={15}/> Add scene</button></div></div><div className="canvas-preview"><div className="canvas-glow"><Sparkles size={32}/></div><span>{selectedProject.type.toUpperCase()} PROJECT · {selectedScenes.length} SCENES</span><h2>{selectedProject.title}</h2><p className="canvas-description">{selectedProject.prompt || 'Your original idea will appear here.'}</p></div><div className="timeline"><div className="timeline-head"><b>Scene timeline</b><span>{String(selectedScenes.length).padStart(2, '0')} scenes</span></div>{selectedScenes.length ? selectedScenes.map((scene, index)=><div className="scene-row" key={scene.id}><div className="scene-number">{String(index + 1).padStart(2, '0')}</div><div className="scene-copy"><b>Scene {String(index + 1).padStart(2, '0')}</b><p>{scene.prompt}</p></div><button className="scene-remove" aria-label={'Remove scene ' + (index + 1)} onClick={()=>removeScene(scene.id)}><Trash2 size={15}/></button></div>) : <div className="scene-empty"><Layers3 size={22}/><b>No scenes yet</b><span>Add your first scene idea below to start building this project.</span></div>}</div></div><div className="scene-composer"><label className="field-label" htmlFor="scene-idea">ADD A SCENE IDEA</label><textarea id="scene-idea" value={sceneDraft} onChange={e=>setSceneDraft(e.target.value)} maxLength={500} placeholder="Describe what happens in this scene..." /><div className="scene-composer-footer"><span>{sceneDraft.length}/500 · Saved on this device</span><button className="primary-btn compact" onClick={addScene}><Plus size={15}/> Add to timeline</button></div></div></> : <div className="studio-empty"><div className="canvas-glow"><Sparkles size={30}/></div><h2>Your studio is ready</h2><p>Create a project, then open it here to build its scenes.</p><button className="primary-btn" onClick={()=>setPage('create')}><Plus size={16}/> Create a project</button></div>}</>}
      {page==='profile'&&<><div className="page-heading"><div><div className="section-kicker">YOUR SPACE</div><h1>Profile</h1><p>Manage your creative workspace.</p></div></div><div className="profile-card"><div className="profile-avatar">U</div><div><h2>Creator</h2><p>Free plan · Personal workspace</p></div><button className="outline-btn" onClick={()=>notify('Account settings coming soon')}><Settings size={15}/> Settings</button></div><div className="settings-list"><div><span>Workspace name</span><b>My workspace</b></div><div><span>Plan</span><b>Free preview</b></div><div><span>Projects created</span><b>{projects.length}</b></div><div><span>App version</span><b>0.1.0 · UI preview</b></div></div></>}
    </div><footer className="footer"><span>© 2026 ZENVORA STUDIO</span><span>Made for the makers <Sparkles size={12}/></span></footer></main>{toast&&<div className="toast"><Check size={16}/>{toast}</div>}</div>
}
function ProjectCard({project,onOpen}) { const Icon=project.icon==='image'?Image:project.icon==='story'?Mic2:Video; return <button className="project-card" onClick={onOpen}><div className={'project-thumb '+project.color}><div className="thumb-shape"/><div className="thumb-icon"><Icon size={23}/></div><span className="thumb-type">{project.type}</span><MoreHorizontal className="thumb-more" size={18}/></div><div className="project-info"><div><b>{project.title}</b><small><Clock3 size={12}/> {project.updated}</small></div><span className={'project-status '+(project.status==='Ready'?'ready':'')}>{project.status}</span></div></button> }

export default App
