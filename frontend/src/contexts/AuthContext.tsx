import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi, type User } from '../api/auth'

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (token: string, user: User) => void
    logout: () => void
    checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const isAuthenticated = !!user

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
    }

    const checkAuth = async () => {
        const token = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (!token) {
            setUser(null)
            setIsLoading(false)
            return
        }

        // Try to use stored user first for faster initial load
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser))
            } catch {
                // Invalid stored user, will verify with API
            }
        }

        // Verify token is still valid by calling /me endpoint
        try {
            const currentUser = await authApi.getCurrentUser()
            setUser(currentUser)
            localStorage.setItem('user', JSON.stringify(currentUser))
        } catch {
            // Token invalid, clear auth state
            logout()
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        checkAuth()
    }, [])

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                login,
                logout,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
