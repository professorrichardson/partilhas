import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="content-shell">
        <Topbar />
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

