import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import {
    ComboboxItemDto,
    MailGroupServiceProxy,
    MailTemplateCreateCommand,
    MailTemplateForEditResponse,
    MailTemplateGetBodyParamListQuery,
    MailTemplateGetForEditQuery,
    MailTemplateGetMailKeyAvailableListQuery,
    MailTemplateUpdateCommand
} from '../../../shared/service-proxies/service-proxies';
import { AppComponent } from '../../app.component';
import { ChangeLogService } from '../../_services/changelog.service';
import { SendTestEmailTemplatesComponent } from './testemailtemplates.component';

@Component({
    templateUrl: './editemailtemplates.component.html'
})
export class EditEmailTemplatesComponent extends AppComponentBase implements OnInit {

    @ViewChild('name', { static: false }) inputFocus: ElementRef;
    form: FormGroup;

    grupo: number = null;

    id?: number = null;
    model: MailTemplateForEditResponse;
    isactive: boolean;
    parametros: ComboboxItemDto[] = [];
    mailKeyList: ComboboxItemDto[] = [];

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private mailGroupService: MailGroupServiceProxy,
        private changeLogService: ChangeLogService,
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

        self.id = self.activatedRoute.snapshot.params['id'] ? Number(self.activatedRoute.snapshot.params['id']) : null;
        self.grupo = self.activatedRoute.snapshot.params['group'] ? Number(self.activatedRoute.snapshot.params['group']) : null;

        self.form = self.formBuilder.group({
            displayname: ['', Validators.required],
            mailkey: ['', Validators.required],
            sendto: [''],
            copyto: [''],
            blindcopyto: [''],
            subject: [''],
            body: [''],
            isactive: ['true']
        });

        self.prepareForm();

        if (self.id) {
            self.getForEdit(self.id);
        }
    }

    getForEdit(id: number): void {
        const self = this;

        const query = new MailTemplateGetForEditQuery();
        query.id = self.id;

        self.app.blocked = true;

        self.mailGroupService.getMailTemplateForEdit(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.model = data;
                self.mailKeyList = self.model.mailKeyList;

                setTimeout(() => {
                    self.f.displayname.setValue(self.model.displayName);
                    self.f.mailkey.setValue(self.model.mailKey);
                    self.f.sendto.setValue(self.model.sendTo);
                    self.f.copyto.setValue(self.model.copyTo);
                    self.f.blindcopyto.setValue(self.model.blindCopyTo);
                    self.f.subject.setValue(self.model.subject);
                    self.f.body.setValue(self.model.body);
                    self.f.isactive.setValue(self.model.isActive);

                    self.getBodyParams(self.model.mailKey);
                }, 0);
            });
    }

    save(): void {
        const self = this;

        if (self.id) {
            const updateCmd = new MailTemplateUpdateCommand();
            updateCmd.id = self.model.id;
            updateCmd.mailGroup = self.model.mailGroup;
            updateCmd.displayName = self.f.displayname.value;
            updateCmd.mailKey = self.f.mailkey.value;
            updateCmd.sendTo = self.f.sendto.value;
            updateCmd.copyTo = self.f.copyto.value;
            updateCmd.blindCopyTo = self.f.blindcopyto.value;
            updateCmd.subject = self.f.subject.value;
            updateCmd.body = self.f.body.value;
            updateCmd.isActive = self.f.isactive.value;

            self.app.blocked = true;

            self.mailGroupService.updateMailTemplate(updateCmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('SavedSuccessfully'), self.l('Success'));
                    self.return();
                });
        } else {
            const createCmd = new MailTemplateCreateCommand();
            createCmd.mailGroup = self.grupo;
            createCmd.displayName = self.f.displayname.value;
            createCmd.mailKey = self.f.mailkey.value;
            createCmd.sendTo = self.f.sendto.value;
            createCmd.copyTo = self.f.copyto.value;
            createCmd.blindCopyTo = self.f.blindcopyto.value;
            createCmd.subject = self.f.subject.value;
            createCmd.body = self.f.body.value;
            createCmd.isActive = self.f.isactive.value;

            self.app.blocked = true;

            self.mailGroupService.createMailTemplate(createCmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('SavedSuccessfully'), self.l('Success'));
                    self.prepareForm();
                });
        }
    }

    prepareForm(): void {
        const self = this;

        self.form = self.formBuilder.group({
            displayname: ['', Validators.required],
            mailkey: ['', Validators.required],
            sendto: [''],
            copyto: [''],
            blindcopyto: [''],
            subject: [''],
            body: [''],
            isactive: ['true']
        });

        self.getMailKeyList();

        // focus
        setTimeout(() => this.inputFocus.nativeElement.focus(), 100);
    }

    sendTest(): void {
        const self = this;

        self.dialogService.open(SendTestEmailTemplatesComponent, {
            width: '50%',
            showHeader: false,
            dismissableMask: false,
            data: new MailTemplateForEditResponse({
                id: 0,
                mailGroup: self.grupo,
                body: self.f.body.value,
                subject: self.f.subject.value
            }),
            header: self.l('EmailTemplates.Test')
        });
    }

    showChangeHistory(): void {
        const self = this;

        self.changeLogService.open('Mailtemplate', self.id);
    }

    return(): void {
        this.router.navigate(['/app/admin/emailtemplates/group', this.grupo]);
    }

    onChangeMailKey(): void {
        const self = this;

        self.getBodyParams(self.f.mailkey.value);
    }

    getMailKeyList(): void {
        const self = this;

        const query = new MailTemplateGetMailKeyAvailableListQuery();
        query.mailGroup = self.grupo;

        self.app.blocked = true;

        self.mailGroupService.getMailTemplateGetMailKeyAvailableList(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.mailKeyList = data;
            });
    }

    getBodyParams(tipoCorreo: string): void {
        const self = this;

        const query = new MailTemplateGetBodyParamListQuery();
        query.mailKey = tipoCorreo;

        self.app.blocked = true;

        self.mailGroupService.getMailTemplateGetBodyParamList(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.parametros = data;
            });
    }

    copy(target: string): void {
        // standard way of copying
        const textArea = document.createElement('textarea');
        textArea.setAttribute('style', 'width:1px;border:0;opacity:0;');
        document.body.appendChild(textArea);
        textArea.value = target;
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}
