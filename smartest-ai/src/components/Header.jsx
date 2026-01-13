import React from 'react';
import { Database } from 'lucide-react';

const Header = ({ db }) => (
    <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Database style={{ width: '32px', height: '32px', color: '#4f46e5' }} />
            <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#1f2937' }}>SmarTest AI - SQLite Database</h1>
        </div>
        <p style={{ color: '#4b5563', marginBottom: '16px' }}>Sistem cu bază de date SQLite pentru generarea și evaluarea întrebărilor AI</p>
        <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '12px', border: '1px solid #86efac' }}>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#166534', marginBottom: '4px' }}>📊 Database Status:</p>
            <p style={{ fontSize: '14px', color: '#15803d' }}>
                ✅ {db.db.problemTypes.length} Problem Types | {db.db.searchStrategies.length} Strategies | {db.db.strategyRules.length} Rules | {db.db.questionLog.length} Generated Questions
            </p>
        </div>
    </div>
);

export default Header;
