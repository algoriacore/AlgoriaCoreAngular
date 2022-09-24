import { Component, Injector, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import {
    ComboboxItemDto,
    MailServiceMailForEditResponse,
    MailServiceMailGetForEditQuery,
    MailServiceMailServiceProxy
} from 'src/shared/service-proxies/service-proxies';
import { AppComponent } from '../../app.component';
import { MailServiceMailAttachComponent } from '../mailservicemailattach/mailservicemailattach.component';
import { EditMailServiceMailConfigComponent } from '../mailservicemailconfig/editmailservicemailconfig.component';

@Component({
    templateUrl: './editmailservicemail.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class EditMailServiceMailComponent extends AppComponentBase implements OnInit {

    @ViewChild(EditMailServiceMailConfigComponent, {static: false}) editMailServiceMailConfigComponent: EditMailServiceMailConfigComponent;
    @ViewChild(MailServiceMailAttachComponent, {static: false}) mailServiceMailAttachmentComponent: MailServiceMailAttachComponent;

    form: FormGroup;
    id?: number = null;
    model: MailServiceMailForEditResponse = null;
    hasLocalConfig = false;
    statusDesc = '';
    bodyId: number = null;
    htmlMessage: string;
    fieldLabels: any = {};

    mailServiceRequestCombo: ComboboxItemDto[] = [];

    permissions: any = {};

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private service: MailServiceMailServiceProxy,
        public modalConfig: DynamicDialogConfig,
        private app: AppComponent
    ) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;
    }

    get isPending() {
        const self = this;
        return self.model.mailServiceMailStatus.status === 0;
    }

    get isSuccess() {
        const self = this;
        return self.model.mailServiceMailStatus.status === 2;
    }

    get isError() {
        const self = this;
        return self.model.mailServiceMailStatus.status === 3;
    }

    get isCanceled() {
        const self = this;
        return self.model.mailServiceMailStatus.status === 4;
    }

    ngOnInit() {
        const self = this;

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
            mailServiceRequest: self.l('MailServiceMails.MailServiceMail.MailServiceRequest'),
            isLocalConfig: self.l('MailServiceMails.MailServiceMail.IsLocalConfig'),
            sendto: self.l('MailServiceMails.MailServiceMail.Sendto'),
            copyTo: self.l('MailServiceMails.MailServiceMail.CopyTo'),
            blindCopyTo: self.l('MailServiceMails.MailServiceMail.BlindCopyTo'),
            subject: self.l('MailServiceMails.MailServiceMail.Subject'),
            status: self.l('MailServiceMailStatuss.MailServiceMailStatus'),
            id: self.l('MailServiceMails.MailServiceMail.Id'),
        };
        /* #endregion */


        /* #region FORM FIELDS */
        self.form = self.formBuilder.group({
            mailServiceRequest: [''],
            isLocalConfig: [true],
            sendto: [''],
            copyTo: [''],
            blindCopyTo: [''],
            subject: [''],
            status: [''],
            id: [''],

        });
        /* #endregion */

    }

    getForEdit(id: number): void {
        const self = this;

        self.app.blocked = true;

        self.service.getMailServiceMailForEdit(new MailServiceMailGetForEditQuery({ id: id }))
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.model = data;

                if (id) {
                    self.f.isLocalConfig.setValue(data.isLocalConfig);
                    self.f.sendto.setValue(data.sendto);
                    self.f.copyTo.setValue(data.copyTo);
                    self.f.blindCopyTo.setValue(data.blindCopyTo);
                    self.f.subject.setValue(data.subject);
                    self.f.id.setValue(data.id);

                    self.statusDesc = data.mailServiceMailStatus.statusDesc;
                    self.hasLocalConfig = data.isLocalConfig;
                    self.bodyId = data.mailServiceMailBody.body ? data.mailServiceMailBody.id : 0;
                    self.htmlMessage = data.mailServiceMailBody.body ? data.mailServiceMailBody.body : '';

                    console.log(this.bodyId);

                }
            });
    }

    activaModoNuevo(): void {
        const self = this;
        self.prepareForm();
    }

    return(): void {
        this.router.navigate(['/app/mailgrpcservice/mailservicemail']);
    }
}
