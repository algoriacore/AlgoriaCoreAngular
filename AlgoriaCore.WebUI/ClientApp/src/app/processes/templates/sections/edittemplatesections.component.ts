import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import {
    TemplateSectionForEditResponse,
    TemplateSectionGetForEditQuery,
    TemplatesServiceProxy,
    TemplateSectionUpdateCommand,
    TemplateSectionCreateCommand
} from 'src/shared/service-proxies/service-proxies';
import { FormService } from 'src/shared/services/form.service';
import { ChangeLogService } from 'src/app/_services/changelog.service';

@Component({
    templateUrl: './edittemplatesections.component.html'
})
export class EditTemplateSectionsComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    blockedDocument = false;

    model: TemplateSectionForEditResponse = new TemplateSectionForEditResponse();
    template: number;
    id?: number = null;
    fieldLabels: any = {};

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

        this.prepareForm();

        if (self.id) {
            self.getForEdit(self.id);
        }
    }

    prepareForm() {
        const self = this;

        self.fieldLabels = {
            name: self.l('TemplateSections.TemplateSection.Name'),
            order: self.l('TemplateSections.TemplateSection.Order'),
            iconAF: self.l('TemplateSections.TemplateSection.IconAF')
        };

        self.form = self.formBuilder.group({
            name: [null, [Validators.required, Validators.maxLength(50)]],
            order: [null, [Validators.required, Validators.min(1), Validators.max(255)]],
            iconAF: [null, [Validators.maxLength(20)]]
        });
    }

    getForEdit(id: number): void {
        const self = this;

        self.blockedDocument = true;

        self.service.getTemplateSectionForEdit(new TemplateSectionGetForEditQuery({ id: id }))
            .pipe(finalize(() => {
                self.blockedDocument = false;
            }))
            .subscribe(data => {
                self.model = data;

                if (self.id) {
                    self.template = data.template;
                    self.f.name.setValue(data.name);
                    self.f.order.setValue(data.order);
                    self.f.iconAF.setValue(data.iconAF);
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
            const updateCmd = new TemplateSectionUpdateCommand();
            updateCmd.template = self.template;
            updateCmd.id = self.model.id;
            updateCmd.name = self.f.name.value;
            updateCmd.order = self.f.order.value;
            updateCmd.iconAF = self.f.iconAF.value;

            self.service.updateTemplateSection(updateCmd)
                .pipe(finalize(() => {
                    self.blockedDocument = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('TemplateSections.TemplateSection.SuccessfulUpdate'), self.l('Success'));
                    self.return(data);
                });
        } else {
            const createCmd = new TemplateSectionCreateCommand();
            createCmd.template = self.template;
            createCmd.name = self.f.name.value;
            createCmd.order = self.f.order.value;
            createCmd.iconAF = self.f.iconAF.value;

            self.service.createTemplateSection(createCmd)
                .pipe(finalize(() => {
                    self.blockedDocument = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('TemplateSections.TemplateSection.SuccessfulCreate'), self.l('Success'));
                    self.return(data);
                });
        }
    }

    showChangeHistory(): void {
        const self = this;

        self.changeLogService.open('TemplateSection', self.id);
    }

    return(templateSection?: number | undefined): void {
        const self = this;

        self.modalRef.close(templateSection);
    }
}
