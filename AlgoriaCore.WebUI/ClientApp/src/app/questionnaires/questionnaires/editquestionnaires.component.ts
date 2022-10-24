import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { finalize } from 'rxjs/operators';
import { AppComponentBase, PagedTableSummary } from 'src/app/app-component-base';
import { AppCustomCodeComponent } from '../../../shared/components/app.customcode.component';
import {
    ComboboxItemDto,
    QuestionnaireCreateCommand, QuestionnaireFieldResponse, QuestionnaireResponse,
    QuestionnaireSectionResponse,
    QuestionnaireServiceProxy,
    QuestionnaireUpdateCommand
} from '../../../shared/service-proxies/service-proxies';
import { DateTimeService } from '../../../shared/services/datetime.service';
import { FormService } from '../../../shared/services/form.service';
import { AppComponent } from '../../app.component';
import { EditQuestionnaireFieldsComponent } from './fields/editquestionnairefields.component';
import { EditQuestionnaireSectionsComponent } from './sections/editquestionnairesections.component';

@Component({
    templateUrl: './editquestionnaires.component.html'
})
export class EditQuestionnairesComponent extends AppComponentBase implements OnInit {

    @ViewChild('sectionMenu', { static: false }) btnSectionMenu: Menu;
    @ViewChild('fieldMenu', { static: false }) btnFieldMenu: Menu;

    form: FormGroup;

    id?: string = null;
    model: QuestionnaireResponse = new QuestionnaireResponse();
    fieldLabels: any = {};

    fieldTypeCombo: ComboboxItemDto[] = [];
    fieldControlCombo: ComboboxItemDto[] = [];

    // FIELDS SECTION
    questionnaireSections: QuestionnaireSectionResponse[] = [];
    questionnaireFields: QuestionnaireFieldResponse[] = [];
    questionnaireFieldsData: QuestionnaireFieldResponse[] = [];
    questionnaireFieldsDataGrouped: any;
    questionnaireFieldsPagedTableSummary: PagedTableSummary = new PagedTableSummary();
    questionnaireFieldsCols: any[];
    sectionItems: MenuItem[];
    fieldItems: MenuItem[];
    customCode: string;

    expandedRows = {};

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private service: QuestionnaireServiceProxy,
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

        self.setCombos();
        self.prepareForm();

        self.questionnaireFieldsCols = [
            { field: 'name', header: this.l('QuestionnaireFields.QuestionnaireField.Name') },
            { field: 'fieldName', header: this.l('QuestionnaireFields.QuestionnaireField.FieldName') },
            { field: 'fieldTypeDesc', header: this.l('QuestionnaireFields.QuestionnaireField.Type') },
            { field: 'fieldControlDesc', header: this.l('QuestionnaireFields.QuestionnaireField.Control') },
            {
                field: 'inputMask',
                header: this.l('QuestionnaireFields.QuestionnaireField.InputMask')
                    + ' / ' + this.l('QuestionnaireFields.QuestionnaireField.KeyFilter')
            },
            {
                field: 'isRequiredDesc',
                header: this.l('QuestionnaireFields.QuestionnaireField.IsRequired')
            }
        ];

