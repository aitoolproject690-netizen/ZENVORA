const clamp = (n, min, max) => Math.min(max, Math.max(min, n))
const clean = (value, fallback = '') => String(value ?? '').trim() || fallback

export function generateStory({ idea, genre = 'Adventure', audience = 'General', language = 'English', tone = 'Hopeful', duration = 60 } = {}) {
  const premise = clean(idea)
  if (!premise) throw new Error('Add an idea before generating a story.')
  const seconds = clamp(Number(duration) || 60, 15, 600)
  const sceneCount = clamp(Math.ceil(seconds / 12), 3, 12)
  const title = premise.split(/[.!?\n]/)[0].slice(0, 54) || 'A New Beginning'
  const isHindi = /^hi|hindi/i.test(language)
  const arcEn = [
    ['The Spark', 'A small detail reveals that something is not as ordinary as it seems.', 'The main character notices the first clue and decides not to ignore it.'],
    ['The First Step', 'A difficult choice turns the idea into a real journey.', 'A trusted companion offers a different point of view.'],
    ['The Turning Point', 'The first plan fails, forcing the characters to rethink what matters.', 'A surprising discovery changes the direction of the story.'],
    ['The Choice', 'The stakes become personal and the central character must act with courage.', 'The team combines its strengths and faces the biggest obstacle.'],
    ['The New Dawn', 'The story resolves with a meaningful change and a hopeful final image.', 'The characters understand what they have learned and what comes next.']
  ]
  const arcHi = [
    ['एक नई शुरुआत', 'एक छोटी-सी बात से पता चलता है कि सब कुछ वैसा नहीं है जैसा दिखता है।', 'मुख्य किरदार पहला सुराग देखता है और उसे अनदेखा नहीं करने का फैसला करता है।'],
    ['पहला कदम', 'एक मुश्किल फैसला इस विचार को असली सफर में बदल देता है।', 'एक साथी उसे एक नया नजरिया देता है।'],
    ['बदलाव का मोड़', 'पहली कोशिश सफल नहीं होती और सभी को अपनी योजना बदलनी पड़ती है।', 'एक अनपेक्षित खोज कहानी की दिशा बदल देती है।'],
    ['हिम्मत का फैसला', 'अब दांव व्यक्तिगत हैं और मुख्य किरदार को साहस दिखाना पड़ता है।', 'सभी अपनी ताकत मिलाकर सबसे बड़ी चुनौती का सामना करते हैं।'],
    ['नई सुबह', 'कहानी एक सार्थक बदलाव और उम्मीद भरे दृश्य के साथ पूरी होती है।', 'किरदार समझते हैं कि उन्होंने क्या सीखा और आगे क्या करना है।']
  ]
  const arc = isHindi ? arcHi : arcEn
  const cast = isHindi
    ? [
        { id: 'hero', name: 'आरव', role: 'मुख्य किरदार', description: 'जिज्ञासु, दयालु और मुश्किल समय में हिम्मत दिखाने वाला।' },
        { id: 'ally', name: 'मीरा', role: 'साथी', description: 'समझदार, रचनात्मक और समाधान खोजने में माहिर।' },
        { id: 'guide', name: 'कबीर', role: 'मार्गदर्शक', description: 'अनुभवी और शांत, जो सही सवाल पूछता है।' }
      ]
    : [
        { id: 'hero', name: 'Aarav', role: 'Protagonist', description: 'Curious, kind, and brave when the moment matters.' },
        { id: 'ally', name: 'Mira', role: 'Companion', description: 'Resourceful, thoughtful, and quick to find a new angle.' },
        { id: 'guide', name: 'Kabir', role: 'Guide', description: 'Calm and experienced, with a talent for asking the right question.' }
      ]
  const scenes = Array.from({ length: sceneCount }, (_, index) => {
    const beat = arc[index % arc.length]
    const secondsPerScene = clamp(Math.round(seconds / sceneCount), 4, 12)
    const narrative = isHindi
      ? premise + ' ' + beat[1] + ' ' + beat[2]
      : premise + '. ' + beat[1] + ' ' + beat[2]
    const dialogue = isHindi
      ? index === 0 ? 'आरव: "यह संयोग नहीं हो सकता। हमें इसकी सच्चाई पता करनी होगी।"' : index === sceneCount - 1 ? 'मीरा: "हमने साथ मिलकर रास्ता खोज लिया।"' : 'कबीर: "जल्दबाजी मत करो। ध्यान से देखो, जवाब यहीं है।"'
      : index === 0 ? 'Aarav: "This cannot be a coincidence. We need to find out why."' : index === sceneCount - 1 ? 'Mira: "We found our way by working together."' : 'Kabir: "Slow down. Look closely; the answer is already here."'
    return {
      id: 'scene-' + (index + 1),
      title: beat[0],
      duration: secondsPerScene,
      shot: ['Wide establishing shot', 'Medium character shot', 'Close-up detail', 'Tracking shot', 'Final cinematic wide'][index % 5],
      action: beat[2],
      narration: narrative,
      dialogue,
      visualPrompt: genre + ' scene, ' + tone.toLowerCase() + ' mood, ' + beat[0].toLowerCase() + ': ' + premise + '. Cinematic composition, clear subject, rich lighting, polished 2D illustration.'
    }
  })
  const heading = isHindi ? 'कहानी: ' + title : 'Title: ' + title
  const script = [
    heading,
    (isHindi ? 'शैली' : 'Genre') + ': ' + genre + ' | ' + (isHindi ? 'दर्शक' : 'Audience') + ': ' + audience + ' | ' + (isHindi ? 'मूड' : 'Tone') + ': ' + tone,
    ...scenes.map((scene, index) => (isHindi ? 'दृश्य ' : 'SCENE ') + (index + 1) + ' — ' + scene.title + '\n' + (isHindi ? 'वर्णन' : 'NARRATION') + ': ' + scene.narration + '\n' + scene.dialogue + '\n' + (isHindi ? 'दृश्य निर्देश' : 'VISUAL') + ': ' + scene.visualPrompt)
  ].join('\n\n')
  return {
    title,
    logline: isHindi ? premise + ' — ' + tone.toLowerCase() + ' अंदाज में एक ' + genre.toLowerCase() + ' कहानी।' : premise + ' — a ' + tone.toLowerCase() + ' ' + genre.toLowerCase() + ' story for ' + audience.toLowerCase() + ' audiences.',
    script,
    scenes,
    characters: cast,
    language,
    generatedAt: new Date().toISOString()
  }
}

