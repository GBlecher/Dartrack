// Small helpers related to viewport / fullscreen behavior.
// keep this module free of React imports so it can be used from any place.

export async function enterAppFullscreen() {
  const el = document.documentElement
  if (el.requestFullscreen) {
    try {
      await el.requestFullscreen()
    } catch {
      // ignore failures — fullscreen is optional and may be blocked by some browsers
    }
  }
}

export function isFullscreenAvailable() {
  return !!document.documentElement.requestFullscreen
}
