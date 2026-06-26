'use client'

import React from 'react'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const Hero = () => {
  return (
    <section className="pt-28 pb-14 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Trusted by 10,000+ learners
            </Badge>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Master any skill with
              <span className="text-primary block">expert-led courses</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10">
              Access unlimited courses, track your progress, and earn verified certificates. 
              Start your learning journey today.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-10">
              <Button size="lg" className="shadow-lg shadow-primary/25">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline">
                View Courses
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">Courses</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">50+</div>
                <div className="text-sm text-muted-foreground">Instructors</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">10K+</div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">4.9</div>
                <div className="text-sm text-muted-foreground">Rating</div>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">What You Get</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium">All courses, all topics</div>
                  <div className="text-sm text-muted-foreground">Access our entire library</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium">Lesson tests & quizzes</div>
                  <div className="text-sm text-muted-foreground">Test your knowledge</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium">Downloadable PDFs</div>
                  <div className="text-sm text-muted-foreground">Offline study materials</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium">Progress tracking</div>
                  <div className="text-sm text-muted-foreground">Track your journey</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium">Verified certificates</div>
                  <div className="text-sm text-muted-foreground">Industry recognition</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