        if (self.id) {
            self.getForEdit(self.id);
        }
    }

    setCombos(): void {
        const self = this;

        self.fieldTypeCombo.push(new ComboboxItemDto({
            value: '1', label: self.l('QuestionnaireFields.QuestionnaireField.TypeBoolean')
        }));
        self.fieldTypeCombo.push(new ComboboxItemDto({
            value: '10', label: self.l('QuestionnaireFields.QuestionnaireField.TypeText')
        }));
        self.fieldTypeCombo.push(new ComboboxItemDto({
            value: '20', label: self.l('QuestionnaireFields.QuestionnaireField.TypeMultivalue')
        }));
        self.fieldTypeCombo.push(new ComboboxItemDto({
            value: '30', label: self.l('QuestionnaireFields.QuestionnaireField.TypeDate')
        }));
        self.fieldTypeCombo.push(new ComboboxItemDto({
            value: '31', label: self.l('QuestionnaireFields.QuestionnaireField.TypeDateTime')
        }));
        self.fieldTypeCombo.push(new ComboboxItemDto({
            value: '32', label: self.l('QuestionnaireFields.QuestionnaireField.TypeTime')
        }));
        self.fieldTypeCombo.push(new ComboboxItemDto({
            value: '40', label: self.l('QuestionnaireFields.QuestionnaireField.TypeInteger')
        }));
        self.fieldTypeCombo.push(new ComboboxItemDto({
            value: '41', label: self.l('QuestionnaireFields.QuestionnaireField.TypeDecimal')
        }));
        self.fieldTypeCombo.push(new ComboboxItemDto({
            value: '43', label: self.l('QuestionnaireFields.QuestionnaireField.TypeCurrency')
        }));
        self.fieldTypeCombo.push(new ComboboxItemDto({
            value: '50', label: self.l('QuestionnaireFields.QuestionnaireField.TypeGoogleAddress')
        }));
        self.fieldTypeCombo.push(new ComboboxItemDto({
            value: '60', label: self.l('QuestionnaireFields.QuestionnaireField.TypeCatalogCustom')
        }));
        self.fieldTypeCombo.push(new ComboboxItemDto({
            value: '70', label: self.l('QuestionnaireFields.QuestionnaireField.TypeUser')
        }));

        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '10', label: self.l('QuestionnaireFields.QuestionnaireField.ControlInputText')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '11', label: self.l('QuestionnaireFields.QuestionnaireField.ControlDropDown')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '12', label: self.l('QuestionnaireFields.QuestionnaireField.ControlListbox')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '13', label: self.l('QuestionnaireFields.QuestionnaireField.ControlRadioButton')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '14', label: self.l('QuestionnaireFields.QuestionnaireField.ControlInputSwitch')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '15', label: self.l('QuestionnaireFields.QuestionnaireField.ControlInputMask')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '16', label: self.l('QuestionnaireFields.QuestionnaireField.ControlInputTextArea')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '21', label: self.l('QuestionnaireFields.QuestionnaireField.ControlListboxMultivalue')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '22', label: self.l('QuestionnaireFields.QuestionnaireField.ControlCheckbox')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '23', label: self.l('QuestionnaireFields.QuestionnaireField.ControlMultiselect')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '30', label: self.l('QuestionnaireFields.QuestionnaireField.ControlCalendarBasic')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '31', label: self.l('QuestionnaireFields.QuestionnaireField.ControlCalendarTime')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '32', label: self.l('QuestionnaireFields.QuestionnaireField.ControlCalendarTimeOnly')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '40', label: self.l('QuestionnaireFields.QuestionnaireField.ControlSpinner')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '41', label: self.l('QuestionnaireFields.QuestionnaireField.ControlSpinnerFormatInput')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '45', label: self.l('QuestionnaireFields.QuestionnaireField.ControlTextNumber')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '50', label: self.l('QuestionnaireFields.QuestionnaireField.ControlGoogleAddress')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '60', label: self.l('QuestionnaireFields.QuestionnaireField.ControlAutocomplete')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '61', label: self.l('QuestionnaireFields.QuestionnaireField.ControlAutocompleteDynamic')
        }));
    }

    prepareForm() {
        const self = this;

        self.fieldLabels = {
            name: self.l('Questionnaires.Questionnaire.Name')
        };

        self.form = self.formBuilder.group({
            name: ['', [Validators.required, Validators.pattern('^.{3,50}$')]],
            isActive: [true]
        });
    }

    getForEdit(id: string): void {
        const self = this;

        self.app.blocked = true;

        self.service.getQuestionnaire(id)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.model = data;
                self.customCode = data.customCode;

                setTimeout(() => {
                    self.f.name.setValue(data.name);
                    self.f.isActive.setValue(data.isActive);

                    self.questionnaireSections = data.sections;

                    self.mergeSectionsAndFields();
                }, 0);
            });
    }

    mergeSectionsAndFields(): void {
        const self = this;
        self.questionnaireFieldsData = [];
        let sectionFields: QuestionnaireFieldResponse[] = [];
        let sectionField: QuestionnaireFieldResponse;

        self.questionnaireSections.sort(function (a, b) {
            return a.order - b.order;
        });

        for (const section of self.questionnaireSections) {
            sectionFields = section.fields;

            if (sectionFields && sectionFields.length > 0) {
                sectionFields.forEach((f) => {
                    f['questionnaireSection'] = section.order;
                    f['questionnaireSectionDesc'] = section.name;
                    f['questionnaireSectionIconAF'] = section.iconAF;
                    f['questionnaireSectionOrder'] = section.order;

                    self.assignFieldDescriptions(f);
                });
                sectionFields = sectionFields.sort(function (a, b) {
                    return a.order - b.order;
                });
                self.questionnaireFieldsData = self.questionnaireFieldsData.concat(sectionFields);
            } else {
                sectionField = new QuestionnaireFieldResponse();

                sectionField['questionnaireSection'] = section.order;
                sectionField['questionnaireSectionDesc'] = section.name;
                sectionField['questionnaireSectionIconAF'] = section.iconAF;
                sectionField['questionnaireSectionOrder'] = section.order;

                self.questionnaireFieldsData.push(sectionField);
                self.expandedRows[section.order] = false;
            }
        }

        self.updateRowGroupMetaData();
    }

    assignFieldDescriptions(field: QuestionnaireFieldResponse): void {
        const self = this;

        field.fieldTypeDesc = self.fieldTypeCombo.find(p => p.value === field.fieldType.toString()).label;
        field.fieldControlDesc = self.fieldControlCombo.find(p => p.value === field.fieldControl.toString()).label;
        field.isRequiredDesc = field.isRequired ? self.l('Yes') : self.l('No');
    }

    updateRowGroupMetaData() {
        this.questionnaireFieldsDataGrouped = {};

        if (this.questionnaireFieldsData) {
            for (let i = 0; i < this.questionnaireFieldsData.length; i++) {
                const rowData = this.questionnaireFieldsData[i];
                const questionnaireSection = rowData['questionnaireSection'];

                if (i === 0) {
                    this.questionnaireFieldsDataGrouped[questionnaireSection] = { index: 0, size: 1 };
                } else {
                    const previousRowData = this.questionnaireFieldsData[i - 1];
                    const previousRowGroup = previousRowData['questionnaireSection'];

                    if (questionnaireSection === previousRowGroup) {
                        this.questionnaireFieldsDataGrouped[questionnaireSection].size++;
                    } else {
                        this.questionnaireFieldsDataGrouped[questionnaireSection] = { index: i, size: 1 };
                    }
                }
            }
        }
    }

    sectionCreateAndShowMenu(event: any, rowData: any): void {
        const self = this;

        self.sectionItems = self.sectionCreateMenuItems(rowData);

        self.btnSectionMenu.toggle(event);
    }

    sectionCreateMenuItems(rowData: any): MenuItem[] {
        const self = this;

        const ll = [
            {
                label: this.l('QuestionnaireFields.QuestionnaireField.Add'),
                icon: 'fa fa-fw fa-plus',
                queryParams: rowData,
                command: (event) => {
                    self.fieldCreate(event.item.queryParams);
                }
            },
            {
                label: this.l('Edit'),
                icon: 'fa fa-fw fa-edit',
                queryParams: rowData,
                command: (event) => {
                    self.sectionEdit(event.item.queryParams.questionnaireSection);
                }
            },
            {
                label: this.l('Delete'),
                icon: 'pi pi-fw pi-times',
                queryParams: rowData,
                command: (event) => {
                    self.sectionDelete(event.item.queryParams.questionnaireSection);
                }
            }
        ];

        return self.getGrantedMenuItems(ll);
    }

    sectionCreate(): void {
        const self = this;

        const ref = self.dialogService.open(EditQuestionnaireSectionsComponent, {
            width: '50%',
            header: self.l('QuestionnaireSections.QuestionnaireSection'),
            showHeader: true,
            closeOnEscape: false,
            closable: false,
            dismissableMask: false,
            data: {
                sections: self.questionnaireSections
            }
        });

        ref.onClose.subscribe((obj) => {
            if (obj) {
                obj.fields = [];
                self.questionnaireSections.push(obj);
                self.mergeSectionsAndFields();
            }
        });
    }

    sectionEdit(id: number): void {
        const self = this;

        const ref = self.dialogService.open(EditQuestionnaireSectionsComponent, {
            width: '50%',
            header: self.l('QuestionnaireSections.QuestionnaireSection'),
            showHeader: true,
            closeOnEscape: false,
            closable: false,
            dismissableMask: false,
            data: {
                sections: self.questionnaireSections,
                section: self.questionnaireSections.find(p => p.order === id)
            }
        });

        ref.onClose.subscribe((obj) => {
            if (obj) {
                self.questionnaireSections[self.questionnaireSections.findIndex(p => p.order === id)] = obj;
                self.mergeSectionsAndFields();
            }
        });
    }

    sectionDelete(id: number): void {
        const self = this;

        self.confirmationService.confirm({
            header: self.l('Confirmation'),
            icon: 'pi pi-exclamation-triangle',
            message: self.l('ConfirmationSoftDeleteRecordMessage'),
            acceptLabel: self.l('Yes'),
            rejectLabel: self.l('No'),
            accept: () => {
                self.questionnaireSections[self.questionnaireSections.findIndex(p => p.order === id)] = null;
                self.questionnaireSections = self.questionnaireSections.filter(p => p);
                self.mergeSectionsAndFields();
            }
        });
    }

    fieldCreateAndShowMenu(event: any, rowData: any): void {
        const self = this;

        self.fieldItems = self.fieldCreateMenuItems(rowData);

        self.btnFieldMenu.toggle(event);
    }

    fieldCreateMenuItems(rowData: any): MenuItem[] {
        const self = this;

        const ll = [
            {
                label: this.l('Edit'),
                icon: 'fa fa-fw fa-edit',
                queryParams: rowData,
                command: (event) => {
                    self.fieldEdit(event.item.queryParams.name);
                }
            },
            {
                label: this.l('Delete'),
                icon: 'pi pi-fw pi-times',
                queryParams: rowData,
                command: (event) => {
                    self.fieldDelete(event.item.queryParams.name);
                }
            }
        ];

        return self.getGrantedMenuItems(ll);
    }

    fieldCreate(record: QuestionnaireFieldResponse): void {
        const self = this;
        const section = self.questionnaireSections.find(p => p.order === record['questionnaireSection']);

        const ref = self.dialogService.open(EditQuestionnaireFieldsComponent, {
            styleClass: 'd-sm d-md d-lg-90 d-xl-70',
            header: self.l('QuestionnaireFields.QuestionnaireField'),
            showHeader: true,
            closeOnEscape: false,
            closable: false,
            dismissableMask: false,
            data: {
                questionnaire: self.id,
                section: section,
                fields: self.questionnaireFieldsData
            }
        });

        ref.onClose.subscribe((obj) => {
            if (obj && obj.length > 0) {
                section.fields = section.fields.concat(obj);
                self.mergeSectionsAndFields();
                self.expandedRows[section.order] = true;
            }
        });
    }

    fieldEdit(id: string): void {
        const self = this;
        const field = self.questionnaireFieldsData.find(p => p.name === id);
        const section = self.questionnaireSections.find(p => p.order === field['questionnaireSection']);

        const ref = self.dialogService.open(EditQuestionnaireFieldsComponent, {
            styleClass: 'd-sm d-md d-lg-90 d-xl-70',
            header: self.l('QuestionnaireFields.QuestionnaireField'),
            showHeader: true,
            closeOnEscape: false,
            closable: false,
            dismissableMask: false,
            data: {
                questionnaire: self.id,
                section: section,
                fields: self.questionnaireFieldsData,
                field: field
            }
        });

        ref.onClose.subscribe((obj) => {
            if (obj && obj.length > 0) {
                section.fields[section.fields.findIndex(p => p.name === id)] = obj[0];
                self.mergeSectionsAndFields();
            }
        });
    }

    fieldDelete(id: string): void {
        const self = this;
        const field = self.questionnaireFieldsData.find(p => p.name === id);
        const section = self.questionnaireSections.find(p => p.order === field['questionnaireSection']);

        self.confirmationService.confirm({
            header: self.l('Confirmation'),
            icon: 'pi pi-exclamation-triangle',
            message: self.l('ConfirmationSoftDeleteRecordMessage'),
            acceptLabel: self.l('Yes'),
            rejectLabel: self.l('No'),
            accept: () => {
                section.fields[section.fields.findIndex(p => p.name === id)] = null;
                section.fields = section.fields.filter(p => p);
                self.mergeSectionsAndFields();
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

        if (self.id) {
            const updateCmd = new QuestionnaireUpdateCommand();

            updateCmd.id = self.model.id;
            updateCmd.name = self.f.name.value;
            updateCmd.customCode = self.customCode;
            updateCmd.isActive = self.f.isActive.value;

            updateCmd.sections = self.questionnaireSections;

            self.app.blocked = true;

            self.service.updateQuestionnaire(updateCmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('Questionnaires.Questionnaire.SuccessfulUpdate'), self.l('Success'));
                    self.return();
                });
        } else {
            const createCmd = new QuestionnaireCreateCommand();

            createCmd.name = self.f.name.value;
            createCmd.customCode = self.customCode;
            createCmd.isActive = self.f.isActive.value;

            createCmd.sections = self.questionnaireSections;

            self.app.blocked = true;

            self.service.createQuestionnaire(createCmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('Questionnaires.Questionnaire.SuccessfulCreate'), self.l('Success'));
                    self.activaModoNuevo();
                });
        }
    }

    customCodeInput(): void {
        const self = this;

        const ref = self.dialogService.open(AppCustomCodeComponent, {
            styleClass: 'd-xl-40 d-lg-50 d-md d-sm',
            header: self.l('CustomCode'),
            showHeader: true,
            closeOnEscape: false,
            closable: false,
            dismissableMask: false,
            footer: 'DUMMY',
            data: self.customCode
        });

        ref.onClose.subscribe((response: any) => {
            console.log(response);
            if (response.isSaved) {
                self.customCode = response.customCode;
            }
        });
    }

    activaModoNuevo(): void {
        const self = this;

        self.prepareForm();
        self.questionnaireFieldsData = [];

        // focus
    }

    return(): void {
        this.router.navigate(['/app/questionnaires/questionnaires']);
    }
}
