import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.tsx'
import { QueryProvider } from './providers'
import { AuthProvider } from './contexts/AuthContext'
import { AuthPage, ProtectedRoute } from './components'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryProvider>
            <BrowserRouter>
                <AuthProvider>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                borderRadius: '8px',
                                padding: '12px 16px',
                                fontSize: '14px',
                            },
                        }}
                    />
                    <Routes>
                        <Route
                            path="/login"
                            element={<AuthPage />}
                        />
                        <Route
                            path="/*"
                            element={
                                <ProtectedRoute>
                                    <App />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </QueryProvider>
    </StrictMode>,
)
