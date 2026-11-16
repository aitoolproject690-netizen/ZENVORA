import test from 'node:test'
import assert from 'node:assert/strict'
import { generateStory, scenesFromScript, createSceneArtwork, createUploadMetadata, getDefaultCharacters } from '../src/lib/creator.js'

test('generateStory builds a script, scenes and characters from an idea', () => {
  const result = generateStory({ idea: 'A child discovers a hidden garden', duration: 60 })
  assert.match(result.script, /hidden garden/i)
  assert.ok(result.scenes.length >= 3)
  assert.ok(result.characters.length >= 2)
  assert.ok(result.scenes.every(scene => scene.visualPrompt && scene.narration))
})

test('generateStory refuses an empty premise', () => {
  assert.throws(() => generateStory({ idea: '   ' }), /Add an idea/)
})

test('Hindi mode returns Hindi cast and script heading', () => {
  const result = generateStory({ idea: 'एक जादुई पेड़', language: 'Hindi' })
  assert.match(result.script, /कहानी:/)
  assert.equal(result.characters[0].name, 'आरव')
})

test('scenesFromScript turns paragraphs into editable storyboard items', () => {
  const scenes = scenesFromScript('SCENE 1 — Opening\nNARRATION: A bright morning.\n\nSCENE 2 — Discovery\nNARRATION: A door opens.')
  assert.equal(scenes.length, 2)
  assert.match(scenes[0].narration, /bright morning/)
})

test('createSceneArtwork returns a valid SVG document with escaped text', () => {
  const svg = createSceneArtwork({ title: '<script>', visualPrompt: 'A & B' }, 0)
  assert.match(svg, /^<svg/)
  assert.match(svg, /&lt;script&gt;/)
  assert.match(svg, /A &amp; B/)
})

test('upload metadata stays within YouTube title length', () => {
  const metadata = createUploadMetadata({ title: 'A'.repeat(180), prompt: 'Test' })
  assert.ok(metadata.title.length <= 95)
  assert.ok(metadata.description.includes('ZENVORA'))
  assert.ok(metadata.tags.length > 0)
})

test('default character suggestions are available in Hindi and English', () => {
  assert.equal(getDefaultCharacters('Hindi')[0].name, 'आरव')
  assert.equal(getDefaultCharacters('English')[0].name, 'Aarav')
})
