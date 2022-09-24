import { Component, Injector, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import {
    MailGroupCreateCommand,
    MailGroupForEditResponse,
    MailGroupGetForEditQuery,
    MailGroupServiceProxy,
    MailGroupUpdateCommand
} from '../../../shared/service-proxies/service-proxies';
import { AppComponent } from '../../app.component';
import { ChangeLogService } from '../../_services/changelog.service';

@Component({
    templateUrl: './editemailgroups.component.html'
})
export class EditEmailGroupsComponent extends AppComponentBase implements OnInit {
    @ViewChild('name', { static: false }) inputFocus: ElementRef;
    form: FormGroup;

    id?: number = null;
    model: MailGroupForEditResponse;
    isactive: boolean;

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

        if (self.activatedRoute.snapshot.url.length > 1 && self.activatedRoute.snapshot.url[1].path === 'edit') {
            self.id = self.activatedRoute.snapshot.params['id'] ? Number(self.activatedRoute.snapshot.params['id']) : null;
        }

        self.prepareForm();

        if (self.id) {
            self.getForEdit(self.id);
        }
    }

    getForEdit(id: number): void {
        const self = this;

        self.app.blocked = true;

        const query = new MailGroupGetForEditQuery();
        query.id = self.id;
        self.mailGroupService.getMailGroupForEdit(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.model = data;

                self.f.displayname.setValue(self.model.displayName);
                self.f.header.setValue(self.model.header);
                self.f.footer.setValue(self.model.footer);
            });
    }

    save(): void {
        const self = this;

        if (self.model == null) {
            const createCmd = new MailGroupCreateCommand();
            createCmd.displayName = self.f.displayname.value;
            createCmd.header = self.f.header.value;
            createCmd.footer = self.f.footer.value;

            self.app.blocked = true;

            self.mailGroupService.createMailGroup(createCmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('SavedSuccessfully'), self.l('Success'));
                    self.prepareForm();
                });

        } else {
            const updateCmd = new MailGroupUpdateCommand();
            updateCmd.id = self.model.id;
            updateCmd.displayName = self.f.displayname.value;
            updateCmd.header = self.f.header.value;
            updateCmd.footer = self.f.footer.value;

            self.app.blocked = true;

            self.mailGroupService.updateMailGroup(updateCmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('SavedSuccessfully'), self.l('Success'));
                    self.return();
                });
        }
    }

    prepareForm(): void {
        const self = this;

        self.form = self.formBuilder.group({
            displayname: ['', Validators.required],
            header: [''],
            footer: ['']
        });

        // focus
        setTimeout(() => this.inputFocus.nativeElement.focus(), 100);
    }

    showChangeHistory(): void {
        const self = this;

        self.changeLogService.open('Mailgroup', self.id);
    }

    return(): void {
        this.router.navigate(['/app/admin/emailgroups']);
    }
}
