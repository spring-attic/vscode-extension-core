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
import { workspace, env } from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import { accessSync } from 'fs';
import { join } from 'path';
import * as findJavaHome from 'find-java-home'

/**
 * Interface containing info about java home and major java version number.
 */
export interface JavaFinderInfo {
    home: string;
    version: number;
}

/**
 * Interface to find java environment from an existing system.
 */
export interface JavaFinder {
    find(): Promise<JavaFinderInfo>;
}

export class DefaultJavaFinder implements JavaFinder {
    constructor(
        private javaHomeConfigKey: string,
        private minJavaVersion: number = 8
    ) {}

    public async find(): Promise<JavaFinderInfo> {
        const javaHome = await this.checkJavaRuntime();
        const javaVersion = await this.checkJavaVersion(javaHome);
        return Promise.resolve({ home: javaHome, version: javaVersion });
    }

    private resolveJavacFilename(): string {
        return 'javac' + (process.platform.indexOf('win') === 0 ? '.exe' : '');
    }

    private readJavaConfig(): string | undefined {
        const config = workspace.getConfiguration();
        return config.get<string>(this.javaHomeConfigKey);
    }

    private expandHomeDir(path: string | undefined): string | undefined {
        const homedir = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
        if (!path) {
            return path;
        }
        if (path === '~') {
            return homedir;
        }
        if (path.slice(0, 2) !== '~/') {
            return path;
        }
        if (!homedir) {
            return undefined;
        } else {
            return join(homedir, path.slice(2));
        }
    }

    private pathExists(path: string | undefined): boolean {
        if (!path) {
            return false;
        }
        try {
            accessSync(path);
            return true;
        } catch (error) {
            return false;
        }
    }

    private checkJavaRuntime(): Promise<string> {
        return new Promise((resolve, reject) => {
            let source: string;
            let javaHome: string | undefined = this.readJavaConfig();
            if (javaHome) {
                source = `java.home variable defined in ${env.appName} settings`;
            } else {
                javaHome = process.env['JDK_HOME'];
                if (javaHome) {
                    source = 'JDK_HOME environment variable';
                } else {
                    javaHome = process.env['JAVA_HOME'];
                    source = 'JAVA_HOME environment variable';
                }
            }

            const javacFilename = this.resolveJavacFilename();
            javaHome = this.expandHomeDir(javaHome);
            if (javaHome) {
                    if (!this.pathExists(javaHome)) {
                    reject(`The ${source} points to a missing or inaccessible folder (${javaHome})`);
                }
                else if (!this.pathExists(path.resolve(javaHome, 'bin', javacFilename))) {
                    let msg: string;
                    if (this.pathExists(path.resolve(javaHome, javacFilename))) {
                        msg = `'bin' should be removed from the ${source} (${javaHome})`;
                    } else {
                        msg = `The ${source} (${javaHome}) does not point to a JDK.`;
                    }
                    reject(msg);
                }
                return resolve(javaHome);
            }
            findJavaHome((err, home) => {
                if (err) {
                    reject('Java runtime (JDK, not JRE) could not be located');
                }
                else {
                    resolve(home);
                }
            });
        });
    }

    private checkJavaVersion(javaHome: string): Promise<number> {
        return new Promise((resolve, reject) => {
            cp.execFile(javaHome + '/bin/java', ['-version'], {}, (error, stdout, stderr) => {
                const javaVersion = this.parseMajorVersion(stderr);
                if (javaVersion < this.minJavaVersion) {
                    throw new Error('Java 8 or more recent is required to run. Please download and install a recent JDK');
                } else {
                    resolve(javaVersion);
                }
            });
        });
    }

    private parseMajorVersion(content: string): number {
        let regexp = /version "(.*)"/g;
        let match = regexp.exec(content);
        if (!match) {
            return 0;
        }
        let version = match[1];
        // Ignore '1.' prefix for legacy Java versions
        if (version.startsWith('1.')) {
            version = version.substring(2);
        }
        // look into the interesting bits now
        regexp = /\d+/g;
        match = regexp.exec(version);
        let javaVersion = 0;
        if (match) {
            javaVersion = parseInt(match[0]);
        }
        return javaVersion;
    }
}
