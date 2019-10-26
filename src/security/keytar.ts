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
export interface IKeytar {
    /**
     * Get the stored password for the service and account.
     *
     * @param service The string service name.
     * @param account The string account name.
     *
     * @returns A promise for the password string.
     */
    getPassword(service: string, account: string): Promise<string | undefined>;

    /**
     * Add the password for the service and account to the keychain.
     *
     * @param service The string service name.
     * @param account The string account name.
     * @param password The string password.
     *
     * @returns A promise for the set password completion.
     */
    setPassword(service: string, account: string, password: string): Promise<void>;

    /**
     * Delete the stored password for the service and account.
     *
     * @param service The string service name.
     * @param account The string account name.
     *
     * @returns A promise for the deletion status. True on success.
     */
    deletePassword(service: string, account: string): Promise<boolean>;
}

/**
 * Returns the keytar module installed with vscode
 */
function getKeytarModule(): Keytar {
    const keytar = getNodeModule<Keytar>('keytar');
    if (!keytar) {
        throw new Error("Internal error: Could not find keytar module for reading and writing passwords");
    } else {
        return keytar;
    }
}

function getNodeModule<T>(moduleName: string): T | undefined {
	const vscodeRequire = eval('require');
	try {
		return vscodeRequire('keytar');
	} catch (err) {
	}
	return undefined;
}

export class Keytar implements IKeytar {
    private constructor(private _keytar: Keytar) {
    }

    public static tryCreate(): Keytar | undefined {
        let keytar: Keytar = getKeytarModule();
        if (keytar) {
            return new Keytar(keytar);
        } else {
            return undefined;
        }
    }

    public async getPassword(service: string, account: string): Promise<string | undefined> {
        return await this._keytar.getPassword(service, account) || undefined;
    }

    public async setPassword(service: string, account: string, password: string): Promise<void> {
        await this._keytar.setPassword(service, account, password);
    }

    public async deletePassword(service: string, account: string): Promise<boolean> {
        return await this._keytar.deletePassword(service, account);
    }
}
