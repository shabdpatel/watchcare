import { useState, useEffect, useRef } from 'react';
import {
    XMarkIcon,
    ChatBubbleLeftRightIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    ArrowLeftIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { FaWhatsapp, FaRobot } from 'react-icons/fa';

interface ChatMessage {
    id: string;
    type: 'user' | 'bot';
    text: string;
    timestamp: Date;
}

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeChat, setActiveChat] = useState<'bot' | 'person' | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isTawkLoading, setIsTawkLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initialize Tawk.to
    useEffect(() => {
        if (activeChat === 'person') {
            setIsTawkLoading(true);
            const s1 = document.createElement("script");
            s1.async = true;
            s1.src = 'https://embed.tawk.to/68336db443a2a8190b59efc7/1is4e93t6';
            s1.charset = 'UTF-8';
            s1.setAttribute('crossorigin', '*');

            // Add load event listener with timeout
            const loadTimeout = setTimeout(() => {
                setIsTawkLoading(false);
            }, 10000); // Stop loading after 10 seconds

            s1.addEventListener('load', () => {
                if (window.Tawk_API) {
                    window.Tawk_API.onLoad = function () {
                        window.Tawk_API.setPosition('bottom-right');
                        window.Tawk_API.maximize();
                        clearTimeout(loadTimeout); // Clear timeout if chat loads before 10s
                        setIsTawkLoading(false);
                    };
                }
            });

            document.head.appendChild(s1);

            return () => {
                clearTimeout(loadTimeout); // Clean up timeout
                document.head.removeChild(s1);
                if (window.Tawk_API) {
                    window.Tawk_API.hideWidget();
                }
            };
        }
    }, [activeChat]);

    const handleSendMessage = () => {
        if (!inputText.trim()) return;

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            text: inputText.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        setInputText('');
        setIsTyping(true);

        // Simulate bot response based on user input
        setTimeout(() => {
            const userText = inputText.toLowerCase();
            let botResponse = '';

            if (userText.includes('price') || userText.includes('cost')) {
                botResponse = "Our watches range from ₹1,000 to ₹1,000,000. Would you like to see specific collections?";
            } else if (userText.includes('delivery') || userText.includes('shipping')) {
                botResponse = "We offer free shipping on orders above ₹5,000. Standard delivery takes 3-5 business days.";
            } else if (userText.includes('warranty')) {
                botResponse = "All our watches come with a 2-year international warranty. Premium collections have extended warranty options.";
            } else {
                botResponse = "How else can I assist you today? Feel free to ask about our products, services, or support.";
            }

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                type: 'bot',
                text: botResponse,
                timestamp: new Date()
            }]);
            setIsTyping(false);
        }, 1500);
    };

    const handleChatOption = (option: 'bot' | 'person') => {
        setActiveChat(option);
        if (option === 'bot') {
            setMessages([{
                id: Date.now().toString(),
                type: 'bot',
                text: 'Welcome to Unboxing Watch Store! How can I help you today? You can ask about:\n\n• Watch Collections\n• Pricing & Availability\n• Shipping & Delivery\n• Warranty & Returns\n• Store Locations',
                timestamp: new Date()
            }]);
        }
    };

    const handleBack = () => {
        setActiveChat(null);
        setMessages([]);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 md:w-14 md:h-14 bg-gray-900 rounded-full flex items-center 
                         justify-center text-white shadow-lg hover:bg-gray-800 
                         transition-all duration-300 hover:scale-105"
            >
                {isOpen ? (
                    <XMarkIcon className="w-6 h-6" />
                ) : (
                    <ChatBubbleLeftRightIcon className="w-6 h-6" />
                )}
            </button>

            {isOpen && (
                <div className="fixed md:absolute bottom-0 md:bottom-20 right-0 w-full md:w-96 
                               bg-white rounded-t-xl md:rounded-xl shadow-2xl border border-gray-200 
                               overflow-hidden max-h-[90vh] md:max-h-[600px]">
                    <div className="p-4 bg-gray-900 text-white flex items-center gap-4">
                        {activeChat && (
                            <button
                                onClick={handleBack}
                                className="p-1 hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                            </button>
                        )}
                        <h3 className="font-medium flex-1">
                            {activeChat ? (
                                activeChat === 'bot' ? 'AI Assistant' : 'Live Chat'
                            ) : 'How can we help?'}
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {!activeChat ? (
                        <div className="p-4 space-y-3">
                            <button
                                onClick={() => handleChatOption('bot')}
                                className="w-full p-3 flex items-center gap-3 bg-gray-50 
                                         rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <FaRobot className="w-5 h-5" />
                                <span>Chat with Bot</span>
                            </button>
                            <button
                                onClick={() => handleChatOption('person')}
                                className="w-full p-3 flex items-center gap-3 bg-gray-50 
                                         rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <UserIcon className="w-5 h-5" />
                                <span>Chat with Agent</span>
                            </button>
                            <a
                                href="https://wa.me/+919049408898"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full p-3 flex items-center gap-3 bg-green-500 
                                         text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <FaWhatsapp className="w-5 h-5" />
                                <span>WhatsApp Chat</span>
                            </a>
                            <a
                                href="tel:+919049408898"
                                className="w-full p-3 flex items-center gap-3 bg-blue-500 
                                         text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                <PhoneIcon className="w-5 h-5" />
                                <span>Call Us</span>
                            </a>
                            <a
                                href="mailto:prameetsw@gmail.com"
                                className="w-full p-3 flex items-center gap-3 bg-red-500 
                                         text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                <EnvelopeIcon className="w-5 h-5" />
                                <span>Email Us</span>
                            </a>
                        </div>
                    ) : (
                        <div className="h-96 flex flex-col">
                            {activeChat === 'bot' ? (
                                <>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'
                                                    }`}
                                            >
                                                <div
                                                    className={`max-w-[75%] rounded-lg p-3 ${message.type === 'user'
                                                        ? 'bg-gray-900 text-white'
                                                        : 'bg-gray-100'
                                                        }`}
                                                >
                                                    {message.text}
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                    <div className="p-4 border-t">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={inputText}
                                                onChange={(e) => setInputText(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                placeholder="Type your message..."
                                                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none 
                                                         focus:ring-2 focus:ring-gray-900"
                                            />
                                            <button
                                                onClick={handleSendMessage}
                                                className="px-4 py-2 bg-gray-900 text-white rounded-lg 
                                                         hover:bg-gray-800 transition-colors"
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex flex-col">
                                    {isTawkLoading ? (
                                        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
                                            {/* Custom loading animation */}
                                            <div className="relative">
                                                <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full 
                                                              inline-block [animation:spin_1s_linear_infinite]"
                                                    style={{
                                                        animation: 'spin 1s linear infinite',
                                                    }}
                                                />
                                            </div>

                                            <div className="text-center space-y-3">
                                                <p className="text-gray-900 font-medium">
                                                    Connecting to live chat...
                                                </p>
                                                <p className="text-sm text-gray-500 max-w-xs">
                                                    Our chat window will open in a moment. You may need to allow pop-ups
                                                    if the chat doesn't appear automatically.
                                                </p>
                                            </div>

                                            {/* Add inline spinner animation */}
                                            <style>
                                                {`
                                                    @keyframes spin {
                                                        0% { transform: rotate(0deg); }
                                                        100% { transform: rotate(360deg); }
                                                    }
                                                `}
                                            </style>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 bg-gray-50">
                                            <div className="text-center space-y-4">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    Chat Window Ready
                                                </h3>
                                                <p className="text-sm text-gray-500 max-w-xs">
                                                    If you don't see the chat window, click the button below to open it.
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        if (window.Tawk_API) {
                                                            window.Tawk_API.maximize();
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-gray-900 text-white rounded-lg 
                                                             hover:bg-gray-800 transition-colors"
                                                >
                                                    Open Chat Window
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatBot;