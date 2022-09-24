import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import {
    TemplateToDoStatusForEditResponse,
    TemplateToDoStatusGetForEditQuery,
    TemplatesServiceProxy,
    TemplateToDoStatusUpdateCommand,
    TemplateToDoStatusCreateCommand,
    ComboboxItemDto,
    TemplateToDoStatusType
} from 'src/shared/service-proxies/service-proxies';
import { FormService } from 'src/shared/services/form.service';
import { ChangeLogService } from 'src/app/_services/changelog.service';

@Component({
    templateUrl: './edittemplatetodostatus.component.html'
})
export class EditTemplateToDoStatusComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    blockedDocument = false;

    model: TemplateToDoStatusForEditResponse = new TemplateToDoStatusForEditResponse();
    template: number;
    id?: number = null;
    fieldLabels: any = {};

    typeCombo: ComboboxItemDto[] = [];

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private service: TemplatesServiceProxy,
        private modalRef: DynamicDialogRef,
        private modalConfig: DynamicDialogConfig,
        private formService: FormService,
        private changeLogService: ChangeLogService
    ) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;
    }

    ngOnInit() {
        const self = this;

        self.template = self.modalConfig.data.template;
        self.id = self.modalConfig.data.id;

        self.typeCombo.push(new ComboboxItemDto({
            value: TemplateToDoStatusType.Pending.toString(), label: self.l('TemplateToDoStatus.TemplateToDoStatus.Type.Pending')
        }));
        self.typeCombo.push(new ComboboxItemDto({
            value: TemplateToDoStatusType.InRevision.toString(), label: self.l('TemplateToDoStatus.TemplateToDoStatus.Type.InRevision')
        }));
        self.typeCombo.push(new ComboboxItemDto({
            value: TemplateToDoStatusType.Returned.toString(), label: self.l('TemplateToDoStatus.TemplateToDoStatus.Type.Returned')
        }));
        self.typeCombo.push(new ComboboxItemDto({
            value: TemplateToDoStatusType.Rejected.toString(), label: self.l('TemplateToDoStatus.TemplateToDoStatus.Type.Rejected')
        }));
        self.typeCombo.push(new ComboboxItemDto({
            value: TemplateToDoStatusType.Closed.toString(), label: self.l('TemplateToDoStatus.TemplateToDoStatus.Type.Closed')
        }));

        this.prepareForm();

        if (self.id) {
            self.getForEdit(self.id);
        }
    }

    prepareForm() {
        const self = this;

        self.fieldLabels = {
            type: self.l('TemplateToDoStatus.TemplateToDoStatus.Type'),
            name: self.l('TemplateToDoStatus.TemplateToDoStatus.Name')
        };

        self.form = self.formBuilder.group({
            type: [null, [Validators.required]],
            name: [null, [Validators.required, Validators.maxLength(30)]],
            isDefault: [false],
            isActive: [true]
        });
    }

    getForEdit(id: number): void {
        const self = this;

        self.blockedDocument = true;

        self.service.getTemplateToDoStatusForEdit(new TemplateToDoStatusGetForEditQuery({ id: id }))
            .pipe(finalize(() => {
                self.blockedDocument = false;
            }))
            .subscribe(data => {
                self.model = data;

                if (self.id) {
                    self.template = data.template;
                    self.f.type.setValue(data.type.toString());
                    self.f.name.setValue(data.name);
                    self.f.isDefault.setValue(data.isDefault);
                    self.f.isActive.setValue(data.isActive);
                }
            });
    }

    save(): void {
        const self = this;

        // stop here if form is invalid
        if (self.form.invalid) {
            this.formService.showErrors(self.form, self.fieldLabels);
            return;
        }

        self.blockedDocument = true;

        if (self.id) {
            const updateCmd = new TemplateToDoStatusUpdateCommand();
            updateCmd.id = self.model.id;
            updateCmd.type = self.f.type.value;
            updateCmd.name = self.f.name.value;
            updateCmd.isDefault = self.f.isDefault.value;
            updateCmd.isActive = self.f.isActive.value;

            self.service.updateTemplateToDoStatus(updateCmd)
                .pipe(finalize(() => {
                    self.blockedDocument = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('TemplateToDoStatus.TemplateToDoStatus.SuccessfulUpdate'), self.l('Success'));
                    self.return(data);
                });
        } else {
            const createCmd = new TemplateToDoStatusCreateCommand();
            createCmd.template = self.template;
            createCmd.type = self.f.type.value;
            createCmd.name = self.f.name.value;
            createCmd.isDefault = self.f.isDefault.value;
            createCmd.isActive = self.f.isActive.value;

            self.service.createTemplateToDoStatus(createCmd)
                .pipe(finalize(() => {
                    self.blockedDocument = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('TemplateToDoStatus.TemplateToDoStatus.SuccessfulCreate'), self.l('Success'));
                    self.return(data);
                });
        }
    }

    showChangeHistory(): void {
        const self = this;

        self.changeLogService.open('TemplateToDoStatus', self.id);
    }

    return(templateToStatus?: number | undefined): void {
        const self = this;

        self.modalRef.close(templateToStatus);
    }
}
