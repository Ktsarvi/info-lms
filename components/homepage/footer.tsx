'use client'

import React from 'react'
import { PrivacyDialog, TermsDialog } from './legal-dialogs'

const Footer = () => {
  return (
    <footer className="py-28 px-4 sm:px-6 lg:px-8 bg-muted/30 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-primary">Info Academy</span>
          </div>

          <div className="flex items-center space-x-2">
            <PrivacyDialog />
            <TermsDialog />
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
              Contact
            </a>
          </div>

          <div className="text-sm text-muted-foreground">
            © 2026 Info Academy. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
