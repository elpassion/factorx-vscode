// @flow

// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import vscode from 'vscode';
import chunk from 'lodash/chunk';
import type { ExtensionContext } from 'vscode';
import {
  getExpressions,
  getExpressionOccurrences,
  extractVariable,
} from './cli';

class FactorX {
  context: ExtensionContext;

  activate = (context: ExtensionContext) => {
    this.context = context;
    this.subscribeToEvents();
  };

  subscribeToEvents = () => {
    const extractVariableCommand = vscode.commands.registerCommand(
      'factorx.extractVariable',
      () => this.extractVariableFlow('variable'),
    );
    const extractConstantCommand = vscode.commands.registerCommand(
      'factorx.extractConstant',
      () => this.extractVariableFlow('constant'),
    );

    this.context.subscriptions.push(extractVariableCommand);
    this.context.subscriptions.push(extractConstantCommand);
  };

  extractVariableFlow = async (type: "constant" | "variable") => {
    const { window } = vscode;
    const { activeTextEditor: editor } = window;
    const { selection, document } = editor;
    try {
      const text = document.getText();
      const ranges = [
        document.offsetAt(selection.start),
        document.offsetAt(selection.end),
      ];
      const { expressions } = await getExpressions(text, ...ranges);

      let selectedExpression;

      if (expressions.length > 1) {
        const items = expressions.map(expression => ({
          value: expression,
          description: expression.value,
        }));
        const pickedItem = await vscode.window.showQuickPick(items, {
          onDidSelectItem: ({ value: { position } }) => {
            editor.selections = [
              new vscode.Selection(
                document.positionAt(position.start),
                document.positionAt(position.end),
              ),
            ];
          },
        });
        if (!pickedItem) throw { name: 'AbortFlow' };
        selectedExpression = pickedItem.value;
      } else {
        selectedExpression = expressions[0];
      }

      const { expressions: occurrences } = await getExpressionOccurrences(
        text,
        selectedExpression.position.start,
        selectedExpression.position.end,
      );

      let selectedOccurrences;
      if (occurrences.length > 1) {
        const allPositions = occurrences.reduce(
          (acc, { position: { start, end } }) => [...acc, start, end],
          [],
        );
        const selectCurrentItem = {
          value: [occurrences[0].position.start, occurrences[0].position.end],
          description: 'This occurrence only',
        };
        const selectAllItem = {
          value: allPositions,
          description: `All ${occurrences.length} occurrences`,
        };
        const items = [selectCurrentItem, selectAllItem];
        const pickedItem = await vscode.window.showQuickPick(items, {
          onDidSelectItem: ({ value }) => {
            const positionPairs = chunk(value, 2);
            editor.selections = positionPairs.map(
              ([start, end]) =>
                new vscode.Selection(
                  document.positionAt([start]),
                  document.positionAt([end]),
                ),
            );
          },
        });
        if (!pickedItem) throw { name: 'AbortFlow' };
        selectedOccurrences = pickedItem.value;
      } else {
        selectedOccurrences = [
          occurrences[0].position.start,
          occurrences[0].position.end,
        ];
      }

      const extractVariableResult = await extractVariable(
        type,
        text,
        ...selectedOccurrences,
      );

      const lastLineId = document.lineCount - 1;
      const fullRange = new vscode.Range(
        0,
        0,
        lastLineId,
        document.lineAt(lastLineId).text.length,
      );
      await editor.edit((edit) => {
        edit.replace(fullRange, extractVariableResult.code);
      });
      const selections = extractVariableResult.cursorPositions.map(
        cursorPosition =>
          new vscode.Selection(
            document.positionAt(cursorPosition.start),
            document.positionAt(cursorPosition.end),
          ),
      );
      editor.selections = selections;
    } catch (e) {
      if (e.name === 'ExpressionNotFoundError') {
        window.showWarningMessage("Didn't find an expression here :/");
      } else if (e.name === 'AbortFlow') {
        editor.selections = [selection];
      } else {
        window.showErrorMessage('Something went wrong :(');
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  };
}

const factorX = new FactorX();

exports.activate = factorX.activate;
