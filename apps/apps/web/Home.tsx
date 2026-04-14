import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { BarChart3, Users, FileText, Zap, Lock, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Africount</span>
          </div>
          <Button onClick={() => (window.location.href = getLoginUrl())}>
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Enterprise Financial Management
          <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Made Elegant
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Africount is a sophisticated multi-tenant bookkeeping platform designed for teams that demand precision, collaboration, and beautiful design.
        </p>
        <Button
          onClick={() => (window.location.href = getLoginUrl())}
          className="px-8 py-3 text-lg"
        >
          Get Started
        </Button>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Powerful Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: BarChart3,
              title: "Balance Sheets",
              description:
                "Create comprehensive balance sheets with separate import for assets, liabilities, and equity with automatic calculations.",
            },
            {
              icon: Users,
              title: "Team Collaboration",
              description:
                "Work together seamlessly with inline comments, activity feeds, and real-time updates across your team.",
            },
            {
              icon: FileText,
              title: "Data Import",
              description:
                "Import CSV and Excel files with intelligent field mapping, validation, and duplicate detection.",
            },
            {
              icon: Zap,
              title: "Auto-Calculations",
              description:
                "Create custom computing tables with formula-based calculations for cost and revenue tracking.",
            },
            {
              icon: Lock,
              title: "Role-Based Access",
              description:
                "Granular permission control at the module level with admin, manager, and agent roles.",
            },
            {
              icon: Globe,
              title: "Multi-Tenant",
              description:
                "Manage multiple organizations and workspaces with complete data isolation and security.",
            },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-xl bg-white border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <Icon className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Finances?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join teams worldwide using Africount for elegant, powerful financial management.
          </p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            Start Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2026 Africount. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
