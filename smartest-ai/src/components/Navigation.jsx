import React from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab }) => (
    <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', marginBottom: '24px', padding: '8px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
            {[
                { id: 'generator', icon: Sparkles, label: 'Generator Întrebări' },
                { id: 'chat', icon: MessageSquare, label: 'Agent Conversațional' }
            ].map(({ id, icon: Icon, label }) => (
                <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    style={{
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
                        cursor: 'pointer',
                        ...(activeTab === id
                            ? { background: '#4f46e5', color: 'white', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }
                            : { color: '#4b5563', background: 'transparent' })
                    }}
                >
                    <Icon style={{ width: '20px', height: '20px' }} />
                    {label}
                </button>
            ))}
        </div>
    </div>
);

export default Navigation;
