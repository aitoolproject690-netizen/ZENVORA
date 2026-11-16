# ZENVORA

A mobile-first, dark creative studio built with React + Vite. The current MVP is local-first: project drafts are saved in the browser on the device where they were created.

## Run locally

- Install: npm install
- Start: npm run dev

## Test and build

- Unit tests: npm test
- Production build: npm run build
- Preview: npm run preview

## Implemented in the local creator MVP

- Mobile-first dashboard, project library, create flow, seven-step Studio, and profile
- Device-local project saving, scene edits, cast details, and upload metadata
- Template-based English/Hindi story drafting with genre, audience, tone, and short-form duration controls
- Editable script with plain-text download
- Script-to-storyboard conversion, manual scene editing, camera notes, and per-scene duration
- Procedural SVG scene artwork generated on-device and downloadable per scene
- Voice playback through the browser/Android speech synthesis engine, with available voice, speed, and pitch settings
- Browser canvas video rendering with a capability-detected MP4 or WebM download
- YouTube title, description, tag suggestions, and a link to continue a manual upload in YouTube Studio
- Automated Node.js unit tests and production build checks in GitHub Actions

## Important feature boundaries

This release does not connect to an external large language model. The story generator is a structured template-based writing helper, not an AI LLM.
- SVG artwork is procedural vector art, not an AI image model and not photorealistic image generation.
- Voice preview uses voices installed by the browser/device. It does not create a downloadable narration audio file.
- Video export creates animated scene-card footage from the storyboard. It does not yet add recorded voice, music, imported footage, character animation, or a multitrack editor.
- Export format depends on browser MediaRecorder support. MP4 is offered only when the current browser reports MP4 support; otherwise the browser exports WebM. No server-side FFmpeg conversion is configured.
- YouTube publishing is manual. Automatic publishing requires a verified Google OAuth app and a secure backend token flow, neither of which is configured for this static GitHub Pages app.
- Login, cloud sync, cross-device backup, payments, and remote asset storage are not connected.

## Data and privacy

Projects are stored in this browser's localStorage. They do not sync to another phone or browser. Clearing browser/site data can remove local project drafts. No paid API key is required for the current local creator workflow.

## Deployment

The GitHub Pages workflow runs npm test and npm run build before publishing the dist directory.
