
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './assets/css.css'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
   <BrowserRouter>
      <App />
    </BrowserRouter>
)
