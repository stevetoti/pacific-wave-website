'use client';

import { useState } from 'react';

const quickResponses = [
  {
    question: 'What services do you offer?',
    answer: 'We offer Web Development, Mobile Apps, AI Solutions, Digital Marketing, Business Automation, and Cloud & Hosting services tailored for Pacific Island businesses.',
  },
  {
    question: 'How can I get a quote?',
    answer: 'You can reach us through our Contact page, email us at info@pacificwavedigital.com, or call +678 777 4567. We typically respond within 24 hours.',
  },
  {
    question: 'Where are you located?',
    answer: 'Our headquarters is in Port Vila, Vanuatu. We also have partners in the USA, Indonesia, and Ghana through our global network.',
  },
  {
    question: 'Do you work with government agencies?',
    answer: 'Yes! We work with both private businesses and government agencies across the Pacific Islands, providing digital transformation and custom software solutions.',
  },
];

interface Message {
  text: string;
  isUser: boolean;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Hello! 👋 Welcome to Pacific Wave Digital. How can I help you today?', isUser: false },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleQuickResponse = (qr: typeof quickResponses[0]) => {
    setMessages((prev) => [
      ...prev,
      { text: qr.question, isUser: true },
      { text: qr.answer, isUser: false },
    ]);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setMessages((prev) => [
      ...prev,
      { text: inputValue, isUser: true },
      { text: 'Thank you for your message! Our team will get back to you shortly. For immediate assistance, please email info@pacificwavedigital.com or call +678 777 4567.', isUser: false },
    ]);
    setInputValue('');
  };

  return (
    <div className="chat-bubble">
      {/* Chat Panel */}
      {isOpen && (
        <div 
          className="absolute bottom-20 right-0 w-[360px] max-h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="gradient-blue p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-vibrant-orange flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm">Pacific Wave Digital</p>
                  <p className="text-xs text-blue-200">We typically reply instantly</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors" aria-label="Close chat">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[280px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.isUser
                      ? 'bg-deep-blue text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-700 rounded-bl-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {/* Quick Responses */}
            {messages.length <= 1 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs text-gray-400 font-medium">Quick questions:</p>
                {quickResponses.map((qr, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickResponse(qr)}
                    className="block w-full text-left px-3 py-2 text-xs bg-pale-orange text-deep-blue rounded-lg hover:bg-vibrant-orange hover:text-white transition-colors"
                  >
                    {qr.question}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-3">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-deep-blue/20 text-gray-800"
              />
              <button
                onClick={handleSend}
                className="w-10 h-10 bg-vibrant-orange text-white rounded-full flex items-center justify-center hover:bg-soft-orange transition-colors flex-shrink-0"
                aria-label="Send message"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button - Small aligned widget */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 ${
          isOpen ? 'bg-gray-600' : 'bg-vibrant-orange'
        }`}
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </div>
  );
}
