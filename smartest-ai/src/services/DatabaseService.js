import { seedDatabase } from './databaseSeed';

class DatabaseService {
    constructor() {
        this.db = {
            problemTypes: [],
            searchStrategies: [],
            instanceConfigs: [],
            strategyRules: [],
            gameConfigs: [],
            questionLog: []
        };
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        const seedSQL = seedDatabase();
        const statements = seedSQL.split(';').filter(s => s.trim());

        statements.forEach(stmt => {
            this.parseProblemTypes(stmt);
            this.parseSearchStrategies(stmt);
            this.parseInstanceConfigs(stmt);
            this.parseStrategyRules(stmt);
            this.parseGameConfigs(stmt);
        });

        this.initialized = true;
    }

    parseProblemTypes(stmt) {
        if (!stmt.includes('INSERT') || !stmt.includes('problem_types')) return;

        const matches = [...stmt.matchAll(/\('([^']+)',\s*'([^']+)',\s*'([^']+)'\)/g)];
        matches.forEach((m) => {
            const [, name, description, category] = m;
            this.db.problemTypes.push({
                id: this.db.problemTypes.length + 1,
                name, description, category
            });
        });
    }

    parseSearchStrategies(stmt) {
        if (!stmt.includes('INSERT') || !stmt.includes('search_strategies')) return;

        const matches = stmt.match(/\('([^']+)',\s*'([^']+)',\s*'([^']+)'\)/g);
        matches?.forEach(match => {
            const [, name, type, description] = match.match(/\('([^']+)',\s*'([^']+)',\s*'([^']+)'\)/);
            this.db.searchStrategies.push({
                id: this.db.searchStrategies.length + 1,
                name, type, description
            });
        });
    }

    parseInstanceConfigs(stmt) {
        if (!stmt.includes('INSERT') || !stmt.includes('instance_configs')) return;

        const matches = stmt.match(/\((\d+),\s*(\d+),\s*(\d+),\s*'([^']+)',\s*(NULL|'[^']*')\)/g);
        matches?.forEach(match => {
            const [, problemTypeId, minSize, maxSize, sizeParamName, additionalParams] =
                match.match(/\((\d+),\s*(\d+),\s*(\d+),\s*'([^']+)',\s*(NULL|'[^']*')\)/);

            this.db.instanceConfigs.push({
                id: this.db.instanceConfigs.length + 1,
                problem_type_id: parseInt(problemTypeId),
                min_size: parseInt(minSize),
                max_size: parseInt(maxSize),
                size_param_name: sizeParamName,
                additional_params: additionalParams === 'NULL' ? null : JSON.parse(additionalParams.replace(/^'|'$/g, ''))
            });
        });
    }

    parseStrategyRules(stmt) {
        if (!stmt.includes('INSERT') || !stmt.includes('strategy_rules')) return;

        const matches = stmt.match(/\((\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(NULL|'[^']*'),\s*'([^']+)',\s*(\d+)\)/g);
        matches?.forEach(match => {
            const [, problemTypeId, strategyId, minSize, maxSize, conditionJson, reason, priority] =
                match.match(/\((\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(NULL|'[^']*'),\s*'([^']+)',\s*(\d+)\)/);

            this.db.strategyRules.push({
                id: this.db.strategyRules.length + 1,
                problem_type_id: parseInt(problemTypeId),
                strategy_id: parseInt(strategyId),
                min_size: parseInt(minSize),
                max_size: parseInt(maxSize),
                condition_json: conditionJson === 'NULL' ? null : JSON.parse(conditionJson.replace(/^'|'$/g, '')),
                reason, priority: parseInt(priority)
            });
        });
    }

    parseGameConfigs(stmt) {
        if (!stmt.includes('INSERT') || !stmt.includes('game_configs')) return;

        const match = stmt.match(/VALUES\s*\('([^']+)',\s*'([^']+)',\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            const [, name, description, minMatrix, maxMatrix, minPayoff, maxPayoff] = match;
            this.db.gameConfigs.push({
                id: 1, name, description,
                min_matrix_size: parseInt(minMatrix),
                max_matrix_size: parseInt(maxMatrix),
                min_payoff: parseInt(minPayoff),
                max_payoff: parseInt(maxPayoff)
            });
        }
    }

    getProblemTypeByName(name) {
        return this.db.problemTypes.find(pt => pt.name === name);
    }

    getProblemTypeById(id) {
        return this.db.problemTypes.find(pt => pt.id === id);
    }

    getAllProblemTypes(category = null) {
        return category ? this.db.problemTypes.filter(pt => pt.category === category) : this.db.problemTypes;
    }

    getStrategyById(id) {
        return this.db.searchStrategies.find(s => s.id === id);
    }

    getInstanceConfig(problemTypeId) {
        return this.db.instanceConfigs.find(ic => ic.problem_type_id === problemTypeId);
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
}

const db = new DatabaseService();
db.init();

export default db;
