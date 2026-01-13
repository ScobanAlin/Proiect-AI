import React, { useState } from 'react';
import { BookOpen, MessageSquare, Database, FileText, Sparkles, Cpu, Brain } from 'lucide-react';
import { db } from '../services/database';
import { generateQuestion } from '../utils/questionGenerator';
import { evaluateAnswer } from '../utils/answerEvaluator';
import { generateChatResponse } from '../utils/chatAgent';
import QuestionGenerator from './QuestionGenerator';
import ChatInterface from './ChatInterface';
import TestGenerator from './TestGenerator';

// ============================================================================
// REACT COMPONENT - MODERN DESIGN
// ============================================================================

const SmarTestApp = () => {
    const [activeTab, setActiveTab] = useState('generator');

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            padding: '32px 24px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated Background Orbs */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%)',
                    top: '-200px',
                    left: '-100px',
                    animation: 'float 20s ease-in-out infinite'
                }} />
                <div style={{
                    position: 'absolute',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(240, 147, 251, 0.25) 0%, transparent 70%)',
                    bottom: '-150px',
                    right: '-100px',
                    animation: 'float 20s ease-in-out infinite',
                    animationDelay: '-10s'
                }} />
                <div style={{
                    position: 'absolute',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 70%)',
                    top: '40%',
                    left: '30%',
                    animation: 'float 25s ease-in-out infinite',
                    animationDelay: '-5s'
                }} />
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(50px, -30px) scale(1.1); }
                    50% { transform: translate(-30px, 50px) scale(0.95); }
                    75% { transform: translate(-50px, -20px) scale(1.05); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.05); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Hero Header Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '28px',
                    padding: '32px',
                    marginBottom: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.2), 0 12px 35px rgba(102, 126, 234, 0.2)',
                    animation: 'slideUp 0.5s ease-out'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '64px',
                            height: '64px',
                            borderRadius: '18px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                        }}>
                            <Brain style={{ width: '36px', height: '36px', color: 'white' }} />
                        </div>
                        <div>
                            <h1 style={{
                                fontSize: '36px',
                                fontWeight: '800',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                margin: 0,
                                letterSpacing: '-0.5px'
                            }}>SmarTest AI</h1>
                            <p style={{ color: '#64748b', fontSize: '16px', margin: '4px 0 0' }}>
                                Intelligent Question Generation & Evaluation Platform
                            </p>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '16px',
                        marginTop: '24px'
                    }}>
                        <div style={{
                            padding: '16px 20px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                            border: '1px solid rgba(102, 126, 234, 0.2)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Database style={{ width: '20px', height: '20px', color: '#667eea' }} />
                                <div>
                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>{db.db.problemTypes.length}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Problem Types</div>
                                </div>
                            </div>
                        </div>
                        <div style={{
                            padding: '16px 20px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%)',
                            border: '1px solid rgba(240, 147, 251, 0.2)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Sparkles style={{ width: '20px', height: '20px', color: '#f093fb' }} />
                                <div>
                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>{db.db.searchStrategies.length}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Strategies</div>
                                </div>
                            </div>
                        </div>
                        <div style={{
                            padding: '16px 20px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(56, 239, 125, 0.1) 100%)',
                            border: '1px solid rgba(0, 212, 255, 0.2)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Cpu style={{ width: '20px', height: '20px', color: '#00d4ff' }} />
                                <div>
                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>{db.db.strategyRules.length}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Rules</div>
                                </div>
                            </div>
                        </div>
                        <div style={{
                            padding: '16px 20px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, rgba(17, 153, 142, 0.1) 0%, rgba(56, 239, 125, 0.1) 100%)',
                            border: '1px solid rgba(56, 239, 125, 0.2)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <FileText style={{ width: '20px', height: '20px', color: '#38ef7d' }} />
                                <div>
                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>{db.db.questionLog.length}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Generated</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Pills */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    marginBottom: '24px',
                    padding: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 15px 50px rgba(0, 0, 0, 0.15)',
                    animation: 'slideUp 0.5s ease-out',
                    animationDelay: '0.1s',
                    animationFillMode: 'both'
                }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[
                            { id: 'generator', label: 'Generator Întrebări', icon: BookOpen },
                            { id: 'test', label: 'Generare Teste', icon: FileText },
                            { id: 'chat', label: 'Agent Conversațional', icon: MessageSquare }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        padding: '16px 20px',
                                        borderRadius: '14px',
                                        fontWeight: '600',
                                        fontSize: '15px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        background: isActive
                                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                            : 'transparent',
                                        color: isActive ? 'white' : '#64748b',
                                        boxShadow: isActive
                                            ? '0 8px 25px rgba(102, 126, 234, 0.4)'
                                            : 'none',
                                        transform: isActive ? 'scale(1)' : 'scale(1)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                                            e.currentTarget.style.color = '#667eea';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = '#64748b';
                                        }
                                    }}
                                >
                                    <Icon style={{ width: '20px', height: '20px' }} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div style={{
                    animation: 'slideUp 0.5s ease-out',
                    animationDelay: '0.2s',
                    animationFillMode: 'both'
                }}>
                    {activeTab === 'generator' && <QuestionGenerator generateQuestion={generateQuestion} evaluateAnswer={evaluateAnswer} />}
                    {activeTab === 'test' && <TestGenerator />}
                    {activeTab === 'chat' && <ChatInterface generateChatResponse={generateChatResponse} />}
                </div>
            </div>
        </div>
    );
};

export default SmarTestApp;