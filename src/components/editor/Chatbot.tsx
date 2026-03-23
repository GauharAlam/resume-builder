import React, { useState, useRef, useEffect } from 'react';
import { getChatbotResponse } from '@/services/geminiService';
import { ChatMessage } from '@/types';
import { useResume } from '@/hooks';

interface ChatbotProps {
    onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
    const { resumeData } = useResume(); // Get resume data for context
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'bot', text: "Hello! I'm CareerBot. How can I help you with your resume or job search today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

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
            const errorMessage: ChatMessage = { sender: 'bot', text: "Sorry, something went wrong." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to render markdown-like text to HTML
    const renderMessageText = (text: string) => {
        const html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^\* (.*$)/gm, '<span class="flex"><span class="mr-2">&bull;</span><span>$1</span></span>') // Basic bullet points
            .replace(/\n/g, '<br />');
        return { __html: html };
    };

    return (
        <div className="fixed bottom-4 right-4 w-[350px] sm:w-[400px] h-[60vh] max-h-[600px] bg-white rounded-xl shadow-2xl flex flex-col z-50 font-sans animate-in fade-in slide-in-from-bottom-5 duration-300 border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <h3 className="font-bold text-gray-800 text-lg">CareerBot AI</h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors" aria-label="Close Chatbot">&times;</button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`rounded-lg px-3 py-2 max-w-xs text-sm break-words ${msg.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                            dangerouslySetInnerHTML={renderMessageText(msg.text)}
                        />
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start mb-3">
                         <div className="rounded-lg px-3 py-2 bg-gray-200 text-gray-800">
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-3 border-t bg-white rounded-b-lg">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask for advice or help..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        disabled={isLoading}
                    />
                    <button type="submit" className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 disabled:opacity-50" disabled={isLoading || !input.trim()} aria-label="Send message">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chatbot;