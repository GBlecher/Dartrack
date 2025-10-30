import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Workaround for mobile browser UI reducing visible viewport height.
// Many mobile browsers expose a dynamic viewport where the URL/search
// bar and other chrome can shrink/expand; relying on `100vh` can cause
// layout issues (content under/behind browser chrome). Here we compute
// a CSS variable `--vh` that represents 1% of the *visible* viewport
// height and update it on resize/orientation changes. Use in CSS as:
//   height: calc(var(--vh, 1vh) * 100);
function setVh() {
  try {
    // visualViewport is more accurate on some browsers (excludes on-screen UI)
    const height = window.visualViewport ? window.visualViewport.height : window.innerHeight
    const vh = height * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  } catch {
    // defensive: silently ignore in restricted environments
  }
}

// Initialize and keep in sync.
setVh()
window.addEventListener('resize', setVh)
window.addEventListener('orientationchange', setVh)
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', setVh)
}

// If you want to provide an "Enter fullscreen" button, prefer using a small
// helper module (see `src/utils/viewport.js`) so UI components don't import
// the bootstrap entry and create circular dependencies.

// Entry point: mount React tree into #root. Keep this file minimal so
// it remains easy to reason about bootstrapping and hydration boundaries.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
