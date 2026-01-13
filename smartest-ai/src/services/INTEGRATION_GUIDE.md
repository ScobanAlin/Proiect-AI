/**
 * Integration Guide: Template-Driven System
 * 
 * This file shows how to integrate the new template system with existing code.
 * It serves as both documentation and a working integration module.
 */

// Import the new services
const TemplateDatabaseService = require('./TemplateDatabaseService');
const TemplateQuestionGenerator = require('./TemplateQuestionGenerator');
const DATABASE_SEED = require('./databaseSeedTemplate');

/**
 * Step 1: Initialize the template system
 * Call this once when your application starts
 */
async function initializeTemplateSystem(db) {
  // Create template database service
  const templateDb = new TemplateDatabaseService(db);

  // Populate database with seed data (templates, configs, generators)
  templateDb.initializeDatabase(DATABASE_SEED);

  // Create question generator using templates
  const questionGenerator = new TemplateQuestionGenerator(templateDb, db);

  return { templateDb, questionGenerator };
}

/**
 * Step 2: Update testGenerator.js
 * Replace this:
 * 
 * const difficultyConfig = {
 *   easy: { nQueens: 4, hanoi: 8, ... },
 *   medium: { ... },
 *   hard: { ... }
 * };
 * 
 * With this:
 */
async function generateTestWithTemplates(questionGenerator) {
  const test = {
    questions: [],
    metadata: {
      createdAt: new Date(),
      version: '2.0-template-driven'
    }
  };

  const questionTypes = ['search', 'nash', 'csp', 'adversarial'];
  const difficulties = ['easy', 'medium', 'hard'];

  // Generate one question of each type at medium difficulty
  for (const type of questionTypes) {
    try {
      const question = await questionGenerator.generateQuestion(type, 'medium');
      test.questions.push(question);
    } catch (error) {
      console.error(`Failed to generate ${type} question:`, error);
    }
  }

  return test;
}

/**
 * Step 3: Update chatAgent.js
 * When generating responses for CSP or other questions, use template-driven evaluation
 */
async function evaluateAnswerWithTemplates(answer, question, templateDb) {
  // Get evaluation rules from database
  const evalRules = await templateDb.getEvaluationRules(question.type);

  // Apply rule-based evaluation
  switch (question.type) {
    case 'csp':
      return evaluateCSPAnswer(answer, question, evalRules);
    case 'nash':
      return evaluateNashAnswer(answer, question, evalRules);
    case 'search':
      return evaluateSearchAnswer(answer, question, evalRules);
    case 'adversarial':
      return evaluateAdversarialAnswer(answer, question, evalRules);
    default:
      return { score: 0, feedback: 'Unknown question type' };
  }
}

/**
 * Step 4: Update DatabaseService.js
 * Replace static generateQuestion with template-based version:
 */
async function generateQuestionNew(type, difficulty, templateDb, questionGenerator) {
  // All logic now delegated to template system
  const question = await questionGenerator.generateQuestion(type, difficulty);
  return question;
}

/**
 * BEFORE (Old hardcoded way):
 * 
 * const question = {
 *   type: 'nash',
 *   difficulty: 'easy',
 *   text: `## Game Theory: Nash Equilibrium\n\nPayoff Matrix:\n...`, // HARDCODED
 *   text_template: 'custom',
 *   instance: {
 *     rows: 2,
 *     cols: 2,
 *     matrix: [[2,1], [0,3], [1,0], [3,2]]
 *   },
 *   correctAnswer: { ... }
 * }
 */

/**
 * AFTER (New template-driven way):
 * 
 * const question = {
 *   id: 2,
 *   type: 'nash',
 *   difficulty: 'easy',
 *   template_name: 'Nash Equilibrium Finding',
 *   text: `## Game Theory: Nash Equilibrium\n\nPayoff Matrix:\n(2, 1) (0, 3)\n(1, 0) (3, 2)`, // FILLED FROM TEMPLATE
 *   answer_format: 'equilibrium_pair', // FROM TEMPLATE
 *   evaluation_type: 'nash_match', // FROM TEMPLATE
 *   instance: {
 *     rows: 2,
 *     cols: 2,
 *     matrix: [[[2,1], [0,3]], [[1,0], [3,2]]],
 *     equilibria: '(1,1) (2,2)'
 *   },
 *   correctAnswer: {
 *     type: 'equilibrium_pair',
 *     rawSolution: '(1,1) (2,2)',
 *     formatted: 'Equilibria at (row 1, col 1) and (row 2, col 2)'
 *   },
 *   metadata: {
 *     generatedAt: '2024-01-15T10:30:00Z',
 *     difficulty: 'easy',
 *     templateId: 2,
 *     configId: 5
 *   }
 * }
 */

