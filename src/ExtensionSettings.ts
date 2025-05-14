import * as vscode from 'vscode';


export class ExtensionSettings {

	public static readonly CONFIGNAME: string = "uppercaseHighlighter";

	constructor() {
		this.read();
	}

	private _enabled: boolean = false;
	get enabled(): boolean {
		return this._enabled;
	}

	private _underlined: boolean = true;
	get underlined(): boolean {
		return this._underlined;
	}

	private _bolder: boolean = true;
	get bolder(): boolean {
		return this._bolder;
	}

	read() {
		const config = vscode.workspace.getConfiguration(ExtensionSettings.CONFIGNAME);

		this._enabled = !!config.get<boolean>("enabled");
		this._underlined = !!config.get<boolean>("underlined");
		this._bolder = !!config.get<boolean>("bolder");
	}

	setEnabled(enabled: boolean) {
		//if (this._enabled !== enabled) {
		const config = vscode.workspace.getConfiguration(ExtensionSettings.CONFIGNAME);
		this._enabled = enabled;

		config.update("enabled", enabled);
		//}
	}
}
