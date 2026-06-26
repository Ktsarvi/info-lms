'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const Pricing = () => {
  const plans = [
    {
      name: 'Monthly',
      price: 19,
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        'Access to all courses',
        'Lesson quizzes',
        'Progress tracking',
        'Basic certificates'
      ],
      popular: false,
      badge: null
    },
    {
      name: 'Yearly',
      price: 149,
      period: '/year',
      description: 'Best value for committed learners',
      features: [
        'Access to all courses',
        'Lesson quizzes',
        'Progress tracking',
        'Verified certificates',
        'Priority support',
        'Downloadable PDFs'
      ],
      popular: true,
      badge: 'Save 35%'
    }
  ]

  return (
    <section id="pricing" className="py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Simple, transparent <span className="text-primary">pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works best for you
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative transition-all hover:shadow-lg ${
                plan.popular ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
              }`}
            >
              {plan.badge && (
                <Badge className="absolute -top-2 right-6">{plan.badge}</Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-5xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-primary mr-3 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'secondary'}
                >
                  Get started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Pricing
