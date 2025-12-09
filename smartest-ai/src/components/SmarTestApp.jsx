// src/components/SmarTestApp.jsx

import React, { useState } from 'react';
import { BookOpen, MessageSquare, CheckCircle, AlertCircle, Send, Sparkles, FileText, RotateCcw, Box } from 'lucide-react';
import apiService from '../services/apiService'; // Importăm serviciul API (simulat)
import { generateChatResponse } from '../utils/ChatAgent'; // Importăm logica Agentului Chat

// --- STILURI (PĂSTRATE DE LA VERSIUNEA ANTERIOARĂ) ---
const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)',
        padding: '24px'
    },
    maxWidth: {
        maxWidth: '1152px',
        margin: '0 auto'
    },
    card: {
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        padding: '24px',
        marginBottom: '24px'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '8px'
    },
    title: {
        fontSize: '30px',
        fontWeight: 'bold',
        color: '#1f2937'
    },
    subtitle: {
        color: '#4b5563'
    },
    navContainer: {
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        marginBottom: '24px',
        padding: '8px'
    },
    navButtons: {
        display: 'flex',
        gap: '8px'
    },
    navButton: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '12px 16px',
        borderRadius: '12px',
        fontWeight: '500',
        transition: 'all 0.3s',
        border: 'none',
        cursor: 'pointer'
    },
    navButtonActive: {
        background: '#4f46e5',
        color: 'white',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    },
    navButtonInactive: {
        color: '#4b5563',
        background: 'transparent'
    },
    button: {
        width: '100%',
        background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
        color: 'white',
        padding: '16px',
        borderRadius: '12px',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.3s'
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed'
    },
    questionBox: {
        background: '#eef2ff',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px'
    },
    questionText: {
        color: '#374151',
        whiteSpace: 'pre-line',
        fontWeight: '500',
        fontSize: '18px'
    },
    problemBox: {
        background: '#f9fafb',
        borderRadius: '8px',
        padding: '16px',
        borderLeft: '4px solid #818cf8'
    },
    problemTitle: {
        fontWeight: 'bold',
        color: '#4338ca',
        fontSize: '18px',
        marginBottom: '8px'
    },
    problemDesc: {
        fontSize: '14px',
        color: '#4b5563',
        marginBottom: '12px'
    },
    instanceBox: {
        background: 'white',
        borderRadius: '8px',
        padding: '12px',
        border: '1px solid #c7d2fe'
    },
    instanceLabel: {
        fontSize: '12px',
        color: '#6b7280',
        marginBottom: '4px'
    },
    instanceText: {
        fontWeight: '600',
        color: '#1f2937',
        whiteSpace: 'pre-line' // Important for Nash Matrix display
    },
    textarea: {
        width: '100%',
        height: '128px',
        padding: '16px',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        resize: 'none',
        fontFamily: 'inherit',
        fontSize: '14px',
        outline: 'none'
    },
    submitButton: {
        marginTop: '16px',
        width: '100%',
        background: '#16a34a',
        color: 'white',
        padding: '12px',
        borderRadius: '12px',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.3s'
    },
    evaluationCard: {
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        padding: '24px'
    },
    scoreContainer: {
        marginBottom: '24px'
    },
    scoreRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px'
    },
    scoreLabel: {
        color: '#374151',
        fontWeight: '500'
    },
    scoreValue: {
        fontSize: '24px',
        fontWeight: 'bold'
    },
    progressBar: {
        width: '100%',
        background: '#e5e7eb',
        borderRadius: '9999px',
        height: '12px'
    },
    progressFill: {
        height: '12px',
        borderRadius: '9999px',
        transition: 'all 0.3s'
    },
    feedbackBox: {
        background: '#dbeafe',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px'
    },
    feedbackLabel: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#1e3a8a',
        marginBottom: '4px'
    },
    feedbackText: {
        color: '#374151'
    },
    correctBox: {
        background: '#dcfce7',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px'
    },
    correctLabel: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#14532d',
        marginBottom: '8px'
    },
    correctAnswer: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '8px'
    },
    reasonBox: {
        background: '#faf5ff',
        borderRadius: '8px',
        padding: '16px'
    },
    reasonLabel: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#581c87',
        marginBottom: '8px'
    },
    reasonText: {
        color: '#374151'
    },
    chatContainer: {
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        height: '600px',
        display: 'flex',
        flexDirection: 'column'
    },
    chatHeader: {
        padding: '24px',
        borderBottom: '1px solid #e5e7eb'
    },
    chatTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#1f2937'
    },
    chatSubtitle: {
        fontSize: '14px',
        color: '#4b5563'
    },
    chatMessages: {
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    chatEmpty: {
        textAlign: 'center',
        paddingTop: '48px',
        paddingBottom: '48px'
    },
    chatEmptyIcon: {
        width: '64px',
        height: '64px',
        color: '#d1d5db',
        margin: '0 auto 16px'
    },
    chatEmptyText: {
        color: '#6b7280',
        marginBottom: '24px'
    },
    suggestionGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        maxWidth: '672px',
        margin: '0 auto'
    },
    suggestionButton: {
        fontSize: '14px',
        background: '#eef2ff',
        color: '#4338ca',
        padding: '8px 16px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s',
        textAlign: 'left'
    },
    messageRow: {
        display: 'flex'
    },
    messageRowUser: {
        justifyContent: 'flex-end'
    },
    messageRowAssistant: {
        justifyContent: 'flex-start'
    },
    messageBubble: {
        maxWidth: '80%',
        borderRadius: '16px',
        padding: '16px'
    },
    messageBubbleUser: {
        background: '#4f46e5',
        color: 'white'
    },
    messageBubbleAssistant: {
        background: '#f3f4f6',
        color: '#1f2937'
    },
    messageText: {
        whiteSpace: 'pre-line',
        fontSize: '14px'
    },
    chatInput: {
        padding: '24px',
        borderTop: '1px solid #e5e7eb'
    },
    chatInputRow: {
        display: 'flex',
        gap: '8px'
    },
    input: {
        flex: 1,
        padding: '12px',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        fontSize: '14px',
        outline: 'none'
    },
    sendButton: {
        background: '#4f46e5',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '12px',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s'
    },
    // Stiluri noi pentru selector
    questionTypeSelector: {
        display: 'flex',
        gap: '12px',
        marginBottom: '16px',
        padding: '0 8px'
    },
    typeButton: {
        flex: 1,
        padding: '12px 16px',
        borderRadius: '12px',
        fontWeight: '600',
        border: '2px solid #e5e7eb',
        cursor: 'pointer',
        background: 'white',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
    },
    typeButtonActive: {
        borderColor: '#4f46e5',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        background: '#eef2ff',
        color: '#4f46e5'
    }
};

