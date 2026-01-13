# Parent Vector (Vector de Tati) Implementation

## Overview
The adversarial search (Minimax + Alpha-Beta) now uses **parent vector representation** instead of node objects with explicit children arrays.

## Data Structure

### Parent Vector Format
```javascript
{
  parents: [-1, 0, 0, 1, 1, 2, 2],  // parents[i] = parent of node i
  values: [null, null, null, 5, 8, 3, 9],  // values[i] = leaf value or null
  leafValues: [5, 8, 3, 9],         // extracted leaf values
  depth: 2,
  rootPlayer: 'MAX',
  totalLeaves: 4,
  numNodes: 7
}
```

### Key Properties
- `parents[0] = -1` (root has no parent)
- `parents[i]` stores the ID of node i's parent
- `values[i]` is either a number (leaf) or null (internal node)
- Children can be reconstructed: all nodes j where `parents[j] === i`

## Implementation Details

### Tree Generation (`generateAdversarialInstance`)
- Builds tree using BFS with parent vector
- Depth: 2-3 levels
- Branching: 1-3 children per node (unbalanced trees supported)
- Leaf values: 0-10

```javascript
const parents = [-1];  // Start with root
const values = [null];

// BFS: for each node, add random children
parents.push(currentId);  // child's parent
values.push(null);        // or actual value for leaves
```

### Tree Solving (`solveMinimaxAlphaBeta`)
- Reconstructs children from parent vector on-the-fly:
```javascript
const children = Array.from({ length: parents.length }, () => []);
for (let i = 1; i < parents.length; i++) {
    children[parents[i]].push(i);
}
```
- Applies Minimax with Alpha-Beta pruning
- Returns root value and number of visited leaves

### Display Format

**Question Generator:**
```
Vector tati (parents): [-1, 0, 1, 1, 2, 2, 3, 3, 3]
Valori noduri (values): [-, -, -, -, 8, 9, 4, 6, 2]

Explicație: parents[i] = părintele nodului i, parents[0] = -1 (rădăcină)
Frunzele sunt nodurile cu valori numerice (nu '-')
```

**Chat Agent:**
```
Vector tati (parent): [-1, 0, 1, 1, 2, 2, 3, 3, 3]
Valori noduri: [-, -, -, -, 8, 9, 4, 6, 2]

Level 0: (0)
Level 1: (1)
Level 2: (2) (3)
Level 3: [8] [9] [4] [6] [2]
```

### Parsing User Trees (`parseAdversarialTree`)
- Accepts input like: `minimax [3, 5, 2, 9]`
- Builds balanced binary tree from leaf values
- Outputs parent vector representation

## Benefits

1. **Mathematical clarity**: Tree structure is defined by a single array
2. **Deducibility**: Entire tree can be reconstructed from parent vector
3. **Simplicity**: No need to maintain explicit children arrays
4. **Educational**: Shows graph/tree representation concept clearly

## Testing

Run the app and try:
1. Generate "Minimax + αβ" question - displays parent vector
2. Ask chat: "minimax cu alpha-beta pentru [3, 5, 2, 9]"
3. Verify tree structure is correctly reconstructed

## Files Modified

- `algorithmSolvers.js`: Generator and solver use parent vectors
- `chatAgent.js`: Display and parsing updated for parent vectors
- `questionGenerator.js`: Question display shows parent vector format
