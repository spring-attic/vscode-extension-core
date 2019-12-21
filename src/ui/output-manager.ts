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

/**
 * Managing extension output channels where a channel is identified by a key
 * and can be associated with a tags. Tags for example helps to close
 * a set of shown outputs if i.e. extension is outputting content of a various
 * logs files in an UI's output area.
 */
export class OutputManager {

    private outputs = new Map<string, TaggedOutputChannel>();

    constructor(
    ) {}

    /**
     * Gets an existing OutputChannel and creates it if it doesn't yet exist.
     *
     * @param key the output channel identifier
     * @returns existing or newly created OutputChannel
     */
    public getOutput(key: string, tags?: string[]): OutputChannel {
        let taggedOutput = this.outputs.get(key);
        if (!taggedOutput) {
            const output = window.createOutputChannel(key);
            taggedOutput = new TaggedOutputChannel(output, tags);
            this.outputs.set(key, taggedOutput);
        }
        return taggedOutput.channel;
    }

    /**
     * Sets a new text for a given output channel. Effectively this will
     * clear existing channel, append text to it and shows channel to a user.
     *
     * @param key the channel identifier
     * @param text the text to get replaced in an output
     * @param tags the tags for newly created channel
     */
    public setText(key: string, text: string, tags?: string[]): void {
        const output = this.getOutput(key, tags);
        output.clear();
        output.append(text);
        output.show();
    }

    /**
     * Appends a new text for a given output channel. Will not clear or
     * force exposing it to a user.
     *
     * @param key the channel identifier
     * @param text the text to get replaced in an output
     * @param tags the tags for newly created channel
     */
    public appendText(key: string, text: string, tags?: string[]): void {
        const output = this.getOutput(key, tags);
        output.append(text);
    }

    /**
     * Disposes all existing channels and clears those out from an
     * existing internal associations for a channel keys. After
     * calling this method we're effectively back to state when this
     * class were instantiated.
     */
    public disposeAll(): void {
        this.outputs.forEach((taggedChannel, key) => {
            taggedChannel.channel.dispose();
            this.outputs.delete(key);
        });
    }

    /**
     * Disposes all channels which matches with a given tags.
     *
     * @param tags the tagged channels to dispose
     */
    public disposeTagged(tags: string[]): void {
        this.outputs.forEach((taggedChannel, key) => {
            const found = taggedChannel.tags.some(tag => tags.includes(tag));
            if (found) {
                taggedChannel.channel.dispose();
                this.outputs.delete(key);
            }
        });
    }
}

/**
 * Keeping vscode output together with a given tags.
 */
class TaggedOutputChannel {
    constructor(
        public readonly channel: OutputChannel,
        public readonly tags: string[] = []
    ) {}
}
