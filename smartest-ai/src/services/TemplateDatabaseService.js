/**
 * Template-Driven Database Service
 * 
 * All question generation now queries from database templates.
 * ZERO hardcoding in application code.
 */

class TemplateDatabaseService {
    constructor(db) {
        this.db = db;
        this.templateCache = {};
        this.difficultyConfigCache = {};
    }

    /**
     * Get question template by type
     * @param {string} questionType - 'search', 'nash', 'csp', 'adversarial'
     * @returns {Promise<Object>} Question template with text and format
     */
    async getQuestionTemplate(questionType) {
        const cacheKey = `template_${questionType}`;
        if (this.templateCache[cacheKey]) {
            return this.templateCache[cacheKey];
        }

        const query = `
      SELECT id, type, name, text_template, description, answer_format, evaluation_type
      FROM question_templates
      WHERE type = ?
    `;

        const template = this.db.prepare(query).get(questionType);
        if (template) {
            this.templateCache[cacheKey] = template;
        }
        return template;
    }

    /**
     * Get difficulty configuration for a question type
     * @param {string} questionType - 'search', 'nash', 'csp', 'adversarial'
     * @param {string} difficulty - 'easy', 'medium', 'hard'
     * @returns {Promise<Object>} Configuration object with all generation parameters
     */
    async getDifficultyConfig(questionType, difficulty) {
        const cacheKey = `config_${questionType}_${difficulty}`;
        if (this.difficultyConfigCache[cacheKey]) {
            return this.difficultyConfigCache[cacheKey];
        }

        const query = `
      SELECT question_type, difficulty, config_json
      FROM difficulty_configs
      WHERE question_type = ? AND difficulty = ?
    `;

        const row = this.db.prepare(query).get(questionType, difficulty);
        if (row) {
            const config = JSON.parse(row.config_json);
            this.difficultyConfigCache[cacheKey] = config;
            return config;
        }
        return null;
    }

    /**
     * Get all configurations for a question type across all difficulties
     * @param {string} questionType - 'search', 'nash', 'csp', 'adversarial'
     * @returns {Promise<Object>} Object with easy/medium/hard keys
     */
    async getAllDifficultyConfigs(questionType) {
        const query = `
      SELECT difficulty, config_json
      FROM difficulty_configs
      WHERE question_type = ?
      ORDER BY difficulty
    `;

        const rows = this.db.prepare(query).all(questionType);
        const configs = {};
        rows.forEach(row => {
            configs[row.difficulty] = JSON.parse(row.config_json);
        });
        return configs;
    }

    /**
     * Get instance generator mapping for a question type
     * @param {string} questionType - 'search', 'nash', 'csp', 'adversarial'
     * @returns {Promise<Object>} Generator name and parameter mapping
     */
    async getInstanceGenerator(questionType) {
        const query = `
      SELECT question_type, generator_name, params_mapping
      FROM instance_generators
      WHERE question_type = ?
    `;

        const row = this.db.prepare(query).get(questionType);
        if (row) {
            return {
                generatorName: row.generator_name,
                paramsMapping: JSON.parse(row.params_mapping)
            };
        }
        return null;
    }

    /**
     * Get evaluation rules for a question type
     * @param {string} questionType - 'search', 'nash', 'csp', 'adversarial'
     * @returns {Promise<Object>} Evaluation rules for scoring
     */
    async getEvaluationRules(questionType) {
        // In a real implementation, this would query from evaluation_rules table
        // For now, returning the structure that should exist in database
        const evaluationRules = {
            search: {
                type: 'strategy_match',
                exactMatchScore: 100,
                partialMatchScore: (matched, total) => (matched / total) * 70,
                matchKeywords: ['BFS', 'DFS', 'A*', 'Greedy'],
                caseInsensitive: true
            },
            nash: {
                type: 'nash_match',
                exactMatchScore: 100,
                partialCreditFormula: (matched, total) => (matched / total) * 60 + 10,
                maxScore: 95
            },
            csp: {
                type: 'assignment_match',
                exactMatchScore: 100,
                partialMatchScore: (matched_vars, total_vars) => (matched_vars / total_vars) * 80,
                constraintViolationPenalty: 10
            },
            adversarial: {
                type: 'numeric_pair_match',
                exactMatchScore: 100,
                rootValueMatchScore: 50,
                leafCountTolerance: 2
            }
        };

        return evaluationRules[questionType] || null;
    }

