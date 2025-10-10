import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx' // 👈 App.tsx를 import
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App /> {/* 👈 App 컴포넌트로 변경 */}
  </React.StrictMode>,
)