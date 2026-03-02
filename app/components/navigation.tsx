"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut, Brain, Bell, ThumbsUp, MessageSquare, MoreVertical, UserPlus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "../hooks/useAuth"
import { ThemeToggle } from "./theme-toggle"
import { BiasAuditToggle } from "./BiasAuditToggle"
import { useAppStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthDialogOpen, setAuthDialogOpen } = useAppStore()
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    name: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const { user, signIn, signUp, signOut } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('alert') === 'login_required') {
        setAuthDialogOpen(true)
        toast({
          title: "Authentication Required",
          description: "Please sign in to access that page.",
          variant: "destructive",
        })
        
        // Clean up the URL so it doesn't show again on refresh
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [toast])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let success = false

      if (authMode === "signup") {
        if (!authForm.name.trim()) {
          return
        }
        success = await signUp(authForm.name, authForm.email, authForm.password)
      } else {
        success = await signIn(authForm.email, authForm.password)
      }

      if (success) {
        setAuthDialogOpen(false)
        setIsMenuOpen(false)
        setAuthForm({ email: "", password: "", name: "" })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const switchAuthMode = () => {
    setAuthMode(authMode === "signin" ? "signup" : "signin")
    setAuthForm({ email: "", password: "", name: "" })
  }

  return (
    <nav
      className={`fixed top-0 w-full mb-20 z-50 transition-all duration-300 ${
        scrolled
          ? "glass shadow-sm py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity group">
              <div className="bg-gradient-to-tr from-primary to-[#8e86ff] p-2.5 rounded-xl shadow-[0_0_20px_rgba(108,99,255,0.4)] group-hover:shadow-[0_0_30px_rgba(108,99,255,0.6)] transition-all duration-300">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl md:text-2xl font-bold tracking-tight gradient-text font-syne">TalentRanker.ai</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center">
              <div className="h-6 w-px bg-white/10 mx-2" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 px-3 gap-2 hover:bg-white/5 rounded-lg text-sm text-muted-foreground font-medium">
                    TalentRanker HQ <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 rounded-xl border-border/50 glass p-2">
                  <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Workspaces</div>
                  <DropdownMenuItem className="rounded-lg gap-3 py-2 cursor-pointer bg-primary/10 text-primary">
                    <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center font-bold text-[10px]">TH</div>
                    TalentRanker HQ
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg gap-3 py-2 cursor-pointer hover:bg-white/5">
                    <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center font-bold text-[10px]">ED</div>
                    Engineering Dept
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem className="rounded-lg gap-3 py-2 cursor-pointer hover:bg-white/5 text-primary">
                    <UserPlus className="w-4 h-4" /> Create Workspace
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {[
              { name: "Pipeline", href: "/pipeline" },
              { name: "Analytics", href: "/analytics" },
              { name: "Batch", href: "/batch" },
              { name: "Past Analyses", href: "/past-analyses" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 font-medium transition-all duration-300 font-syne text-sm"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            <BiasAuditToggle 
              enabled={useAppStore(state => state.biasAuditEnabled)} 
              onToggle={useAppStore(state => state.setBiasAuditEnabled)} 
            />
            <div className="h-6 w-px bg-white/10 mx-1" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-white/10">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-[#0a0a0f] animate-pulse" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-2xl border-border/50 glass p-0 overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-white/5">
                  <h3 className="text-sm font-bold font-syne">Notifications</h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {[
                    { id: 1, text: "Jessica upvoted Jake's Resume", time: "2m ago", icon: ThumbsUp, color: "text-emerald-500" },
                    { id: 2, text: "New comment on Sarah's Profile", time: "15m ago", icon: MessageSquare, color: "text-primary" },
                    { id: 3, text: "Batch analysis for Senior DE complete", time: "1h ago", icon: Brain, color: "text-blue-400" },
                  ].map((n) => (
                    <div key={n.id} className="p-4 flex gap-3 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-[#1a1a26] border border-white/5 flex items-center justify-center shrink-0">
                        <n.icon className={`h-4 w-4 ${n.color}`} />
                      </div>
                      <div>
                        <p className="text-xs text-foreground/90 leading-normal">{n.text}</p>
                        <span className="text-[10px] text-muted-foreground mt-1 block">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-white/5">
                  <Button variant="ghost" className="w-full text-xs h-8 text-primary hover:bg-primary/5">View all activity</Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 border-border/50 hover:bg-foreground/5 bg-background/50 backdrop-blur-sm rounded-full pl-2 pr-4 h-10">
                    <div className="w-7 h-7 bg-gradient-to-tr from-primary to-blue-500 rounded-full flex items-center justify-center shadow-inner">
                      <span className="text-white text-xs font-bold">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-sm">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/50 glass">
                  <DropdownMenuItem asChild>
                    <Link href="/workspace" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Workspace
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:bg-destructive/10 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Dialog open={isAuthDialogOpen} onOpenChange={setAuthDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full bg-primary hover:bg-[#8e86ff] text-white shadow-[0_0_20px_rgba(108,99,255,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(108,99,255,0.5)] font-syne">
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] glass border-border/50 shadow-2xl rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold gradient-text">{authMode === "signin" ? "Welcome Back" : "Create Account"}</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      {authMode === "signin"
                        ? "Enter your credentials to access your account."
                        : "Create a new account to get started."}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAuth} className="space-y-5 mt-4">
                    {authMode === "signup" && (
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-foreground/80">Full Name</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          value={authForm.name}
                          onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                          className="bg-background/50 border-border/50 focus:border-primary transition-all rounded-xl"
                          required
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground/80">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={authForm.email}
                        onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                        className="bg-background/50 border-border/50 focus:border-primary transition-all rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground/80">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={authForm.password}
                        onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                        className="bg-background/50 border-border/50 focus:border-primary transition-all rounded-xl"
                        required
                        minLength={6}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11 shadow-lg shadow-primary/25"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Please wait..." : authMode === "signin" ? "Sign In" : "Create Account"}
                    </Button>
                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={switchAuthMode}
                        className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        {authMode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                      </button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <button
              className="p-2 rounded-xl bg-background/50 border border-border/50 text-foreground hover:bg-foreground/5 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 px-2 mt-2 glass rounded-2xl border border-border/50 shadow-xl overflow-hidden animate-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col space-y-1">
              {[
                { name: "Pipeline", href: "/pipeline" },
                { name: "Analytics", href: "/analytics" },
                { name: "Batch", href: "/batch" },
                { name: "Workspace Settings", href: "/workspace" },
                { name: "Past Analyses", href: "/past-analyses" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-3 rounded-xl text-foreground hover:bg-foreground/5 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-3 pb-1 mt-2 border-t border-border/50 px-2">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-2 py-2">
                      <div className="w-10 h-10 bg-gradient-to-tr from-primary to-blue-500 rounded-full flex items-center justify-center shadow-inner">
                        <span className="text-white text-sm font-bold">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                      </div>
                      <span className="font-semibold text-foreground text-lg">{user.name}</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 rounded-xl h-11"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      setAuthDialogOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
