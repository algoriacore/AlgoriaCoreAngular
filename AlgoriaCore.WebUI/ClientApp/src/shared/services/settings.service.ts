import { Injectable } from '@angular/core';
import { PasswordComplexityDto } from '../service-proxies/service-proxies';

@Injectable({ providedIn: 'root' })
export class SettingsService {
    private _passwordComplexity: PasswordComplexityDto;

    get passwordComplexity(): PasswordComplexityDto {
        return this._passwordComplexity;
    }

    set passwordComplexity(passwordComplexity: PasswordComplexityDto) {
        this._passwordComplexity = passwordComplexity;
    }
}