/**
 * Configuration Flow Chart:
 * 
 * Application Start
 *   ↓
 * initializeTemplateSystem(db)
 *   ├─ Create TemplateDatabaseService
 *   ├─ Call initializeDatabase(DATABASE_SEED)
 *   │   ├─ Insert into problem_types
 *   │   ├─ Insert into search_strategies
 *   │   ├─ Insert into question_templates ← Question text templates
 *   │   ├─ Insert into difficulty_configs ← Generation parameters
 *   │   ├─ Insert into instance_generators ← Function mappings
 *   │   └─ Insert into evaluation_rules ← Scoring logic
 *   └─ Create TemplateQuestionGenerator
 *
 * When Generating Question
 *   ↓
 * questionGenerator.generateQuestion(type, difficulty)
 *   ├─ getQuestionTemplate(type) ← Fetch from DB
 *   ├─ getDifficultyConfig(type, difficulty) ← Fetch from DB
 *   ├─ generateInstance(type, config) ← Use config ranges
 *   ├─ generateCorrectAnswer(...) ← Solve instance
 *   ├─ generateQuestionFromTemplate(template, instance) ← Fill placeholders
 *   └─ Return complete question with metadata
 *
 * When Evaluating Answer
 *   ↓
 * getEvaluationRules(type) ← Fetch from DB
 *   ↓
 * Apply rule-based scoring
 *   └─ No hardcoded switch statements
 */

/**
 * Database Schema Relationships:
 * 
 * problem_types (1) ──┬──→ (many) search_strategies
 *                     ├──→ (many) instance_configs
 *                     └──→ (many) strategy_rules
 *
 * question_templates (1) ──┬──→ (many) difficulty_configs
 *                          ├──→ (many) instance_generators
 *                          └──→ (many) evaluation_rules
 *
 * difficulty_configs: question_type → config_json
 * {
 *   question_type: "csp",
 *   difficulty: "easy",
 *   config_json: {
 *     variable_count: { min: 2, max: 3 },
 *     domain_size: { min: 2, max: 3 },
 *     constraint_count: { min: 1, max: 2 },
 *     constraint_types: ["inequality", "difference"],
 *     optimizations: ["AC-3"],
 *     time_limit: 5000
 *   }
 * }
 *
 * instance_generators: Maps template parameters to generation logic
 * {
 *   question_type: "csp",
 *   generator_name: "generateRandomCSPInstance",
 *   params_mapping: {
 *     variable_count: "config.variable_count",
 *     domain_size: "config.domain_size",
 *     constraint_count: "config.constraint_count",
 *     optimization: "config.optimizations[0]"
 *   }
 * }
 */

/**
 * Migration Checklist:
 * 
 * Phase 1: Setup
 * ☐ Add TemplateDatabaseService.js
 * ☐ Add TemplateQuestionGenerator.js
 * ☐ Add databaseSeedTemplate.js with all templates
 * ☐ Create database schema tables
 * ☐ Run database initialization
 *
 * Phase 2: Integration
 * ☐ Update DatabaseService.js to use templateDb
 * ☐ Update testGenerator.js to fetch configs from DB
 * ☐ Update answerEvaluator.js to use template-based rules
 * ☐ Update chatAgent.js to fetch templates
 * ☐ Update questionGenerator.js to use TemplateQuestionGenerator
 *
 * Phase 3: Validation
 * ☐ Test generateQuestion for all 4 types
 * ☐ Test generateTest with multiple questions
 * ☐ Test evaluateAnswer for all types
 * ☐ Verify difficulty scaling works
 * ☐ Test template caching
 *
 * Phase 4: Cleanup
 * ☐ Remove hardcoded difficultyConfig from testGenerator.js
 * ☐ Remove hardcoded templates from questionGenerator.js
 * ☐ Remove hardcoded templates from chatAgent.js
 * ☐ Update documentation
 * ☐ Remove old seed files (keep as backup)
 */

/**
 * API Endpoints to Create (Backend):
 * 
 * GET /api/templates/:type
 *   Returns question template for given type
 *   Response: { id, type, name, text_template, answer_format, evaluation_type }
 *
 * GET /api/difficulty-config/:type/:difficulty
 *   Returns generation config for type/difficulty
 *   Response: { question_type, difficulty, config_json }
 *
 * GET /api/questions/:type/:difficulty
 *   Generates complete question
 *   Response: { id, type, difficulty, text, answer_format, instance, correctAnswer, metadata }
 *
 * POST /api/evaluate-answer
 *   Evaluates user answer against correct answer
 *   Body: { questionType, userAnswer, correctAnswer }
 *   Response: { score, feedback, details }
 *
 * GET /api/question-types
 *   Returns available question types
 *   Response: ["search", "nash", "csp", "adversarial"]
 *
 * GET /api/difficulties
 *   Returns available difficulties
 *   Response: ["easy", "medium", "hard"]
 */

module.exports = {
  initializeTemplateSystem,
  generateTestWithTemplates,
  evaluateAnswerWithTemplates,
  generateQuestionNew
};
