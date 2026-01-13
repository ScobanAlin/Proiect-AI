import { seedDatabase } from './databaseSeed.js';
import createTemplateDatabaseService from './TemplateDbService.js';
import createTemplateQuestionGenerator from './TemplateQuestionGeneratorSimplified.js';
import DATABASE_SEED from './databaseSeedTemplate.js';

class DatabaseService {
    constructor() {
        this.db = {
            problemTypes: [],
            searchStrategies: [],
            instanceConfigs: [],
            strategyRules: [],
            gameConfigs: [],
            cspConfigs: [],
            questionLog: []
        };
        this.initialized = false;
        this.templateDb = null;
        this.questionGenerator = null;
    }

    init() {
        if (this.initialized) return;

        // Initialize legacy database system (for backward compatibility)
        const seedSQL = seedDatabase();
        const statements = seedSQL
            .split(/;(?=\s*(?:INSERT|$))/)
            .map(s => s.trim())
            .filter(s => s.length > 0);

        statements.forEach(stmt => {
            const cleanStmt = stmt.replace(/\s+/g, ' ');
            this._parseProblemTypes(cleanStmt);
            this._parseSearchStrategies(cleanStmt);
            this._parseInstanceConfigs(cleanStmt);
            this._parseStrategyRules(cleanStmt);
            this._parseGameConfigs(cleanStmt);
            this._parseCSPConfigs(cleanStmt);
        });

        // Initialize template system
        this.initializeTemplateSystem();

        this.initialized = true;

        console.log('Database initialized (legacy + templates):', {
            problemTypes: this.db.problemTypes.length,
            strategies: this.db.searchStrategies.length,
            configs: this.db.instanceConfigs.length,
            cspConfigs: this.db.cspConfigs.length,
            rules: this.db.strategyRules.length
        });
    }

    /**
     * Initialize the template-driven question system
     */
    initializeTemplateSystem() {
        try {
            // Create template service with seed data
            this.templateDb = createTemplateDatabaseService(DATABASE_SEED);

            // Create question generator
            this.questionGenerator = createTemplateQuestionGenerator(this.templateDb);

            console.log('Template system initialized successfully');
        } catch (error) {
            console.error('Error initializing template system:', error);
        }
    }

    /**
     * Query in-memory template database
     * This is a simplified implementation - for production, use proper DB
     */
    _queryTemplateDb(sql, mode, params) {
        // This method is no longer needed with the new service architecture
        return null;
    }

    _parseProblemTypes(stmt) {
        if (!stmt.includes('INSERT') || !stmt.includes('problem_types')) return;

        const matches = [...stmt.matchAll(/\('([^']+)',\s*'([^']+)',\s*'([^']+)'\)/g)];
        matches.forEach((m) => {
            const [, name, description, category] = m;
            this.db.problemTypes.push({
                id: this.db.problemTypes.length + 1,
                name,
                description,
                category,
            });
        });
    }

    _parseSearchStrategies(stmt) {
        if (!stmt.includes('INSERT') || !stmt.includes('search_strategies')) return;

        const matches = stmt.match(/\('([^']+)',\s*'([^']+)',\s*'([^']+)'\)/g);
        matches?.forEach(match => {
            const [, name, type, description] =
                match.match(/\('([^']+)',\s*'([^']+)',\s*'([^']+)'\)/);

            this.db.searchStrategies.push({
                id: this.db.searchStrategies.length + 1,
                name,
                type,
                description
            });
        });
    }

    _parseInstanceConfigs(stmt) {
        if (!stmt.includes('INSERT') || !stmt.includes('instance_configs')) return;

        // Match all value groups in the INSERT statement
        const matches = [...stmt.matchAll(/\((\d+),\s*(\d+),\s*(\d+),\s*'([^']+)',\s*(NULL|'[^']*')\)/g)];

