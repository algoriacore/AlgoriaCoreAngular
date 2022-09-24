import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import { MailGroupCopyCommand, MailGroupForEditResponse, MailGroupServiceProxy } from 'src/shared/service-proxies/service-proxies';

@Component({
    templateUrl: './copyemailgroups.component.html'
})
export class CopyEmailGroupsComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    blockedDocument = false;

    model: MailGroupForEditResponse = null;
    id?: number = null;

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

        self.id = self.modalConfig.data.id;
        self.model = self.modalConfig.data;
    }

    prepareForm() {
        const self = this;

        self.form = self.formBuilder.group({
            displayname: ['', Validators.required]
        });
    }

    save(): void {
        const self = this;

        // stop here if form is invalid
        if (self.form.invalid) {
            return;
        }

        const cmd = new MailGroupCopyCommand();

        cmd.id = self.model.id;
        cmd.displayName = self.f.displayname.value;

        self.blockedDocument = true;

        self.service.copyMailGroup(cmd)
            .pipe(finalize(() => {
                self.blockedDocument = false;
            }))
            .subscribe(data => {
                self.notify.success(self.l('SavedSuccessfully'), self.l('Success'));
                self.return(true);
            });
    }

    return(isEdited = false): void {
        const self = this;

        self.modalRef.close(isEdited);
    }
}
