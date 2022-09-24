import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AppComponentBase } from 'src/app/app-component-base';
import { QuestionnaireSectionResponse, QuestionnaireServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { FormService } from 'src/shared/services/form.service';

@Component({
    templateUrl: './editquestionnairesections.component.html'
})
export class EditQuestionnaireSectionsComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    blockedDocument = false;

    model: QuestionnaireSectionResponse = new QuestionnaireSectionResponse();
    fieldLabels: any = {};

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private service: QuestionnaireServiceProxy,
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

        self.model = self.modalConfig.data.section ? self.modalConfig.data.section : new QuestionnaireSectionResponse();

        this.prepareForm();

        if (self.modalConfig.data.section) {
            self.f.name.setValue(self.model.name);
            self.f.order.setValue(self.model.order);
            self.f.iconAF.setValue(self.model.iconAF);
        } else {
            const orders = self.modalConfig.data.sections.map(p => p.order);

            self.f.order.setValue(orders.length > 0 ? (Math.max(...orders) + 1) : 1);
        }
    }

    prepareForm() {
        const self = this;

        self.fieldLabels = {
            name: self.l('QuestionnaireSections.QuestionnaireSection.Name'),
            order: self.l('QuestionnaireSections.QuestionnaireSection.Order'),
            iconAF: self.l('QuestionnaireSections.QuestionnaireSection.IconAF')
        };

        self.form = self.formBuilder.group({
            name: [null, [Validators.required, Validators.pattern('^.{3,50}$')]],
            order: [null, [Validators.required, Validators.min(1), Validators.max(255)]],
            iconAF: [null]
        });
    }

    save(): void {
        const self = this;
        // stop here if form is invalid
        if (self.form.invalid) {
            this.formService.showErrors(self.form, self.fieldLabels);
            return;
        }

        const errors = [];
        const sections = self.model.name ? self.modalConfig.data.sections
            .filter(p => p.name.toLowerCase() !== self.model.name.toLowerCase())
            : self.modalConfig.data.sections;

        if (sections.some(p => p.name.toLowerCase() === self.f.name.value.toLowerCase())) {
            errors.push(self.l('QuestionnaireSections.QuestionnaireSection.DuplicatedName'));
        }

        if (sections.some(p => p.order === self.f.order.value)) {
            errors.push(self.l('QuestionnaireSections.QuestionnaireSection.DuplicatedOrder'));
        }

        if (errors.length > 0) {
            self.formService.showErrorsFromMessages(errors);
            return;
        }

        self.model.name = self.f.name.value;
        self.model.order = self.f.order.value;
        self.model.iconAF = self.f.iconAF.value;

        self.return(self.model);
    }

    return(section?: QuestionnaireSectionResponse | undefined): void {
        const self = this;

        self.modalRef.close(section);
    }
}
