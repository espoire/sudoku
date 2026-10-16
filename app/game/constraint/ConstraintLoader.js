import { ensureArray } from '../../util/Array.js';
import { errorOrThrow } from '../../util/Util.js';
import Constraint from './Constraint.js';

const nameMap = {
  sudokuRow: Constraint.sudokuRow,
  row: 'sudokuRow',
  sudokuColumn: Constraint.sudokuColumn,
  column: 'sudokuColumn',
  sudokuBox: {
    params: ['boardSize'],
    generate: Constraint.sudokuBox,
  },
  box: 'sudokuBox',
  allCellsFilled: Constraint.allCellsFilled,
  full: 'allCellsFilled',

  default: ['row','column','box', 'full'],
};

export default class ConstraintLoader {
  /**
   * @param {string[]} boardConstraintsConfigArray
   * @returns {Constraint[]} An array of loaded constraint instances.
   */
  static load(boardConfig) {
    const boardConstraintsConfigArray = ensureArray(boardConfig.constraints ?? boardConfig.constraint ?? 'default');

    const constraints = [];

    const stack = [...boardConstraintsConfigArray];
    while (stack.length > 0) {
      const constraintName = stack.pop();
      const mapped = nameMap[constraintName];

      if (mapped == null) {
        errorOrThrow(`ConstraintLoader: Unknown constraint: ${constraintName}`);

      } else if (typeof mapped === 'string') {
        stack.push(mapped);

      } else if (Array.isArray(mapped)) {
        stack.push(...mapped);
      
      } else if (typeof mapped === 'object') {
        if (mapped instanceof Constraint) {
          constraints.push(mapped);

        } else if (mapped.generate) {
          const paramDefs = mapped.params ?? [];
          const generatorParams = [];

          for (const def of paramDefs) {
            switch (def) {
              case 'boardSize':
                generatorParams.push({ size: boardConfig.size ?? { x: 9, y: 9 } });
                break;

              default:
                errorOrThrow(`ConstraintLoader: Unknown constraint parameter definition: ${def}`);
                generatorParams.push(undefined);
            }
          }

          constraints.push(mapped.generate(...generatorParams));

        } else {
          errorOrThrow(`ConstraintLoader: Bad constraint mapping as typeof = 'object' for: ${constraintName}`);
        }
      }
    }

    return constraints;
  }
}