export function scenesFromScript(script, fallbackIdea = 'A new story') {
  const text = clean(script)
  if (!text) return []
  const blocks = text.split(/\n\s*\n/).map(part => part.trim()).filter(Boolean)
  const contentBlocks = blocks.filter(block => !/^(title:|कहानी:|genre:|शैली)/i.test(block))
  const source = contentBlocks.length ? contentBlocks : [text]
  return source.slice(0, 12).map((block, index) => {
    const lines = block.split('\n').map(line => line.trim()).filter(Boolean)
    const first = lines[0] || 'Scene ' + (index + 1)
    const title = first.replace(/^(scene|दृश्य)\s*\d*\s*[—:-]?\s*/i, '').slice(0, 72) || 'Scene ' + (index + 1)
    const narrationLine = lines.find(line => /^(narration|वर्णन)\s*:/i.test(line))
    const visualLine = lines.find(line => /^(visual|दृश्य निर्देश)\s*:/i.test(line))
    const dialogueLine = lines.find(line => /[:：]/.test(line) && line !== first && !/^(visual|दृश्य निर्देश|narration|वर्णन)/i.test(line))
    const narration = narrationLine ? narrationLine.replace(/^[^:：]+:\s*/, '') : lines.slice(1).join(' ')
    return {
      id: 'scene-' + Date.now() + '-' + index,
      title,
      duration: 4,
      shot: 'Cinematic medium shot',
      action: narration || clean(fallbackIdea),
      narration: narration || clean(fallbackIdea),
      dialogue: dialogueLine || '',
      visualPrompt: visualLine ? visualLine.replace(/^[^:：]+:\s*/, '') : ('Illustrated scene showing: ' + title + '. ' + narration).slice(0, 500)
    }
  })
}

