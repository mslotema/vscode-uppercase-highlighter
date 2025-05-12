import * as vscode from 'vscode';

const COMMAND = 'uppercase-highlighter.run';
const CONFIGNAME = "uppercaseHighlighter";


interface ExtensionSettings {
	enabled: boolean;
}

let settings: ExtensionSettings = readSettings();
let decorationType: vscode.TextEditorDecorationType = createDecoration(); // Initialize decoration type

export function activate(context: vscode.ExtensionContext) {

	let firstCall = false;

	const start = (autostart: boolean = false) => {
		if (autostart) {
			settings = readSettings();
			vscode.window.showInformationMessage(`Uppercase Highlighter: autostart (enabled)`);
			firstCall = false;
		} else {
			if (firstCall) {
				settings.enabled = writeEnabled(true);
				firstCall = false;
				vscode.window.showInformationMessage(`Uppercase Highlighter: first call (enabled)`);
			} else {
				settings.enabled = writeEnabled(!settings.enabled);
			}
		}
		processStateChange();
	};

	context.subscriptions.push(vscode.commands.registerCommand(COMMAND, start));

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
		if (event.affectsConfiguration(CONFIGNAME)) {
			settings = readSettings();
			processStateChange();
		}
	}));

	start(true);
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
	showState();

	const editor = vscode.window.activeTextEditor;
	if (editor) {
		highlightCharacters(editor!);
	}
}

function createDecoration() {
	let options: vscode.DecorationRenderOptions = {
		fontWeight: 'bolder',
		textDecoration: 'underline'
	};
	return vscode.window.createTextEditorDecorationType(options);
};


function readSettings(): ExtensionSettings {
	const config = vscode.workspace.getConfiguration(CONFIGNAME);

	return {
		enabled: config.get<boolean>("enabled", true)
	};
}

function writeEnabled(enabled: boolean): boolean {
	if (settings.enabled === enabled) {
		return settings.enabled;
	}

	const config = vscode.workspace.getConfiguration(CONFIGNAME);
	config.update("enabled", enabled);

	return enabled;
}

function showState() {
	vscode.window.showInformationMessage(
		`Uppercase Highlighter: ${(settings.enabled ? 'enabled' : 'disabled')}`);
}