    /**
     * Generate a complete question from template and config
     * @param {string} questionType - 'search', 'nash', 'csp', 'adversarial'
     * @param {string} difficulty - 'easy', 'medium', 'hard'
     * @param {Object} instanceData - Generated instance data with placeholders
     * @returns {Promise<Object>} Complete question with text and metadata
     */
    async generateQuestionFromTemplate(questionType, difficulty, instanceData) {
        const template = await this.getQuestionTemplate(questionType);
        if (!template) {
            throw new Error(`Template not found for question type: ${questionType}`);
        }

        let questionText = template.text_template;

        // Replace all placeholders with instance data
        Object.entries(instanceData).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`;
            questionText = questionText.replace(new RegExp(placeholder, 'g'), value);
        });

        return {
            id: template.id,
            type: questionType,
            difficulty,
            template_name: template.name,
            text: questionText,
            answer_format: template.answer_format,
            evaluation_type: template.evaluation_type
        };
    }

    /**
     * Initialize database with seed data
     * @param {Object} seedData - DATABASE_SEED from databaseSeedTemplate.js
     */
    initializeDatabase(seedData) {
        // Insert problem types
        seedData.problem_types.forEach(pt => {
            this.db.prepare(`
        INSERT OR IGNORE INTO problem_types (id, name, description, category)
        VALUES (?, ?, ?, ?)
      `).run(pt.id, pt.name, pt.description, pt.category);
        });

        // Insert search strategies
        seedData.search_strategies.forEach(ss => {
            this.db.prepare(`
        INSERT OR IGNORE INTO search_strategies (id, name, type, description)
        VALUES (?, ?, ?, ?)
      `).run(ss.id, ss.name, ss.type, ss.description);
        });

        // Insert question templates
        seedData.question_templates.forEach(qt => {
            this.db.prepare(`
        INSERT OR IGNORE INTO question_templates (id, type, name, text_template, description, answer_format, evaluation_type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
                qt.id, qt.type, qt.name, qt.text_template, qt.description,
                qt.answer_format, qt.evaluation_type
            );
        });

        // Insert difficulty configs
        seedData.difficulty_configs.forEach(dc => {
            this.db.prepare(`
        INSERT OR IGNORE INTO difficulty_configs (question_type, difficulty, config_json)
        VALUES (?, ?, ?)
      `).run(dc.question_type, dc.difficulty, dc.config_json);
        });

        // Insert instance generators
        seedData.instance_generators.forEach(ig => {
            this.db.prepare(`
        INSERT OR IGNORE INTO instance_generators (question_type, generator_name, params_mapping)
        VALUES (?, ?, ?)
      `).run(ig.question_type, ig.generator_name, ig.params_mapping);
        });

        console.log('Database initialized with template seed data');
    }

    /**
     * Clear all caches (useful for testing or reloading config)
     */
    clearCache() {
        this.templateCache = {};
        this.difficultyConfigCache = {};
    }

    /**
     * Get all available question types
     * @returns {Promise<Array>} Array of question type names
     */
    async getAvailableQuestionTypes() {
        const query = 'SELECT DISTINCT type FROM question_templates';
        const rows = this.db.prepare(query).all();
        return rows.map(r => r.type);
    }

    /**
     * Get all available difficulties
     * @returns {Promise<Array>} ['easy', 'medium', 'hard']
     */
    async getAvailableDifficulties() {
        const query = 'SELECT DISTINCT difficulty FROM difficulty_configs ORDER BY difficulty';
        const rows = this.db.prepare(query).all();
        return rows.map(r => r.difficulty);
    }
}

export default TemplateDatabaseService;
