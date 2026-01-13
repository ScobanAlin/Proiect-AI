#!/bin/bash
# Quick Reference - Template System Integration

## Running Tests
```bash
cd smartest-ai
node integration-test.js
```

## Key Files Created
- `src/services/TemplateDbService.js` - Template management
- `src/services/TemplateQuestionGeneratorSimplified.js` - Question generation bridge
- `src/services/databaseSeedTemplate.js` - All template data
- `integration-test.js` - Integration tests

## Key Methods

### Generate Questions
```javascript
import { db } from './src/services/database.js';

// Wait for DB to init, then:
const question = await db.generateQuestionFromTemplate('csp', 'easy');
// Returns: { text, correctAnswer, instance, difficulty, ... }
```

### Access Template Service
```javascript
const templateService = db.getTemplateService();

// Get templates
const template = await templateService.getQuestionTemplate('nash');
const config = await templateService.getDifficultyConfig('search', 'hard');
const rules = await templateService.getEvaluationRules('adversarial');

// Get lists
const types = await templateService.getAvailableQuestionTypes();
const difficulties = await templateService.getAvailableDifficulties();
```

## Database Schema

### Templates Store
- type: 'search' | 'nash' | 'csp' | 'adversarial'
- text_template: "Question about {{problem}} with {{constraint}}"
- answer_format: 'strategy_name' | 'equilibrium_pair' | 'assignment_set' | 'numeric_pair'
- evaluation_type: How to score

### Configs Store
- question_type: 'search' | 'nash' | 'csp' | 'adversarial'
- difficulty: 'easy' | 'medium' | 'hard'
- config_json: { variable_count: {min, max}, ... }

## Question Types

### Search (Uninformed & Informed Strategies)
- Easy: 4 nodes, BFS/DFS suitable
- Medium: 6 nodes, some heuristic value
- Hard: 8+ nodes, requires informed search

### Nash (Game Theory Equilibria)
- Easy: 2x2 matrix, single equilibrium
- Medium: 2-3 x 2-4 matrix, 1-2 equilibria
- Hard: 3-4 x 3-5 matrix, multiple equilibria

### CSP (Constraint Satisfaction)
- Easy: 2-3 variables, 2-3 domains, 1-2 constraints
- Medium: 3-4 variables, 3-4 domains, 2-3 constraints
- Hard: 4-6 variables, 4-6 domains, 3-5 constraints

### Adversarial (Minimax Game Trees)
- Easy: Depth 2, branching 2
- Medium: Depth 3, branching 2-3
- Hard: Depth 4, branching 2-3, alpha-beta pruning

## Current Status

✅ Database service initialized with templates
✅ All 4 question types working
✅ 3 difficulty levels per type
✅ Evaluation rules defined
✅ Integration tests passing
✅ Backward compatible with legacy code

## To Add More Templates

Edit `src/services/databaseSeedTemplate.js`:

1. Add to `question_templates` array:
```javascript
{
  id: 5,
  type: 'new_type',
  name: 'New Question Type',
  text_template: 'Your template with {{placeholders}}',
  answer_format: 'format_type',
  evaluation_type: 'how_to_score'
}
```

2. Add to `difficulty_configs` array:
```javascript
{
  question_type: 'new_type',
  difficulty: 'easy',
  config_json: JSON.stringify({
    // Your generation parameters
  })
}
```

3. Add to `instance_generators` array:
```javascript
{
  question_type: 'new_type',
  generator_name: 'generateNewTypeInstance',
  params_mapping: JSON.stringify({
    // Parameter mappings
  })
}
```

## Performance Tips

- Template and config caching is automatic
- Call `templateService.clearCache()` to refresh
- In-memory database is fast (no network delay)
- Migrate to SQL for persistence in production

## Debugging

Enable debug logs:
```javascript
console.log('Database initialized (legacy + templates):', db.db);
console.log('Template service:', db.getTemplateService());
console.log('Question generator:', db.getQuestionGenerator());
```

Test individual question generation:
```javascript
const q1 = await db.generateQuestionFromTemplate('search', 'easy');
const q2 = await db.generateQuestionFromTemplate('nash', 'medium');
const q3 = await db.generateQuestionFromTemplate('csp', 'hard');
const q4 = await db.generateQuestionFromTemplate('adversarial', 'medium');
```

## Zero Hardcoding Achieved ✓

- ✅ Question text templates → Database
- ✅ Difficulty parameters → Database
- ✅ Instance generation configs → Database
- ✅ Evaluation rules → Database
- ✅ Answer format specs → Database
- ✅ No hardcoded strings in app code
- ✅ All configuration queryable from DB
