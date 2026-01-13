/**
 * Template Database Service - ES Module Version
 * 
 * Manages question templates, difficulty configs, and evaluation rules
 * All stored in-memory from DATABASE_SEED for now
 */

export const createTemplateDatabaseService = (seedData) => {
    const templateCache = {};
    const difficultyConfigCache = {};

    return {
        /**
         * Get question template by type
         */
        async getQuestionTemplate(questionType) {
            const cacheKey = `template_${questionType}`;
            if (templateCache[cacheKey]) {
                return templateCache[cacheKey];
            }

            const template = seedData.question_templates.find(t => t.type === questionType);
            if (template) {
                templateCache[cacheKey] = template;
            }
            return template;
        },

        /**
         * Get difficulty configuration for a question type
         */
        async getDifficultyConfig(questionType, difficulty) {
            const cacheKey = `config_${questionType}_${difficulty}`;
            if (difficultyConfigCache[cacheKey]) {
                return difficultyConfigCache[cacheKey];
            }

            const config = seedData.difficulty_configs.find(
                c => c.question_type === questionType && c.difficulty === difficulty
            );
            if (config) {
                difficultyConfigCache[cacheKey] = config;
            }
            return config;
        },

        /**
         * Get all configurations for a question type across all difficulties
         */
        async getAllDifficultyConfigs(questionType) {
            const configs = {};
            seedData.difficulty_configs.forEach(config => {
                if (config.question_type === questionType) {
                    configs[config.difficulty] = config;
                }
            });
            return configs;
        },

        /**
         * Get instance generator mapping for a question type
         */
        async getInstanceGenerator(questionType) {
            const row = seedData.instance_generators.find(
                g => g.question_type === questionType
            );
            if (row) {
                return {
                    generatorName: row.generator_name,
                    paramsMapping: typeof row.params_mapping === 'string'
                        ? JSON.parse(row.params_mapping)
                        : row.params_mapping
                };
            }
            return null;
        },

        /**
         * Get evaluation rules for a question type
         */
        async getEvaluationRules(questionType) {
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
        },

        /**
         * Clear all caches
         */
        clearCache() {
            Object.keys(templateCache).forEach(key => delete templateCache[key]);
            Object.keys(difficultyConfigCache).forEach(key => delete difficultyConfigCache[key]);
        },

        /**
         * Get all available question types
         */
        async getAvailableQuestionTypes() {
            return [...new Set(seedData.question_templates.map(t => t.type))];
        },

        /**
         * Get all available difficulties
         */
        async getAvailableDifficulties() {
            return [...new Set(seedData.difficulty_configs.map(d => d.difficulty))].sort();
        }
    };
};

export default createTemplateDatabaseService;
