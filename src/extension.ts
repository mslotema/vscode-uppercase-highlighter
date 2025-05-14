import * as vscode from 'vscode';
import { ExtensionSettings } from './ExtensionSettings';

const COMMAND = 'uppercase-highlighter.toggle';

const debug = false;

let settings = new ExtensionSettings();

let decorationType: vscode.TextEditorDecorationType = createDecoration(settings);

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand(COMMAND, () => {
		// toggle
		const newValue = !settings.enabled;
		settings.setEnabled(newValue);
		decorationType = createDecoration(settings);
		processStateChange();
	}));

	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
		if (editor && settings.enabled) {
			highlightCharacters(editor);
		}
	}));

	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event) => {
		const editor = vscode.window.activeTextEditor;
		if (editor && event.document === editor.document && settings.enabled) {
			highlightCharacters(editor);
		}
	}));

	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((event) => {
		if (event.affectsConfiguration(ExtensionSettings.CONFIGNAME)) {
			dbg("settings changed");

			settings.read();
			decorationType = createDecoration(settings);
			processStateChange();
		}
	}));

	processStateChange();
}

export function deactivate() { }

// =========
// the Work:
// =========

function highlightCharacters(editor: vscode.TextEditor) {
	if (editor) {
		if (settings.enabled) {
			const text = editor.document.getText();
			const decorations: vscode.DecorationOptions[] = [];

			for (let i = 0; i < text.length; i++) {
				if (text[i] === text[i].toUpperCase() && text[i] !== text[i].toLowerCase()) {
					const startPos = editor.document.positionAt(i);
					const endPos = editor.document.positionAt(i + 1);
					const decoration = { range: new vscode.Range(startPos, endPos) };
					decorations.push(decoration);
				}
			}
			editor.setDecorations(decorationType, decorations);
		}
		else {
			editor.setDecorations(decorationType, []); // Clear decorations
		}
	}
}

// helpers:
function processStateChange() {
	vscode.window.showInformationMessage(
		`Uppercase Highlighter: ${(settings.enabled ? 'enabled' : 'disabled')}`);

	const editor = vscode.window.activeTextEditor;

	if (editor) {
		highlightCharacters(editor!);
	}
}

function createDecoration(settings: ExtensionSettings) {
	let options: vscode.DecorationRenderOptions = {
		fontWeight: settings.bolder ? 'bolder' : '',
		textDecoration: settings.underlined ? 'underline' : ''
	};

	return vscode.window.createTextEditorDecorationType(options);
};

function dbg(text: string) {
	if (debug) {
		vscode.window.showInformationMessage(`[DBG]: ${text}`);
	}
}