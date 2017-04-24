// @flow

import executeCommand from './executeCommand';

type fxPosition = { start: number, end: number };

type fxExpression = {
  value: string,
  position: fxPosition
};

type renameVariableResult = {
  status: string,
  code: string,
  error?: { name: string },
  cursorPositions: Array<{
    start: number,
    end: number
  }>
};

export const renameVariable = (
  input: string,
  startPosition: number,
  endPosition: number,
  newName: string,
): Promise<renameVariableResult> =>
  executeCommand({
    command: 'rename-identifier',
    args: [startPosition, endPosition, newName],
    input,
  });

type getExpressionsResult = {
  status: string,
  expressions: Array<fxExpression>,
  error?: { name: string }
};

export const getExpressions = (
  input: string,
  startPosition: number,
  endPosition: number,
): Promise<getExpressionsResult> =>
  executeCommand({
    command: 'get-expressions',
    args: [startPosition, endPosition],
    input,
  });

type getExpressionOccurrencesResult = {
  status: string,
  expressions: Array<fxExpression>,
  error?: { name: string }
};

export const getExpressionOccurrences = (
  input: string,
  startPosition: number,
  endPosition: number,
): Promise<getExpressionOccurrencesResult> =>
  executeCommand({
    command: 'get-expression-occurrences',
    args: [startPosition, endPosition],
    input,
  });

type extractVariableResult = {
  status: string,
  code: string,
  cursorPositions: Array<{
    start: number,
    end: number
  }>,
  error?: { name: string }
};

export const extractVariable = (
  type: "constant" | "variable",
  input: string,
  ...positions: Array<number>
): Promise<extractVariableResult> =>
  executeCommand({
    command: `extract-${type}`,
    args: positions,
    input,
  });

export type codeResult = extractVariableResult | renameVariableResult;
