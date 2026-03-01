"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Users, 
  Settings, 
  CreditCard, 
  UserPlus, 
  Mail, 
  Shield, 
  MoreVertical,
  Trash2,
  CheckCircle2,
  Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navigation from "@/app/components/navigation"
import { useAuth } from "@/app/hooks/useAuth"

const MOCK_MEMBERS = [
  { id: 1, name: "Aryan Seth", email: "aryan@talentranker.ai", role: "Owner", status: "Active" },
  { id: 2, name: "Jessica Chen", email: "jessica@talentranker.ai", role: "Admin", status: "Active" },
  { id: 3, name: "Michael Ross", email: "michael@talentranker.ai", role: "Member", status: "Away" },
  { id: 4, name: "Sarah Miller", email: "sarah@talentranker.ai", role: "Member", status: "Active" },
]

export default function WorkspacePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("members")

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* SVG Noise Texture */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

      {/* Ambient Glow */}
      <div className="ambient-glow bg-primary top-[-10%] left-[-10%] animate-drift" />
      <div className="ambient-glow bg-secondary bottom-[-10%] right-[-10%] animate-drift-reverse" />

      <Navigation />

      <main className="container mx-auto px-10 pt-32 pb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-10"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold font-syne tracking-tight">Workspace <span className="gradient-text">Settings</span></h1>
                <Badge className="bg-primary/20 text-primary border-primary/30 uppercase text-[10px] tracking-widest font-bold">Pro Plan</Badge>
              </div>
              <p className="text-muted-foreground text-lg">Manage your team, roles, and workspace preferences.</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 h-12 px-6 rounded-xl font-syne">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            {/* Sidebar Controls */}
            <Card className="glass-card shadow-lg border-0 bg-transparent h-fit overflow-hidden">
              <CardContent className="p-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="flex flex-col w-full h-full">
                  <TabsList className="flex flex-col bg-transparent h-full items-start justify-start p-0">
                    <TabsTrigger value="members" className="w-full justify-start gap-3 h-12 px-4 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all">
                      <Users className="w-4 h-4" /> Members
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="w-full justify-start gap-3 h-12 px-4 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all">
                      <Settings className="w-4 h-4" /> General Settings
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="w-full justify-start gap-3 h-12 px-4 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all">
                      <CreditCard className="w-4 h-4" /> Billing & Plan
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="w-full justify-start gap-3 h-12 px-4 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all">
                      <Activity className="w-4 h-4" /> Audit Log
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Content Area */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {activeTab === "members" && (
                  <motion.div
                    key="members"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <Card className="glass-card shadow-lg border-0 bg-transparent overflow-hidden">
                      <CardHeader className="border-b border-white/5 pb-4">
                        <CardTitle className="font-syne">Workspace Members</CardTitle>
                        <CardDescription>All people with access to this workspace.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-white/5">
                          {MOCK_MEMBERS.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center font-bold text-sm text-white border border-white/10">
                                  {member.name.split(" ").map(n => n[0]).join("")}
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground/90">{member.name}</p>
                                  <p className="text-xs text-muted-foreground">{member.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="hidden md:block text-right">
                                  <Badge variant="outline" className={`bg-transparent border-white/10 text-xs ${member.role === 'Owner' ? 'text-primary border-primary/30' : 'text-muted-foreground'}`}>
                                    {member.role}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${member.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                  <span className="text-xs text-muted-foreground">{member.status}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border border-primary/20 p-6 rounded-2xl">
                      <div className="flex gap-4">
                        <div className="p-3 bg-primary/20 rounded-xl h-fit">
                          <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-syne font-bold">Workspace Security</h4>
                          <p className="text-sm text-muted-foreground">Only owners and admins can invite new members or change workspace settings. Standard members can view and evaluate candidates.</p>
                          <Button variant="link" className="p-0 h-fit text-primary font-bold hover:no-underline flex items-center gap-2">
                            View permissions matrix <Shield className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {activeTab === "settings" && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <Card className="glass-card shadow-lg border-0 bg-transparent">
                      <CardHeader className="border-b border-white/5 pb-4">
                        <CardTitle className="font-syne">General Settings</CardTitle>
                        <CardDescription>Basic information about your workspace.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Workspace Name</label>
                          <Input defaultValue="TalentRanker HQ" className="bg-[#0a0a0f]/50 border-white/10 rounded-xl h-12 focus:border-primary transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Workspace ID</label>
                          <div className="flex gap-2">
                            <Input disabled value="tr-hq-8293" className="bg-white/5 border-white/5 rounded-xl h-12 cursor-not-allowed" />
                            <Button variant="outline" className="h-12 border-white/10 rounded-xl px-4">Copy</Button>
                          </div>
                        </div>
                        <div className="pt-4 flex justify-end">
                          <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-8">Save Changes</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-destructive/20 bg-destructive/5 overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-destructive font-syne">Danger Zone</CardTitle>
                        <CardDescription>Irreversible actions for your workspace.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 pt-0 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-muted-foreground">Once you delete a workspace, there is no going back. Please be certain.</div>
                        <Button variant="destructive" className="rounded-xl h-11 px-6 shadow-lg shadow-destructive/20 font-syne">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Workspace
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === "billing" && (
                  <motion.div
                    key="billing"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <Card className="glass-card shadow-lg border-0 bg-transparent overflow-hidden">
                      <div className="bg-gradient-to-r from-primary to-blue-600 p-8 text-white relative">
                        <div className="relative z-10">
                          <h3 className="text-2xl font-bold font-syne mb-2">Pro Plan</h3>
                          <p className="opacity-90 max-w-sm">Everything you need for serious recruitment. Advanced AI, Unlimited candidates, and Team Collaboration.</p>
                          <p className="mt-6 text-3xl font-bold font-syne">$99 <span className="text-sm font-normal opacity-70">/ month</span></p>
                        </div>
                        <CreditCard className="absolute bottom-[-20%] right-[-5%] w-48 h-48 opacity-10 rotate-12" />
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-8">
                          <div>
                            <p className="font-semibold text-foreground/90">Next Billing Date</p>
                            <p className="text-sm text-muted-foreground">March 28, 2026</p>
                          </div>
                          <Button variant="outline" className="border-white/10 rounded-xl px-6 h-11 transition-all hover:bg-white/5">Manage Subscription</Button>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="font-syne font-bold text-sm uppercase tracking-wider text-muted-foreground">Plan Features</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {["Unlimited Resumes", "Advanced AI (Grok-2)", "Team Collaboration", "Priority Support", "Custom Branding", "API Access"].map(f => (
                              <div key={f} className="flex items-center gap-3 text-sm text-foreground/80">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {f}
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
