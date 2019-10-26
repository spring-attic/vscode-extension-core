/*
 * Copyright 2019 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
    EventEmitter, TextDocumentContentProvider, Uri, CancellationToken, Event, window, ExtensionContext, workspace,
    WorkspaceConfiguration
} from 'vscode';
import { isNumber } from "util";
import { randomUtils } from '../utils/random-utils';
import { nonNullValue } from '../utils/non-null';

const scheme: string = 'pivotalvscodeextensioncore';

export class ReadOnlyDocumentManager {

    private contentProvider: ReadOnlyContentProvider | undefined;

    constructor(
        private context: ExtensionContext
    ) {
    }

    public async openReadOnlyJson(node: { label: string, fullId: string }, data: {}): Promise<void> {
        let tab: string = '	';
        const config: WorkspaceConfiguration = workspace.getConfiguration('editor');
        const insertSpaces: boolean = !!config.get<boolean>('insertSpaces');
        if (insertSpaces) {
            let tabSize: number | undefined = config.get<number>('tabSize');
            if (!isNumber(tabSize) || tabSize < 0) {
                tabSize = 4;
            }

            tab = ' '.repeat(tabSize);
        }

        const content: string = JSON.stringify(data, undefined, tab);
        await this.openReadOnlyContent(node, content, '.json');
    }

    public async openReadOnlyContent(node: { label: string, fullId: string }, content: string, fileExtension: string): Promise<void> {
        if (!this.contentProvider) {
            this.contentProvider = new ReadOnlyContentProvider();
            this.context.subscriptions.push(workspace.registerTextDocumentContentProvider(scheme, this.contentProvider));
        }
        await this.contentProvider.openReadOnlyContent(node, content, fileExtension);
    }
}

class ReadOnlyContentProvider implements TextDocumentContentProvider {
    private _onDidChangeEmitter: EventEmitter<Uri> = new EventEmitter<Uri>();
    private _contentMap: Map<string, string> = new Map<string, string>();

    public get onDidChange(): Event<Uri> {
        return this._onDidChangeEmitter.event;
    }

    public async openReadOnlyContent(node: { label: string, fullId: string }, content: string, fileExtension: string): Promise<void> {
        const idHash: string = randomUtils.getPseudononymousStringHash(node.fullId, 'hex');
        const uri: Uri = Uri.parse(`${scheme}:///${idHash}/${node.label}${fileExtension}`);
        this._contentMap.set(uri.toString(), content);
        await window.showTextDocument(uri);
        this._onDidChangeEmitter.fire(uri);
    }

    public async provideTextDocumentContent(uri: Uri, _token: CancellationToken): Promise<string> {
        return nonNullValue(this._contentMap.get(uri.toString()), 'ReadOnlyContentProvider._contentMap.get');
    }
}
