import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, LayoutDashboard, MessageSquare, PhoneCall, Users } from "lucide-react";

// export const dynamic = "force-dynamic"

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center overflow-x-hidden selection:bg-primary/30">
      {/* Dynamic Backgrounds */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-primary/20 via-transparent to-transparent -z-10 blur-3xl rounded-full" />
      <div className="absolute top-40 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-orange-400/10 via-transparent to-transparent -z-10 blur-3xl rounded-full" />

      <div className="flex-1 w-full flex flex-col items-center">
        {/* Navigation */}
        <nav className="w-full flex justify-center border-b border-b-slate-200/50 dark:border-b-slate-800/50 h-16 bg-white/50 dark:bg-slate-950/50 backdrop-blur-lg sticky top-0 z-50">
          <div className="w-full max-w-6xl flex justify-between items-center px-6 text-sm">
            <div className="font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <Link href={"/"} className="text-lg tracking-tight">System<span className="text-primary">CRM</span></Link>
            </div>
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              {hasEnvVars ? (
                <Suspense fallback={<div className="h-8 w-20 animate-pulse bg-slate-200 dark:bg-slate-800 rounded"></div>}>
                  <AuthButton />
                </Suspense>
              ) : null}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="w-full max-w-6xl px-6 py-24 md:py-32 flex flex-col items-center text-center gap-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-medium border border-orange-200 dark:border-orange-500/20">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            V2.0 is now live
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight text-slate-900 dark:text-slate-50">
            The modern CRM built for <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent pb-2">ultimate velocity.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl text-balance">
            Unify your customer data, automate tasks, and handle omnichannel communication all from a single, beautiful ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <Link
              href="/auth/sign-up"
              className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 group shadow-lg shadow-orange-500/20"
            >
              Start for free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="px-8 py-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Explore Features
            </Link>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="w-full max-w-6xl px-6 py-20">
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need to grow.</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Powerful un-opinionated tools to build the workflow that matches your team.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-auto md:auto-rows-[300px]">
            {/* Feature 1 - Large Feature */}
            <div className="md:col-span-2 relative group overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-md transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/20 rounded-xl flex items-center justify-center mb-6 relative z-10">
                <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 relative z-10">Lead 360 Profile</h3>
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md relative z-10">Track the entire customer journey, from the first touchpoint to conversion. Deep analytics and history in one timeline.</p>

              {/* Decorative element */}
              <div className="hidden md:flex absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-48 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-tl-xl shadow-2xl p-4 flex-col gap-3 group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform duration-500">
                <div className="w-full h-8 bg-slate-200 dark:bg-slate-800 rounded object-cover" />
                <div className="w-3/4 h-8 bg-slate-100 dark:bg-slate-800/50 rounded" />
                <div className="w-1/2 h-8 bg-slate-100 dark:bg-slate-800/50 rounded" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative group overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-md transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 relative z-10">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 relative z-10">Omnichannel Inbox</h3>
              <p className="text-slate-600 dark:text-slate-400 relative z-10">Respond to SMS, WhatsApp, and Emails all in the same unified conversation thread.</p>
            </div>

            {/* Feature 3 */}
            <div className="relative group overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-md transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 relative z-10">
                <PhoneCall className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 relative z-10">Visual IVR Builder</h3>
              <p className="text-slate-600 dark:text-slate-400 relative z-10">Drag and drop nodes to create intelligent call routing and automated voice bots.</p>
            </div>

            {/* Feature 4 - Sub Feature */}
            <div className="md:col-span-2 relative group overflow-hidden rounded-3xl bg-slate-900 dark:bg-slate-100 border border-slate-800 dark:border-slate-200 p-8 shadow-sm hover:shadow-md transition-all text-white dark:text-slate-900 flex flex-col justify-center">
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.2)_50%,transparent_75%,transparent_100%)] bg-[length:40px_40px]"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                <div>
                  <h3 className="text-3xl font-bold mb-3">Ready to transform your sales?</h3>
                  <p className="text-slate-300 dark:text-slate-700 text-lg max-w-sm">Join forward-thinking teams using our platform to close more leads.</p>
                </div>
                <Link href="/auth/login" className="px-8 py-3 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold hover:scale-105 transition-transform whitespace-nowrap shadow-xl">
                  Get Started Today
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full flex items-center justify-between border-t border-slate-200 dark:border-slate-800 max-w-6xl mx-auto px-6 text-sm text-slate-500 py-8">
          <p>© 2026 SystemCRM. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Terms of Service</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
