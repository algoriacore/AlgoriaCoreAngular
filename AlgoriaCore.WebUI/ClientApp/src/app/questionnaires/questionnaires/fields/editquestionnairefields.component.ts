import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs';
import { AppComponentBase } from 'src/app/app-component-base';
import {
    CatalogCustomFieldGetComboQuery,
    CatalogCustomGetComboQuery,
    CatalogCustomServiceProxy,
    ComboboxItemDto,
    QuestionnaireCatalogCustomResponse,
    QuestionnaireCustomPropertiesResponse,
    QuestionnaireFieldControl, QuestionnaireFieldOptionResponse,
    QuestionnaireFieldResponse,
    QuestionnaireFieldType, QuestionnaireServiceProxy
} from 'src/shared/service-proxies/service-proxies';
import { ControlError, FormService } from 'src/shared/services/form.service';

@Component({
    templateUrl: './editquestionnairefields.component.html'
})
export class EditQuestionnaireFieldsComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    blockedDocument = false;
    saved: QuestionnaireFieldResponse[] = [];

    model: QuestionnaireFieldResponse = new QuestionnaireFieldResponse();
    options: QuestionnaireFieldOptionResponse[] = [];
    questionnaire: string;
    questionnaireSectionDesc: string;
    fieldLabels: any = {};
    optionFieldLabels: any = {};

    fieldTypeCombo: ComboboxItemDto[] = [];
    fieldControlCombo: ComboboxItemDto[] = [];
    fieldControlComboFiltered: ComboboxItemDto[] = [];

    QuestionnaireFieldType = QuestionnaireFieldType;
    QuestionnaireFieldControl = QuestionnaireFieldControl;

    clonedOptions: { [s: number]: QuestionnaireFieldOptionResponse } = {};

    catalogCustomCombo: ComboboxItemDto[] = [];
    catalogCustomFieldCombo: ComboboxItemDto[] = [];

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private service: QuestionnaireServiceProxy,
        private serviceCatalogCustom: CatalogCustomServiceProxy,
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

        self.model = new QuestionnaireFieldResponse();
        self.model.options = [];
        self.options = [];

        if (self.modalConfig.data.field) {
            self.model = self.modalConfig.data.field;
            self.options = self.modalConfig.data.field.options;
        }

        self.questionnaire = self.modalConfig.data.questionnaire;
        self.questionnaireSectionDesc = self.modalConfig.data.section.name;

        self.fillCombos();
        self.prepareLabels();
        self.prepareForm();

        if (self.modalConfig.data.field) {
            self.setFieldData(self.modalConfig.data.field);
        } else {
            self.getCatalogCustomCombo();
            self.getFieldNextOrder();
        }
    }

    setFieldData(field: any): void {
        const self = this;

        if (self.model.catalogCustom) {
            self.getCatalogCustomCombo(new ComboboxItemDto({
                value: self.model.catalogCustom.catalogCustom,
                label: self.model.catalogCustom.catalogCustomDesc
            }), self.model.catalogCustom.fieldName);
        } else {
            self.getCatalogCustomCombo();
        }

        self.f.name.setValue(self.model.name);
        self.f.fieldType.setValue(self.model.fieldType.toString());

        self.onChangeFieldType();

        self.f.fieldSize.setValue(self.model.fieldSize);
        self.f.fieldControl.setValue(self.model.fieldControl.toString());

        self.onChangeHasKeyFilter();

        self.f.inputMask.setValue(self.model.inputMask);
        self.f.hasKeyFilter.setValue(self.model.hasKeyFilter);
        self.f.keyFilter.setValue(self.model.hasKeyFilter ? self.model.keyFilter : null);
        self.f.isRequired.setValue(self.model.isRequired);
        self.f.order.setValue(self.model.order);

        if (self.model.customProperties && (self.model.fieldType === QuestionnaireFieldType.Integer
            || self.model.fieldType === QuestionnaireFieldType.Decimal
            || self.model.fieldType === QuestionnaireFieldType.Currency
            || self.model.fieldType === QuestionnaireFieldType.Multivalue)) {

            if (self.model.fieldType === QuestionnaireFieldType.Currency) {
                self.f.currency.setValue(self.model.customProperties.currency);
                self.f.locale.setValue(self.model.customProperties.locale);
            }

            self.f.minValue.setValue(self.model.customProperties.minValue);
            self.f.maxValue.setValue(self.model.customProperties.maxValue);

            if (self.model.fieldType !== QuestionnaireFieldType.Multivalue) {
                self.f.useGrouping.setValue(self.model.customProperties.useGrouping);
            }
        }
    }

    fillCombos(): void {
        const self = this;

        self.fieldTypeCombo = [];
        self.fieldControlCombo = [];

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

    prepareLabels() {
        const self = this;

        self.fieldLabels = {
            questionnaireSection: self.l('QuestionnaireFields.QuestionnaireField.QuestionnaireSection'),
            name: self.l('QuestionnaireFields.QuestionnaireField.Name'),
            fieldName: self.l('QuestionnaireFields.QuestionnaireField.FieldName'),
            fieldType: self.l('QuestionnaireFields.QuestionnaireField.Type'),
            fieldSize: self.l('QuestionnaireFields.QuestionnaireField.Size'),
            decimalPartSize: self.l('QuestionnaireFields.QuestionnaireField.DecimalPartSize'),
            fieldControl: self.l('QuestionnaireFields.QuestionnaireField.Control'),
            inputMask: self.l('QuestionnaireFields.QuestionnaireField.InputMask'),
            hasKeyFilter: self.l('QuestionnaireFields.QuestionnaireField.HasKeyFilter'),
            keyFilter: self.l('QuestionnaireFields.QuestionnaireField.KeyFilter'),
            catalogCustomFieldRelationCatalogCustom: self.l(
                'QuestionnaireFields.QuestionnaireField.CatalogCustomFieldRelationCatalogCustom'),
            catalogCustomFieldRelationCatalogCustomField: self.l(
                'QuestionnaireFields.QuestionnaireField.CatalogCustomFieldRelationCatalogCustomField'),
            isRequired: self.l('QuestionnaireFields.QuestionnaireField.IsRequired'),
            order: self.l('QuestionnaireFields.QuestionnaireField.Order'),
            currency: self.l('QuestionnaireFields.QuestionnaireField.Format.Currency'),
            locale: self.l('QuestionnaireFields.QuestionnaireField.Format.Locale'),
            minValue: self.l('QuestionnaireFields.QuestionnaireField.Format.MinValue'),
            maxValue: self.l('QuestionnaireFields.QuestionnaireField.Format.MaxValue'),
            useGrouping: self.l('QuestionnaireFields.QuestionnaireField.Format.UseGrouping'),
            options: self.l('QuestionnaireFields.QuestionnaireField.Options')
        };

        self.optionFieldLabels = {
            value: self.l('QuestionnaireFields.QuestionnaireField.Options.Option.Value'),
            description: self.l('QuestionnaireFields.QuestionnaireField.Options.Option.Description')
        };
    }

    prepareForm() {
        const self = this;

        self.form = self.formBuilder.group({
            name: [null, [Validators.required, Validators.pattern('^.{3,50}$')]],
            fieldType: [null, [Validators.required]],
            fieldSize: [null],
            fieldControl: [null, [Validators.required]],
            inputMask: [null],
            hasKeyFilter: [false],
            keyFilter: [null],
            catalogCustomFieldRelationCatalogCustom: [null],
            catalogCustomFieldRelationCatalogCustomField: [null],
            isRequired: [false],
            order: [null, [Validators.required, Validators.min(1), Validators.max(255), Validators.maxLength(3)]],
            currency: [null],
            locale: [null],
            minValue: [null],
            maxValue: [null],
            useGrouping: [false]
        });
    }

    clearForm() {
        const self = this;
        let control;

        Object.keys(self.f).forEach(controlName => {
            control = self.f[controlName];

            control.setValue(null);
            control.updateValueAndValidity();
        });

        self.f.hasKeyFilter.setValue(false);
        self.f.isRequired.setValue(false);
        self.f.useGrouping.setValue(false);

        self.form.updateValueAndValidity();
    }

    activateNewMode(): void {
        const self = this;

        self.model = new QuestionnaireFieldResponse();
        self.clearForm();
        self.getFieldNextOrder();
        self.options = [];

        // focus
    }

    getFieldNextOrder() {
        const self = this;
        const orders = self.modalConfig.data.fields.filter(p => p['questionnaireSection'] === self.modalConfig.data.section.order
            && p.order)
            .concat(self.saved)
            .map(p => p.order);

        self.f.order.setValue(orders.length > 0 ? (Math.max(...orders) + 1) : 1);
    }

    save(): void {
        const self = this;
        const errorMessages = self.validate();

        // stop here if form is invalid
        if (self.form.invalid || errorMessages.length > 0) {
            self.formService.showErrorsFromErrors(
                self.form,
                self.formService.getErrors(self.form, self.fieldLabels).concat(errorMessages)
            );
            return;
        }

        const errors = self.getFieldDuplicatedErrors();

        if (errors.length > 0) {
            self.formService.showErrorsFromMessages(errors);
            return;
        }

        self.model.name = self.f.name.value;
        self.model.fieldType = Number(self.f.fieldType.value);
        self.model.fieldSize = self.getFieldSize();
        self.model.fieldControl = self.f.fieldControl.value;
        self.model.inputMask = self.f.inputMask.value;
        self.model.hasKeyFilter = self.f.hasKeyFilter.value;
        self.model.keyFilter = self.f.hasKeyFilter.value ? self.f.keyFilter.value : null;
        self.model.isRequired = self.f.isRequired.value;
        self.model.order = self.f.order.value;

        self.model.catalogCustom = self.getFieldCatalogCustom();
        self.model.customProperties = self.getFieldCustomProperties();
        self.model.options = self.mustFieldControlHaveOptions(self.f.fieldControl.value) ? self.options : [];

        self.saved.push(self.model);

        if (self.modalConfig.data.field) {
            self.return();
        } else {
            self.activateNewMode();
        }
    }

    getFieldSize(): number {
        const self = this;

        return self.f.fieldType.value === QuestionnaireFieldType.Text.toString()
            || self.f.fieldType.value === QuestionnaireFieldType.Decimal.toString()
            || self.f.fieldType.value === QuestionnaireFieldType.Currency.toString() ? self.f.fieldSize.value : null;
    }

    getFieldCatalogCustom(): QuestionnaireCatalogCustomResponse {
        const self = this;
        let catalogCustom = null;

        if (self.f.fieldType.value === QuestionnaireFieldType.CatalogCustom.toString()) {
            return new QuestionnaireCatalogCustomResponse({
                catalogCustom: self.f.catalogCustomFieldRelationCatalogCustom.value,
                fieldName: self.f.catalogCustomFieldRelationCatalogCustomField.value
            });
        }

        return catalogCustom;
    }

    getFieldCustomProperties(): QuestionnaireCustomPropertiesResponse {
        const self = this;
        let customProperties = null;

        if (self.f.fieldType.value === QuestionnaireFieldType.Integer.toString()
            || self.f.fieldType.value === QuestionnaireFieldType.Decimal.toString()
            || self.f.fieldType.value === QuestionnaireFieldType.Currency.toString()
            || self.f.fieldType.value === QuestionnaireFieldType.Multivalue.toString()) {
            customProperties = new QuestionnaireCustomPropertiesResponse();

            if (self.f.fieldType.value === QuestionnaireFieldType.Currency.toString()) {
                customProperties.currency = self.f.currency.value;
                customProperties.locale = self.f.locale.value;
            }

            customProperties.minValue = self.f.minValue.value;
            customProperties.maxValue = self.f.maxValue.value;

            if (self.f.fieldType.value !== QuestionnaireFieldType.Multivalue.toString()) {
                customProperties.useGrouping = self.f.useGrouping.value;
            }
        }

        return customProperties;
    }

    getFieldDuplicatedErrors(): any[] {
        const self = this;
        const errors = [];

        let fields = self.model.name ? self.modalConfig.data.fields
            .filter(p => p.name && p.name.toLowerCase() !== self.model.name.toLowerCase())
            : self.modalConfig.data.fields.filter(p => p.name);

        fields = fields.concat(self.saved);

        if (fields.some(p => p.name.toLowerCase() === self.f.name.value.toLowerCase())) {
            errors.push(self.l('TemplateFields.TemplateField.DuplicatedFieldName'));
        }

        if (fields.some(p => p['questionnaireSection'] === self.modalConfig.data.section.order && p.order === self.f.order.value)) {
            errors.push(self.l('TemplateFields.TemplateField.DuplicatedOrder'));
        }

        return errors;
    }

    onChangeFieldType(): void {
        const self = this;

        self.fieldControlComboFiltered = [];
        self.f.fieldControl.setValue(null);

        self.f.fieldSize.clearValidators();
        self.f.catalogCustomFieldRelationCatalogCustom.clearValidators();
        self.f.catalogCustomFieldRelationCatalogCustomField.clearValidators();

        if (self.f.fieldType.value) {
            self.fieldLabels['minValue'] = self.l('QuestionnaireFields.QuestionnaireField.Format.MinValue');
            self.fieldLabels['maxValue'] = self.l('QuestionnaireFields.QuestionnaireField.Format.MaxValue');

            switch (Number.parseInt(self.f.fieldType.value, 10)) {
                case QuestionnaireFieldType.Boolean:
                    self.fieldControlComboFiltered = self.fieldControlCombo.filter(p => p.value === '14');
                    break;
                case QuestionnaireFieldType.Text:
                    self.fieldControlComboFiltered = self.fieldControlCombo
                        .filter(p => '10,11,12,13,15,16'.split(',').some(x => x === p.value));
                    self.f.fieldSize.setValidators([Validators.required, Validators.min(1), Validators.max(32000)]);
                    break;
                case QuestionnaireFieldType.Multivalue:
                    self.fieldControlComboFiltered = self.fieldControlCombo
                        .filter(p => Number.parseInt(p.value, 10) >= 21 && Number.parseInt(p.value, 10) <= 23);
                    self.fieldLabels['minValue'] = self.l('QuestionnaireFields.QuestionnaireField.Options.MinSelecting');
                    self.fieldLabels['maxValue'] = self.l('QuestionnaireFields.QuestionnaireField.Options.MaxSelecting');
                    break;
                case QuestionnaireFieldType.Date:
                    self.fieldControlComboFiltered = self.fieldControlCombo.filter(p => p.value === '30');
                    break;
                case QuestionnaireFieldType.Time:
                    self.fieldControlComboFiltered = self.fieldControlCombo.filter(p => p.value === '32');
                    break;
                case QuestionnaireFieldType.DateTime:
                    self.fieldControlComboFiltered = self.fieldControlCombo.filter(p => p.value === '31');
                    break;
                case QuestionnaireFieldType.Integer:
                    self.fieldControlComboFiltered = self.fieldControlCombo.filter(p => p.value === '40' || p.value === '45');
                    break;
                case QuestionnaireFieldType.Decimal:
                    self.fieldControlComboFiltered = self.fieldControlCombo.filter(p => p.value === '41' || p.value === '45');
                    self.f.fieldSize.setValidators([Validators.required, Validators.min(1), Validators.max(32000)]);
                    break;
                case QuestionnaireFieldType.Currency:
                    self.fieldControlComboFiltered = self.fieldControlCombo.filter(p => p.value === '40' || p.value === '45');
                    break;
                case QuestionnaireFieldType.GoogleAddress:
                    self.fieldControlComboFiltered = self.fieldControlCombo.filter(p => p.value === '50');
                    break;
                case QuestionnaireFieldType.CatalogCustom:
                    self.fieldControlComboFiltered = self.fieldControlCombo.filter(p => p.value === '60' || p.value === '61');
                    self.f.catalogCustomFieldRelationCatalogCustom.setValidators([Validators.required]);
                    self.f.catalogCustomFieldRelationCatalogCustomField.setValidators([Validators.required]);
                    break;
                case QuestionnaireFieldType.User:
                    self.fieldControlComboFiltered = self.fieldControlCombo.filter(p => p.value === '61');
                    break;
            }
        }

        self.f.fieldSize.updateValueAndValidity();
        self.f.catalogCustomFieldRelationCatalogCustom.updateValueAndValidity();
        self.f.catalogCustomFieldRelationCatalogCustomField.updateValueAndValidity();

        self.onChangeFieldControl();
    }

    onChangeFieldControl(): void {
        const self = this;

        if ((self.f.fieldControl.value === QuestionnaireFieldControl.InputText.toString()
            || self.f.fieldControl.value === QuestionnaireFieldControl.InputMask.toString())
            && self.f.hasKeyFilter.value) {
            self.f.keyFilter.setValidators([Validators.required]);
        } else {
            self.f.keyFilter.clearValidators();
        }

        if (self.f.fieldControl.value === QuestionnaireFieldControl.InputMask.toString()) {
            self.f.inputMask.setValidators([Validators.required]);
        } else {
            self.f.inputMask.clearValidators();
        }

        self.f.keyFilter.updateValueAndValidity();
        self.f.inputMask.updateValueAndValidity();
    }

    onChangeHasKeyFilter(): void {
        const self = this;

        if (self.f.hasKeyFilter.value) {
            self.f.keyFilter.setValidators([Validators.required]);
        } else {
            self.f.keyFilter.clearValidators();
        }

        self.f.keyFilter.updateValueAndValidity();
    }

    getCatalogCustomCombo(currentItem?: ComboboxItemDto, fieldName?: string): void {
        const self = this;

        self.blockedDocument = true;
        self.f.catalogCustomFieldRelationCatalogCustom.setValue(null);

        self.serviceCatalogCustom.getCatalogCustomCombo(new CatalogCustomGetComboQuery({ isActive: true }))
            .pipe(finalize(() => {
                self.blockedDocument = false;
            }))
            .subscribe(data => {
                if (currentItem && !data.some(p => p.value === currentItem.value)) {
                    data.push(currentItem);

                    data = data.sort((a, b) => {
                        if (a.label.toLowerCase() > b.label.toLowerCase()) {
                            return 1;
                        } 

                        return a.label.toLowerCase() < b.label.toLowerCase() ? - 1 : 0;
                    });
                }

                self.catalogCustomCombo = data;
                self.f.catalogCustomFieldRelationCatalogCustom.setValue(currentItem ? currentItem.value : null);
                self.onChangeCatalogCustom(fieldName);
            });
    }

    onChangeCatalogCustom(fieldName?: string): void {
        const self = this;

        self.blockedDocument = true;
        self.f.catalogCustomFieldRelationCatalogCustomField.setValue(null);

        self.serviceCatalogCustom.getCatalogCustomFieldCombo(new CatalogCustomFieldGetComboQuery({
            catalogCustom: self.f.catalogCustomFieldRelationCatalogCustom.value
        }))
            .pipe(finalize(() => {
                self.blockedDocument = false;
            }))
            .subscribe(data => {
                self.catalogCustomFieldCombo = data;
                self.f.catalogCustomFieldRelationCatalogCustomField.setValue(fieldName ? fieldName : null);
            });
    }

    optionCreate(): void {
        const self = this;
        const dto = new QuestionnaireFieldOptionResponse();

        dto['isNew'] = true;
        self.options.push(dto);

        const index = self.options.length - 1;

        self.onRowEditInit(dto, index);

        setTimeout(() => document.getElementById('description' + index).focus(), 100);
    }

    onRowEditInit(option: QuestionnaireFieldOptionResponse, index: number) {
        const self = this;

        self.clonedOptions[index] = new QuestionnaireFieldOptionResponse({
            value: option.value,
            description: option.description
        });

        option['isEditable'] = true;

        setTimeout(() => document.getElementById('description' + index).focus(), 100);
    }

    onRowEditSave(option: QuestionnaireFieldOptionResponse, index: number) {
        const self = this;
        const errorMessages = self.onRowEditValidate(option);

        // stop here if form is invalid
        if (errorMessages.length > 0) {
            self.formService.showErrorsFromMessages(errorMessages);
            return;
        }

        delete self.clonedOptions[index];
        option['isEditable'] = false;
        option['isNew'] = false;
    }

    onRowEditCancel(option: QuestionnaireFieldOptionResponse, index: number) {
        const self = this;

        if (option['isNew']) {
            self.onRowEditDelete(index);
            return;
        }

        self.options[index] = self.clonedOptions[index];
        delete self.clonedOptions[index];

        option['isEditable'] = false;
    }

    onRowEditDelete(index: number) {
        const self = this;

        self.options.splice(index, 1);
        delete self.clonedOptions[index];
    }

    onRowEditValidate(option: QuestionnaireFieldOptionResponse): string[] {
        const self = this;
        const messages: string[] = [];

        if (!option.description) {
            messages.push(self.l('RequiredField', self.optionFieldLabels['description']));
        }

        if (self.options.some((item) => item.description === option.description && !item['isEditable'])) {
            messages.push(self.l('FieldDuplicated', self.optionFieldLabels['description']));
        }

        if (!option.value) {
            messages.push(self.l('RequiredField', self.optionFieldLabels['value']));
        }

        if (self.options.some((item) => item.value === option.value && !item['isEditable'])) {
            messages.push(self.l('FieldDuplicated', self.optionFieldLabels['value']));
        }

        return messages;
    }

    mustFieldControlHaveOptions(fieldControl: number): boolean {
        if (fieldControl) {
            const fieldControlStr = fieldControl.toString();

            return fieldControlStr === QuestionnaireFieldControl.Checkbox.toString()
                || fieldControlStr === QuestionnaireFieldControl.DropDown.toString()
                || fieldControlStr === QuestionnaireFieldControl.Listbox.toString()
                || fieldControlStr === QuestionnaireFieldControl.ListboxMultivalue.toString()
                || fieldControlStr === QuestionnaireFieldControl.Multiselect.toString()
                || fieldControlStr === QuestionnaireFieldControl.RadioButton.toString();
        } else {
            return false;
        }
    }

    validate(): ControlError[] {
        const self = this;
        const messages: ControlError[] = [];

        if (self.mustFieldControlHaveOptions(self.f.fieldControl.value)) {
            if (self.options.length > 0) {
                if (self.options.some((item) => !(item.description) || item.value === null || item.value === undefined)) {
                    messages.push(
                        {
                            controlName: 'fieldControl',
                            message: self.l('QuestionnaireFields.QuestionnaireField.OptionsFullyCapturedMessage')
                        }
                    );
                }
            } else {
                messages.push({ controlName: 'fieldControl', message: self.l('RequiredField', self.fieldLabels['options']) });
            }
        }

        return messages;
    }

    return(): void {
        const self = this;

        self.modalRef.close(self.saved);
    }
}
