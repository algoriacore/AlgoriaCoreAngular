import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AppComponentBase } from 'src/app/app-component-base';
import { FormService } from 'src/shared/services/form.service';
import { StringsHelper } from '../helpers/StringsHelper';

@Component({
    templateUrl: './app.prompt.component.html'
})
export class AppPromptComponent extends AppComponentBase implements OnInit {

    form: FormGroup;
    fieldLabels: any = {};

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private modalRef: DynamicDialogRef,
        public modalConfig: DynamicDialogConfig,
        private formService: FormService
    ) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;
    }

    ngOnInit() {
        const self = this;

        self.prepareForm();

        if (self.modalRef) {
            self.initModalMode();
        }
    }

    prepareForm() {
        const self = this;

        self.fieldLabels = {
            prompt: self.modalConfig.data.promptLabel
        };

        self.form = self.formBuilder.group({
            prompt: [null]
        });

        if (self.modalConfig.data.required) {
            self.f.prompt.addValidators(Validators.required);
        }

        if (self.modalConfig.data.maxLength) {
            self.f.prompt.addValidators(Validators.maxLength(self.modalConfig.data.maxLength));
        }
    }

    initModalMode(): void {
        const self = this;
        const templateHTML = '<button id="{0}"class="p-button p-button-secondary" type="button">{1}</button>'
            + '<button id="{2}"class="p-button" type="button">{3}</button>';
        const footer = document.getElementsByClassName('p-dialog-footer')[0];
        const idButton1 = 'btn' + new Date().getMilliseconds() + (Math.random() * 100);
        const idButton2 = 'btn' + new Date().getMilliseconds() + (Math.random() * 100);

        footer.innerHTML = StringsHelper.formatString(templateHTML, [
            idButton1,
            self.l('Return'),
            idButton2,
            self.l('Accept')
        ]);

        let button = document.getElementById(idButton1);

        button.addEventListener('click', (e) => {
            self.return();
        });

        button = document.getElementById(idButton2);

        button.addEventListener('click', (e) => {
            self.save();
        });
    }

    save(): void {
        const self = this;

        // stop here if form is invalid
        if (self.form.invalid) {
            this.formService.showErrors(self.form, self.fieldLabels);
            return;
        }

        self.return(self.f.prompt.value);
    }

    return(prompt?: string): void {
        const self = this;

        self.modalRef.close(prompt);
    }
}
