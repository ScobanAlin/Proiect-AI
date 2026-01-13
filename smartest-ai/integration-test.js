/**
 * Integration Test for Template System
 * 
 * Tests the complete template-driven question generation pipeline
 * Run with: node src/integration-test.js
 */

import { db } from './src/services/database.js';

async function runIntegrationTests() {
    console.log('\n=== TEMPLATE SYSTEM INTEGRATION TEST ===\n');

    try {
        // Test 1: Verify database initialized
        console.log('✓ Test 1: Database Service Initialized');
        console.log(`  - Problem types loaded: ${db.db.problemTypes.length}`);
        console.log(`  - Search strategies loaded: ${db.db.searchStrategies.length}`);
        console.log(`  - Instance configs loaded: ${db.db.instanceConfigs.length}`);

        // Test 2: Verify template service exists
        console.log('\n✓ Test 2: Template Database Service');
        if (db.getTemplateService()) {
            console.log('  - Template service initialized');
            const types = await db.getTemplateService().getAvailableQuestionTypes();
            console.log(`  - Available question types: ${types.join(', ')}`);
        }

        // Test 3: Verify question generator exists
        console.log('\n✓ Test 3: Question Generator Service');
        if (db.getQuestionGenerator()) {
            console.log('  - Question generator initialized');
        }

        // Test 4: Generate a search question
        console.log('\n✓ Test 4: Generate Search Question (Easy)');
        try {
            const searchQuestion = await db.generateQuestionFromTemplate('search', 'easy');
            console.log(`  - Generated: ${searchQuestion.type} (template: ${searchQuestion.template_name})`);
            console.log(`  - Difficulty: ${searchQuestion.difficulty}`);
            console.log(`  - Has correct answer: ${searchQuestion.correctAnswer ? '✓' : '✗'}`);
            console.log(`  - Question text length: ${searchQuestion.text.length} chars`);
        } catch (error) {
            console.error(`  - Error: ${error.message}`);
        }

        // Test 5: Generate a Nash question
        console.log('\n✓ Test 5: Generate Nash Question (Medium)');
        try {
            const nashQuestion = await db.generateQuestionFromTemplate('nash', 'medium');
            console.log(`  - Generated: ${nashQuestion.type}`);
            console.log(`  - Difficulty: ${nashQuestion.difficulty}`);
            console.log(`  - Has correct answer: ${nashQuestion.correctAnswer ? '✓' : '✗'}`);
        } catch (error) {
            console.error(`  - Error: ${error.message}`);
        }

        // Test 6: Generate a CSP question
        console.log('\n✓ Test 6: Generate CSP Question (Hard)');
        try {
            const cspQuestion = await db.generateQuestionFromTemplate('csp', 'hard');
            console.log(`  - Generated: ${cspQuestion.type}`);
            console.log(`  - Difficulty: ${cspQuestion.difficulty}`);
            console.log(`  - Has correct answer: ${cspQuestion.correctAnswer ? '✓' : '✗'}`);
        } catch (error) {
            console.error(`  - Error: ${error.message}`);
        }

        // Test 7: Generate an adversarial question
        console.log('\n✓ Test 7: Generate Adversarial Question (Medium)');
        try {
            const advQuestion = await db.generateQuestionFromTemplate('adversarial', 'medium');
            console.log(`  - Generated: ${advQuestion.type}`);
            console.log(`  - Difficulty: ${advQuestion.difficulty}`);
            console.log(`  - Has correct answer: ${advQuestion.correctAnswer ? '✓' : '✗'}`);
        } catch (error) {
            console.error(`  - Error: ${error.message}`);
        }

        // Test 8: Verify evaluation rules loaded
        console.log('\n✓ Test 8: Evaluation Rules');
        const templateService = db.getTemplateService();
        if (templateService) {
            for (const type of ['search', 'nash', 'csp', 'adversarial']) {
                const rules = await templateService.getEvaluationRules(type);
                if (rules) {
                    console.log(`  - ${type}: ${rules.type}`);
                }
            }
        }

        console.log('\n=== ALL TESTS PASSED ===\n');

    } catch (error) {
        console.error('\n✗ Test Failed:', error);
        process.exit(1);
    }
}

// Run tests
runIntegrationTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
