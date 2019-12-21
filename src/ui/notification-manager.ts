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
import { OutputManager } from './output-manager';

/**
 * Enumeration of a possible locations for notifications.
 */
export enum Location {
    Notifications = 'notifications',
    Statusbar = 'statusbar',
    Log = 'log'
}

/**
 * Message with a level.
 */
export interface Message {
    text: string;
    level?: Level;
}

/**
 * Enumeration of a levels for a messages.
 */
export enum Level {
    Trace = 0,
    Info = 1,
    Warn = 2,
    Error = 3
}

/**
 * Simplifies to show notifications in a central way.
 */
export class NotificationManager {

    private location: Location | undefined;
    private level: Level | undefined = Level.Info;

    constructor(
        private outputManager: OutputManager | undefined,
        locationKey: string | undefined,
        levelKey: string | undefined,
        private outputKey: string | undefined,
        private outputTag: string | undefined
    ){
        if (locationKey) {
            this.location = workspace.getConfiguration().get<Location>(locationKey);
            workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(locationKey)) {
                    this.location = workspace.getConfiguration().get<Location>(locationKey);
                }
            });
        }
        if (levelKey) {
            this.level = workspace.getConfiguration().get<Level>(levelKey);
            workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(levelKey)) {
                    this.level = workspace.getConfiguration().get<Level>(levelKey);
                }
            });
        }
    }

    /**
     * Dispatch message for notification handling.
     *
     * @param message the message
     */
    public message(message: Message): void {
        const lev = message.level ? message.level : Level.Info;
        if (this.level && lev < this.level) {
            return;
        }
        if (this.location === Location.Notifications) {
            window.showInformationMessage(message.text);
        } else if (this.location === Location.Statusbar) {
            window.setStatusBarMessage(message.text, 5000);
        } else if (this.location === Location.Log) {
            if (this.outputManager && this.outputKey && this.outputTag) {
                const time = new Date().toLocaleTimeString();
                const levelName = Object.keys(Level).find(key => Level[key] === lev.valueOf());
                const msg = `${time} - ${levelName} - ${message.text}\n`;
                this.outputManager.appendText(this.outputKey, msg, [this.outputTag]);
            }
        }
    }

    /**
     * Dispatch message for notification handling. Internally delegating
     * to message handling with Info level.
     *
     * @param text the text
     * @deprecated will get removed in favour of message(Message)
     */
    public showMessage(text: string): void {
        this.message({
            text: text,
            level: Level.Info
        });
    }
}
