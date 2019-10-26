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
import { window, OutputChannel } from 'vscode';

export class OutputManager {

    private outputs = new Map<string, OutputChannel>();

    constructor(
    ) {}

    public getOutput(key: string): OutputChannel {
        let output = this.outputs.get(key);
        if (!output) {
            output = window.createOutputChannel(key);
            this.outputs.set(key, output);
        }
        return output;
    }

    public setText(key: string, text: string): void {
        const output = this.getOutput(key);
        output.clear();
        output.append(text);
        output.show();
    }

    public disposeAll(): void {
        [...this.outputs.values()].forEach(channel => channel.dispose());
        this.outputs.clear();
    }
}
