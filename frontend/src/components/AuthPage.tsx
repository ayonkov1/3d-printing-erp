import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Loader2, Eye, EyeOff, Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi, type RegisterCredentials } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'

type AuthMode = 'login' | 'register'

interface LoginFormData {
    email: string
    password: string
}

interface RegisterFormData {
    email: string
    password: string
    confirmPassword: string
    full_name: string
}

export function AuthPage() {
    const [mode, setMode] = useState<AuthMode>('login')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const { login } = useAuth()

    const loginForm = useForm<LoginFormData>({
        defaultValues: { email: '', password: '' },
    })

    const registerForm = useForm<RegisterFormData>({
        defaultValues: { email: '', password: '', confirmPassword: '', full_name: '' },
    })

    const handleLogin = async (data: LoginFormData) => {
        setIsLoading(true)
        try {
            const response = await authApi.login(data)
            login(response.access_token, response.user)
            toast.success('Welcome back!')
            navigate('/')
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Login failed'
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRegister = async (data: RegisterFormData) => {
        if (data.password !== data.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        setIsLoading(true)
        try {
            const credentials: RegisterCredentials = {
                email: data.email,
                password: data.password,
                full_name: data.full_name || undefined,
            }
            const response = await authApi.register(credentials)
            login(response.access_token, response.user)
            toast.success('Account created successfully!')
            navigate('/')
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Registration failed'
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    const toggleMode = () => {
        setMode(mode === 'login' ? 'register' : 'login')
        loginForm.reset()
        registerForm.reset()
    }

    return (
        <div className="min-h-screen flex">
            {/* Left side - 3D Printing Image/Illustration */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
                    {/* 3D Printer Icon */}
                    <div className="mb-8 p-6 bg-white/10 rounded-3xl backdrop-blur-sm">
                        <Printer className="w-24 h-24 text-white" strokeWidth={1.5} />
                    </div>

                    <h1 className="text-4xl font-bold mb-4 text-center">
                        3D Printing ERP
                    </h1>
                    <p className="text-xl text-white/80 text-center max-w-md">
                        Manage your filament inventory, track spools, and optimize your 3D printing workflow.
                    </p>

                    {/* Feature highlights */}
                    <div className="mt-12 space-y-4">
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="w-2 h-2 bg-green-400 rounded-full" />
                            <span>Track filament spools & inventory</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="w-2 h-2 bg-green-400 rounded-full" />
                            <span>Manage brands, colors & materials</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="w-2 h-2 bg-green-400 rounded-full" />
                            <span>Barcode scanning support</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                            <Printer className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            3D Printing ERP
                        </h1>
                    </div>

                    {/* Form Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {mode === 'login' ? 'Welcome back' : 'Create account'}
                        </h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            {mode === 'login'
                                ? 'Sign in to access your inventory'
                                : 'Get started with your free account'}
                        </p>
                    </div>

                    {/* Login Form */}
                    {mode === 'login' && (
                        <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    {...loginForm.register('email', { required: true })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="you@example.com"
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        {...loginForm.register('password', { required: true })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign in'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Register Form */}
                    {mode === 'register' && (
                        <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    {...registerForm.register('full_name')}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="John Doe"
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    {...registerForm.register('email', { required: true })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="you@example.com"
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        {...registerForm.register('password', { required: true, minLength: 6 })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Must be at least 6 characters
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    {...registerForm.register('confirmPassword', { required: true })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    'Create account'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Toggle Mode */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
                            >
                                {mode === 'login' ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
