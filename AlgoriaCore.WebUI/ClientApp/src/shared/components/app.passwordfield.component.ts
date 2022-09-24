import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PasswordComplexityDto } from '../service-proxies/service-proxies';
import { LocalizationService } from '../services/localization.service';
import { SettingsService } from '../services/settings.service';

@Component({
    selector: 'app-password-field',
    templateUrl: './app.passwordfield.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => PasswordFieldComponent),
        multi: true,
    }]
})
export class PasswordFieldComponent implements ControlValueAccessor {
    @Input() feedback = true;
    value: string;

    private passwordComplexity: PasswordComplexityDto;

    constructor(private settingsService: SettingsService, private localizationService: LocalizationService) {
        this.passwordComplexity = settingsService.passwordComplexity;
    }

    l(key: string, ...args: any[]): string {
        return this.localizationService.l(key, args);
    }

    public writeValue(value: any) {
        const self = this;

        self.value = value;
        self.propagateChange(value);
    }

    // registers 'fn' that will be fired when changes are made
    // this is how we emit the changes back to the form
    public registerOnChange(fn: any) {
        this.propagateChange = fn;
    }

    // not used, used for touch input
    public registerOnTouched() { }

    onChange(event) {
        const self = this;

        self.value = event.target.value;
        self.propagateChange(event.target.value);
    }

    // Implementar la interfaz ControlValueAccesor
    private propagateChange = (_: any) => { };
}
