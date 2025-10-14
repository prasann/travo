'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import LoginButton from './LoginButton'

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
    <header className="navbar bg-base-200 shadow-md">
      <div className="container mx-auto">
        <div className="flex-none">
          {showBackButton && (
            <Link href={backHref} className="btn btn-ghost btn-circle">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <div className="flex-none">
          <LoginButton />
        </div>
      </div>
    </header>
  )
}
