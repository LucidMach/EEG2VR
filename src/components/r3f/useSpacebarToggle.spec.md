# useSpacebarToggle.ts

Wires the global Spacebar shortcut to `togglePlayPause`.

**Signature**: `useSpacebarToggle(togglePlayPause: () => void): void`

Ignores the keydown when focus is inside an `<input>`, `<textarea>`, or any
`contenteditable` element, so a space keystroke while typing doesn't
double as a playback toggle.
