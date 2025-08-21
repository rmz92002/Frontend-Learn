"use client"

import React, { useState, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Brain, X, MessageCircle, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { chatWithLecture } from '@/lib/api';
import type { ChatMessage } from "@/lib/api"
import { useParams } from 'next/navigation';

interface Message {
    id: number;
    sender: 'bot' | 'user';
    text: string;
}

const ThinkingIndicator = () => (
    <div className="flex items-end gap-2 justify-start">
        <motion.div
            className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.05, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
            <motion.div
                className="w-6 h-6 rounded-full border border-green-300 flex items-center justify-center"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
                <Brain className="w-4 h-4 text-green-700" />
            </motion.div>
            <motion.span
                className="text-green-900 text-sm font-medium"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
            >
                thinking…
            </motion.span>
        </motion.div>
    </div>
);

export function BuddyChatbot({ currentSection, onSlideUpdate, onSlideUpdating }: { currentSection: number; onSlideUpdate: (update: { new_html?: string | null; new_jsx?: string | null }) => void; onSlideUpdating: (v: boolean) => void }) {
    const { id: lectureId } = useParams<{ id: string }>()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            sender: 'bot',
            text: 'Hey there! 👋 Got any questions about this slide? Ask away! I\'ll do my best to help.',
        },
    ])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const { toast } = useToast()

    useLayoutEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
    }, [messages])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputValue.trim() || isLoading) return

        const userMessage = { id: Date.now(), sender: 'user' as const, text: inputValue }
        const history: ChatMessage[] = messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
        }))

        const botMsgId = userMessage.id + 1
        const botPlaceholder = { id: botMsgId, sender: 'bot' as const, text: '' }

        setMessages(prev => [...prev, userMessage, botPlaceholder])
        setInputValue('')
        setIsLoading(true)

        let streamedAnswer = ''

        try {
            await chatWithLecture(
                lectureId,
                currentSection,
                userMessage.text,
                {
                    history,
                    onStream: (data) => {
                        if (typeof data?.answer === 'string') {
                            streamedAnswer = data.answer
                            setMessages(prev => prev.map(m =>
                                m.id === botMsgId ? { ...m, text: streamedAnswer } : m
                            ))
                        }
                        if (data?.slide_update) {
                            if (data.slide_update.new_html === 'updating') {
                                onSlideUpdating(true)
                                toast({ title: 'AI is updating the slide...' })
                            } else {
                                onSlideUpdate(data.slide_update)
                                onSlideUpdating(false)
                                toast({ title: '✅ Slide updated!', description: 'Your slide was refreshed with new content.' })
                                setMessages(prev => [
                                    ...prev,
                                    { id: Date.now() + 2, sender: 'bot' as const, text: 'I\'ve updated the slide for you.' },
                                ])
                            }
                        }
                    }
                }
            )
        } catch (err) {
            setMessages(prev => prev.map(m =>
                m.id === botMsgId ? { ...m, text: 'Sorry, something went wrong.' } : m
            ))
        } finally {
            setIsLoading(false)
        }
    }

    const chatWindowVariants: Variants = {
        open: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
        closed: { opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } },
    }

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed bottom-24 right-4 w-80 h-[28rem] bg-white border rounded-2xl shadow-2xl flex flex-col z-50 origin-bottom-right"
                        variants={chatWindowVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                    >
                        <header className="p-3 border-b flex items-center justify-between bg-green-50 rounded-t-2xl">
                            <h3 className="font-semibold text-base text-green-800">Chat with AI Buddy</h3>
                            <button
                                type="button"
                                className="rounded-full p-1 hover:bg-green-200 transition-colors"
                                onClick={() => setIsOpen(false)}
                                aria-label="Close chat"
                            >
                                <X className="h-5 w-5 text-green-700" />
                            </button>
                        </header>

                        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white">
                            <AnimatePresence>
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    >
                                        {msg.sender === 'bot' && msg.text === '' ? (
                                            <ThinkingIndicator />
                                        ) : (
                                            <div className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm shadow-sm ${msg.sender === 'user' ? 'bg-black text-white' : 'bg-green-50 text-green-900'}`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-3 border-t bg-white rounded-b-2xl">
                            <div className="flex items-center gap-2">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask anything..."
                                    className="flex-1 rounded-lg"
                                    autoComplete="off"
                                    disabled={isLoading}
                                />
                                <Button type="submit" size="icon" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-5 right-5 z-50 w-16 h-16 rounded-full shadow-lg bg-green-500 flex items-center justify-center text-white"
                aria-label="Open AI Buddy Chatbot"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={{ scale: isOpen ? 0 : 1, opacity: isOpen ? 0 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                <MessageCircle size={28} />
            </motion.button>
        </>
    )
}
