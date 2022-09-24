import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SettingsClientService {
    private _settings: { [key: string]: string };

    set settings(settings) {
        this._settings = settings;
    }

    getSetting(key: string): string {
        return this._settings[key];
    }

    setSetting(key: string, value: string): string {
        return this._settings[key] = value;
    }
}
