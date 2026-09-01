"use client";
import { useState, useEffect, useRef } from "react";

// --- SVG Icon Components ---
const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const SendIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);

export default function AssistantChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: "init-1", sender: "assistant", text: "Hello 👋 I’m your Email Assistant. How can I help?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // After mount, hydrate messages from sessionStorage (fixes hydration mismatch)
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = sessionStorage.getItem("chatMessages");
            if (saved) setMessages(JSON.parse(saved));
        }
    }, []);

    // Scroll to bottom when messages update or on open
    useEffect(() => {
        if (isOpen && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [messages, isOpen]);

    // Persist messages to sessionStorage on update (guarded for browser)
    useEffect(() => {
        if (typeof window !== "undefined") {
            sessionStorage.setItem("chatMessages", JSON.stringify(messages));
        }
    }, [messages]);

    // Focus input when open or after loading is done
    useEffect(() => {
        if (isOpen && inputRef.current && !loading) {
            inputRef.current.focus();
        }
    }, [isOpen, loading]);

    async function sendMessageToAPI(message) {
        try {
            const res = await fetch("/api/ai/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });
            const data = await res.json();
            return data.reply;
        } catch (err) {
            console.error("API error:", err);
            return "Sorry, I couldn't get a response.";
        }
    }

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = { id: `user-${Date.now()}`, sender: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        const reply = await sendMessageToAPI(userMessage.text);
        setLoading(false);

        const assistantMessage = { id: `asst-${Date.now()}`, sender: "assistant", text: reply };
        setMessages((prev) => [...prev, assistantMessage]);
    };

    const ChatWindow = () => (
        <div className="fixed bottom-24 right-4 md:right-6 w-[350px] md:w-[400px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-background shadow-2xl shadow-indigo-500/10 rounded-2xl flex flex-col overflow-hidden border border-border z-[9999]">
            <div className="bg-card/50 border-b border-border text-foreground px-5 py-4 flex justify-between items-center font-bold">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🤖</span>
                    <span>Email Assistant</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-2xl leading-none text-[hsl(var(--muted-foreground))] hover:text-foreground transition-colors">&times;</button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-muted scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`p-3 rounded-2xl max-w-[85%] text-sm shadow-sm ${msg.sender === "user"
                            ? "ml-auto bg-gradient-to-r from-indigo-500 to-purple-500 text-foreground rounded-br-sm"
                            : "mr-auto bg-muted border border-border text-foreground rounded-bl-sm"
                        }`}
                    >
                        {msg.text}
                    </div>
                ))}
                {loading && (
                    <div className="mr-auto bg-muted border border-border text-foreground/70 p-3 rounded-2xl max-w-[50%] rounded-bl-sm animate-pulse flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-muted0 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-muted0 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-muted0 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="flex items-center p-3 border-t border-border bg-card/50">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSend();
                    }}
                    placeholder="Ask your assistant..."
                    className="flex-1 px-4 py-2 text-sm outline-none bg-muted border border-border rounded-full text-foreground placeholder-white/40 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all mr-2 disabled:opacity-50"
                    disabled={loading}
                />
                <button
                    onClick={handleSend}
                    disabled={loading}
                    className="p-2 rounded-full text-foreground bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 transition-all"
                >
                    <SendIcon />
                </button>
            </div>
        </div>
    );

    return (
        <>
            {isOpen && <ChatWindow />}
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 text-foreground rounded-full flex items-center justify-center shadow-xl hover:scale-110 hover:shadow-indigo-500/20 transition-all z-[9999]"
            >
                {isOpen ? (
                    <span className="text-3xl font-bold">&times;</span>
                ) : (
                    <ChatIcon />
                )}
            </button>
        </>
    );
}
