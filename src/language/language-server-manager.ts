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
import { LanguageClient, Disposable } from "vscode-languageclient";
import { LanguageSupport } from "./language-support";
import { NotificationManager } from "../ui/notification-manager";

export class LanguageServerManager {

    private clients: Map<string[], LanguageClientHolder> = new Map();

    constructor(
        private context: ExtensionContext,
        private languageSupports: LanguageSupport[] = [],
        private notificationManager: NotificationManager
    ) {}

    public async start(): Promise<void> {
        const promises = this.languageSupports.map(async ls => {
            const lc = await ls.buildLanguageClient();
            const lch: LanguageClientHolder = { client: lc };
            this.clients.set(ls.getLanguageIds(), lch);
            this.notificationManager.info('Starting Language Support for ' + ls.getLanguageIds().join(','));
            const disposable = lc.start();
            lch.disposable = disposable;
            this.context.subscriptions.push(disposable);
        });
        await Promise.all(promises);
    }

    public getLanguageClient(languageId: string): LanguageClient {
        let lc: LanguageClient | undefined;
        this.clients.forEach( (v,k) => {
            if ( k.some( i => i === languageId) ) {
                lc = v.client;
            }
        } );

        if (lc) {
            return lc;
        }
        throw new Error();
    }

    public async restart(languageId: string): Promise<void> {
        let lch: LanguageClientHolder | undefined;
        this.clients.forEach((v,k) => {
            if ( k.some( i => i === languageId) ) {
                lch = v;
            }
        });
        if (lch) {
            await lch.client.stop();
            if (lch.disposable) {
                lch.disposable.dispose();
            }
            this.languageSupports.forEach(async ls => {
                if (lch) {
                    if (ls.getLanguageIds().some(i => i === languageId)) {
                        const lc = await ls.buildLanguageClient();
                        this.notificationManager.info('Starting Language Support for ' + ls.getLanguageIds().join(','));
                        const disposable = lc.start();
                        lch.client = lc;
                        lch.disposable = disposable;
                        this.context.subscriptions.push(disposable);
                    }
                }
            });
        }
    }

    public getLanguageClients():LanguageClient[] {
        return [...this.clients.values()].map(v => v.client);
    }
}

interface LanguageClientHolder {
    client: LanguageClient;
    disposable?: Disposable;
}
