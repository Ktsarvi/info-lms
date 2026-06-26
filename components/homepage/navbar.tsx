'use client'

import React from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-primary">Info Academy</span>
          </div>
          
          <div className="hidden md:flex flex-1 items-center justify-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <Button variant="ghost">Sign In</Button>
            <Button>Get Started</Button>
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="px-4 py-4 space-y-3">
            <a href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="block text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <Button variant="ghost" className="w-full justify-start">Sign In</Button>
            <Button className="w-full">Get Started</Button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
