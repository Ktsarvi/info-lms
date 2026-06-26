'use client'

import React from 'react'
import { BookOpen, FileText, TrendingUp, Award, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const Features = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'All courses, all topics',
      description: 'Access our entire library of courses across various subjects and skill levels.'
    },
    {
      icon: CheckCircle2,
      title: 'Lesson tests & quizzes',
      description: 'Test your knowledge with interactive quizzes after each lesson to reinforce learning.'
    },
    {
      icon: FileText,
      title: 'Downloadable PDFs',
      description: 'Download course materials and notes for offline study and reference.'
    },
    {
      icon: TrendingUp,
      title: 'Progress tracking',
      description: 'Track your learning journey with detailed progress reports and achievements.'
    },
    {
      icon: Award,
      title: 'Verified certificates',
      description: 'Earn industry-recognized certificates upon completing courses successfully.'
    }
  ]

  return (
    <section id="features" className="py-28 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            What You <span className="text-primary">Get</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to succeed in your learning journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="hover:border-primary/50 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Features
