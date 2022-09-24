import { Component, Injector, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import {
    MailServiceMailConfigForEditResponse,
    MailServiceMailConfigGetForEditQuery,
    MailServiceMailConfigServiceProxy
} from 'src/shared/service-proxies/service-proxies';
import { AppComponent } from '../../app.component';

@Component({
    selector: 'app-editmailservicemailconfig-form',
    templateUrl: './editmailservicemailconfig.component.html'
})
export class EditMailServiceMailConfigComponent extends AppComponentBase implements OnInit {

    @Input() mailServiceMailId: number;

    form: FormGroup;
    id?: number = null;
    model: MailServiceMailConfigForEditResponse = null;
    fieldLabels: any = {};

    permissions: any = {};

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private service: MailServiceMailConfigServiceProxy,
        public modalConfig: DynamicDialogConfig,
        private app: AppComponent
    ) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;
    }

    ngOnInit() {
        const self = this;

        self.id = self.mailServiceMailId;

        if (self.activatedRoute.snapshot.url.length > 1 && self.activatedRoute.snapshot.url[1].path === 'edit') {
            self.id = self.activatedRoute.snapshot.params['id'] ? Number(self.activatedRoute.snapshot.params['id']) : null;
        }

        this.prepareForm();

        if (self.id) {
            self.getForEdit(self.id);
        }
    }

    prepareForm() {
        const self = this;

        /* #region FORM LABELS */
        self.fieldLabels = {
            mailServiceMail: self.l('MailServiceMailConfigs.MailServiceMailConfig.MailServiceMail'),
            sender: self.l('MailServiceMailConfigs.MailServiceMailConfig.Sender'),
            senderDisplay: self.l('MailServiceMailConfigs.MailServiceMailConfig.SenderDisplay'),
            smpthost: self.l('MailServiceMailConfigs.MailServiceMailConfig.Smpthost'),
            smptport: self.l('MailServiceMailConfigs.MailServiceMailConfig.Smptport'),
            isSsl: self.l('MailServiceMailConfigs.MailServiceMailConfig.IsSsl'),
            useDefaultCredential: self.l('MailServiceMailConfigs.MailServiceMailConfig.UseDefaultCredential'),
            domain: self.l('MailServiceMailConfigs.MailServiceMailConfig.Domain'),
            mailUser: self.l('MailServiceMailConfigs.MailServiceMailConfig.MailUser'),
            mailPassword: self.l('MailServiceMailConfigs.MailServiceMailConfig.MailPassword'),
            id: self.l('MailServiceMailConfigs.MailServiceMailConfig.Id'),
        };
        /* #endregion */


        /* #region FORM FIELDS */
        self.form = self.formBuilder.group({
            mailServiceMail: [''],
            sender: [''],
            senderDisplay: [''],
            smpthost: [''],
            smptport: [''],
            isSsl: [true],
            useDefaultCredential: [true],
            domain: [''],
            mailUser: [''],
            mailPassword: [''],
            id: [''],

        });
        /* #endregion */


    }

    getForEdit(id: number): void {
        const self = this;

        self.app.blocked = true;

        self.service.getMailServiceMailConfigForEdit(new MailServiceMailConfigGetForEditQuery({ id: id }))
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.model = data;

                if (id) {

                    self.f.id.setValue(data.id);
                    self.f.sender.setValue(data.sender);
                    self.f.senderDisplay.setValue(data.senderDisplay);
                    self.f.smpthost.setValue(data.smpthost);
                    self.f.smptport.setValue(data.smptport);
                    self.f.isSsl.setValue(data.isSsl);
                    self.f.useDefaultCredential.setValue(data.useDefaultCredential);
                    self.f.domain.setValue(data.domain);
                    self.f.mailUser.setValue(data.mailUser);
                    self.f.mailPassword.setValue(data.mailPassword);

                }
            });
    }

    activaModoNuevo(): void {
        const self = this;
        self.prepareForm();
    }
}

