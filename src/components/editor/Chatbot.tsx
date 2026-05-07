import React, { useState, useRef, useEffect } from 'react';
import { getChatbotResponse } from '@/services/aiService';
import { ChatMessage } from '@/types';
import { useResume } from '@/hooks';
import { Minus, X, Maximize2, Move } from 'lucide-react';

interface ChatbotProps {
    onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
    const { resumeData } = useResume(); 
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'bot', text: "Hello! I'm CareerBot. How can I help you with your resume or job search today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    
    // Draggable state
    const [position, setPosition] = useState({ x: window.innerWidth - 420, y: window.innerHeight - 620 });
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const chatbotRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isLoading, isMinimized]);

    // Update position if window resizes and chatbot would be off-screen
    useEffect(() => {
        const handleResize = () => {
            setPosition(prev => ({
                x: Math.min(prev.x, window.innerWidth - 100),
                y: Math.min(prev.y, window.innerHeight - 100)
            }));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.drag-handle')) {
            setIsDragging(true);
            dragOffset.current = {
                x: e.clientX - position.x,
                y: e.clientY - position.y
            };
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const newX = e.clientX - dragOffset.current.x;
                const newY = e.clientY - dragOffset.current.y;
                
                // Keep within bounds
                const boundedX = Math.max(0, Math.min(newX, window.innerWidth - (isMinimized ? 200 : 400)));
                const boundedY = Math.max(0, Math.min(newY, window.innerHeight - (isMinimized ? 60 : 600)));
                
                setPosition({ x: boundedX, y: boundedY });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isMinimized]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const botResponseText = await getChatbotResponse(input, resumeData);
            const botMessage: ChatMessage = { sender: 'bot', text: botResponseText };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { sender: 'bot', text: "Sorry, something went wrong. Please check your database connection." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessageText = (text: string) => {
        const html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^\* (.*$)/gm, '<span class="flex"><span class="mr-2">&bull;</span><span>$1</span></span>')
            .replace(/\n/g, '<br />');
        return { __html: html };
    };

    return (
        <div 
            ref={chatbotRef}
            style={{ 
                left: `${position.x}px`, 
                top: `${position.y}px`,
                position: 'fixed',
                cursor: isDragging ? 'grabbing' : 'auto'
            }}
            className={`w-[350px] sm:w-[400px] ${isMinimized ? 'h-auto' : 'h-[60vh] max-h-[600px]'} bg-white rounded-xl shadow-2xl flex flex-col z-50 font-sans border border-gray-200 overflow-hidden transition-[height] duration-300 ease-in-out`}
            onMouseDown={handleMouseDown}
        >
            {/* Header / Drag Handle */}
            <div className={`drag-handle flex justify-between items-center p-3 border-b bg-indigo-600 text-white cursor-grab active:cursor-grabbing select-none`}>
                <div className="flex items-center gap-2">
                    <Move size={14} className="opacity-70" />
                    <span className="text-lg">🤖</span>
                    <h3 className="font-bold text-sm sm:text-base">CareerBot AI</h3>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} 
                        className="p-1.5 hover:bg-indigo-500 rounded-md transition-colors"
                        title={isMinimized ? "Expand" : "Minimize"}
                    >
                        {isMinimized ? <Maximize2 size={16} /> : <Minus size={16} />}
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onClose(); }} 
                        className="p-1.5 hover:bg-red-500 rounded-md transition-colors"
                        title="Close"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`rounded-2xl px-4 py-2 max-w-[85%] text-sm shadow-sm ${
                                        msg.sender === 'user' 
                                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                    }`}
                                    dangerouslySetInnerHTML={renderMessageText(msg.text)}
                                />
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start mb-3">
                                <div className="rounded-2xl px-4 py-2 bg-white border border-gray-100 rounded-tl-none shadow-sm">
                                    <div className="flex items-center space-x-1">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Form */}
                    <div className="p-3 border-t bg-white">
                        <form onSubmit={handleSend} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask CareerBot anything..."
                                className="flex-1 px-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-indigo-500 text-sm"
                                disabled={isLoading}
                                onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking input
                            />
                            <button 
                                type="submit" 
                                className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 shadow-md transition-transform active:scale-95" 
                                disabled={isLoading || !input.trim()}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default Chatbot;