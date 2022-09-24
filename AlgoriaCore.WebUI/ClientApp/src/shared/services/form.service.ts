import { ElementRef, Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { LocalizationService } from './localization.service';
import { AlertService } from './alert.service';

@Injectable({ providedIn: 'root' })
export class FormService {

    constructor(private localizationService: LocalizationService, private alertService: AlertService) { }

    l(key: string, ...args: any[]): string {
        return this.localizationService.l(key, ...args);
    }

    getErrors(form: FormGroup, fieldLabels: any): ControlError[] {
        const self = this;
        const messages: ControlError[] = [];
        let control;
        let fieldLabel: string;
        let error;

        Object.keys(form.controls).forEach(controlName => {
            control = form.controls[controlName];

            if (control.errors) {
                fieldLabel = fieldLabels[controlName];

                Object.keys(control.errors).forEach(errorName => {
                    error = control.errors[errorName];

                    switch (errorName) {
                        case 'required': {
                            messages.push({ controlName: controlName, message: self.l('RequiredField', fieldLabel) });
                            break;
                        }
                        case 'requiredtrue': {
                            messages.push({ controlName: controlName, message: self.l('RequiredTrueField', fieldLabel) });
                            break;
                        }
                        case 'minlength': {
                            messages.push({
                                controlName: controlName, message: self.l('FieldMinLength', fieldLabel, error.requiredLength)
                            });
                            break;
                        }
                        case 'maxlength': {
                            messages.push({
                                controlName: controlName, message: self.l('FieldMaxLength', fieldLabel, error.requiredLength)
                            });
                            break;
                        }
                        case 'min': {
                            messages.push({
                                controlName: controlName, message: self.l('FieldMinimumValue', fieldLabel, error.min)
                            });
                            break;
                        }
                        case 'max': {
                            messages.push({
                                controlName: controlName, message: self.l('FieldMaximumValue', fieldLabel, error.max)
                            });
                            break;
                        }
                        case 'email': {
                            messages.push({
                                controlName: controlName, message: self.l('FieldInvalidEmailAddress', fieldLabel)
                            });
                            break;
                        }
                        case 'pattern': {
                            messages.push({
                                controlName: controlName, message: self.l('FieldInvalidFormat', fieldLabel, error.requiredPattern)
                            });
                            break;
                        }
                        case 'nullvalidator': {
                            messages.push({ controlName: controlName, message: self.l('FieldNotNull', fieldLabel) });
                            break;
                        }
                    }
                });
            }
        });

        return messages;
    }

    showErrors(form: FormGroup, fieldLabels: any): void {
        const self = this;
        let errors: ControlError[] = [];

        errors = self.getErrors(form, fieldLabels);

        if (errors.length > 0) {
            self.showErrorsFromErrors(form, errors);
        }
    }

    showErrorsFromErrors(form: FormGroup, errors: ControlError[]): void {
        const self = this;
        const messages = errors.map(p => p.message);

        self.showErrorsFromMessages(messages);
        self.highlightErrors(form, errors);
    }

    showErrorsFromMessages(messages: string[]): void {
        const self = this;

        const wholeMessage = self.l('ExceptionFilter.ValidationException.Message') + '\r\n' + '\r\n' + messages.join('\r\n');
        this.alertService.validation(self.l('ExceptionFilter.ValidationException.Title'), wholeMessage);
    }

    highlightErrors(form: FormGroup, errors: ControlError[]): void {
        let control;
        let nativeControl;

        errors.forEach(error => {
            control = form.get(error.controlName) as any;

            if (control) {
                nativeControl = (control).nativeElement;
                (nativeControl as HTMLFormElement).classList.add('ng-dirty');
            }
        });
    }
}

export class ControlError {
    controlName: string;
    message: string;
}
