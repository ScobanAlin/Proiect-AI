import React, { useState } from 'react';
import { generateTest, generateBothPDFs } from '../utils/testGenerator';
import { Download, Loader, FileText, Sparkles, Settings, CheckCircle, Layers, Box, Zap, Search } from 'lucide-react';

const TestGenerator = () => {
    const [selectedTypes, setSelectedTypes] = useState(['search']);
    const [difficulty, setDifficulty] = useState('medium');
    const [numQuestions, setNumQuestions] = useState(10);
    const [loading, setLoading] = useState(false);
    const [generated, setGenerated] = useState(null);

    const questionTypes = [
        { id: 'search', label: 'Strategii Căutare', icon: Search },
        { id: 'csp', label: 'CSP', icon: Layers },
        { id: 'nash', label: 'Echilibru Nash', icon: Box },
        { id: 'adversarial', label: 'Minimax + αβ', icon: Zap }
    ];

    const difficultyConfig = {
        easy: { label: 'Ușor', color: '#38ef7d', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
        medium: { label: 'Mediu', color: '#f2c94c', gradient: 'linear-gradient(135deg, #f2994a 0%, #f2c94c 100%)' },
        hard: { label: 'Dificil', color: '#f5576c', gradient: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)' }
    };

    const handleTypeToggle = (typeId) => {
        setSelectedTypes(prev =>
            prev.includes(typeId)
                ? prev.filter(t => t !== typeId)
                : [...prev, typeId]
        );
    };

    const handleGenerateTest = async () => {
        if (selectedTypes.length === 0) {
            alert('Te rog selectează cel puțin un tip de întrebare');
            return;
        }

        setLoading(true);
        try {
            const result = await generateTest(selectedTypes, difficulty, numQuestions);
            setGenerated(result);
        } catch (error) {
            console.error('Error generating test:', error);
            alert('Eroare la generarea testului. Te rog încearcă din nou.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDFs = () => {
        if (generated) {
            generateBothPDFs(generated.questions, generated.answers, difficulty);
        }
    };

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '28px',
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
                        <FileText style={{ width: '28px', height: '28px', color: 'white' }} />
                    </div>
                    <div>
                        <h2 style={{
                            fontSize: '22px',
                            fontWeight: '700',
                            color: '#1e293b',
                            margin: 0,
                            letterSpacing: '-0.3px'
                        }}>Generator de Teste AI</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#38ef7d',
                                boxShadow: '0 0 10px rgba(56, 239, 125, 0.5)'
                            }} />
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Generare PDF automată</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ padding: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Configuration Panel */}
                <div style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <Settings style={{ width: '22px', height: '22px', color: '#667eea' }} />
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Configurare Test</h3>
                    </div>

                    {/* Question Types */}
                    <div style={{ marginBottom: '24px' }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '12px' }}>Tipuri de Întrebări</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {questionTypes.map(type => {
                                const Icon = type.icon;
                                const isSelected = selectedTypes.includes(type.id);
                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => handleTypeToggle(type.id)}
                                        style={{
                                            padding: '14px 16px',
                                            borderRadius: '14px',
                                            border: isSelected ? '2px solid #667eea' : '2px solid rgba(102, 126, 234, 0.2)',
                                            background: isSelected
                                                ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)'
                                                : 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                                        }}
                                    >
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '10px',
                                            background: isSelected
                                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                : 'rgba(102, 126, 234, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s'
                                        }}>
                                            <Icon style={{
                                                width: '16px',
                                                height: '16px',
                                                color: isSelected ? 'white' : '#667eea'
                                            }} />
                                        </div>
                                        <span style={{
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: isSelected ? '#667eea' : '#64748b'
                                        }}>{type.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Difficulty Level */}
                    <div style={{ marginBottom: '24px' }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '12px' }}>Nivel Dificultate</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {Object.entries(difficultyConfig).map(([level, config]) => (
                                <button
                                    key={level}
                                    onClick={() => setDifficulty(level)}
                                    style={{
                                        flex: 1,
                                        padding: '14px 16px',
                                        borderRadius: '14px',
                                        border: difficulty === level ? 'none' : '2px solid rgba(102, 126, 234, 0.15)',
                                        background: difficulty === level ? config.gradient : 'white',
                                        color: difficulty === level ? 'white' : '#64748b',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: difficulty === level ? `0 8px 20px ${config.color}40` : 'none',
                                        transform: difficulty === level ? 'translateY(-2px)' : 'translateY(0)'
                                    }}
                                >
                                    {config.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Number of Questions */}
                    <div style={{ marginBottom: '28px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', margin: 0 }}>Număr Întrebări</p>
                            <span style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontSize: '14px',
                                fontWeight: '700'
                            }}>{numQuestions}</span>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="range"
                                min="5"
                                max="20"
                                step="1"
                                value={numQuestions}
                                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                                style={{
                                    width: '100%',
                                    height: '8px',
                                    borderRadius: '4px',
                                    appearance: 'none',
                                    background: `linear-gradient(to right, #667eea 0%, #764ba2 ${(numQuestions - 5) / 15 * 100}%, rgba(102, 126, 234, 0.2) ${(numQuestions - 5) / 15 * 100}%, rgba(102, 126, 234, 0.2) 100%)`,
                                    cursor: 'pointer'
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>5</span>
                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>20</span>
                            </div>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerateTest}
                        disabled={loading || selectedTypes.length === 0}
                        style={{
                            width: '100%',
                            padding: '16px 24px',
                            borderRadius: '14px',
                            border: 'none',
                            background: loading || selectedTypes.length === 0
                                ? 'rgba(102, 126, 234, 0.3)'
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '15px',
                            cursor: loading || selectedTypes.length === 0 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            boxShadow: loading || selectedTypes.length === 0 ? 'none' : '0 8px 25px rgba(102, 126, 234, 0.4)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                                Se generează testul...
                            </>
                        ) : (
                            <>
                                <Sparkles style={{ width: '20px', height: '20px' }} />
                                Generează Test
                            </>
                        )}
                    </button>
                </div>

                {/* Preview & Download Panel */}
                <div style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <CheckCircle style={{ width: '22px', height: '22px', color: '#667eea' }} />
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Sumar Test</h3>
                    </div>

                    {generated ? (
                        <div>
                            {/* Stats Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                <div style={{
                                    background: 'white',
                                    borderRadius: '14px',
                                    padding: '16px',
                                    border: '1px solid rgba(102, 126, 234, 0.1)'
                                }}>
                                    <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Total Întrebări</p>
                                    <p style={{ fontSize: '28px', fontWeight: '700', color: '#667eea', margin: 0 }}>{generated.questions.length}</p>
                                </div>
                                <div style={{
                                    background: 'white',
                                    borderRadius: '14px',
                                    padding: '16px',
                                    border: '1px solid rgba(102, 126, 234, 0.1)'
                                }}>
                                    <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Dificultate</p>
                                    <p style={{
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        color: difficultyConfig[difficulty].color.replace('40', ''),
                                        margin: 0,
                                        textTransform: 'uppercase'
                                    }}>{difficultyConfig[difficulty].label}</p>
                                </div>
                            </div>

                            {/* Type Tags */}
                            <div style={{ marginBottom: '20px' }}>
                                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>Tipuri incluse:</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {Array.from(new Set(generated.questions.map(q => q.type))).map(type => (
                                        <span key={type} style={{
                                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                                            color: '#667eea',
                                            padding: '8px 14px',
                                            borderRadius: '20px',
                                            fontSize: '13px',
                                            fontWeight: '600'
                                        }}>
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Breakdown */}
                            <div style={{
                                background: 'white',
                                borderRadius: '14px',
                                padding: '16px',
                                marginBottom: '20px',
                                border: '1px solid rgba(102, 126, 234, 0.1)'
                            }}>
                                <p style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>Distribuție Întrebări</p>
                                {Array.from(new Set(generated.questions.map(q => q.type))).map(type => {
                                    const count = generated.questions.filter(q => q.type === type).length;
                                    const percentage = (count / generated.questions.length) * 100;
                                    return (
                                        <div key={type} style={{ marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <span style={{ fontSize: '13px', color: '#64748b' }}>{type}</span>
                                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#667eea' }}>{count}</span>
                                            </div>
                                            <div style={{
                                                height: '6px',
                                                background: 'rgba(102, 126, 234, 0.1)',
                                                borderRadius: '3px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    width: `${percentage}%`,
                                                    height: '100%',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    borderRadius: '3px',
                                                    transition: 'width 0.5s ease'
                                                }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Download Button */}
                            <button
                                onClick={handleDownloadPDFs}
                                style={{
                                    width: '100%',
                                    padding: '16px 24px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                    color: 'white',
                                    fontWeight: '700',
                                    fontSize: '15px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    boxShadow: '0 8px 25px rgba(240, 147, 251, 0.4)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <Download style={{ width: '20px', height: '20px' }} />
                                Descarcă PDF-uri
                            </button>
                            <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginTop: '12px' }}>
                                Un PDF cu întrebări și unul cu răspunsuri
                            </p>
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px'
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                margin: '0 auto 20px',
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(240, 147, 251, 0.1) 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FileText style={{ width: '36px', height: '36px', color: '#667eea' }} />
                            </div>
                            <h4 style={{ color: '#1e293b', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                                Niciun test generat
                            </h4>
                            <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '220px', margin: '0 auto' }}>
                                Configurează și generează un test pentru a vedea previzualizarea
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Generated Questions Preview */}
            {generated && (
                <div style={{
                    padding: '0 28px 28px',
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        borderRadius: '20px',
                        padding: '24px',
                        border: '1px solid rgba(102, 126, 234, 0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <Sparkles style={{ width: '22px', height: '22px', color: '#667eea' }} />
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Previzualizare Întrebări</h3>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '16px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            paddingRight: '8px'
                        }}>
                            {generated.questions.map((q) => (
                                <div key={q.number} style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    padding: '18px',
                                    border: '1px solid rgba(102, 126, 234, 0.1)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'default'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 12px 30px rgba(102, 126, 234, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <span style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            padding: '6px 12px',
                                            borderRadius: '10px',
                                            fontSize: '13px',
                                            fontWeight: '700'
                                        }}>Q{q.number}</span>
                                        <span style={{
                                            background: 'rgba(102, 126, 234, 0.1)',
                                            color: '#667eea',
                                            padding: '4px 10px',
                                            borderRadius: '8px',
                                            fontSize: '11px',
                                            fontWeight: '600'
                                        }}>{q.type}</span>
                                    </div>
                                    <p style={{
                                        fontSize: '13px',
                                        color: '#64748b',
                                        lineHeight: '1.5',
                                        margin: 0,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>{q.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    cursor: pointer;
                    box-shadow: 0 4px 10px rgba(102, 126, 234, 0.4);
                    border: 3px solid white;
                }
                input[type="range"]::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    cursor: pointer;
                    box-shadow: 0 4px 10px rgba(102, 126, 234, 0.4);
                    border: 3px solid white;
                }
            `}</style>
        </div>
    );
};

export default TestGenerator;