// --- COMPONENTA PRINCIPALĂ ---

const SmarTestApp = () => {
    const [activeTab, setActiveTab] = useState('generator');
    const [questionType, setQuestionType] = useState('search'); // 'search', 'nash'
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [evaluation, setEvaluation] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // LOGICA DE BAZĂ ESTE MUTATĂ ÎN apiService.js ȘI ChatAgent.js

    // --- FUNCTII DE GENERARE (API CALL) ---
    const generateQuestion = async () => {
        setIsGenerating(true);
        setEvaluation(null);
        setUserAnswer('');

        try {
            // Apel către API service pentru a genera întrebarea specifică
            const question = await apiService.generateQuestion(questionType);
            setCurrentQuestion(question);
        } catch (error) {
            console.error("Eroare la generarea întrebării:", error);
        }

        setIsGenerating(false);
    };

    // --- FUNCTIA DE EVALUARE (API CALL) ---
    const evaluateAnswer = async () => {
        if (!userAnswer.trim() || !currentQuestion) return;

        // Apel către API service pentru evaluare
        const result = await apiService.evaluateAnswer(currentQuestion, userAnswer);
        setEvaluation(result);
    };

    // --- FUNCTIA CHAT SUBMIT (Agent Conversațional) ---
    const handleChatSubmit = () => {
        if (!chatInput.trim()) return;

        const userMessage = { role: 'user', content: chatInput };
        setChatMessages([...chatMessages, userMessage]);
        const currentInput = chatInput;
        setChatInput('');

        setTimeout(() => {
            // Folosim generateChatResponse importat, care știe să parseze instanțe
            const response = generateChatResponse(currentInput);
            setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
        }, 500);
    };

    // --- COMPONENTA SELECTOR TIP ÎNTREBARE ---
    const QuestionTypeSelector = () => (
        <div style={styles.questionTypeSelector}>
            <button
                onClick={() => setQuestionType('search')}
                style={{
                    ...styles.typeButton,
                    ...(questionType === 'search' ? styles.typeButtonActive : {})
                }}
            >
                <Sparkles style={{ width: '20px', height: '20px' }} />
                Strategii Căutare (A*, DFS)
            </button>
            <button
                onClick={() => setQuestionType('nash')}
                style={{
                    ...styles.typeButton,
                    ...(questionType === 'nash' ? styles.typeButtonActive : {})
                }}
            >
                <Box style={{ width: '20px', height: '20px' }} />
                Echilibru Nash Pur
            </button>
        </div>
    );

    // --- RENDERIZARE UI ---
    return (
        <div style={styles.container}>
            <div style={styles.maxWidth}>
                {/* Header */}
                <div style={styles.card}>
                    <div style={styles.header}>
                        <BookOpen style={{ width: '32px', height: '32px', color: '#4f46e5' }} />
                        <h1 style={styles.title}>SmarTest AI (Modularizat)</h1>
                    </div>
                    <p style={styles.subtitle}>Sistem avansat pentru generarea și evaluarea întrebărilor AI, cu suport pentru multiple tipuri de probleme (Mock API/MySQL)</p>
                </div>

                {/* Navigation */}
                <div style={styles.navContainer}>
                    <div style={styles.navButtons}>
                        <button
                            onClick={() => setActiveTab('generator')}
                            style={{
                                ...styles.navButton,
                                ...(activeTab === 'generator' ? styles.navButtonActive : styles.navButtonInactive)
                            }}
                        >
                            <Sparkles style={{ width: '20px', height: '20px' }} />
                            Generator Întrebări
                        </button>
                        <button
                            onClick={() => setActiveTab('chat')}
                            style={{
                                ...styles.navButton,
                                ...(activeTab === 'chat' ? styles.navButtonActive : styles.navButtonInactive)
                            }}
                        >
                            <MessageSquare style={{ width: '20px', height: '20px' }} />
                            Agent Conversațional
                        </button>
                    </div>
                </div>

                {/* Generator Tab */}
                {activeTab === 'generator' && (
                    <div>
                        <div style={styles.card}>
                            <QuestionTypeSelector />
                            <button
                                onClick={generateQuestion}
                                disabled={isGenerating}
                                style={{
                                    ...styles.button,
                                    ...(isGenerating ? styles.buttonDisabled : {})
                                }}
                                onMouseEnter={(e) => {
                                    if (!isGenerating) {
                                        e.currentTarget.style.background = 'linear-gradient(to right, #4338ca, #6d28d9)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isGenerating) {
                                        e.currentTarget.style.background = 'linear-gradient(to right, #4f46e5, #7c3aed)';
                                    }
                                }}
                            >
                                {isGenerating ? (
                                    <>
                                        <RotateCcw style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                                        Se generează...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles style={{ width: '20px', height: '20px' }} />
                                        Generează Întrebare Nouă
                                    </>
                                )}
                            </button>
                        </div>

                        {currentQuestion && (
                            <>
                                <div style={styles.card}>
                                    <div style={styles.header}>
                                        <FileText style={{ width: '24px', height: '24px', color: '#4f46e5' }} />
                                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                                            Întrebarea {currentQuestion.type === 'GameTheory' ? '(Teoria Jocurilor)' : '(Strategii de Căutare)'}
                                        </h2>
                                    </div>
                                    <div style={styles.questionBox}>
                                        <p style={styles.questionText}>{currentQuestion.text}</p>
                                    </div>
                                    <div style={styles.problemBox}>
                                        <h4 style={styles.problemTitle}>{currentQuestion.problem.name}</h4>
                                        <p style={styles.problemDesc}>{currentQuestion.problem.description}</p>
                                        <div style={styles.instanceBox}>
                                            <p style={styles.instanceLabel}>Instanță Detaliată:</p>
                                            <p style={styles.instanceText}>{currentQuestion.problem.instance.text}</p>
                                            {currentQuestion.type === 'GameTheory' && currentQuestion.problem.instance.visual && (
                                                <div style={{ marginTop: '8px' }}>
                                                    <p style={styles.instanceLabel}>Matricea (P1, P2):</p>
                                                    <pre style={styles.instanceText}>{currentQuestion.problem.instance.visual}</pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={styles.card}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
                                        Răspunsul Tău
                                    </h3>
                                    <textarea
                                        value={userAnswer}
                                        onChange={(e) => setUserAnswer(e.target.value)}
                                        placeholder={currentQuestion.type === 'Search' ? "Introdu strategia de rezolvare... (ex: 'Backtracking', 'A*', etc.)" : "Introdu echilibrul Nash pur... (ex: 'Rând 2, Coloana 1' sau 'NU există')"}
                                        style={styles.textarea}
                                        onFocus={(e) => { e.target.style.borderColor = '#4f46e5'; }}
                                        onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
                                    />
                                    <button
                                        onClick={evaluateAnswer}
                                        disabled={!userAnswer.trim()}
                                        style={{
                                            ...styles.submitButton,
                                            ...(!userAnswer.trim() ? styles.buttonDisabled : {})
                                        }}
                                        onMouseEnter={(e) => { if (userAnswer.trim()) { e.currentTarget.style.background = '#15803d'; } }}
                                        onMouseLeave={(e) => { if (userAnswer.trim()) { e.currentTarget.style.background = '#16a34a'; } }}
                                    >
                                        <CheckCircle style={{ width: '20px', height: '20px' }} />
                                        Evaluează Răspunsul
                                    </button>
                                </div>

                                {evaluation && (
                                    <div style={styles.evaluationCard}>
                                        <div style={styles.header}>
                                            {evaluation.score >= 70 ? (
                                                <CheckCircle style={{ width: '24px', height: '24px', color: '#16a34a' }} />
                                            ) : (
                                                <AlertCircle style={{ width: '24px', height: '24px', color: '#ea580c' }} />
                                            )}
                                            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>Evaluare</h3>
                                        </div>

                                        <div style={styles.scoreContainer}>
                                            <div style={styles.scoreRow}>
                                                <span style={styles.scoreLabel}>Scor</span>
                                                <span style={{
                                                    ...styles.scoreValue,
                                                    color: evaluation.score >= 70 ? '#16a34a' : '#ea580c'
                                                }}>
                                                    {evaluation.score}%
                                                </span>
                                            </div>
                                            <div style={styles.progressBar}>
                                                <div
                                                    style={{
                                                        ...styles.progressFill,
                                                        width: `${evaluation.score}%`,
                                                        background: evaluation.score >= 70 ? '#16a34a' : '#ea580c'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div style={styles.feedbackBox}>
                                            <p style={styles.feedbackLabel}>Feedback</p>
                                            <p style={styles.feedbackText}>{evaluation.feedback}</p>
                                        </div>

                                        <div style={styles.correctBox}>
                                            <p style={styles.correctLabel}>Răspuns Corect</p>
                                            <p style={styles.correctAnswer}>{evaluation.correctAnswer.strategy}</p>
                                        </div>

                                        <div style={styles.reasonBox}>
                                            <p style={styles.reasonLabel}>Justificare Detaliată</p>
                                            <p style={styles.reasonText}>{evaluation.correctAnswer.reason}</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Chat Tab */}
                {activeTab === 'chat' && (
                    <div style={styles.chatContainer}>
                        <div style={styles.chatHeader}>
                            <h2 style={styles.chatTitle}>Agent Conversațional AI</h2>
                            <p style={styles.chatSubtitle}>Întreabă despre strategii de căutare, Echilibru Nash sau probleme specifice!</p>
                        </div>

                        <div style={styles.chatMessages}>
                            {chatMessages.length === 0 ? (
                                <div style={styles.chatEmpty}>
                                    <MessageSquare style={styles.chatEmptyIcon} />
                                    <p style={styles.chatEmptyText}>Începe o conversație despre strategii de căutare sau teorii ale jocurilor!</p>
                                    <div style={styles.suggestionGrid}>
                                        {[
                                            'N-Queens cu N=10?',
                                            'Explică Backtracking',
                                            'Hanoi 12 discuri 4 tije?',
                                            'Ce e A*?',
                                            'Echilibru Nash?',
                                            'Simulated Annealing când?'
                                        ].map((suggestion, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setChatInput(suggestion)}
                                                style={styles.suggestionButton}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = '#e0e7ff'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = '#eef2ff'; }}
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                chatMessages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            ...styles.messageRow,
                                            ...(msg.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant)
                                        }}
                                    >
                                        <div style={{
                                            ...styles.messageBubble,
                                            ...(msg.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant)
                                        }}>
                                            <p style={styles.messageText}>{msg.content}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div style={styles.chatInput}>
                            <div style={styles.chatInputRow}>
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                                    placeholder="Scrie întrebarea ta aici (ex: Nash Equilibrium (4, 5) | (5, 5)...)"
                                    style={styles.input}
                                    onFocus={(e) => { e.target.style.borderColor = '#4f46e5'; }}
                                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
                                />
                                <button
                                    onClick={handleChatSubmit}
                                    disabled={!chatInput.trim()}
                                    style={{
                                        ...styles.sendButton,
                                        ...(!chatInput.trim() ? styles.buttonDisabled : {})
                                    }}
                                    onMouseEnter={(e) => { if (chatInput.trim()) { e.currentTarget.style.background = '#4338ca'; } }}
                                    onMouseLeave={(e) => { if (chatInput.trim()) { e.currentTarget.style.background = '#4f46e5'; } }}
                                >
                                    <Send style={{ width: '20px', height: '20px' }} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default SmarTestApp;