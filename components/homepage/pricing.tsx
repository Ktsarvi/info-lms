"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Monthly",
    price: 19,
    period: "/month",
    description: "Perfect for getting started",
    features: [
      "Access to all courses",
      "Lesson quizzes",
      "Progress tracking",
      "Basic certificates",
    ],
    popular: false,
  },
  {
    name: "Yearly",
    price: 149,
    period: "/year",
    description: "Best value for committed learners",
    features: [
      "Access to all courses",
      "Lesson quizzes",
      "Progress tracking",
      "Verified certificates",
      "Priority support",
      "Downloadable PDFs",
    ],
    popular: true,
    badge: "Save 35%",
  },
];

const Pricing = () => {
  return (
    <section
      id="pricing"
      className="py-24 px-4 sm:px-6 lg:px-8"
      style={{ background: "#F8FAFC" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2
            className="text-4xl sm:text-5xl font-bold mb-3"
            style={{ color: "#1E3A5F" }}
          >
            Simple, transparent{" "}
            <span style={{ color: "#3B82F6" }}>pricing</span>
          </h2>
          <p className="text-base" style={{ color: "#64748B" }}>
            Choose the plan that works best for you
          </p>
        </div>

        <div
          className="max-w-2xl mx-auto mb-8"
          style={{ borderBottom: "1px solid #E2E8F0" }}
        ></div>

        <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="relative rounded-2xl p-8"
              style={{
                background: plan.popular ? "#EFF6FF" : "#fff",
                border: plan.popular
                  ? "2px solid #3B82F6"
                  : "1px solid #E2E8F0",
              }}
            >
              {plan.badge && (
                <span
                  className="absolute -top-3 right-5 text-xs font-semibold text-white px-3 py-1 rounded-full"
                  style={{ background: "#3B82F6" }}
                >
                  {plan.badge}
                </span>
              )}

              <div
                className="text-lg font-semibold mb-1"
                style={{ color: "#1E3A5F" }}
              >
                {plan.name}
              </div>
              <div className="text-sm mb-5" style={{ color: "#64748B" }}>
                {plan.description}
              </div>

              <div className="flex items-baseline gap-1 mb-6">
                <span
                  className="text-5xl font-bold"
                  style={{ color: "#1E3A5F" }}
                >
                  ${plan.price}
                </span>
                <span className="text-sm" style={{ color: "#94A3B8" }}>
                  {plan.period}
                </span>
              </div>

              <ul className="space-y-2.5 mb-7">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm"
                    style={{ color: "#475569" }}
                  >
                    <Check
                      className="w-4 h-4 shrink-0 mt-0.5"
                      style={{ color: "#3B82F6" }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full font-medium"
                style={
                  plan.popular
                    ? { background: "#3B82F6", color: "#fff", border: "none" }
                    : {
                        background: "transparent",
                        color: "#1E3A5F",
                        border: "1px solid #CBD5E1",
                      }
                }
              >
                Get started
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
