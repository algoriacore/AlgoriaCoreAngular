import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import {
    MailGroupServiceProxy,
    MailTemplateForEditResponse,
    MailTemplateSendTestCommand
} from 'src/shared/service-proxies/service-proxies';

@Component({
    templateUrl: './testemailtemplates.component.html'
})
export class SendTestEmailTemplatesComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    blockedDocument = false;

    model: MailTemplateForEditResponse = null;

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private service: MailGroupServiceProxy,
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

        self.model = self.modalConfig.data;
    }

    prepareForm() {
        const self = this;

        self.form = self.formBuilder.group({
            emailaddress: ['', Validators.required]
        });
    }

    save(): void {
        const self = this;

        // stop here if form is invalid
        if (self.form.invalid) {
            return;
        }

        const cmd = new MailTemplateSendTestCommand();

        cmd.mailGroup = self.model.mailGroup;
        cmd.email = self.f.emailaddress.value;
        cmd.body = self.model.body;
        cmd.subject = self.model.subject;

        self.blockedDocument = true;

        self.service.sendTestEmail(cmd)
            .pipe(finalize(() => {
                self.blockedDocument = false;
            }))
            .subscribe(data => {
                self.notify.success(self.l('TestEmailSentSuccessfully'), self.l('Success'));
                self.return(true);
            });
    }

    return(isSuccess = false): void {
        const self = this;

        self.modalRef.close(isSuccess);
    }
}
