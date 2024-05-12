import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "vscode-swap-selections.swap",
    () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        return;
      }

      if (editor.selections.length > 2) {
        vscode.window.showErrorMessage("Too many selections (It should be 2)");
        return;
      }

      if (editor.selections.length < 2) {
        vscode.window.showErrorMessage(
          "Not enough selections (It should be 2)"
        );
        return;
      }

      const initialSelections = editor.selections;

      const isInitialSelectionsEmpty = initialSelections.every(
        (selection) => selection.isEmpty
      );

      if (isInitialSelectionsEmpty) {
        editor.selections = editor.selections.map((selection) => {
          return new vscode.Selection(
            selection.start.line,
            0,
            selection.end.line,
            editor.document.lineAt(selection.end.line).text.length
          );
        });
      }

      const selectionsWithText = editor.selections.map((selection) => {
        return {
          selection,
          text: editor.document.getText(selection),
        };
      });

      if (isInitialSelectionsEmpty) {
        editor.selections = initialSelections.map((selection, index) => {
          return new vscode.Selection(
            selection.start.line,
            initialSelections[index === 0 ? 1 : 0].active.character,
            selection.end.line,
            initialSelections[index === 0 ? 1 : 0].active.character
          );
        });
      }

      const swappedSelections = [
        {
          selection: selectionsWithText[1].selection,
          text: selectionsWithText[0].text,
        },
        {
          selection: selectionsWithText[0].selection,
          text: selectionsWithText[1].text,
        },
      ];

      editor.edit((builder) => {
        swappedSelections.forEach(({ selection, text }) => {
          builder.replace(selection, text);
        });
      });
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
