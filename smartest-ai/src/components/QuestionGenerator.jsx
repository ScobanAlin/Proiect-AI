import React, { useState } from 'react';
import { Sparkles, FileText, CheckCircle, AlertCircle, RotateCcw, Box, Zap, Layers } from 'lucide-react';

// Helper to format constraint functions into symbolic strings
const formatConstraint = (key, fn) => {
    const [a, b] = key.split(',');
    const body = fn.toString();
    if (body.includes('!==') || body.includes('!=') || body.includes('!==')) return `${a}!=${b}`;
    if (body.includes('a < b')) return `${a}<${b}`;
    if (body.includes('a <= b')) return `${a}<=${b}`;
    if (body.includes('a > b')) return `${a}>${b}`;
    if (body.includes('a + b') && body.includes('<=')) return `${a}+${b}<=k`;
    if (body.includes('Math.abs') && body.includes('>= 2')) return `|${a}-${b}|>=2`;
    return `${a}?${b}`;
};

const QuestionGenerator = ({ generateQuestion, evaluateAnswer }) => {
    const [questionType, setQuestionType] = useState('search');
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [evaluation, setEvaluation] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateQuestion = async () => {
        setIsGenerating(true);
        setEvaluation(null);
        setUserAnswer('');
        const question = await generateQuestion(questionType);
        setCurrentQuestion(question);
        setIsGenerating(false);
    };

    const handleEvaluateAnswer = async () => {
        if (!userAnswer.trim() || !currentQuestion) return;
        const result = evaluateAnswer(currentQuestion, userAnswer);
        setEvaluation(result);
    };

    return (
        <div>
            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', padding: '0 8px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => { setQuestionType('search'); setCurrentQuestion(null); setEvaluation(null); setUserAnswer(''); }}
                        style={{ flex: 1, minWidth: '140px', padding: '12px 16px', borderRadius: '12px', fontWeight: '600', border: '2px solid #e5e7eb', cursor: 'pointer', background: questionType === 'search' ? '#eef2ff' : 'white', color: questionType === 'search' ? '#4f46e5' : '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
                        <Sparkles style={{ width: '20px', height: '20px' }} />
                        Strategii Căutare
                    </button>
                    <button
                        onClick={() => { setQuestionType('nash'); setCurrentQuestion(null); setEvaluation(null); setUserAnswer(''); }}
                        style={{ flex: 1, minWidth: '140px', padding: '12px 16px', borderRadius: '12px', fontWeight: '600', border: '2px solid #e5e7eb', cursor: 'pointer', background: questionType === 'nash' ? '#eef2ff' : 'white', color: questionType === 'nash' ? '#4f46e5' : '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
                        <Box style={{ width: '20px', height: '20px' }} />
                        Echilibru Nash
                    </button>
                    <button
                        onClick={() => { setQuestionType('csp'); setCurrentQuestion(null); setEvaluation(null); setUserAnswer(''); }}
                        style={{ flex: 1, minWidth: '140px', padding: '12px 16px', borderRadius: '12px', fontWeight: '600', border: '2px solid #e5e7eb', cursor: 'pointer', background: questionType === 'csp' ? '#eef2ff' : 'white', color: questionType === 'csp' ? '#4f46e5' : '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
                        <Layers style={{ width: '20px', height: '20px' }} />
                        CSP
                    </button>
                    <button
                        onClick={() => { setQuestionType('adversarial'); setCurrentQuestion(null); setEvaluation(null); setUserAnswer(''); }}
                        style={{ flex: 1, minWidth: '140px', padding: '12px 16px', borderRadius: '12px', fontWeight: '600', border: '2px solid #e5e7eb', cursor: 'pointer', background: questionType === 'adversarial' ? '#eef2ff' : 'white', color: questionType === 'adversarial' ? '#4f46e5' : '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
                        <Zap style={{ width: '20px', height: '20px' }} />
                        Minimax + αβ
                    </button>
                </div>
                <button
                    onClick={handleGenerateQuestion}
                    disabled={isGenerating}
                    style={{ width: '100%', background: isGenerating ? 'rgba(79, 70, 229, 0.5)' : 'linear-gradient(to right, #4f46e5, #7c3aed)', color: 'white', padding: '16px', borderRadius: '12px', fontWeight: '600', border: 'none', cursor: isGenerating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s' }}>
                    {isGenerating ? <><RotateCcw style={{ width: '20px', height: '20px' }} /> Se generează...</> : <><Sparkles style={{ width: '20px', height: '20px' }} /> Generează Întrebare Nouă</>}
                </button>
            </div>

            {currentQuestion && (
                <>
                    <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '24px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <FileText style={{ width: '24px', height: '24px', color: '#4f46e5' }} />
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                                Întrebarea {currentQuestion.type === 'GameTheory' ? '(Teoria Jocurilor)' : currentQuestion.type === 'CSP' ? '(CSP)' : currentQuestion.type === 'Adversarial' ? '(Minimax + αβ)' : '(Strategii de Căutare)'}
                            </h2>
                        </div>
                        <div style={{ background: '#eef2ff', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                            <p style={{ color: '#374151', whiteSpace: 'pre-line', fontWeight: '500', fontSize: '18px' }}>{currentQuestion.text}</p>
                        </div>
                        <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '16px', borderLeft: '4px solid #818cf8' }}>
                            <h4 style={{ fontWeight: 'bold', color: '#4338ca', fontSize: '18px', marginBottom: '8px' }}>{currentQuestion.problem.name}</h4>
                            <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '12px' }}>{currentQuestion.problem.description}</p>

                            {currentQuestion.type === 'CSP' && (
                                <CSPProblemDisplay problem={currentQuestion.problem} selectedOptimization={currentQuestion.selectedOptimization} />
                            )}

                            {currentQuestion.type !== 'CSP' && (
                                <div style={{ background: 'white', borderRadius: '8px', padding: '12px', border: '1px solid #c7d2fe' }}>
                                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Instanță Detaliată:</p>
                                    <p style={{ fontWeight: '600', color: '#1f2937', whiteSpace: 'pre-line' }}>{currentQuestion.problem.instance.text}</p>
                                    {currentQuestion.type === 'GameTheory' && currentQuestion.problem.instance.visual && (
                                        <div style={{ marginTop: '8px' }}>
                                            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Matricea (P1, P2):</p>
                                            <pre style={{ fontWeight: '600', color: '#1f2937', whiteSpace: 'pre-line' }}>{currentQuestion.problem.instance.visual}</pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {currentQuestion.type === 'Search' && currentQuestion.comparisonResults && currentQuestion.comparisonResults.length > 0 && evaluation && (
                            <ComparisonTable comparisonResults={currentQuestion.comparisonResults} bestStrategy={currentQuestion.bestStrategy} />
                        )}

                        {currentQuestion.type === 'CSP' && currentQuestion.comparisonResults && evaluation && (
                            <CSPComparisonTable comparisonResults={currentQuestion.comparisonResults} selectedOptimization={currentQuestion.selectedOptimization} />
                        )}
                    </div>

                    <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '24px', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>Răspunsul Tău</h3>
                        {currentQuestion.type === 'CSP' ? (
                            <CSPAnswerInput userAnswer={userAnswer} setUserAnswer={setUserAnswer} remainingVariables={currentQuestion.remainingVariables} />
                        ) : (
                            <textarea
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                placeholder="Introdu răspunsul..."
                                style={{ width: '100%', height: '128px', padding: '16px', border: '2px solid #e5e7eb', borderRadius: '12px', resize: 'none', fontFamily: 'inherit', fontSize: '14px', outline: 'none' }}
                            />
                        )}
                        <button
                            onClick={handleEvaluateAnswer}
                            disabled={!userAnswer.trim()}
                            style={{ marginTop: '16px', width: '100%', background: userAnswer.trim() ? '#16a34a' : 'rgba(22, 163, 74, 0.5)', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: '600', border: 'none', cursor: userAnswer.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s' }}>
                            <CheckCircle style={{ width: '20px', height: '20px' }} />
                            Evaluează Răspunsul
                        </button>
                    </div>

                    {evaluation && (
                        <EvaluationCard evaluation={evaluation} currentQuestion={currentQuestion} />
                    )}
                </>
            )}
        </div>
    );
};

// CSP Problem Display Component
const CSPProblemDisplay = ({ problem, selectedOptimization }) => {
    const constraintsFormatted = problem.instance.constraintsFormatted || [];

    return (
        <div style={{ background: 'white', borderRadius: '8px', padding: '12px', border: '1px solid #c7d2fe' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>Problem Definition:</p>
            <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.6' }}>
                <p><strong>Variables:</strong> {problem.instance.variables.join(', ')}</p>
                <p><strong>Domains:</strong></p>
                <div style={{ marginLeft: '20px', marginTop: '4px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {Object.entries(problem.instance.domains).map(([v, d]) => (
                        <div key={v} style={{ background: '#f3f4f6', padding: '6px', borderRadius: '4px', fontSize: '12px' }}>
                            <strong>{v}</strong>: {`{${d.join(',')}}`} <span style={{ color: '#6b7280' }}>|D|={d.length}</span>
                        </div>
                    ))}
                </div>
                <p style={{ marginTop: '12px' }}><strong>Constraints:</strong></p>
                <ul style={{ marginLeft: '20px', marginTop: '4px' }}>
                    {constraintsFormatted.length === 0 && <li style={{ color: '#6b7280' }}>None</li>}
                    {constraintsFormatted.map(({ key, text }) => (
                        <li key={key} style={{ background: '#eef2ff', padding: '4px 8px', borderRadius: '4px', marginBottom: '4px', width: 'fit-content', fontFamily: 'monospace' }}>
                            {text}
                        </li>
                    ))}
                </ul>
                <p style={{ marginTop: '12px' }}><strong>Partial Assignment:</strong></p>
                <ul style={{ marginLeft: '20px', marginTop: '4px' }}>
                    {Object.entries(problem.instance.partial).map(([v, val]) => (
                        <li key={v} style={{ background: '#dcfce7', padding: '4px 8px', borderRadius: '4px', marginBottom: '4px', width: 'fit-content' }}>
                            {v} = {val}
                        </li>
                    ))}
                </ul>
                <p style={{ marginTop: '12px', background: '#f0fdf4', padding: '8px', borderRadius: '6px', color: '#166534' }}>
                    <strong>Optimization:</strong> {selectedOptimization}
                </p>
            </div>
        </div>
    );
};

// CSP Answer Input Component
const CSPAnswerInput = ({ userAnswer, setUserAnswer, remainingVariables }) => {
    return (
        <div>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                Format: Variable=Value, separated by commas. Example: V3=Red, V4=Green, V5=Blue
            </p>
            <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '8px', marginBottom: '8px', fontSize: '12px', color: '#6b7280' }}>
                <strong>Variables to assign:</strong> {remainingVariables.join(', ')}
            </div>
            <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="V1=Red, V2=Green, V3=Blue"
                style={{ width: '100%', height: '128px', padding: '16px', border: '2px solid #e5e7eb', borderRadius: '12px', resize: 'none', fontFamily: 'monospace', fontSize: '14px', outline: 'none' }}
            />
        </div>
    );
};

// Comparison Table Component
const ComparisonTable = ({ comparisonResults, bestStrategy }) => {
    return (
        <div style={{ background: '#f0f9ff', borderRadius: '12px', padding: '16px', marginTop: '16px', borderLeft: '4px solid #0284c7' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap style={{ width: '16px', height: '16px' }} />
                Comparație Algoritmi - Rezultate Execuție
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                    <tr>
                        <th style={{ background: '#e0f2fe', padding: '8px', textAlign: 'left', fontWeight: '600', color: '#0c4a6e', borderBottom: '2px solid #0284c7' }}>Algoritm</th>
                        <th style={{ background: '#e0f2fe', padding: '8px', textAlign: 'left', fontWeight: '600', color: '#0c4a6e', borderBottom: '2px solid #0284c7' }}>Status</th>
                        <th style={{ background: '#e0f2fe', padding: '8px', textAlign: 'left', fontWeight: '600', color: '#0c4a6e', borderBottom: '2px solid #0284c7' }}>Timp (ms)</th>
                        <th style={{ background: '#e0f2fe', padding: '8px', textAlign: 'left', fontWeight: '600', color: '#0c4a6e', borderBottom: '2px solid #0284c7' }}>Noduri Explorate</th>
                    </tr>
                </thead>
                <tbody>
                    {comparisonResults.map((result, idx) => (
                        <tr key={idx} style={bestStrategy && result === bestStrategy ? { background: '#cffafe' } : {}}>
                            <td style={{ padding: '8px', borderBottom: '1px solid #bae6fd', color: '#164e63', fontWeight: bestStrategy && result === bestStrategy ? '600' : 'normal' }}>
                                {result.strategyUsed}
                                {bestStrategy && result === bestStrategy && ' ⭐'}
                            </td>
                            <td style={{ padding: '8px', borderBottom: '1px solid #bae6fd', color: '#164e63' }}>
                                {result.found ? '✅ Soluție găsită' : '⚠️ Nu s-a găsi'}
                            </td>
                            <td style={{ padding: '8px', borderBottom: '1px solid #bae6fd', fontWeight: 'bold', color: result === bestStrategy ? '#0c4a6e' : '#164e63' }}>
                                {result.executionTime}
                            </td>
                            <td style={{ padding: '8px', borderBottom: '1px solid #bae6fd', color: '#164e63' }}>{result.nodesExplored}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {bestStrategy && (
                <div style={{ marginTop: '12px', padding: '8px', background: '#d1fae5', borderRadius: '6px', fontSize: '13px', color: '#065f46' }}>
                    <strong>Cel mai rapid:</strong> {bestStrategy.strategyUsed} - {bestStrategy.executionTime}ms
                </div>
            )}
        </div>
    );
};

// CSP Comparison Table Component
const CSPComparisonTable = ({ comparisonResults, selectedOptimization }) => {
    return (
        <div style={{ background: '#f0f9ff', borderRadius: '12px', padding: '16px', marginTop: '16px', borderLeft: '4px solid #0284c7' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap style={{ width: '16px', height: '16px' }} />
                Comparație Optimizări - Rezultate Execuție
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                    <tr>
                        <th style={{ background: '#e0f2fe', padding: '8px', textAlign: 'left', fontWeight: '600', color: '#0c4a6e', borderBottom: '2px solid #0284c7' }}>Optimizare</th>
                        <th style={{ background: '#e0f2fe', padding: '8px', textAlign: 'left', fontWeight: '600', color: '#0c4a6e', borderBottom: '2px solid #0284c7' }}>Status</th>
                        <th style={{ background: '#e0f2fe', padding: '8px', textAlign: 'left', fontWeight: '600', color: '#0c4a6e', borderBottom: '2px solid #0284c7' }}>Timp (ms)</th>
                        <th style={{ background: '#e0f2fe', padding: '8px', textAlign: 'left', fontWeight: '600', color: '#0c4a6e', borderBottom: '2px solid #0284c7' }}>Noduri Explorate</th>
                    </tr>
                </thead>
                <tbody>
                    {comparisonResults.map((result, idx) => (
                        <tr key={idx} style={result.optimization === selectedOptimization ? { background: '#cffafe' } : {}}>
                            <td style={{ padding: '8px', borderBottom: '1px solid #bae6fd', color: '#164e63', fontWeight: result.optimization === selectedOptimization ? '600' : 'normal' }}>
                                {result.optimization}
                                {result.optimization === selectedOptimization && ' ⭐'}
                            </td>
                            <td style={{ padding: '8px', borderBottom: '1px solid #bae6fd', color: '#164e63' }}>
                                {result.found ? '✅ Soluție găsită' : '⚠️ Nu s-a găsi'}
                            </td>
                            <td style={{ padding: '8px', borderBottom: '1px solid #bae6fd', fontWeight: 'bold', color: result.optimization === selectedOptimization ? '#0c4a6e' : '#164e63' }}>
                                {result.executionTime}
                            </td>
                            <td style={{ padding: '8px', borderBottom: '1px solid #bae6fd', color: '#164e63' }}>{result.nodesExplored}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Evaluation Card Component
const EvaluationCard = ({ evaluation, currentQuestion }) => {
    return (
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                {evaluation.score >= 70 ? <CheckCircle style={{ width: '24px', height: '24px', color: '#16a34a' }} /> : <AlertCircle style={{ width: '24px', height: '24px', color: '#ea580c' }} />}
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>Evaluare</h3>
            </div>
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#374151', fontWeight: '500' }}>Scor</span>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: evaluation.score >= 70 ? '#16a34a' : '#ea580c' }}>{evaluation.score}%</span>
                </div>
                <div style={{ width: '100%', background: '#e5e7eb', borderRadius: '9999px', height: '12px' }}>
                    <div style={{ height: '12px', borderRadius: '9999px', transition: 'all 0.3s', width: `${evaluation.score}%`, background: evaluation.score >= 70 ? '#16a34a' : '#ea580c' }} />
                </div>
            </div>
            <div style={{ background: '#dbeafe', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e3a8a', marginBottom: '4px' }}>Feedback</p>
                <p style={{ color: '#374151' }}>{evaluation.feedback}</p>
            </div>
            <div style={{ background: '#dcfce7', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#14532d', marginBottom: '8px' }}>Răspuns Corect</p>
                <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{evaluation.correctAnswer.strategy}</p>
            </div>
            <div style={{ background: '#faf5ff', borderRadius: '8px', padding: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#581c87', marginBottom: '8px' }}>Justificare Detaliată</p>
                <p style={{ color: '#374151', whiteSpace: 'pre-wrap' }}>{evaluation.correctAnswer.reason}</p>
            </div>
        </div>
    );
};

export default QuestionGenerator;
