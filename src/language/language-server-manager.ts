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
import { ExtensionContext } from "vscode";
import { LanguageClient } from "vscode-languageclient";
import { LanguageSupport } from "./language-support";
import { NotificationManager } from "../ui/notification-manager";

export class LanguageServerManager {

    private clients: Map<string, LanguageClient> = new Map();

    constructor(
        private context: ExtensionContext,
        languageSupports: LanguageSupport[] = [],
        private notificationManager: NotificationManager
    ){
        languageSupports.forEach(ls => {
            const lc = ls.buildLanguageClient();
            ls.getLanguageIds().forEach(li => {
                this.clients.set(li, lc);
            });
            this.notificationManager.showMessage('Starting Language Support for ' + ls.getLanguageIds().join(','));
            const disposable = lc.start();
            this.context.subscriptions.push(disposable);
        });
    }

    public getLanguageClient(languageId: string): LanguageClient {
        const lc = this.clients.get(languageId);
        if (lc) {
            return lc;
        }
        throw new Error();
    }

    public getLanguageClients():LanguageClient[] {
        return [...this.clients.values()];
    }
}
