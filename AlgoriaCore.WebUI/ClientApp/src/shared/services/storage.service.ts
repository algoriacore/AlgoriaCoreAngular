import { Inject, Injectable, InjectionToken } from '@angular/core';
import { AppConsts } from '../AppConsts';

export const BROWSER_STORAGE = new InjectionToken<Storage>('Browser Storage', {
    providedIn: 'root',
    factory: () => localStorage
});

@Injectable({
    providedIn: 'root'
})
export class BrowserStorageService {
    constructor(@Inject(BROWSER_STORAGE) public storage: Storage) { }

    get(key: string): any {
        return JSON.parse(this.storage.getItem(this.calculateKey(key)));
    }

    set(key: string, value: any): void {
        this.storage.setItem(this.calculateKey(key), JSON.stringify(value));
    }

    remove(key: string): void {
        this.storage.removeItem(this.calculateKey(key));
    }

    removeExact(key: string): void {
        this.storage.removeItem(key);
    }

    clear(): void {
        this.storage.clear();
    }

    getAll(): StorageKeys[] {
        const lenght = this.storage.length;

        const lista: StorageKeys[] = [];

        for (let i = 0, len = lenght; i < len; i++) {

            const actualKey = this.storage.key(i);
            const actual = new StorageKeys();
            actual.key = actualKey;
            actual.value = JSON.parse(this.storage.getItem(actualKey));

            lista.push(actual);
        }

        return lista;
    }

    calculateKey(key: string): string {
        return AppConsts.appPrefix + '-' + key;
    }
}

export class StorageKeys {
    key: string;
    value: any;
}
