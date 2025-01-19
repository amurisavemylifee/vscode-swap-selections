import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "vscode-swap-selections.swap",
    async () => {
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

      const initialSelections = [...editor.selections];

      // Both initial selections are empty
      const isInitialSelectionsEmpty = initialSelections.every(
        (selection) => selection.isEmpty
      );

      const isOneOfSelectionsEmpty =
        editor.selections.filter((selection) => selection.isEmpty).length === 1;

      if (isInitialSelectionsEmpty) {
        // If both initial selections are empty
        // We create new whole line selections
        editor.selections = initialSelections.map((selection) => {
          return new vscode.Selection(
            selection.start.line,
            0,
            selection.end.line,
            editor.document.lineAt(selection.end.line).text.length
          );
        });
      }

      const [firstSel, secondSel] = editor.selections;

      const firstText = editor.document.getText(firstSel);
      const secondText = editor.document.getText(secondSel);

      await editor.edit((builder) => {
        builder.replace(firstSel, secondText);
        builder.replace(secondSel, firstText);
      });

      if (isInitialSelectionsEmpty) {
        // After swap line selections
        // We create new character selections based on initial selections
        editor.selections = initialSelections.map((selection, index) => {
          return new vscode.Selection(
            selection.start.line,
            initialSelections[+!index].active.character,
            selection.end.line,
            initialSelections[+!index].active.character
          );
        });
      }

      if (isOneOfSelectionsEmpty) {
        // If one of initial selections is empty
        // We create new selection based on the other one with inserted text
        const makeNewSelection = (
          anchorPos: vscode.Position,
          insertedText: string
        ) => {
          const startOffset = editor.document.offsetAt(anchorPos);
          const endOffset = startOffset + insertedText.length;
          const newStart = editor.document.positionAt(startOffset);
          const newEnd = editor.document.positionAt(endOffset);
          return new vscode.Selection(newStart, newEnd);
        };

        const newFirstSelection = makeNewSelection(firstSel.start, secondText);
        const newSecondSelection = makeNewSelection(secondSel.start, firstText);

        editor.selections = [newFirstSelection, newSecondSelection];
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
