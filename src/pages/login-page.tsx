import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROLES, DEMO_PASSWORD, type Role } from '@/lib/roles'
import { login } from '@/lib/session'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Role | null>(null)
  const [password, setPassword] = useState(DEMO_PASSWORD)

  const filtered = useMemo(
    () => ROLES.filter((r) => r.label.toLowerCase().includes(query.toLowerCase())),
    [query],
  )

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selected) return
    login(selected)
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-emerald-deep px-4 py-10">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl md:grid md:grid-cols-5">
        <div className="hidden flex-col items-center justify-center gap-6 bg-brand-emerald-deep px-8 py-12 md:col-span-2 md:flex">
          <img src="/brand/logo-dark.jpg" alt="THANGALS" className="w-40 rounded-xl" />
          <p className="font-display text-center text-xl leading-relaxed text-white/80">
            Gold, Jewellery &amp; Bullion
            <br />
            Enterprise Platform
          </p>
          <p className="text-center text-xs text-white/40">United Arab Emirates · AED</p>
        </div>

        <div className="col-span-3 px-6 py-10 sm:px-10">
          <div className="mb-6 flex items-center gap-3 md:hidden">
            <img src="/brand/logo-light.jpg" alt="THANGALS" className="h-12 w-12 rounded-lg" />
            <p className="font-display text-xl font-semibold text-brand-emerald-deep">THANGALS ERP</p>
          </div>

          <h1 className="font-display text-2xl font-semibold text-charcoal">Sign in to your workspace</h1>
          <p className="mt-1 text-sm text-slate-green">
            Select your demo role to preview THANGALS ERP. This is a presentation demo — not a live system.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-green">Role</label>
              <div className="mb-2 flex items-center gap-2 rounded-lg border border-border-soft px-3 py-2">
                <Search className="h-4 w-4 text-slate-green" aria-hidden />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search 24 roles..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-green"
                />
              </div>
              <div className="grid max-h-56 grid-cols-1 gap-1.5 overflow-y-auto rounded-lg border border-border-soft p-2 sm:grid-cols-2">
                {filtered.map((role) => (
                  <button
                    type="button"
                    key={role.id}
                    onClick={() => setSelected(role)}
                    className={`rounded-md border px-3 py-2 text-left text-xs font-medium transition-colors ${
                      selected?.id === role.id
                        ? 'border-brand-emerald bg-nav-selected text-brand-emerald-deep'
                        : 'border-transparent bg-ivory text-charcoal hover:border-border-soft'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-green">
                Password <span className="font-normal text-slate-green/70">(demo password, not real security)</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border-soft px-3 py-2.5 text-sm text-charcoal outline-none focus:border-brand-emerald"
              />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={!selected}>
              Enter dashboard
            </Button>
            {!selected && <p className="text-center text-xs text-slate-green">Pick a role above to continue.</p>}
          </form>
        </div>
      </div>
    </div>
  )
}
