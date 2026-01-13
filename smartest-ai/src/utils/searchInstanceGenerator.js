import db from '../services/DatabaseService';

export const generateSearchInstance = (problemName) => {
    const problemType = db.getProblemTypeByName(problemName);
    if (!problemType) return { text: 'Unknown problem', size: 5 };

    const config = db.getInstanceConfig(problemType.id);
    if (!config) return { text: 'No config found', size: 5 };

    const size = Math.floor(Math.random() * (config.max_size - config.min_size + 1)) + config.min_size;

    switch (problemName) {
        case 'N-Queens':
            return { text: `N=${size} (tablă ${size}x${size})`, n: size, size };

        case 'Generalized Hanoi': {
            const { pegs_min, pegs_max } = config.additional_params;
            const pegs = Math.floor(Math.random() * (pegs_max - pegs_min + 1)) + pegs_min;
            return { text: `${size} discuri, ${pegs} tije`, discs: size, pegs, size };
        }

        case 'Graph Coloring': {
            const { colors_min, colors_max, density_options } = config.additional_params;
            const colors = Math.floor(Math.random() * (colors_max - colors_min + 1)) + colors_min;
            const density = density_options[Math.floor(Math.random() * density_options.length)];

            const maxEdges = size * (size - 1) / 2;
            const edges = density === 'dens'
                ? Math.floor(maxEdges * (0.4 + Math.random() * 0.5))
                : Math.floor(maxEdges * (0.1 + Math.random() * 0.2));

            return {
                text: `Graf ${density} cu ${size} noduri, ${Math.max(edges, size - 1)} muchii, ${colors} culori`,
                nodes: size,
                edges: Math.max(edges, size - 1),
                colors,
                density,
                size
            };
        }

        case "Knight's Tour":
            return { text: `Tablă ${size}x${size}`, size };

        default:
            return { text: 'Instanță standard', size: 5 };
    }
};

export const determineOptimalSearchStrategy = (problemName, instance) => {
    const problemType = db.getProblemTypeByName(problemName);
    if (!problemType) return { strategy: 'Unknown', reason: 'Problem not found', type: 'Search' };

    const size = instance.size || 5;
    const additionalConditions = {};

    if (problemName === 'Generalized Hanoi' && instance.pegs) {
        additionalConditions.pegs = instance.pegs;
    }
    if (problemName === 'Graph Coloring' && instance.density) {
        additionalConditions.density = instance.density;
    }

    const rules = db.getStrategyRules(problemType.id, size, additionalConditions);

    if (rules.length === 0) {
        return { strategy: 'BFS', reason: 'No specific rule found, using default BFS.', type: 'Search' };
    }

    const selectedRule = rules[0];
    const strategy = db.getStrategyById(selectedRule.strategy_id);

    return { strategy: strategy.name, reason: selectedRule.reason, type: 'Search' };
};
