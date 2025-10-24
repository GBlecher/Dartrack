import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Entry point: mount React tree into #root. Keep this file minimal so
// it remains easy to reason about bootstrapping and hydration boundaries.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
