/**
 * Template-Driven Question Generator (Simplified)
 * 
 * Integrates with existing questionGenerator.js
 * Uses templates from database for question text generation
 */

export const createTemplateQuestionGenerator = (templateDbService) => {
    return {
        /**
         * Generate a complete question from template
         * Uses existing question generator for instance creation
         * @param {string} questionType - 'search', 'nash', 'csp', 'adversarial'
         * @param {string} difficulty - 'easy', 'medium', 'hard'
         * @returns {Promise<Object>} Complete question object
         */
        async generateQuestion(questionType, difficulty = 'medium') {
            try {
                // Get config from database
                const config = await templateDbService.getDifficultyConfig(questionType, difficulty);
                if (!config) {
                    throw new Error(`No difficulty config found for: ${questionType}/${difficulty}`);
                }

                // Get template
                const template = await templateDbService.getQuestionTemplate(questionType);
                if (!template) {
                    throw new Error(`No template found for question type: ${questionType}`);
                }

                // Convert database config to legacy format for backward compatibility
                const legacyConfig = this.convertDatabaseConfigToLegacy(config);

                // Use existing question generator logic
                const { generateQuestion: legacyGenerateQuestion } =
                    await import('../utils/questionGenerator.js');

                // Generate using legacy system
                const question = await legacyGenerateQuestion(questionType, legacyConfig);

                // Enhance with template metadata
                return {
                    ...question,
                    template_name: template.name,
                    template_id: template.id,
                    answer_format: template.answer_format,
                    evaluation_type: template.evaluation_type,
                    difficulty,
                    metadata: {
                        generatedAt: new Date().toISOString(),
                        difficulty,
                        templateId: template.id,
                        configId: config.question_type + '_' + config.difficulty
                    }
                };
            } catch (error) {
                console.error('Error generating question from template:', error);
                throw error;
            }
        },

        /**
         * Convert database config format to legacy format
         * Database uses JSON config_json, legacy uses individual fields
         */
        convertDatabaseConfigToLegacy(databaseConfig) {
            const config = typeof databaseConfig.config_json === 'string'
                ? JSON.parse(databaseConfig.config_json)
                : databaseConfig.config_json;

            const difficulty = databaseConfig.difficulty;

            // Map database config to legacy format based on question type
            const legacyConfig = {
                difficulty
            };

            // Extract ranges and convert to legacy field names
            if (config.node_count) {
                legacyConfig.graphNodes = this.randomInRange(config.node_count);
            }
            if (config.edge_count) {
                legacyConfig.graphEdges = this.randomInRange(config.edge_count);
            }
            if (config.variable_count) {
                legacyConfig.cspSize = this.randomInRange(config.variable_count);
            }
            if (config.max_depth) {
                legacyConfig.advDepth = config.max_depth;
            }
            if (config.matrix_rows) {
                legacyConfig.nashRows = config.matrix_rows;
            }
            if (config.matrix_cols) {
                legacyConfig.nashCols = config.matrix_cols;
            }

            // Add default values for missing fields
            if (!legacyConfig.nQueens) legacyConfig.nQueens = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
            if (!legacyConfig.hanoi) legacyConfig.hanoi = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 7;
            if (!legacyConfig.knightSize) legacyConfig.knightSize = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 5 : 6;

            return legacyConfig;
        },

        /**
         * Helper: Random value in range
         */
        randomInRange(range) {
            if (typeof range === 'number') {
                return range;
            }
            if (!range || !range.min || !range.max) {
                return 5; // Default fallback
            }
            return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        }
    };
};

export default createTemplateQuestionGenerator;
