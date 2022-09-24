import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AppComponentBase } from 'src/app/app-component-base';
import { FormService } from 'src/shared/services/form.service';
import { StringsHelper } from '../helpers/StringsHelper';

@Component({
    templateUrl: './app.customcode.component.html'
})
export class AppCustomCodeComponent extends AppComponentBase implements OnInit {

    form: FormGroup;
    fieldLabels: any = {};

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private modalRef: DynamicDialogRef,
        private modalConfig: DynamicDialogConfig,
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
        self.f.customCode.setValue(self.modalConfig.data);

        if (self.modalRef) {
            self.initModalMode();
        }
    }

    prepareForm() {
        const self = this;

        self.fieldLabels = {
            customCode: self.l('CustomCode.Input')
        };

        self.form = self.formBuilder.group({
            customCode: [null]
        });
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
            self.l('Save')
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

        self.return(true);
    }

    return(isSaved: boolean = false): void {
        const self = this;

        self.modalRef.close({ isSaved: isSaved, customCode: self.f.customCode.value });
    }
}
