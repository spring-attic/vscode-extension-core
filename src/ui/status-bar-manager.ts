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
import { StatusBarItem, StatusBarAlignment, window } from "vscode";

export interface StatusBarManagerItem {

    setStatusBarItem(item: StatusBarItem);
    getStatusBarAlignment(): StatusBarAlignment;
    getPriority(): number;
    getCommand(): string | undefined;
    getText(): string | undefined;
    setText(text: string): void;
}

export abstract class AbstractStatusBarManagerItem implements StatusBarManagerItem {

    protected statusBarItem: StatusBarItem | undefined;

    public setStatusBarItem(item: StatusBarItem) {
        this.statusBarItem = item;
    }

    public getStatusBarAlignment(): StatusBarAlignment {
        return StatusBarAlignment.Left;
    }

    public getPriority(): number {
        return 0;
    }

    public getCommand(): string | undefined {
        return undefined;
    }

    public getText(): string | undefined {
        return undefined;
    }

    public setText(text: string): void {
        if (this.statusBarItem) {
            this.statusBarItem.text = text;
        }
    }
}

export class StatusBarManager {

    constructor(
        private items: StatusBarManagerItem[]
    ){
        this.items.forEach(item => {
            const sbi = window.createStatusBarItem(item.getStatusBarAlignment(), item.getPriority());
            item.setStatusBarItem(sbi);
            sbi.command = item.getCommand();
            const text = item.getText();
            if (text) {
                sbi.text = text;
            }
            sbi.show();
        });
    }
}
