import { useState } from 'react'
import toast from 'react-hot-toast'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard'} replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const currentUser = await login(name, pin)
      toast.success(`Welcome, ${currentUser.name}`)
      navigate(currentUser.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard', {
        replace: true,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign in'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-transparent px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-xl shadow-slate-900/10 lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-slate-900 p-8 text-white lg:block">
          <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/30 blur-2xl" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-sky-400/25 blur-2xl" />
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">Granny's Shop SaaS</p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight">Manage stock, sales, and staff from one lightweight dashboard.</h1>
            <ul className="mt-8 space-y-3 text-sm text-slate-200">
              <li>Realtime-style mock workflow</li>
              <li>Role-based admin and staff experience</li>
              <li>Reports, logs, exports, and low-stock alerts</li>
            </ul>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="w-full p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Welcome back</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Sign in to your workspace</h2>
          <p className="mt-1 text-sm text-slate-500">Use your name and PIN to continue.</p>

          <div className="mt-6 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Aisha"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">PIN</span>
              <input
                type="password"
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                placeholder="****"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </label>
          </div>

          {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="mt-4 text-xs text-slate-500">
            Demo accounts: Aisha / 1234, Emeka / 5678, Granny / 0000
          </p>
        </form>
      </div>
    </div>
  )
}
