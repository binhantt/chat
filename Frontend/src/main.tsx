
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './assets/css.css'
import { BrowserRouter } from 'react-router-dom'
import { App as AntdApp } from 'antd'

createRoot(document.getElementById('root')!).render(
  <AntdApp>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AntdApp>
)
