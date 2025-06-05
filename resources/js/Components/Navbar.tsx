import { type User } from '@/types'
import { Link, router } from '@inertiajs/react'
import React, { useEffect, useState } from 'react'
import { UserCircleIcon, MoonIcon, SunIcon } from '@heroicons/react/24/solid'
import axios from 'axios'

interface Props {
  user: User
}

export default function Navbar ({ user }: Props): JSX.Element {
  const [activeModal, setActiveModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState<'corporate' | 'dark'>('corporate')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'corporate' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    } else {
      document.documentElement.setAttribute('data-theme', 'corporate')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'corporate' ? 'dark' : 'corporate'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.get(`/task-search?q=${encodeURIComponent(searchTerm)}`)
      setSearchResults(res.data)
      setShowResults(true)
    } catch {
      setSearchResults([])
      setShowResults(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="navbar bg-base-100 shadow-md z-10 sticky top-0">
        <div className="flex-1">
          {!route().current('web.page.home')
            ? <a className="btn btn-ghost text-xl" onClick={() => router.get('/home')}>Kanbanboard</a>
            : <a className="btn btn-ghost text-xl">Kanbanboard</a>
          }
        </div>

        {/* Zone de recherche */}
        <div className="flex-none">
          <form onSubmit={handleSearch} className="flex items-center mr-4 relative">
            <input
              type="text"
              placeholder="Recherche tâche..."
              className="input input-bordered w-48"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setShowResults(true)}
              autoComplete="off"
            />
            <button type="submit" className="btn ml-2 btn-primary btn-sm" disabled={loading}>
              {loading ? '...' : '🔍'}
            </button>
            {showResults && searchTerm && (
              <div className="absolute top-12 left-0 bg-base-100 shadow-lg z-20 w-full max-h-60 overflow-auto rounded-box">
                {loading && <div className="p-2">Recherche...</div>}
                {!loading && searchResults.length === 0 && <div className="p-2">Aucun résultat</div>}
                {!loading && searchResults.map((task, idx) => (
                  <div key={idx} className="p-2 border-b last:border-b-0">
                    <span className="font-bold">{task._source?.title}</span>
                    <p className="text-xs text-gray-500">{task._source?.description}</p>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Bouton thème */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-circle mr-2"
          aria-label="Toggle Dark/Light theme"
          title={theme === 'corporate' ? 'Passer en mode sombre' : 'Passer en mode clair'}
        >
          {theme === 'corporate'
            ? <MoonIcon className="h-5 w-5 text-gray-700" />
            : <SunIcon className="h-5 w-5 text-yellow-400" />}
        </button>

        {/* Menu utilisateur */}
        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost avatar">
              <p>{user.name}</p>
              <div className="w-10 rounded-full">
                <UserCircleIcon />
              </div>
            </div>
            <ul className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><Link href={route('profile.edit')} as="button">Profile</Link></li>
              {!route().current('web.page.home') && (
                <li><Link href={route('web.page.home')} as="button">Home</Link></li>
              )}
              <li><Link href={route('logout')} method="post" as="button">Logout</Link></li>
              <li><Link href={route('about')} as="button">About</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
