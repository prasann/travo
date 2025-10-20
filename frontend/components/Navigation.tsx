'use client'

import Link from 'next/link'
import { ArrowLeft, Menu } from 'lucide-react'
import LoginButton from './LoginButton'
import { SyncStatus } from './SyncStatus'
import { SettingsMenu } from './SettingsMenu'
import { ThemeToggle } from './ThemeToggle'

export interface NavigationProps {
  title: string
  showBackButton?: boolean
  backHref?: string
}

export function Navigation({ 
  title, 
  showBackButton = false,
  backHref = '/'
}: NavigationProps) {
  return (
    <div className="navbar bg-base-200 shadow-md">
      <div className="navbar-start">
        {showBackButton && (
          <Link href={backHref} className="btn btn-ghost btn-circle">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}
        <span className="text-xl font-bold ml-2">{title}</span>
      </div>
      
      <div className="navbar-end">
        <SyncStatus />
        <ThemeToggle />
        <SettingsMenu />
        
        {/* Desktop: Show full login button */}
        <div className="hidden sm:flex">
          <LoginButton />
        </div>
        
        {/* Mobile: Show dropdown menu */}
        <div className="dropdown dropdown-end sm:hidden">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <Menu className="h-5 w-5" />
          </div>
          <ul tabIndex={0} className="menu dropdown-content bg-base-200 rounded-box z-[1] mt-3 w-52 p-2 shadow">
            <li>
              <LoginButton />
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
