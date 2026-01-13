import { runCSPComparison } from './algorithmSolvers';
import { generateRandomCSPInstance } from './cspGenerator';

export const generateCSPInstance = () => {
    return generateRandomCSPInstance();
};

export const parseCSPQuestion = (text) => {
    // Try to parse a specific CSP instance from the text
    const specificInstance = parseSpecificCSPInstance(text);
    if (specificInstance) {
        return specificInstance;
    }

    // Fallback to general CSP detection
    const lowerText = text.toLowerCase();
    if (lowerText.includes('csp') || lowerText.includes('constraint') || lowerText.includes('satisfaction')) {
        const instance = generateCSPInstance();
        return {
            name: 'CSP (Constraint Satisfaction)',
            instance: instance
        };
    }

    return null;
};

const parseSpecificCSPInstance = (text) => {
    try {
        // Parse variables - handle both with and without line breaks
        const variablesMatch = text.match(/Variables:\s*([^\n]+?)(?=\s*(?:Domains:|$))/i);
        if (!variablesMatch) return null;

        const variablesStr = variablesMatch[1].trim();
        const variables = variablesStr.split(',').map(v => v.trim()).filter(v => v);

        // Parse domains - more flexible pattern
        const domainsMatch = text.match(/Domains:\s*([\s\S]*?)(?=\s*(?:Given:|$))/i);
        if (!domainsMatch) return null;

        const domains = {};
        const domainPattern = /(\w+)∈\{([^}]+)\}/g;
        let match;
        while ((match = domainPattern.exec(domainsMatch[1])) !== null) {
            const varName = match[1];
            const values = match[2].split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
            domains[varName] = values;
        }

        if (Object.keys(domains).length === 0) return null;

        // Parse given assignments
        const givenMatch = text.match(/Given:\s*([^\n]+?)(?=\s*(?:Find:|$))/i);
        const partial = {};
        if (givenMatch) {
            const givenStr = givenMatch[1].trim();
            const assignmentPattern = /(\w+)=(\d+)/g;
            let assignMatch;
            while ((assignMatch = assignmentPattern.exec(givenStr)) !== null) {
                partial[assignMatch[1]] = parseInt(assignMatch[2]);
            }
        }

        // Parse remaining variables to find
        const findMatch = text.match(/Find:\s*([^\n]+?)(?=\s*(?:Constraints:|$))/i);
        const remainingVariables = [];
        if (findMatch) {
            const findStr = findMatch[1].trim();
            remainingVariables.push(...findStr.split(',').map(v => v.trim()).filter(v => v));
        }

        // Parse constraints - improved to handle multiple constraints
        const constraintsMatch = text.match(/Constraints:\s*([^\n]+?)(?=\s*(?:\*\*Using|Using|$))/i);
        const constraints = {};
        const constraintDescriptions = {}; // Store human-readable descriptions
        if (constraintsMatch) {
            const constraintsStr = constraintsMatch[1].trim();
            const constraintList = constraintsStr.split(',').map(c => c.trim()).filter(c => c);
            constraintList.forEach(constraint => {
                parseConstraint(constraint, constraints, constraintDescriptions);
            });
        }

        // Parse optimization method
        const optimizationMatch = text.match(/Using\s+([^,?]+?)(?:\s*,|\s*what|\?)/i);
        const selectedOptimization = optimizationMatch ? optimizationMatch[1].trim() : 'None';

        const instance = {
            template: 'Manual Instance',
            description: 'User-provided CSP instance',
            variables,
            domains,
            constraints,
            constraintDescriptions,
            partial,
            remainingVariables,
            instanceText: `**Manual CSP Instance**\n\nVariables: ${variables.join(', ')}\n\nDomains:\n${variables.map(v => `${v}∈{${domains[v]?.join(',') || ''}}`).join(', ')}\n\nGiven: ${Object.entries(partial).map(([k, v]) => `${k}=${v}`).join(', ')}\n\nFind: ${remainingVariables.join(', ')}`
        };

        return {
            name: 'CSP (Constraint Satisfaction)',
            instance: instance,
            selectedOptimization: selectedOptimization
        };
    } catch (e) {
        console.error('Error parsing CSP instance:', e);
        return null;
    }
};

