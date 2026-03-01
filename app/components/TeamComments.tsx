"use client"

import { useState, useEffect, useRef } from "react"
import { Send, MessageSquare, Clock, User, Smile } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/app/hooks/useAuth"

interface Comment {
  id: string
  author_id: string
  author_name: string
  content: string
  created_at: string
}

const MOCK_COMMENTS: Comment[] = [
  { id: "1", author_id: "2", author_name: "Jessica Chen", content: "Great technical skills, but curious about the short tenure at their last role.", created_at: "2026-03-01T08:00:00Z" },
  { id: "2", author_id: "3", author_name: "Michael Ross", content: "Met them at a conference before, very sharp and collaborative.", created_at: "2026-03-01T08:15:00Z" },
]

export function TeamComments({ candidateId }: { candidateId: string }) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS)
  const [newComment, setNewComment] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleSend = () => {
    if (!newComment.trim() || !user) return

    const comment: Comment = {
      id: Date.now().toString(),
      author_id: user._id,
      author_name: user.name,
      content: newComment,
      created_at: new Date().toISOString()
    }

    setComments([...comments, comment])
    setNewComment("")
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [comments])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 px-1">
        <MessageSquare className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Team Discussion</h3>
      </div>

      <div className="flex-1 min-h-0 bg-white/5 rounded-xl border border-white/5 flex flex-col">
        <ScrollArea className="flex-1 p-4 h-[400px]">
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col gap-1.5 ${comment.author_id === user?._id ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{comment.author_name}</span>
                    <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-lg ${
                    comment.author_id === user?._id 
                      ? "bg-primary text-white rounded-tr-none shadow-primary/10" 
                      : "bg-[#1a1a26] text-foreground/90 rounded-tl-none border border-white/5"
                  }`}>
                    {comment.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-3 bg-white/5 border-t border-white/5 flex gap-2 rounded-b-xl">
          <Input 
            placeholder="Write a comment..." 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="bg-[#0a0a0f]/50 border-white/10 rounded-xl h-10 text-xs focus:border-primary transition-all"
          />
          <Button 
            size="icon" 
            onClick={handleSend}
            disabled={!newComment.trim()}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl w-10 h-10 shrink-0 shadow-lg shadow-primary/20"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><User className="w-3 h-3" /> 2 others active</span>
        <span className="w-1 h-1 rounded-full bg-white/20" />
        <span className="flex items-center gap-1"><Smile className="w-3 h-3" /> Real-time mode</span>
      </div>
    </div>
  )
}
