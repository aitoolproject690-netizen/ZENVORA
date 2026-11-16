import { useEffect, useMemo, useState } from 'react'
import {
  Home, FolderOpen, Plus, WandSparkles, UserRound, Search, Bell, ArrowUpRight,
  Play, Image as ImageIcon, Video, Mic2, Sparkles, Clock3, MoreHorizontal,
  ChevronRight, SlidersHorizontal, Layers3, Download, Settings, Menu, X, Check,
  Trash2, BookOpen, Users, Clapperboard, FileText, Copy, ExternalLink, Volume2,
  Square, Film, Upload, RefreshCw, Palette, Languages, ArrowLeft, Save
} from 'lucide-react'
import {
  generateStory, scenesFromScript, createSceneArtwork, downloadBlob,
  getVideoMimeType, renderStoryboardVideo, createUploadMetadata, getDefaultCharacters
} from './lib/creator.js'

const initialProjects = [
  { id: 1, title: 'Neon Dreams', type: 'Video', status: 'Draft', updated: 'Sample', color: 'violet', icon: 'video', prompt: 'A city that wakes up when its last light turns on.', scenes: [], characters: [], script: '' },
  { id: 2, title: 'Brand Identity Kit', type: 'Image', status: 'Draft', updated: 'Sample', color: 'blue', icon: 'image', prompt: 'A clean visual identity for a creative studio.', scenes: [], characters: [], script: '' },
  { id: 3, title: 'Midnight Stories', type: 'Story', status: 'Draft', updated: 'Sample', color: 'pink', icon: 'story', prompt: 'A mysterious story under a quiet moon.', scenes: [], characters: [], script: '' }
]
const nav = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'projects', label: 'Projects', Icon: FolderOpen },
  { id: 'create', label: 'Create', Icon: Plus },
  { id: 'studio', label: 'Studio', Icon: WandSparkles },
  { id: 'profile', label: 'Profile', Icon: UserRound }
]
const studioTabs = [
  { id: 'script', label: 'Script', Icon: FileText },
  { id: 'cast', label: 'Characters', Icon: Users },
  { id: 'storyboard', label: 'Storyboard', Icon: Layers3 },
  { id: 'images', label: 'Images', Icon: Palette },
  { id: 'voice', label: 'Voice', Icon: Volume2 },
  { id: 'video', label: 'Video', Icon: Clapperboard },
  { id: 'publish', label: 'Publish', Icon: Upload }
]
const safeArray = value => Array.isArray(value) ? value : []
const cleanFilename = value => String(value || 'zenvora-project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'zenvora-project'


async function compressSceneImage(file) {
  if (!file || !file.type.startsWith('image/')) throw new Error('Choose an image file.')
  if (file.size > 12 * 1024 * 1024) throw new Error('Image must be smaller than 12 MB.')
  const source = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read this image.'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('This image format could not be opened.'))
      image.onload = () => resolve(image)
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  })
  const scale = Math.min(1, 1280 / source.width, 720 / source.height)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(source.width * scale))
  canvas.height = Math.max(1, Math.round(source.height * scale))
  canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.76)
}

function App() {
  const [page, setPage] = useState('home')
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('zenvora.projects.v1')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length) return parsed.map(p => ({ ...p, scenes: safeArray(p.scenes), characters: safeArray(p.characters) }))
      }
    } catch {}
    return initialProjects
  })
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    try { return Number(localStorage.getItem('zenvora.selected-project.v1')) || null } catch { return null }
  })
  const [studioTab, setStudioTab] = useState('script')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [idea, setIdea] = useState('')
  const [kind, setKind] = useState('Video')
  const [genre, setGenre] = useState('Adventure')
  const [audience, setAudience] = useState('Family')
  const [language, setLanguage] = useState('English')
  const [tone, setTone] = useState('Hopeful')
  const [duration, setDuration] = useState('60')
  const [newCharacter, setNewCharacter] = useState({ name: '', role: 'Supporting character', description: '' })
  const [sceneDraft, setSceneDraft] = useState('')
  const [toast, setToast] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [voiceList, setVoiceList] = useState([])
  const [voiceRate, setVoiceRate] = useState('1')
  const [voicePitch, setVoicePitch] = useState('1')
  const [voiceName, setVoiceName] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoFormat, setVideoFormat] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const [metadataEdited, setMetadataEdited] = useState(false)

  const selectedProject = projects.find(project => String(project.id) === String(selectedProjectId)) || null
  const selectedScenes = safeArray(selectedProject?.scenes)
  const selectedCharacters = safeArray(selectedProject?.characters)
  const pageTitle = nav.find(item => item.id === page)?.label || 'Home'
  const filteredProjects = useMemo(() => projects.filter(project =>
    String(project.title || '').toLowerCase().includes(query.toLowerCase()) &&
    (filter === 'All' || project.type === filter)
  ), [projects, query, filter])
  const metadata = useMemo(() => createUploadMetadata(selectedProject || {}), [selectedProject])
  const videoSupport = typeof window !== 'undefined' ? getVideoMimeType() : null

  useEffect(() => {
    try { localStorage.setItem('zenvora.projects.v1', JSON.stringify(projects)) } catch {}
  }, [projects])
  useEffect(() => {
    try {
      if (selectedProjectId) localStorage.setItem('zenvora.selected-project.v1', String(selectedProjectId))
      else localStorage.removeItem('zenvora.selected-project.v1')
    } catch {}
  }, [selectedProjectId])
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const updateVoices = () => setVoiceList(window.speechSynthesis.getVoices())
    updateVoices()
    window.speechSynthesis.addEventListener?.('voiceschanged', updateVoices)
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', updateVoices)
  }, [])
  useEffect(() => () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel()
  }, [videoUrl])

  const notify = message => {
    setToast(message)
    window.clearTimeout(notify.timer)
    notify.timer = window.setTimeout(() => setToast(''), 2600)
  }
  const updateSelected = patch => {
    if (!selectedProject) return
    setProjects(current => current.map(project => String(project.id) === String(selectedProject.id) ? { ...project, ...patch, updated: 'Just now' } : project))
  }
  const updateScene = (sceneId, patch) => {
    if (!selectedProject) return
    updateSelected({ scenes: selectedScenes.map(scene => scene.id === sceneId ? { ...scene, ...patch } : scene) })
  }
  const openProject = id => {
    setSelectedProjectId(id)
    setStudioTab('script')
    setMenuOpen(false)
    setPage('studio')
    setVideoUrl('')
    setExportError('')
  }
  const createProject = () => {
    if (!idea.trim()) return notify('Pehle apna idea likho')
    const project = {
      id: Date.now(),
      title: idea.trim().split(/[.!?\n]/)[0].slice(0, 42) || 'Untitled project',
      prompt: idea.trim(),
      type: kind,
      status: 'Draft',
      updated: 'Just now',
      color: kind === 'Image' ? 'blue' : kind === 'Story' ? 'pink' : 'violet',
      icon: kind.toLowerCase(),
      script: '',
      scenes: [],
      characters: [],
      logline: ''
    }
    setProjects(current => [project, ...current])
    setSelectedProjectId(project.id)
    setIdea('')
    setStudioTab('script')
    setPage('studio')
    notify('Project created — script tab se shuru karo')
  }
  const createStory = () => {
    if (!selectedProject) return notify('Open a project first')
    try {
      const result = generateStory({
        idea: selectedProject.prompt || selectedProject.title,
        genre,
        audience,
        language,
        tone,
        duration: Number(duration)
      })
      updateSelected({
        title: selectedProject.title || result.title,
        script: result.script,
        logline: result.logline,
        scenes: result.scenes,
        characters: result.characters,
        language,
        genre,
        status: 'Story drafted',
        storyGeneratedAt: result.generatedAt,
        voiceText: result.script
      })
      setStudioTab('script')
      setVideoUrl('')
      notify('Story aur ' + result.scenes.length + ' scenes ready')
    } catch (error) {
      notify(error.message || 'Story generate nahi hui')
    }
  }
  const buildStoryboard = () => {
    const scenes = scenesFromScript(selectedProject?.script || '', selectedProject?.prompt)
    if (!scenes.length) return notify('Pehle script generate ya paste karo')
    updateSelected({ scenes, status: 'Storyboard ready' })
    setStudioTab('storyboard')
    setVideoUrl('')
    notify(scenes.length + ' storyboard scenes ban gaye')
  }

  const uploadSceneImage = async (sceneId, file) => {
    if (!file) return
    try {
      const imageDataUrl = await compressSceneImage(file)
      updateScene(sceneId, { imageDataUrl })
      setVideoUrl('')
      notify('Scene image added and saved on this device')
    } catch (error) {
      notify(error.message || 'Image upload failed')
    }
  }

  const addScene = () => {
    if (!sceneDraft.trim()) return notify('Scene idea likho')
    const scene = {
      id: 'manual-' + Date.now(),
      title: 'New scene ' + (selectedScenes.length + 1),
      duration: 4,
      shot: 'Cinematic medium shot',
      action: sceneDraft.trim(),
      narration: sceneDraft.trim(),
      dialogue: '',
      visualPrompt: 'Cinematic illustrated scene showing: ' + sceneDraft.trim()
    }
    updateSelected({ scenes: [...selectedScenes, scene], status: 'In progress' })
    setSceneDraft('')
    setVideoUrl('')
    notify('Scene timeline mein add ho gaya')
  }
  const removeScene = sceneId => {
    updateSelected({ scenes: selectedScenes.filter(scene => scene.id !== sceneId) })
    setVideoUrl('')
    notify('Scene removed')
  }
  const addCharacter = () => {
    if (!newCharacter.name.trim()) return notify('Character ka naam likho')
    const character = { ...newCharacter, id: 'character-' + Date.now() }
    updateSelected({ characters: [...selectedCharacters, character] })
    setNewCharacter({ name: '', role: 'Supporting character', description: '' })
    notify('Character add ho gaya')
  }
  const updateCharacter = (id, patch) => updateSelected({ characters: selectedCharacters.map(character => character.id === id ? { ...character, ...patch } : character) })
  const removeCharacter = id => updateSelected({ characters: selectedCharacters.filter(character => character.id !== id) })
  const handleSpeak = () => {
    if (!selectedProject) return
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') return notify('Is browser mein voice playback supported nahi hai')
    const text = String(selectedProject.voiceText || selectedProject.script || selectedProject.prompt || '').trim()
    if (!text) return notify('Voice ke liye script ya narration add karo')
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 12000))
    utterance.lang = language === 'Hindi' || selectedProject.language === 'Hindi' ? 'hi-IN' : 'en-IN'
    utterance.rate = Number(voiceRate)
    utterance.pitch = Number(voicePitch)
    const voice = voiceList.find(item => item.name === voiceName)
    if (voice) utterance.voice = voice
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }
  const stopSpeak = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }
  const exportScript = () => {
    const blob = new Blob([selectedProject?.script || ''], { type: 'text/plain;charset=utf-8' })
    downloadBlob(blob, cleanFilename(selectedProject?.title) + '-script.txt')
    notify('Script file downloaded')
  }
  const exportArtwork = (scene, index) => {
    const svg = createSceneArtwork(scene, index)
    downloadBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), cleanFilename(selectedProject?.title) + '-scene-' + (index + 1) + '.svg')
  }
  const exportVideo = async () => {
    if (!selectedScenes.length) return setExportError('Video ke liye pehle storyboard scenes banao.')
    setIsExporting(true)
    setExportError('')
    try {
      const result = await renderStoryboardVideo(selectedScenes)
      if (videoUrl) URL.revokeObjectURL(videoUrl)
      const url = URL.createObjectURL(result.blob)
      setVideoUrl(url)
      setVideoFormat(result.extension.toUpperCase())
      downloadBlob(result.blob, cleanFilename(selectedProject.title) + '-video.' + result.extension)
      notify(result.extension.toUpperCase() + ' video export complete')
    } catch (error) {
      setExportError(error.message || 'Video export failed in this browser.')
    } finally {
      setIsExporting(false)
    }
  }
  const copyText = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text)
      notify(label + ' copied')
    } catch {
      const field = document.createElement('textarea')
      field.value = text
      document.body.appendChild(field)
      field.select()
      const ok = document.execCommand('copy')
      field.remove()
      notify(ok ? label + ' copied' : 'Copy not supported by this browser')
    }
  }
  const openNav = id => {
    setPage(id)
    setMenuOpen(false)
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Sparkles size={19}/></div><span>ZENVORA</span><small>STUDIO</small></div>
      <div className="workspace"><div className="avatar">Z</div><div><b>My workspace</b><small>Local creator studio</small></div><MoreHorizontal size={18}/></div>
      <nav>{nav.map(({ id, label, Icon }) => <button key={id} className={page === id ? 'nav-item active' : 'nav-item'} onClick={() => openNav(id)}><Icon size={18}/>{label}{id === 'create' && <span className="nav-plus">+</span>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="upgrade-card"><div className="glow-icon"><Sparkles size={17}/></div><b>Create on your device</b><p>Scripts, scene boards and project drafts stay in this browser.</p><button onClick={() => openNav('create')}>Start a project <ArrowUpRight size={14}/></button></div>
        <button className="nav-item muted" onClick={() => notify('Settings are not part of this local preview')}><Settings size={18}/> Settings</button>
        <div className="user-mini"><div className="avatar small">U</div><div><b>Creator</b><small>Device workspace</small></div><MoreHorizontal size={18}/></div>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar">
        <button className="mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
        <div className="crumb">Workspace <ChevronRight size={14}/> <b>{pageTitle}</b></div>
        <div className="top-actions"><span className="status-pill"><i/> Local workspace</span><button className="icon-btn" aria-label="Notifications" onClick={() => notify('Projects auto-save on this device')}><Bell size={18}/></button><div className="avatar small">U</div></div>
      </header>
      {menuOpen && <div className="mobile-nav">{nav.map(({ id, label, Icon }) => <button key={id} onClick={() => openNav(id)}><Icon size={18}/>{label}</button>)}</div>}
      <div className="content">
        {page === 'home' && <>
          <section className="welcome-row"><div><div className="eyebrow"><Sparkles size={13}/> YOUR CREATIVE UNIVERSE</div><h1>Make something<br/><span>remarkable.</span></h1><p className="subhead">From an idea to a scene-by-scene story, in one mobile studio.</p><button className="primary-btn home-cta" onClick={() => openNav('create')}><Plus size={17}/> Start creating</button></div><div className="welcome-art"><div className="orb orb-one"/><div className="orb orb-two"/><div className="art-core"><Sparkles size={38}/></div><span className="orbit-label">CREATE WITHOUT LIMITS</span></div></section>
          <section className="quick-create"><div className="section-kicker">START CREATING</div><h2>What are we making today?</h2><div className="create-options"><button onClick={() => { setKind('Video'); openNav('create') }}><span className="option-icon purple"><Video/></span><b>Story to Video</b><small>Build a scene sequence</small><ArrowUpRight size={16}/></button><button onClick={() => { setKind('Image'); openNav('create') }}><span className="option-icon blue"><ImageIcon/></span><b>Scene Artwork</b><small>Create vector frames</small><ArrowUpRight size={16}/></button><button onClick={() => { setKind('Story'); openNav('create') }}><span className="option-icon orange"><Mic2/></span><b>Script & Voice</b><small>Write and preview narration</small><ArrowUpRight size={16}/></button></div></section>
          <section className="section-block"><div className="section-heading"><div><div className="section-kicker">YOUR WORKSPACE</div><h2>Recent projects</h2></div><button className="text-link" onClick={() => openNav('projects')}>View all <ArrowUpRight size={15}/></button></div><div className="project-grid">{projects.slice(0, 3).map(project => <ProjectCard key={project.id} project={project} onOpen={() => openProject(project.id)}/>)}</div></section>
        </>}
        {page === 'projects' && <>
          <div className="page-heading"><div><div className="section-kicker">YOUR CREATIVE LIBRARY</div><h1>Projects</h1><p>Everything you make, saved in this browser.</p></div><button className="primary-btn" onClick={() => openNav('create')}><Plus size={17}/> New project</button></div>
          <div className="toolbar"><div className="search-box"><Search size={17}/><input placeholder="Search projects..." value={query} onChange={event => setQuery(event.target.value)}/></div><div className="filters">{['All', 'Video', 'Image', 'Story'].map(value => <button key={value} className={filter === value ? 'filter active-filter' : 'filter'} onClick={() => setFilter(value)}>{value}</button>)}</div><button className="icon-btn filter-icon" onClick={() => setFilter('All')}><SlidersHorizontal size={17}/></button></div>
          <div className="project-grid">{filteredProjects.map(project => <ProjectCard key={project.id} project={project} onOpen={() => openProject(project.id)}/>)}</div>
          {filteredProjects.length === 0 && <div className="empty"><FolderOpen size={30}/><b>No projects found</b><span>Try another search or create something new.</span></div>}
        </>}
        {page === 'create' && <>
          <div className="page-heading"><div><div className="section-kicker">TURN THOUGHT INTO FORM</div><h1>Create</h1><p>Start with a premise. Your studio will shape it into a script and storyboard.</p></div></div>
          <div className="create-layout"><div className="create-panel">
            <label className="field-label">CHOOSE YOUR PROJECT</label>
            <div className="kind-grid">{[{ name: 'Video', Icon: Video, desc: 'Story to motion' }, { name: 'Image', Icon: ImageIcon, desc: 'Visual frames' }, { name: 'Story', Icon: BookOpen, desc: 'Script & dialogue' }].map(({ name, Icon, desc }) => <button className={kind === name ? 'kind-card selected' : 'kind-card'} key={name} onClick={() => setKind(name)}><Icon size={21}/><b>{name}</b><small>{desc}</small>{kind === name && <Check className="kind-check" size={16}/>}</button>)}</div>
            <label className="field-label" htmlFor="idea">YOUR STORY IDEA</label><textarea id="idea" value={idea} maxLength={500} onChange={event => setIdea(event.target.value)} placeholder="A young inventor finds a tiny planet inside an old music box..."/>
            <div className="prompt-footer"><span><Sparkles size={14}/> One clear idea is enough to start</span><span>{idea.length}/500</span></div>
            <button className="primary-btn full" disabled={!idea.trim()} onClick={createProject}><Sparkles size={17}/> Create project <ArrowUpRight size={16}/></button>
            <p className="fine-print">Your drafts are stored locally in this browser. No cloud account or paid API is connected.</p>
          </div><div className="inspiration-panel"><div className="inspire-art"><div className="inspire-sun"/><div className="inspire-mountain m1"/><div className="inspire-mountain m2"/><div className="inspire-stars">✦　·　✧</div></div><div className="section-kicker">A LITTLE INSPIRATION</div><h3>Every great creation<br/>starts with a spark.</h3><p>Build the idea first. Add characters, scenes, voice and video when you are ready.</p></div></div>
        </>}
        {page === 'studio' && <>
          {!selectedProject ? <div className="studio-empty"><div className="canvas-glow"><Sparkles size={30}/></div><h2>Your studio is ready</h2><p>Create a project, then open it here to build its script, cast and storyboard.</p><button className="primary-btn" onClick={() => openNav('create')}><Plus size={16}/> Create a project</button></div> : <>
            <div className="studio-title-row"><div><div className="section-kicker">CREATIVE WORKSPACE</div><h1>{selectedProject.title}</h1><p>{selectedProject.logline || selectedProject.prompt || 'Build your idea one step at a time.'}</p></div><span className="draft-badge">● {selectedProject.status || 'Draft'}</span></div>
            <div className="studio-stepbar">{studioTabs.map(({ id, label, Icon }, index) => <button key={id} className={studioTab === id ? 'studio-step active' : 'studio-step'} onClick={() => setStudioTab(id)}><span className="step-index">{index + 1}</span><Icon size={15}/><span>{label}</span></button>)}</div>
            <div className="studio-workspace">
              {studioTab === 'script' && <div className="tool-panel">
                <div className="panel-heading"><div><div className="section-kicker">01 / STORY ENGINE</div><h2>Script & story generator</h2><p>Local template-based story drafting. It does not call an external AI model.</p></div><span className="local-tag">LOCAL MODE</span></div>
                <div className="generator-grid">
                  <div className="field"><label htmlFor="genre">Genre</label><select id="genre" value={genre} onChange={event => setGenre(event.target.value)}>{['Adventure', 'Fantasy', 'Comedy', 'Drama', 'Mystery', 'Science fiction', 'Educational'].map(value => <option key={value}>{value}</option>)}</select></div>
                  <div className="field"><label htmlFor="audience">Audience</label><select id="audience" value={audience} onChange={event => setAudience(event.target.value)}>{['Family', 'Kids', 'Teens', 'General', 'Adults'].map(value => <option key={value}>{value}</option>)}</select></div>
                  <div className="field"><label htmlFor="language">Language</label><select id="language" value={language} onChange={event => setLanguage(event.target.value)}><option>English</option><option>Hindi</option></select></div>
                  <div className="field"><label htmlFor="tone">Tone</label><select id="tone" value={tone} onChange={event => setTone(event.target.value)}>{['Hopeful', 'Funny', 'Mysterious', 'Emotional', 'Epic', 'Calm'].map(value => <option key={value}>{value}</option>)}</select></div>
                  <div className="field"><label htmlFor="duration">Target duration</label><select id="duration" value={duration} onChange={event => setDuration(event.target.value)}><option value="30">30 seconds</option><option value="60">1 minute</option><option value="120">2 minutes</option></select></div>
                </div>
                <div className="field"><label htmlFor="story-premise">Story premise</label><textarea id="story-premise" className="large-textarea" value={selectedProject.prompt || ''} maxLength={1000} onChange={event => updateSelected({ prompt: event.target.value })} placeholder="Write the central idea of your story..."/></div>
                <div className="button-row"><button className="primary-btn" onClick={createStory}><WandSparkles size={16}/> Generate story & scenes</button><button className="outline-btn" disabled={!selectedProject.script} onClick={exportScript}><Download size={15}/> Download script</button></div>
                {selectedProject.script && <div className="script-editor"><div className="script-heading"><b>Generated script</b><span>{selectedProject.script.length} characters · autosaved</span></div><textarea value={selectedProject.script} onChange={event => updateSelected({ script: event.target.value })} aria-label="Edit generated script" /><div className="button-row"><button className="outline-btn" onClick={() => copyText(selectedProject.script, 'Script')}><Copy size={15}/> Copy script</button><button className="primary-btn compact" onClick={buildStoryboard}><Layers3 size={15}/> Build storyboard</button></div></div>}
                <p className="fine-print">This offline story engine uses structured templates. It is not a connected large language model and needs your editing for a polished final script.</p>
              </div>}
              {studioTab === 'cast' && <div className="tool-panel">
                <div className="panel-heading"><div><div className="section-kicker">02 / CAST DESIGN</div><h2>Characters</h2><p>Build a cast and keep their details with this project.</p></div><span className="count-chip">{selectedCharacters.length} characters</span></div>
                {selectedCharacters.length ? <div className="character-grid">{selectedCharacters.map((character, index) => <div className="character-card" key={character.id}><div className="character-avatar">{String(character.name || 'C').slice(0, 1).toUpperCase()}</div><div className="character-fields"><input aria-label="Character name" value={character.name} onChange={event => updateCharacter(character.id, { name: event.target.value })}/><input aria-label="Character role" value={character.role} onChange={event => updateCharacter(character.id, { role: event.target.value })}/><textarea aria-label="Character description" value={character.description} onChange={event => updateCharacter(character.id, { description: event.target.value })}/></div><button className="scene-remove" aria-label="Remove character" onClick={() => removeCharacter(character.id)}><Trash2 size={15}/></button></div>)}</div> : <div className="empty-inline"><Users size={24}/><b>No characters yet</b><span>Generate a story to get starter characters, or add your own below.</span></div>}
                <div className="add-character"><div className="section-kicker">ADD A CHARACTER</div><div className="generator-grid"><div className="field"><label htmlFor="char-name">Name</label><input id="char-name" value={newCharacter.name} onChange={event => setNewCharacter({ ...newCharacter, name: event.target.value })} placeholder="Character name"/></div><div className="field"><label htmlFor="char-role">Role</label><input id="char-role" value={newCharacter.role} onChange={event => setNewCharacter({ ...newCharacter, role: event.target.value })}/></div></div><div className="field"><label htmlFor="char-desc">Appearance & personality</label><textarea id="char-desc" value={newCharacter.description} onChange={event => setNewCharacter({ ...newCharacter, description: event.target.value })} placeholder="Describe their appearance, personality and motivation..."/></div><button className="primary-btn compact" onClick={addCharacter}><Plus size={15}/> Add character</button></div>
                <p className="fine-print">Character cards are written descriptions, not generated character portraits.</p>
              </div>}
              {studioTab === 'storyboard' && <div className="tool-panel">
                <div className="panel-heading"><div><div className="section-kicker">03 / VISUAL PLAN</div><h2>Scene storyboard</h2><p>Turn script beats into editable scenes and camera notes.</p></div><span className="count-chip">{selectedScenes.length} scenes</span></div>
                <div className="button-row"><button className="primary-btn" disabled={!selectedProject.script} onClick={buildStoryboard}><RefreshCw size={15}/> Rebuild from script</button><button className="outline-btn" onClick={() => setStudioTab('images')}><Palette size={15}/> Open artwork</button></div>
                <div className="scene-list">{selectedScenes.map((scene, index) => <div className="scene-editor-card" key={scene.id}><div className="scene-editor-top"><span className="scene-number">{String(index + 1).padStart(2, '0')}</span><input aria-label="Scene title" value={scene.title || ''} onChange={event => updateScene(scene.id, { title: event.target.value })}/><button className="scene-remove" aria-label="Remove scene" onClick={() => removeScene(scene.id)}><Trash2 size={15}/></button></div><div className="scene-edit-grid"><div className="field"><label>Duration (seconds)</label><input type="number" min="2" max="12" value={scene.duration || 4} onChange={event => updateScene(scene.id, { duration: Math.max(2, Math.min(12, Number(event.target.value) || 2)) })}/></div><div className="field"><label>Camera / shot</label><input value={scene.shot || ''} onChange={event => updateScene(scene.id, { shot: event.target.value })}/></div></div><div className="field"><label>Narration / action</label><textarea value={scene.narration || scene.action || ''} onChange={event => updateScene(scene.id, { narration: event.target.value, action: event.target.value })}/></div><div className="field"><label>Image prompt</label><textarea value={scene.visualPrompt || ''} onChange={event => updateScene(scene.id, { visualPrompt: event.target.value })}/></div></div>)}</div>
                <div className="add-scene"><div className="field"><label htmlFor="scene-draft">Add a scene manually</label><textarea id="scene-draft" value={sceneDraft} onChange={event => setSceneDraft(event.target.value)} placeholder="What happens in this scene?"/></div><button className="primary-btn compact" onClick={addScene}><Plus size={15}/> Add scene</button></div>
                <p className="fine-print">Storyboard scenes, timing and camera notes save automatically on this device.</p>
              </div>}
              {studioTab === 'images' && <div className="tool-panel">
                <div className="panel-heading"><div><div className="section-kicker">04 / ARTWORK</div><h2>Scene image generator</h2><p>Create a vector frame or add your own photo to each scene. Custom photos are included in video exports.</p></div><span className="local-tag">SVG ART</span></div>
                <div className="notice-panel"><Palette size={18}/><span>SVG frames are procedural artwork, not AI image generation. You can also add a photo from your phone; it is resized and saved locally.</span></div>
                {selectedScenes.length ? <div className="artwork-grid">{selectedScenes.map((scene, index) => {
                  const svg = createSceneArtwork(scene, index)
                  const src = scene.imageDataUrl || ('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg))
                  return <article className="artwork-card" key={scene.id}><img src={src} alt={(scene.imageDataUrl ? 'Custom photo for ' : 'Procedural artwork for ') + scene.title}/><div className="artwork-info"><b>{String(index + 1).padStart(2, '0')} · {scene.title}</b><p>{scene.visualPrompt || scene.action}</p><div className="button-row"><button className="outline-btn compact" onClick={() => exportArtwork(scene, index)}><Download size={14}/> Download SVG</button><label className="outline-btn compact" style={{ cursor: 'pointer' }}><ImageIcon size={14}/> {scene.imageDataUrl ? 'Replace photo' : 'Use my photo'}<input type="file" accept="image/*" hidden onChange={event => uploadSceneImage(scene.id, event.target.files?.[0])}/></label></div>{scene.imageDataUrl && <p className="success-note"><Check size={13}/> Custom image saved for this scene</p>}</div></article>
                })}</div> : <div className="empty-inline"><ImageIcon size={24}/><b>No scene artwork yet</b><span>Generate a story or create storyboard scenes first.</span></div>}
              </div>}
              {studioTab === 'voice' && <div className="tool-panel">
                <div className="panel-heading"><div><div className="section-kicker">05 / NARRATION</div><h2>Voice studio</h2><p>Preview narration with voices installed on this device or browser.</p></div><span className="local-tag">DEVICE TTS</span></div>
                <div className="notice-panel"><Volume2 size={18}/><span>Voice is played by your browser's built-in speech engine. ZENVORA does not create or download a voice audio file in this version.</span></div>
                <div className="field"><label htmlFor="voice-text">Narration text</label><textarea id="voice-text" className="large-textarea" value={selectedProject.voiceText ?? selectedProject.script ?? selectedProject.prompt ?? ''} onChange={event => updateSelected({ voiceText: event.target.value })} placeholder="Paste or edit the narration you want to hear..."/></div>
                <div className="generator-grid">
                  <div className="field"><label htmlFor="voice-choice">Device voice ({voiceList.length} available)</label><select id="voice-choice" value={voiceName} onChange={event => setVoiceName(event.target.value)}><option value="">Default voice</option>{voiceList.map(voice => <option key={voice.name} value={voice.name}>{voice.name} · {voice.lang}</option>)}</select></div>
                  <div className="field"><label htmlFor="voice-rate">Speaking speed: {voiceRate}×</label><input id="voice-rate" type="range" min="0.7" max="1.3" step="0.1" value={voiceRate} onChange={event => setVoiceRate(event.target.value)}/></div>
                  <div className="field"><label htmlFor="voice-pitch">Voice pitch: {voicePitch}</label><input id="voice-pitch" type="range" min="0.7" max="1.3" step="0.1" value={voicePitch} onChange={event => setVoicePitch(event.target.value)}/></div>
                </div>
                <div className="button-row"><button className="primary-btn" onClick={handleSpeak} disabled={isSpeaking}><Play size={15}/> Play voice preview</button><button className="outline-btn" onClick={stopSpeak}><Square size={14}/> Stop</button></div>
                <p className="fine-print">{voiceList.length ? 'The available voices depend on your Android/browser language packs.' : 'No device voices were detected yet. Voice availability depends on browser and Android speech services.'}</p>
              </div>}
              {studioTab === 'video' && <div className="tool-panel">
                <div className="panel-heading"><div><div className="section-kicker">06 / VIDEO EDITOR</div><h2>Video builder & export</h2><p>Render your storyboard as a simple animated 720p scene video in the browser.</p></div><span className="local-tag">{videoSupport ? videoSupport[1].toUpperCase() + ' READY' : 'CHECKING'}</span></div>
                <div className="notice-panel"><Film size={18}/><span>Exports include animated scene cards and any custom scene photos you added. Narration audio, music, generated character animation and multitrack editing are not included.</span></div>
                {selectedScenes.length ? <><div className="video-summary"><div><b>{selectedScenes.length} scenes</b><span>{selectedScenes.reduce((total, scene) => total + (Number(scene.duration) || 4), 0)} seconds total</span></div><div><b>1280 × 720</b><span>24 fps browser canvas render</span></div><div><b>{videoSupport ? videoSupport[1].toUpperCase() : 'Unavailable'}</b><span>{videoSupport ? 'Supported by this browser' : 'No supported recorder format found'}</span></div></div><div className="video-preview-box">{videoUrl ? <video controls playsInline src={videoUrl}/> : <div className="video-placeholder"><div className="canvas-glow"><Play size={28}/></div><b>Storyboard video preview</b><span>Render your scenes to preview and download the clip.</span></div>}</div><div className="button-row"><button className="primary-btn" disabled={isExporting || !videoSupport} onClick={exportVideo}>{isExporting ? <RefreshCw size={15} className="spin"/> : <Download size={15}/>} {isExporting ? 'Rendering video…' : videoSupport?.[1] === 'mp4' ? 'Export MP4' : 'Export video (WebM)'}</button><button className="outline-btn" onClick={() => setStudioTab('storyboard')}><Layers3 size={15}/> Edit scenes</button></div>{exportError && <div className="error-panel">{exportError}</div>}{videoFormat && <p className="success-note"><Check size={15}/> Last export: {videoFormat}. File saved from this browser.</p>}</> : <div className="empty-inline"><Film size={24}/><b>Storyboard is empty</b><span>Add at least one scene before rendering video.</span><button className="primary-btn compact" onClick={() => setStudioTab('storyboard')}>Go to storyboard</button></div>}
                {!videoSupport && <p className="fine-print">This browser did not report an MP4 or WebM MediaRecorder format. A server-side encoder would be needed for reliable MP4 export on all devices.</p>}
              </div>}
              {studioTab === 'publish' && <div className="tool-panel">
                <div className="panel-heading"><div><div className="section-kicker">07 / RELEASE</div><h2>YouTube publishing kit</h2><p>Prepare the video metadata and continue to YouTube Studio.</p></div><span className="local-tag">MANUAL UPLOAD</span></div>
                <div className="notice-panel"><Upload size={18}/><span>Automatic publishing is not connected. It requires a verified Google OAuth app and a secure server-side token flow; this static GitHub Pages app has neither.</span></div>
                <div className="field"><label htmlFor="yt-title">YouTube title</label><input id="yt-title" maxLength={100} value={selectedProject.youtubeTitle ?? metadata.title} onChange={event => updateSelected({ youtubeTitle: event.target.value })}/><small className="field-hint">{(selectedProject.youtubeTitle ?? metadata.title).length}/100 characters</small></div>
                <div className="field"><label htmlFor="yt-desc">Description</label><textarea id="yt-desc" className="large-textarea" value={selectedProject.youtubeDescription ?? metadata.description} onChange={event => updateSelected({ youtubeDescription: event.target.value })}/></div>
                <div className="field"><label>Suggested tags</label><div className="tag-row">{metadata.tags.map(tag => <span key={tag}>#{tag.replace(/\s+/g, '')}</span>)}</div></div>
                <div className="button-row"><button className="primary-btn" onClick={() => copyText('Title: ' + (selectedProject.youtubeTitle ?? metadata.title) + '\n\nDescription:\n' + (selectedProject.youtubeDescription ?? metadata.description) + '\n\nTags: ' + metadata.tags.join(', '), 'Upload details')}><Copy size={15}/> Copy upload details</button><a className="outline-btn" href="https://studio.youtube.com/channel/UC/videos/upload" target="_blank" rel="noreferrer">Open YouTube Studio <ExternalLink size={14}/></a></div>
                <div className="publish-checklist"><b>Before you publish</b><label><input type="checkbox"/> Exported video is ready on this device</label><label><input type="checkbox"/> Reviewed title, description and audience setting</label><label><input type="checkbox"/> Checked music, images and usage rights</label></div>
                <p className="fine-print">Upload the exported video manually in YouTube Studio. ZENVORA cannot confirm publication or monetization from this page.</p>
              </div>}
            </div>
            <div className="studio-footer-actions"><button className="text-link" onClick={() => openNav('projects')}><ArrowLeft size={15}/> Back to projects</button><span><Save size={14}/> Auto-saved in this browser</span><button className="text-link" onClick={() => setStudioTab(studioTabs[Math.min(studioTabs.findIndex(tab => tab.id === studioTab) + 1, studioTabs.length - 1)].id)}>Next step <ArrowUpRight size={15}/></button></div>
          </>}
        </>}
        {page === 'profile' && <><div className="page-heading"><div><div className="section-kicker">YOUR SPACE</div><h1>Profile</h1><p>Local workspace information.</p></div></div><div className="profile-card"><div className="profile-avatar">U</div><div><h2>Creator</h2><p>Device-only workspace · No account connected</p></div><button className="outline-btn" onClick={() => notify('Cloud accounts are not connected')}><Settings size={15}/> Settings</button></div><div className="settings-list"><div><span>Workspace</span><b>My workspace</b></div><div><span>Storage</span><b>Browser localStorage</b></div><div><span>Projects created</span><b>{projects.length}</b></div><div><span>App version</span><b>0.2.0 · Local creator MVP</b></div></div><div className="notice-panel profile-notice"><Save size={18}/><span>Projects stay on this browser/device. Clearing browser storage or switching devices may remove or hide them. Cloud backup is not configured.</span></div></>}
      </div>
      <footer className="footer"><span>© 2026 ZENVORA STUDIO</span><span>Built for the makers <Sparkles size={12}/></span></footer>
    </main>
    {toast && <div className="toast"><Check size={16}/>{toast}</div>}
  </div>
}

function ProjectCard({ project, onOpen }) {
  const Icon = project.icon === 'image' ? ImageIcon : project.icon === 'story' ? Mic2 : Video
  const count = safeArray(project.scenes).length
  return <button className="project-card" onClick={onOpen}><div className={'project-thumb ' + (project.color || 'violet')}><div className="thumb-shape"/><div className="thumb-icon"><Icon size={23}/></div><span className="thumb-type">{project.type}</span><MoreHorizontal className="thumb-more" size={18}/></div><div className="project-info"><div><b>{project.title}</b><small><Clock3 size={12}/> {count} scenes · {project.updated || 'Saved'}</small></div><span className={'project-status ' + (project.status === 'Ready' ? 'ready' : '')}>{project.status || 'Draft'}</span></div></button>
}

export default App
