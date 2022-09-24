import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import {
    LanguageServiceProxy,
    LanguageTextForEditResponse,
    LanguageTextUpdateCommand
} from 'src/shared/service-proxies/service-proxies';
import { FormService } from '../../../../shared/services/form.service';

@Component({
    templateUrl: './editlanguagetexts.component.html'
})
export class EditLanguageTextsComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    blockedDocument = false;

    model: LanguageTextForEditResponse = null;
    id?: number = null;
    fieldLabels: any = {};

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private formService: FormService,
        private service: LanguageServiceProxy,
        private modalRef: DynamicDialogRef,
        private modalConfig: DynamicDialogConfig
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

        self.id = self.modalConfig.data.id;
        self.model = self.modalConfig.data;

        self.f.value.setValue(self.model.value);
    }

    prepareForm() {
        const self = this;

        self.fieldLabels = {
            key: this.l('Languages.Texts.Text.Key'),
            value: this.l('Languages.Texts.Text.Value')
        };

        self.form = self.formBuilder.group({
            value: ['', Validators.required]
        });
    }

    save(): void {
        const self = this;

        // stop here if form is invalid
        if (self.form.invalid) {
            this.formService.showErrors(self.form, self.fieldLabels);
            return;
        }

        const updateCmd = new LanguageTextUpdateCommand();

        updateCmd.id = self.model.id;
        updateCmd.languageId = self.model.languageId;
        updateCmd.key = self.model.key;
        updateCmd.value = self.f.value.value;

        self.blockedDocument = true;

        self.service.updateLanguageText(updateCmd)
            .pipe(finalize(() => {
                self.blockedDocument = false;
            }))
            .subscribe(data => {
                self.notify.success(self.l('SavedSuccessfully'), self.l('Confirmation'));
                self.return(true);
            });
    }

    return(isEdited = false): void {
        const self = this;

        self.modalRef.close(isEdited);
    }
}
