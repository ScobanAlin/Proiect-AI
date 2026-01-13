import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, Bot, User } from 'lucide-react';

const ChatInterface = ({ generateChatResponse }) => {
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const handleChatSubmit = () => {
        if (!chatInput.trim()) return;
        const userMessage = { role: 'user', content: chatInput };
        setChatMessages([...chatMessages, userMessage]);
        const currentInput = chatInput;
        setChatInput('');
        setIsTyping(true);

        setTimeout(() => {
            const response = generateChatResponse(currentInput);
            setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
            setIsTyping(false);
        }, 800);
    };

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '28px',
            height: '650px',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.15), 0 12px 35px rgba(102, 126, 234, 0.15)',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '24px 28px',
                borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '52px',
                        height: '52px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 8px 20px rgba(102, 126, 234, 0.35)'
                    }}>
                        <Bot style={{ width: '28px', height: '28px', color: 'white' }} />
                    </div>
                    <div>
                        <h2 style={{
                            fontSize: '22px',
                            fontWeight: '700',
                            color: '#1e293b',
                            margin: 0,
                            letterSpacing: '-0.3px'
                        }}>Agent Conversațional AI</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#38ef7d',
                                boxShadow: '0 0 10px rgba(56, 239, 125, 0.5)'
                            }} />
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Online • Powered by SQLite</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                background: 'linear-gradient(180deg, rgba(102, 126, 234, 0.02) 0%, transparent 100%)'
            }}>
                {chatMessages.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        paddingTop: '80px',
                        paddingBottom: '48px'
                    }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            margin: '0 auto 24px',
                            borderRadius: '28px',
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(240, 147, 251, 0.1) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <MessageSquare style={{ width: '48px', height: '48px', color: '#667eea' }} />
                        </div>
                        <h3 style={{ color: '#1e293b', fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                            Începe o conversație!
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '300px', margin: '0 auto' }}>
                            Întreabă-mă despre strategii de căutare, algoritmi CSP, echilibrul Nash sau Minimax
                        </p>

                        {/* Suggested Questions */}
                        <div style={{ marginTop: '32px', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                            {['Ce este A*?', 'Explică BFS vs DFS', 'Ce este Nash?'].map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => setChatInput(q)}
                                    style={{
                                        padding: '10px 18px',
                                        borderRadius: '20px',
                                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                        border: '1px solid rgba(102, 126, 234, 0.2)',
                                        color: '#667eea',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                                        e.currentTarget.style.color = 'white';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)';
                                        e.currentTarget.style.color = '#667eea';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {chatMessages.map((msg, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: 'flex',
                                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    gap: '12px',
                                    animation: 'slideIn 0.3s ease-out'
                                }}
                            >
                                {msg.role === 'assistant' && (
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <Sparkles style={{ width: '18px', height: '18px', color: 'white' }} />
                                    </div>
                                )}
                                <div style={{
                                    maxWidth: '75%',
                                    borderRadius: '20px',
                                    padding: '16px 20px',
                                    background: msg.role === 'user'
                                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                    color: msg.role === 'user' ? 'white' : '#1e293b',
                                    borderBottomRightRadius: msg.role === 'user' ? '6px' : '20px',
                                    borderBottomLeftRadius: msg.role === 'user' ? '20px' : '6px',
                                    boxShadow: msg.role === 'user'
                                        ? '0 8px 25px rgba(102, 126, 234, 0.3)'
                                        : '0 4px 15px rgba(0, 0, 0, 0.05)',
                                    border: msg.role === 'user' ? 'none' : '1px solid rgba(102, 126, 234, 0.1)'
                                }}>
                                    <pre style={{
                                        whiteSpace: 'pre-wrap',
                                        fontSize: '14px',
                                        lineHeight: '1.6',
                                        margin: 0,
                                        fontFamily: 'inherit'
                                    }}>{msg.content}</pre>
                                </div>
                                {msg.role === 'user' && (
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <User style={{ width: '18px', height: '18px', color: 'white' }} />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Sparkles style={{ width: '18px', height: '18px', color: 'white' }} />
                                </div>
                                <div style={{
                                    padding: '16px 20px',
                                    borderRadius: '20px',
                                    borderBottomLeftRadius: '6px',
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                    border: '1px solid rgba(102, 126, 234, 0.1)'
                                }}>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {[0, 1, 2].map((i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    background: '#667eea',
                                                    animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <div style={{
                padding: '20px 24px',
                borderTop: '1px solid rgba(102, 126, 234, 0.1)',
                background: 'rgba(255, 255, 255, 0.8)'
            }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                        placeholder="Scrie întrebarea ta..."
                        style={{
                            flex: 1,
                            padding: '16px 20px',
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            borderRadius: '16px',
                            fontSize: '15px',
                            outline: 'none',
                            background: 'rgba(255, 255, 255, 0.9)',
                            transition: 'all 0.3s',
                            color: '#1e293b'
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#667eea';
                            e.currentTarget.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    />
                    <button
                        onClick={handleChatSubmit}
                        disabled={!chatInput.trim()}
                        style={{
                            background: chatInput.trim()
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
                            color: 'white',
                            padding: '16px 28px',
                            borderRadius: '16px',
                            fontWeight: '600',
                            border: 'none',
                            cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.3s',
                            boxShadow: chatInput.trim() ? '0 8px 25px rgba(102, 126, 234, 0.35)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                            if (chatInput.trim()) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.45)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = chatInput.trim() ? '0 8px 25px rgba(102, 126, 234, 0.35)' : 'none';
                        }}
                    >
                        <Send style={{ width: '20px', height: '20px' }} />
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes bounce {
                    0%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-6px); }
                }
            `}</style>
        </div>
    );
};

export default ChatInterface;