function xml(value) {
  return String(value ?? '').replace(/[<>&'"]/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[char]))
}

export function createSceneArtwork(scene = {}, index = 0) {
  const palettes = [
    ['#21164a', '#ec4899', '#7c3aed'],
    ['#0c3c56', '#38bdf8', '#2563eb'],
    ['#43200f', '#fb923c', '#be185d'],
    ['#143b33', '#34d399', '#0f766e'],
    ['#38213f', '#c084fc', '#db2777']
  ]
  const palette = palettes[index % palettes.length]
  const dark = palette[0], glow = palette[1], accent = palette[2]
  const heading = xml(clean(scene.title, 'Scene ' + (index + 1)).slice(0, 42))
  const subtitle = xml(clean(scene.visualPrompt || scene.action, 'A cinematic story moment').slice(0, 90))
  const seed = (index + 3) * 29
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" role="img" aria-label="' + heading + '">' +
  '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="' + dark + '"/><stop offset="1" stop-color="#090a12"/></linearGradient><radialGradient id="sun"><stop stop-color="' + glow + '" stop-opacity=".95"/><stop offset="1" stop-color="' + glow + '" stop-opacity="0"/></radialGradient><linearGradient id="ground"><stop stop-color="' + accent + '" stop-opacity=".9"/><stop offset="1" stop-color="' + dark + '"/></linearGradient></defs>' +
  '<rect width="1280" height="720" fill="url(#bg)"/><circle cx="' + (850 + seed) + '" cy="230" r="260" fill="url(#sun)"/>' +
  '<path d="M0 520 Q210 ' + (390 + seed) + ' 430 520 T850 500 T1280 460 V720 H0Z" fill="url(#ground)" opacity=".78"/>' +
  '<path d="M0 610 Q240 510 490 615 T980 590 T1280 560 V720 H0Z" fill="#080912" opacity=".66"/>' +
  '<circle cx="170" cy="125" r="3" fill="#fff" opacity=".9"/><circle cx="310" cy="205" r="2" fill="#fff" opacity=".7"/><circle cx="1080" cy="100" r="3" fill="#fff" opacity=".8"/>' +
  '<g opacity=".8" transform="translate(' + (640 + seed) + ',445)"><circle cx="0" cy="-56" r="32" fill="' + glow + '"/><path d="M-54 112 Q-50 -12 0 -8 Q50 -12 54 112Z" fill="#10111c"/><path d="M-36 20 Q0 2 36 20" stroke="' + glow + '" stroke-width="6" fill="none" opacity=".8"/></g>' +
  '<rect x="68" y="70" width="1144" height="580" rx="28" fill="none" stroke="#ffffff" stroke-opacity=".13" stroke-width="2"/>' +
  '<text x="100" y="535" fill="#fff" font-family="Arial,sans-serif" font-size="48" font-weight="700">' + heading + '</text>' +
  '<text x="102" y="585" fill="#eee8ff" fill-opacity=".82" font-family="Arial,sans-serif" font-size="22">' + subtitle + '</text>' +
  '<text x="102" y="625" fill="#fff" fill-opacity=".55" font-family="Arial,sans-serif" font-size="14" letter-spacing="4">ZENVORA • STORY FRAME ' + String(index + 1).padStart(2, '0') + '</text></svg>'
}

export function downloadBlob(blob, filename) {
  if (typeof document === 'undefined' || !blob) throw new Error('Download is not available in this environment.')
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export function getVideoMimeType() {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return null
  const candidates = [
    ['video/mp4;codecs=avc1.42E01E', 'mp4'],
    ['video/mp4', 'mp4'],
    ['video/webm;codecs=vp9', 'webm'],
    ['video/webm;codecs=vp8', 'webm'],
    ['video/webm', 'webm']
  ]
  return candidates.find(candidate => MediaRecorder.isTypeSupported(candidate[0])) || null
}

function drawFrame(ctx, scene, index, elapsed, width, height, sceneImage = null) {
  const hues = [265, 205, 28, 155, 320]
  const hue = hues[index % hues.length]
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, 'hsl(' + hue + ' 48% 17%)')
  gradient.addColorStop(1, 'hsl(' + ((hue + 65) % 360) + ' 58% 6%)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  if (sceneImage) {
    const scale = Math.max(width / sceneImage.width, height / sceneImage.height)
    const drawWidth = sceneImage.width * scale
    const drawHeight = sceneImage.height * scale
    ctx.drawImage(sceneImage, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight)
    const shade = ctx.createLinearGradient(0, height * 0.42, 0, height)
    shade.addColorStop(0, 'rgba(5,5,12,0)')
    shade.addColorStop(1, 'rgba(5,5,12,.88)')
    ctx.fillStyle = shade
    ctx.fillRect(0, 0, width, height)
  }
  const pulse = 0.84 + Math.sin(elapsed / 650) * 0.08
  const glow = ctx.createRadialGradient(width * 0.73, height * 0.31, 8, width * 0.73, height * 0.31, width * 0.42)
  glow.addColorStop(0, 'hsla(' + (hue + 35) + ', 95%, 70%, .8)')
  glow.addColorStop(1, 'hsla(' + (hue + 35) + ', 95%, 50%, 0)')
  ctx.globalAlpha = pulse
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, height)
  ctx.globalAlpha = 1
  ctx.fillStyle = 'rgba(255,255,255,.08)'
  ctx.beginPath()
  ctx.arc(width * 0.73, height * 0.31, 110 + 8 * Math.sin(elapsed / 500), 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,.82)'
  ctx.font = '600 20px Arial'
  ctx.fillText('ZENVORA  /  SCENE ' + String(index + 1).padStart(2, '0'), 64, 80)
  ctx.fillStyle = '#ffffff'
  ctx.font = '700 54px Arial'
  ctx.fillText(clean(scene.title, 'Scene ' + (index + 1)).slice(0, 34), 64, height * 0.67)
  ctx.fillStyle = 'rgba(255,255,255,.82)'
  ctx.font = '26px Arial'
  const words = clean(scene.narration || scene.action || scene.visualPrompt, '').split(/\s+/)
  let line = ''
  let y = height * 0.75
  for (const word of words) {
    const candidate = line + word + ' '
    if (ctx.measureText(candidate).width > width - 128 && line) {
      ctx.fillText(line.trim(), 64, y)
      line = word + ' '
      y += 38
      if (y > height - 48) break
    } else line = candidate
  }
  if (line && y <= height - 48) ctx.fillText(line.trim(), 64, y)
  ctx.fillStyle = 'rgba(255,255,255,.55)'
  ctx.font = '18px Arial'
  ctx.fillText('CREATED WITH ZENVORA STUDIO', 64, height - 46)
}

export async function renderStoryboardVideo(scenes, { secondsPerScene = 3, fps = 24 } = {}) {
  if (!Array.isArray(scenes) || !scenes.length) throw new Error('Add at least one storyboard scene before exporting.')
  const sceneImages = await Promise.all(scenes.map(scene => {
    if (!scene.imageDataUrl) return Promise.resolve(null)
    return new Promise(resolve => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => resolve(null)
      image.src = scene.imageDataUrl
    })
  }))
  if (typeof document === 'undefined' || typeof MediaRecorder === 'undefined') throw new Error('This browser does not support video recording.')
  const supported = getVideoMimeType()
  if (!supported) throw new Error('This browser does not report a supported MP4 or WebM recording format.')
  const canvas = document.createElement('canvas')
  canvas.width = 1280
  canvas.height = 720
  const ctx = canvas.getContext('2d')
  if (!ctx || typeof canvas.captureStream !== 'function') throw new Error('Canvas video capture is not supported by this browser.')
  const stream = canvas.captureStream(fps)
  const recorder = new MediaRecorder(stream, { mimeType: supported[0], videoBitsPerSecond: 4000000 })
  const chunks = []
  const stopped = new Promise((resolve, reject) => {
    recorder.onstop = () => resolve()
    recorder.onerror = event => reject(event.error || new Error('Video recording failed.'))
  })
  recorder.ondataavailable = event => { if (event.data && event.data.size) chunks.push(event.data) }
  recorder.start(250)
  try {
    for (let index = 0; index < scenes.length; index += 1) {
      const started = performance.now()
      const length = clamp(Number(scenes[index].duration) || secondsPerScene, 2, 12) * 1000
      while (performance.now() - started < length) {
        drawFrame(ctx, scenes[index], index, performance.now() - started, canvas.width, canvas.height, sceneImages[index])
        await new Promise(resolve => requestAnimationFrame(resolve))
      }
    }
    recorder.stop()
    await stopped
  } catch (error) {
    if (recorder.state !== 'inactive') recorder.stop()
    await stopped.catch(() => {})
    stream.getTracks().forEach(track => track.stop())
    throw error
  }
  stream.getTracks().forEach(track => track.stop())
  return { blob: new Blob(chunks, { type: supported[0] }), extension: supported[1], mimeType: supported[0] }
}

export function createUploadMetadata(project = {}) {
  const title = clean(project.title || project.prompt, 'Untitled ZENVORA story').slice(0, 95)
  const description = [clean(project.logline, clean(project.prompt, 'A story created in ZENVORA Studio.')), '', 'Created with ZENVORA Studio.', '#ZENVORA #CreativeStudio'].join('\n')
  return { title, description, tags: ['ZENVORA', 'storytelling', 'creative studio', 'short film'] }
}

export function getDefaultCharacters(language = 'English') {
  const hindi = /^hi|hindi/i.test(language)
  return hindi
    ? [{ id: 'hero', name: 'आरव', role: 'मुख्य किरदार', description: 'जिज्ञासु और साहसी' }, { id: 'ally', name: 'मीरा', role: 'साथी', description: 'समझदार और रचनात्मक' }]
    : [{ id: 'hero', name: 'Aarav', role: 'Protagonist', description: 'Curious and brave' }, { id: 'ally', name: 'Mira', role: 'Companion', description: 'Thoughtful and resourceful' }]
}
