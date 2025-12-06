import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
