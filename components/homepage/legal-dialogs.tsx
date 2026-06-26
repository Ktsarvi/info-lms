'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function PrivacyDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">Privacy</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
          <DialogDescription>
            Your privacy is important to us. Please read our policy carefully.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Course Content Sharing</h3>
            <p className="text-muted-foreground">
              All course materials, including videos, PDFs, quizzes, and other content, are strictly for personal use only. 
              Sharing, distributing, or reproducing course content without explicit written permission is prohibited. 
              Your account may be terminated if you violate this policy.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Data Collection</h3>
            <p className="text-muted-foreground">
              We collect information necessary to provide our services, including your learning progress, quiz results, 
              and account details. We never sell your personal data to third parties.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Account Security</h3>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account credentials. 
              Sharing your account with others is a violation of our terms.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function TermsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">Terms</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
          <DialogDescription>
            By using Info Academy, you agree to these terms and conditions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Course Usage Restrictions</h3>
            <p className="text-muted-foreground">
              All courses and materials provided by Info Academy are for individual, non-commercial use only. 
              You may not share, resell, redistribute, or make available any course content to others. 
              This includes but is not limited to: video downloads, PDF materials, quiz content, and certificates.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Account Terms</h3>
            <p className="text-muted-foreground">
              Each account is for one individual only. Account sharing is strictly prohibited and may result 
              in immediate termination without refund. You must provide accurate information when creating your account.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
