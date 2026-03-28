import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '14px',
          borderRadius: '12px',
          border: '1px solid #e4e4e7',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        },
        success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
      }}
    />
  </BrowserRouter>
)