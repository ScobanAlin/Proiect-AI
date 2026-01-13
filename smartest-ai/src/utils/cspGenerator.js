import { db } from '../services/database';

const CSP_TEMPLATES = [
    {
        id: 1,
        name: 'Inequality Constraints',
        description: 'All different constraints',
        generateInstance: (numVars, config) => {
            const variables = Array.from({ length: numVars }, (_, i) => `x${i + 1}`);
            const maxDomainSize = config?.maxDomainSize || 3;
            const maxValue = config?.maxValue || 15;

            const domains = {};
            variables.forEach(v => {
                const domainSize = Math.floor(Math.random() * (maxDomainSize - 1)) + 2;
                const domainValues = new Set();
                while (domainValues.size < domainSize) {
                    domainValues.add(Math.floor(Math.random() * maxValue) + 1);
                }
                domains[v] = Array.from(domainValues).sort((a, b) => a - b);
            });

            const constraints = {};

            // Add random inequality constraints between pairs
            for (let i = 0; i < variables.length - 1; i++) {
                if (Math.random() > 0.3) {
                    const key = `${variables[i]},${variables[i + 1]}`;
                    constraints[key] = (a, b) => a !== b;
                }
            }

            const numPartial = Math.ceil(numVars / 3);
            const partial = {};
            for (let i = 0; i < numPartial; i++) {
                const v = variables[i];
                partial[v] = domains[v][Math.floor(Math.random() * domains[v].length)];
            }

            return { variables, domains, constraints, partial };
        }
    },
    {
        id: 2,
        name: 'Arithmetic Constraints',
        description: 'Comparison constraints',
        generateInstance: (numVars, config) => {
            const variables = Array.from({ length: numVars }, (_, i) => `x${i + 1}`);
            const maxValue = config?.maxValue || 15;
            const maxDomainSize = config?.maxDomainSize || 3;

            const domains = {};
            variables.forEach(v => {
                const domainSize = Math.floor(Math.random() * (maxDomainSize - 1)) + 2;
                const domainValues = new Set();
                while (domainValues.size < domainSize) {
                    domainValues.add(Math.floor(Math.random() * maxValue) + 1);
                }
                domains[v] = Array.from(domainValues).sort((a, b) => a - b);
            });

            const constraints = {};
            const constraintTypes = ['less', 'lessEqual'];

            // Add random comparison constraints
            for (let i = 0; i < variables.length - 1; i++) {
                const key = `${variables[i]},${variables[i + 1]}`;
                const type = constraintTypes[Math.floor(Math.random() * constraintTypes.length)];

                if (type === 'less') {
                    constraints[key] = (a, b) => a < b;
                } else {
                    constraints[key] = (a, b) => a <= b;
                }
            }

            const numPartial = Math.ceil(numVars / 3);
            const partial = {};
            for (let i = 0; i < numPartial; i++) {
                const v = variables[i];
                partial[v] = domains[v][Math.floor(Math.random() * domains[v].length)];
            }

            return { variables, domains, constraints, partial };
        }
    },
    {
        id: 3,
        name: 'Mixed Constraints',
        description: 'Combination of different constraint types',
        generateInstance: (numVars, config) => {
            const variables = Array.from({ length: numVars }, (_, i) => `x${i + 1}`);
            const maxValue = config?.maxValue || 15;
            const maxDomainSize = config?.maxDomainSize || 3;

            const domains = {};
            variables.forEach(v => {
                const domainSize = Math.floor(Math.random() * (maxDomainSize - 1)) + 2;
                const domainValues = new Set();
                while (domainValues.size < domainSize) {
                    domainValues.add(Math.floor(Math.random() * maxValue) + 1);
                }
                domains[v] = Array.from(domainValues).sort((a, b) => a - b);
            });

            const constraints = {};
            const constraintTypes = ['notEqual', 'less', 'lessEqual', 'abs'];

            // Add random mixed constraints
            for (let i = 0; i < variables.length - 1; i++) {
                const key = `${variables[i]},${variables[i + 1]}`;
                const type = constraintTypes[Math.floor(Math.random() * constraintTypes.length)];

                switch (type) {
                    case 'notEqual':
                        constraints[key] = (a, b) => a !== b;
                        break;
                    case 'less':
                        constraints[key] = (a, b) => a < b;
                        break;
                    case 'lessEqual':
                        constraints[key] = (a, b) => a <= b;
                        break;
                    case 'abs':
                        constraints[key] = (a, b) => Math.abs(a - b) >= 2;
                        break;
                }
            }

            const numPartial = Math.ceil(numVars / 3);
            const partial = {};
            for (let i = 0; i < numPartial; i++) {
                const v = variables[i];
                partial[v] = domains[v][Math.floor(Math.random() * domains[v].length)];
            }

            return { variables, domains, constraints, partial };
        }
    }
];

export const generateRandomCSPInstance = (minVars = 3, maxVars = 5, difficultyConfig = {}) => {
    // Adjust based on difficulty
    let varRange = { min: minVars, max: maxVars };

    if (difficultyConfig.difficulty === 'easy') {
        varRange = { min: 2, max: 3 };
    } else if (difficultyConfig.difficulty === 'medium') {
        varRange = { min: 3, max: 4 };
    } else if (difficultyConfig.difficulty === 'hard') {
        varRange = { min: 4, max: 6 };
    }

    const numVars = Math.floor(Math.random() * (varRange.max - varRange.min + 1)) + varRange.min;
    const template = CSP_TEMPLATES[Math.floor(Math.random() * CSP_TEMPLATES.length)];

    const instance = template.generateInstance(numVars, {
        maxDomainSize: 3,
        maxValue: 15
    });

    const remainingVars = instance.variables.filter(v => !(v in instance.partial));

    const instanceText = `**${template.name}**\n\nVariables: ${instance.variables.join(', ')}\n\nDomains:\n${instance.variables.map(v => `${v}∈{${instance.domains[v].join(',')}}`).join(', ')
        }\n\nGiven: ${Object.entries(instance.partial).map(([k, v]) => `${k}=${v}`).join(', ')}\n\nFind: ${remainingVars.join(', ')}`;

    return {
        template: template.name,
        description: template.description,
        variables: instance.variables,
        domains: instance.domains,
        constraints: instance.constraints,
        partial: instance.partial,
        instanceText,
        remainingVariables: remainingVars
    };
};

export const generateCSPInstance = () => {
    return generateRandomCSPInstance(3, 5);
};