        matches.forEach(match => {
            const [, problemTypeId, minSize, maxSize, sizeParamName, additionalParams] = match;

            let parsedParams = null;
            if (additionalParams !== 'NULL') {
                // Remove quotes and parse JSON
                const jsonStr = additionalParams.replace(/^'|'$/g, '');
                try {
                    parsedParams = JSON.parse(jsonStr);
                } catch (e) {
                    console.warn('Failed to parse additional_params:', jsonStr);
                }
            }

            this.db.instanceConfigs.push({
                id: this.db.instanceConfigs.length + 1,
                problem_type_id: parseInt(problemTypeId),
                min_size: parseInt(minSize),
                max_size: parseInt(maxSize),
                size_param_name: sizeParamName,
                additional_params: parsedParams
            });
        });
    }

    _parseStrategyRules(stmt) {
        if (!stmt.includes('INSERT') || !stmt.includes('strategy_rules')) return;

        // Match all value groups in the INSERT statement
        const matches = [...stmt.matchAll(/\((\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(NULL|'[^']*'),\s*'([^']+)',\s*(\d+)\)/g)];

        matches.forEach(match => {
            const [, problemTypeId, strategyId, minSize, maxSize, conditionJson, reason, priority] = match;

            let parsedCondition = null;
            if (conditionJson !== 'NULL') {
                // Remove quotes and parse JSON
                const jsonStr = conditionJson.replace(/^'|'$/g, '');
                try {
                    parsedCondition = JSON.parse(jsonStr);
                } catch (e) {
                    console.warn('Failed to parse condition_json:', jsonStr);
                }
            }

            this.db.strategyRules.push({
                id: this.db.strategyRules.length + 1,
                problem_type_id: parseInt(problemTypeId),
                strategy_id: parseInt(strategyId),
                min_size: parseInt(minSize),
                max_size: parseInt(maxSize),
                condition_json: parsedCondition,
                reason: reason,
                priority: parseInt(priority)
            });
        });
    }

    _parseGameConfigs(stmt) {
        if (!stmt.includes('INSERT') || !stmt.includes('game_configs')) return;

        const match = stmt.match(/VALUES\s*\('([^']+)',\s*'([^']+)',\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            const [, name, description, minMatrix, maxMatrix, minPayoff, maxPayoff] = match;
            this.db.gameConfigs.push({
                id: 1,
                name,
                description,
                min_matrix_size: parseInt(minMatrix),
                max_matrix_size: parseInt(maxMatrix),
                min_payoff: parseInt(minPayoff),
                max_payoff: parseInt(maxPayoff)
            });
        }
    }

    _parseCSPConfigs(stmt) {
        if (!stmt.includes('INSERT') || !stmt.includes('csp_configs')) return;

        const matches = [...stmt.matchAll(/\((\d+),\s*(\d+),\s*(\d+),\s*'([^']+)',\s*(NULL|'[^']*')\)/g)];

        matches.forEach(match => {
            const [, cspId, minVars, maxVars, paramName, additionalParams] = match;

            let parsedParams = null;
            if (additionalParams !== 'NULL') {
                // Remove quotes and parse JSON
                const jsonStr = additionalParams.replace(/^'|'$/g, '');
                try {
                    parsedParams = JSON.parse(jsonStr);
                } catch (e) {
                    console.warn('Failed to parse CSP additional_params:', jsonStr);
                }
            }

            this.db.cspConfigs.push({
                id: this.db.cspConfigs.length + 1,
                csp_id: parseInt(cspId),
                min_variables: parseInt(minVars),
                max_variables: parseInt(maxVars),
                param_name: paramName,
                additional_params: parsedParams
            });
        });
    }

    getProblemTypeByName(name) {
        return this.db.problemTypes.find(pt => pt.name === name);
    }

    getProblemTypeById(id) {
        return this.db.problemTypes.find(pt => pt.id === id);
    }

    getAllProblemTypes(category = null) {
        if (category) {
            return this.db.problemTypes.filter(pt => pt.category === category);
        }
        return this.db.problemTypes;
    }

    getStrategyById(id) {
        return this.db.searchStrategies.find(s => s.id === id);
    }

    getInstanceConfig(problemTypeId) {
        return this.db.instanceConfigs.find(ic => ic.problem_type_id === problemTypeId);
    }

    getCSPConfig(cspId) {
        return this.db.cspConfigs.find(cc => cc.csp_id === cspId);
    }

    getAllCSPConfigs() {
        return this.db.cspConfigs;
    }

    getStrategyRules(problemTypeId, size, additionalConditions = {}) {
        let rules = this.db.strategyRules
            .filter(r => r.problem_type_id === problemTypeId)
            .filter(r => size >= r.min_size && size <= r.max_size);

        if (Object.keys(additionalConditions).length > 0) {
            rules = rules.filter(r => {
                if (!r.condition_json) return true;

                for (const [key, value] of Object.entries(additionalConditions)) {
                    if (r.condition_json[key] !== undefined) {
                        if (Array.isArray(r.condition_json[key])) {
                            if (!r.condition_json[key].includes(value)) return false;
                        } else {
                            if (r.condition_json[key] !== value) return false;
                        }
                    }
                }
                return true;
            });
        }

        rules.sort((a, b) => b.priority - a.priority);
        return rules;
    }

    getGameConfig() {
        return this.db.gameConfigs[0];
    }

    logQuestion(problemTypeId, instanceData, correctAnswer) {
        this.db.questionLog.push({
            id: this.db.questionLog.length + 1,
            problem_type_id: problemTypeId,
            instance_data: JSON.stringify(instanceData),
            correct_answer: JSON.stringify(correctAnswer),
            generated_at: new Date().toISOString()
        });
    }

    /**
     * Generate a question using the template system
     * @param {string} questionType - 'search', 'nash', 'csp', 'adversarial'
     * @param {string} difficulty - 'easy', 'medium', 'hard'
     * @returns {Promise<Object>} Complete question object
     */
    async generateQuestionFromTemplate(questionType, difficulty = 'medium') {
        if (!this.questionGenerator) {
            throw new Error('Template system not initialized');
        }
        try {
            return await this.questionGenerator.generateQuestion(questionType, difficulty);
        } catch (error) {
            console.error('Error generating question from template:', error);
            throw error;
        }
    }

    /**
     * Get template database service (for advanced usage)
     */
    getTemplateService() {
        return this.templateDb;
    }

    /**
     * Get question generator service (for advanced usage)
     */
    getQuestionGenerator() {
        return this.questionGenerator;
    }
}

export const db = new DatabaseService();
db.init();