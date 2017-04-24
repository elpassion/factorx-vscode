// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import vscode from 'vscode';
import type { ExtensionContext } from 'vscode';

class FactorX {
  context: ExtensionContext;

  activate = (context: ExtensionContext) => {
    this.context = context;
    this.subscribeToEvents();
  };

  subscribeToEvents = () => {
    const disposable = vscode.commands.registerCommand(
      'extension.extractVariable',
      () => this.extractVariableFlow(),
    );

    this.context.subscriptions.push(disposable);
  };

  extractVariableFlow = () => {
    console.log('a');
  };
}

const factorX = new FactorX();

exports.activate = factorX.activate;
