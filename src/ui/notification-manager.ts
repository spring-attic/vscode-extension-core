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
import { window, workspace } from 'vscode';

/**
 * Simplifies to show notifications in a central way.
 */
export class NotificationManager {

    private location: string|undefined;

    constructor(
        locationKey: string|undefined
    ){
        if (locationKey) {
            this.location = workspace.getConfiguration().get<string>(locationKey);
            workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(locationKey)) {
                    this.location = workspace.getConfiguration().get<string>(locationKey);
                }
            });
        }
    }

    public showMessage(text: string): void {
        if (this.location === 'notifications') {
            window.showInformationMessage(text);
        } else if (this.location === 'statusbar') {
            window.setStatusBarMessage(text, 5000);
        }
    }
}
