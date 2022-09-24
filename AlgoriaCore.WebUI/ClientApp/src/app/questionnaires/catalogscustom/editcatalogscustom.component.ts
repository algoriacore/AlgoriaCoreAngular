import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, TreeNode } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import {
    CatalogCustomCreateCommand, CatalogCustomGetForEditQuery, CatalogCustomResponse, CatalogCustomServiceProxy,
    CatalogCustomUpdateCommand,
    ComboboxItemDto,
    QuestionnaireResponse,
    QuestionnaireServiceProxy
} from '../../../shared/service-proxies/service-proxies';
import { DateTimeService } from '../../../shared/services/datetime.service';
import { FormService } from '../../../shared/services/form.service';
import { AppComponent } from '../../app.component';

@Component({
    templateUrl: './editcatalogscustom.component.html'
})
export class EditCatalogsCustomComponent extends AppComponentBase implements OnInit {

    @ViewChild('sectionMenu', { static: false }) btnSectionMenu: Menu;
    @ViewChild('fieldMenu', { static: false }) btnFieldMenu: Menu;

    form: FormGroup;

    id?: string = null;
    model: CatalogCustomResponse = new CatalogCustomResponse();
    fieldLabels: any = {};

    questionnaireCombo: ComboboxItemDto[] = [];
    treeNodes: TreeNode[] = [];
    selectedNodes: TreeNode[] = [];

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private service: CatalogCustomServiceProxy,
        private serviceQuestionnaire: QuestionnaireServiceProxy,
        private formService: FormService,
        private app: AppComponent,
        public dateTimeService: DateTimeService,
        private confirmationService: ConfirmationService
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
            self.id = self.activatedRoute.snapshot.params['id'] ? self.activatedRoute.snapshot.params['id'] : null;
        }

        self.prepareForm();

        self.getForEdit(self.id);
    }

    prepareForm() {
        const self = this;

        self.fieldLabels = {
            nameSingular: self.l('CatalogsCustom.CatalogCustom.NameSingular'),
            namePlural: self.l('CatalogsCustom.CatalogCustom.NamePlural'),
            description: self.l('CatalogsCustom.CatalogCustom.Description'),
            questionnaire: self.l('CatalogsCustom.CatalogCustom.Questionnaire'),
            isCollectionGenerated: self.l('CatalogsCustom.CatalogCustom.IsCollectionGenerated')
        };

        self.form = self.formBuilder.group({
            nameSingular: [null, [Validators.required, Validators.pattern('^.{3,50}$')]],
            namePlural: [null, [Validators.required, Validators.pattern('^.{3,55}$')]],
            description: [null, [Validators.required]],
            questionnaire: [null, [Validators.required]],
            isActive: [true]
        });
    }

    getForEdit(id: string): void {
        const self = this;

        self.app.blocked = true;

        self.service.getCatalogCustomForEdit(new CatalogCustomGetForEditQuery({ id: id }))
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.model = data;
                self.questionnaireCombo = data.questionnaireCombo;

                if (id) {
                    setTimeout(() => {
                        self.f.nameSingular.setValue(data.nameSingular);
                        self.f.namePlural.setValue(data.namePlural);
                        self.f.description.setValue(data.description);
                        self.f.questionnaire.setValue(data.questionnaire);
                        self.f.isActive.setValue(data.isActive);

                        self.onChangeQuestionnaire(data.fieldNames);
                    }, 0);
                }
            });
    }

    onChangeQuestionnaire(selected?: string[]): void {
        const self = this;

        self.treeNodes = [];
        self.selectedNodes = [];

        if (self.f.questionnaire.value) {
            self.app.blocked = true;

            self.serviceQuestionnaire.getQuestionnaire(self.f.questionnaire.value)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.treeNodes = self.createTreeNode(data, selected);
                });
        }
    }

    createTreeNode(root: QuestionnaireResponse, selected: string[] = []): any {
        const self = this;
        const treeNodes: TreeNode[] = [];
        let childrens: TreeNode[] = [];
        let treeNode: TreeNode;
        const hasChecked = selected && selected.length > 0;

        root.sections.filter(p => p.fields && p.fields.length > 0).forEach(s => {
            childrens = [];

            s.fields.forEach(f => {
                treeNode = {
                    label: f.name,
                    data: f.fieldName
                };

                childrens.push(treeNode);

                if (hasChecked && selected.includes(f.fieldName)) {
                    self.selectedNodes.push(treeNode);
                }
            });

            treeNodes.push({
                label: s.name,
                children: childrens
            });
        });

        return treeNodes;
    }

    getCheckedFields(): string[] {
        const self = this;
        const list: string[] = [];

        if (self.selectedNodes !== null && self.selectedNodes.length > 0) {
            for (let i = 0; i < self.selectedNodes.length; i++) {
                if (self.selectedNodes[i].data) {
                    list.push(self.selectedNodes[i].data);
                }
            }
        }

        return list;
    }

    save(): void {
        const self = this;

        // stop here if form is invalid
        if (self.form.invalid) {
            this.formService.showErrors(self.form, self.fieldLabels);
            return;
        }

        if (self.id) {
            const updateCmd = new CatalogCustomUpdateCommand();

            updateCmd.id = self.model.id;
            updateCmd.nameSingular = self.f.nameSingular.value;
            updateCmd.namePlural = self.f.namePlural.value;
            updateCmd.description = self.f.description.value;
            updateCmd.questionnaire = self.f.questionnaire.value;
            updateCmd.isActive = self.f.isActive.value;
            updateCmd.fieldNames = self.getCheckedFields();

            self.app.blocked = true;

            self.service.updateCatalogCustom(updateCmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('CatalogsCustom.CatalogCustom.SuccessfulUpdate'), self.l('Success'));
                    self.return();
                });
        } else {
            const createCmd = new CatalogCustomCreateCommand();

            createCmd.nameSingular = self.f.nameSingular.value;
            createCmd.namePlural = self.f.namePlural.value;
            createCmd.description = self.f.description.value;
            createCmd.questionnaire = self.f.questionnaire.value;
            createCmd.isActive = self.f.isActive.value;
            createCmd.fieldNames = self.getCheckedFields();

            self.app.blocked = true;

            self.service.createCatalogCustom(createCmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('CatalogsCustom.CatalogCustom.SuccessfulCreate'), self.l('Success'));
                    self.activaModoNuevo();
                });
        }
    }

    activaModoNuevo(): void {
        const self = this;

        self.prepareForm();
        self.onChangeQuestionnaire();

        // focus
    }

    return(): void {
        this.router.navigate(['/app/questionnaires/catalogscustom']);
    }
}