const parseConstraint = (constraintStr, constraints, constraintDescriptions = {}) => {
    constraintStr = constraintStr.trim();

    // Parse absolute difference: |x1-x2|>=2
    const absMatch = constraintStr.match(/\|(\w+)-(\w+)\|\s*(>=|<=|>|<|!=)\s*(\d+)/);
    if (absMatch) {
        const v1 = absMatch[1];
        const v2 = absMatch[2];
        const operator = absMatch[3];
        const value = parseInt(absMatch[4]);
        const key = `${v1},${v2}`;

        if (operator === '>=') {
            constraints[key] = ((val) => (a, b) => Math.abs(a - b) >= val)(value);
            constraintDescriptions[key] = `|${v1}-${v2}| >= ${value}`;
        } else if (operator === '<=') {
            constraints[key] = ((val) => (a, b) => Math.abs(a - b) <= val)(value);
            constraintDescriptions[key] = `|${v1}-${v2}| <= ${value}`;
        } else if (operator === '>') {
            constraints[key] = ((val) => (a, b) => Math.abs(a - b) > val)(value);
            constraintDescriptions[key] = `|${v1}-${v2}| > ${value}`;
        } else if (operator === '<') {
            constraints[key] = ((val) => (a, b) => Math.abs(a - b) < val)(value);
            constraintDescriptions[key] = `|${v1}-${v2}| < ${value}`;
        }
        return;
    }

    // Parse inequality: x1!=x2
    if (constraintStr.includes('!=')) {
        const [v1, v2] = constraintStr.split('!=').map(s => s.trim());
        if (v1 && v2 && !v2.match(/^\d+/)) {
            const key = `${v1},${v2}`;
            constraints[key] = (a, b) => a !== b;
            constraintDescriptions[key] = `${v1} != ${v2}`;
            return;
        }
    }

    // Parse less than or equal: x1<=x2
    if (constraintStr.includes('<=')) {
        const [v1, v2] = constraintStr.split('<=').map(s => s.trim());
        if (v1 && v2 && !v2.match(/^\d+$/)) {
            const key = `${v1},${v2}`;
            constraints[key] = (a, b) => a <= b;
            constraintDescriptions[key] = `${v1} <= ${v2}`;
            return;
        }
    }

    // Parse less than: x1<x2
    if (constraintStr.includes('<')) {
        const [v1, v2] = constraintStr.split('<').map(s => s.trim());
        if (v1 && v2 && !v2.match(/^\d+$/)) {
            const key = `${v1},${v2}`;
            constraints[key] = (a, b) => a < b;
            constraintDescriptions[key] = `${v1} < ${v2}`;
            return;
        }
    }

    // Parse greater than or equal: x1>=x2
    if (constraintStr.includes('>=')) {
        const [v1, v2] = constraintStr.split('>=').map(s => s.trim());
        if (v1 && v2 && !v2.match(/^\d+$/)) {
            const key = `${v1},${v2}`;
            constraints[key] = (a, b) => a >= b;
            constraintDescriptions[key] = `${v1} >= ${v2}`;
            return;
        }
    }

    // Parse greater than: x1>x2
    if (constraintStr.includes('>')) {
        const [v1, v2] = constraintStr.split('>').map(s => s.trim());
        if (v1 && v2 && !v2.match(/^\d+$/)) {
            const key = `${v1},${v2}`;
            constraints[key] = (a, b) => a > b;
            constraintDescriptions[key] = `${v1} > ${v2}`;
            return;
        }
    }
};

export const determineCSPStrategy = (optimization) => {
    const strategies = {
        'None': 'Backtracking without optimizations',
        'MRV (Minimum Remaining Values)': 'Selects the variable with the smallest domain',
        'Forward Checking': 'Checks consistency of neighbor variables ahead',
        'AC-3': 'Establishes arc consistency'
    };

    return strategies[optimization] || 'Unknown';
};

export const solveCSPQuestion = (instance, selectedOptimization) => {
    const comparisonResults = runCSPComparison(
        instance.variables,
        instance.domains,
        instance.constraints,
        instance.partial
    );

    const selectedResult = comparisonResults.find(r => r.optimization === selectedOptimization);

    if (!selectedResult) {
        return null;
    }

    const allVars = instance.variables;
    const remainingVars = allVars.filter(v => !(v in instance.partial));
    const finalAssignment = selectedResult.solution || {};

    return {
        optimization: selectedOptimization,
        solution: selectedResult,
        remainingVariables: remainingVars,
        finalAssignment: finalAssignment,
        comparisonResults: comparisonResults
    };
};
