import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import {
    TemplateFieldForEditResponse,
    TemplateFieldGetForEditQuery,
    TemplatesServiceProxy,
    TemplateFieldUpdateCommand,
    TemplateFieldCreateCommand,
    ComboboxItemDto,
    TemplateFieldStatus,
    TemplateFieldType,
    TemplateFieldOptionDto,
    TemplateFieldControl,
    TemplateFieldGetComboQuery
} from 'src/shared/service-proxies/service-proxies';
import { ControlError, FormService } from 'src/shared/services/form.service';
import { ChangeLogService } from 'src/app/_services/changelog.service';

@Component({
    templateUrl: './edittemplatefields.component.html'
})
export class EditTemplateFieldsComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    blockedDocument = false;
    isSaved = false;

    model: TemplateFieldForEditResponse = new TemplateFieldForEditResponse();
    status: number;
    statusDesc: string;
    template: number;
    templateSection: number;
    templateSectionDesc: string;
    id?: number = null;
    fieldLabels: any = {};
    optionFieldLabels: any = {};

    fieldTypeCombo: ComboboxItemDto[] = [];
    fieldControlCombo: ComboboxItemDto[] = [];
    fieldControlComboFiltered: ComboboxItemDto[] = [];

    TemplateFieldType = TemplateFieldType;
    TemplateFieldControl = TemplateFieldControl;

    clonedOptions: { [s: number]: TemplateFieldOptionDto } = {};

    templateCombo: ComboboxItemDto[] = [];
    templateFieldCombo: ComboboxItemDto[] = [];

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
        self.templateSection = self.modalConfig.data.templateSection;
        self.templateSectionDesc = self.modalConfig.data.templateSectionDesc;
        self.id = self.modalConfig.data.id;

        self.fieldTypeCombo.push(new ComboboxItemDto({ value: '1', label: self.l('TemplateFields.TemplateField.TypeBoolean') }));
        self.fieldTypeCombo.push(new ComboboxItemDto({ value: '10', label: self.l('TemplateFields.TemplateField.TypeText') }));
        self.fieldTypeCombo.push(new ComboboxItemDto({ value: '20', label: self.l('TemplateFields.TemplateField.TypeMultivalue') }));
        self.fieldTypeCombo.push(new ComboboxItemDto({ value: '30', label: self.l('TemplateFields.TemplateField.TypeDate') }));
        self.fieldTypeCombo.push(new ComboboxItemDto({ value: '31', label: self.l('TemplateFields.TemplateField.TypeDateTime') }));
        self.fieldTypeCombo.push(new ComboboxItemDto({ value: '32', label: self.l('TemplateFields.TemplateField.TypeTime') }));
        self.fieldTypeCombo.push(new ComboboxItemDto({ value: '40', label: self.l('TemplateFields.TemplateField.TypeInteger') }));
        self.fieldTypeCombo.push(new ComboboxItemDto({ value: '41', label: self.l('TemplateFields.TemplateField.TypeDecimal') }));
        self.fieldTypeCombo.push(new ComboboxItemDto({ value: '50', label: self.l('TemplateFields.TemplateField.TypeGoogleAddress') }));
        self.fieldTypeCombo.push(new ComboboxItemDto({ value: '60', label: self.l('TemplateFields.TemplateField.TypeTemplate') }));
        self.fieldTypeCombo.push(new ComboboxItemDto({ value: '70', label: self.l('TemplateFields.TemplateField.TypeUser') }));

        self.fieldControlCombo.push(new ComboboxItemDto({ value: '10', label: self.l('TemplateFields.TemplateField.ControlInputText') }));
        self.fieldControlCombo.push(new ComboboxItemDto({ value: '11', label: self.l('TemplateFields.TemplateField.ControlDropDown') }));
        self.fieldControlCombo.push(new ComboboxItemDto({ value: '12', label: self.l('TemplateFields.TemplateField.ControlListbox') }));
        self.fieldControlCombo.push(new ComboboxItemDto({ value: '13', label: self.l('TemplateFields.TemplateField.ControlRadioButton') }));
        self.fieldControlCombo.push(new ComboboxItemDto({ value: '14', label: self.l('TemplateFields.TemplateField.ControlInputSwitch') }));
        self.fieldControlCombo.push(new ComboboxItemDto({ value: '15', label: self.l('TemplateFields.TemplateField.ControlInputMask') }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '16', label: self.l('TemplateFields.TemplateField.ControlInputTextArea')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '21', label: self.l('TemplateFields.TemplateField.ControlListboxMultivalue')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({ value: '22', label: self.l('TemplateFields.TemplateField.ControlCheckbox') }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '23', label: self.l('TemplateFields.TemplateField.ControlMultiselect')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '30', label: self.l('TemplateFields.TemplateField.ControlCalendarBasic')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '31', label: self.l('TemplateFields.TemplateField.ControlCalendarTime')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '32', label: self.l('TemplateFields.TemplateField.ControlCalendarTimeOnly')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({ value: '40', label: self.l('TemplateFields.TemplateField.ControlSpinner') }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '41', label: self.l('TemplateFields.TemplateField.ControlSpinnerFormatInput')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '42', label: self.l('TemplateFields.TemplateField.ControlTextNumber')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '50', label: self.l('TemplateFields.TemplateField.ControlGoogleAddress')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '60', label: self.l('TemplateFields.TemplateField.ControlAutocomplete')
        }));
        self.fieldControlCombo.push(new ComboboxItemDto({
            value: '61', label: self.l('TemplateFields.TemplateField.ControlAutocompleteDynamic')
        }));

        self.model.options = [];
        self.prepareLabels();
        self.prepareForm();

        self.getForEdit(self.id);

        if (!self.id) {
            self.getFieldNextOrder();
        }
    }

    prepareLabels() {
        const self = this;

        self.fieldLabels = {
            templateSection: self.l('TemplateFields.TemplateField.TemplateSection'),
            status: self.l('TemplateFields.TemplateField.Status'),
            name: self.l('TemplateFields.TemplateField.Name'),
            fieldName: self.l('TemplateFields.TemplateField.FieldName'),
            fieldType: self.l('TemplateFields.TemplateField.Type'),
            fieldSize: self.l('TemplateFields.TemplateField.Size'),
            decimalPartSize: self.l('TemplateFields.TemplateField.DecimalPartSize'),
            fieldControl: self.l('TemplateFields.TemplateField.Control'),
            inputMask: self.l('TemplateFields.TemplateField.InputMask'),
            hasKeyFilter: self.l('TemplateFields.TemplateField.HasKeyFilter'),
            keyFilter: self.l('TemplateFields.TemplateField.KeyFilter'),
            templateFieldRelationTemplate: self.l('TemplateFields.TemplateField.TemplateFieldRelationTemplate'),
            templateFieldRelationTemplateField: self.l('TemplateFields.TemplateField.TemplateFieldRelationTemplateField'),
            isRequired: self.l('TemplateFields.TemplateField.IsRequired'),
            showOnGrid: self.l('TemplateFields.TemplateField.ShowOnGrid'),
            order: self.l('TemplateFields.TemplateField.Order'),
            inheritSecurity: self.l('TemplateFields.TemplateField.InheritSecurity'),
            options: self.l('TemplateFields.TemplateField.Options')
        };

        self.optionFieldLabels = {
            value: self.l('TemplateFields.TemplateField.Options.Option.Value'),
            description: self.l('TemplateFields.TemplateField.Options.Option.Description')
        };
    }

    prepareForm() {
        const self = this;

        self.form = self.formBuilder.group({
            name: [null, [Validators.required, Validators.maxLength(50)]],
            fieldType: [null, [Validators.required]],
            fieldSize: [null],
            fieldControl: [null, [Validators.required]],
            inputMask: [null, [Validators.maxLength(50)]],
            hasKeyFilter: [false],
            keyFilter: [null, [Validators.maxLength(500)]],
            templateFieldRelationTemplate: [null],
            templateFieldRelationTemplateField: [null],
            isRequired: [false],
            showOnGrid: [false],
            order: [null, [Validators.required, Validators.min(1), Validators.max(255), Validators.maxLength(3)]],
            inheritSecurity: [false]
        });
    }

    getForEdit(id: number): void {
        const self = this;

        self.blockedDocument = true;

        self.service.getTemplateFieldForEdit(new TemplateFieldGetForEditQuery({ id: id }))
            .pipe(finalize(() => {
                self.blockedDocument = false;
            }))
            .subscribe(data => {
                self.templateCombo = data.templateCombo.filter(p => p.value !== self.template.toString());

                if (self.id) {
                    self.templateFieldCombo = data.templateFieldCombo;
                    self.model = data;

                    self.status = data.status;
                    self.statusDesc = data.statusDesc;
                    self.templateSection = data.templateSection;
                    self.templateSectionDesc = data.templateSectionDesc;

                    self.f.name.setValue(data.name);
                    self.f.fieldType.setValue(data.fieldType.toString());

                    self.onChangeFieldType();

                    self.f.fieldSize.setValue(data.fieldSize);
                    self.f.fieldControl.setValue(data.fieldControl.toString());

                    self.onChangeHasKeyFilter();

                    self.f.inputMask.setValue(data.inputMask);
                    self.f.hasKeyFilter.setValue(data.hasKeyFilter);
                    self.f.keyFilter.setValue(data.hasKeyFilter ? data.keyFilter : null);
                    self.f.templateFieldRelationTemplate.setValue(data.templateFieldRelationTemplate ?
                        data.templateFieldRelationTemplate.toString() : null
                    );
                    self.f.templateFieldRelationTemplateField.setValue(data.templateFieldRelationTemplateField ?
                        data.templateFieldRelationTemplateField.toString() : null
                    );
                    self.f.isRequired.setValue(data.isRequired);
                    self.f.showOnGrid.setValue(data.showOnGrid);
                    self.f.order.setValue(data.order);
                    self.f.inheritSecurity.setValue(data.inheritSecurity);
                } else {
                    self.status = TemplateFieldStatus.New;
                    self.statusDesc = self.l('TemplateFields.TemplateField.StatusNew');
                }
            });
    }

    activateNewMode(): void {
        const self = this;

        self.prepareForm();
        self.getFieldNextOrder();

        // focus
    }

    getFieldNextOrder() {
        const self = this;

        self.blockedDocument = true;

        self.service.getTemplateFieldNextOrderByTemplateSection(self.templateSection)
            .pipe(finalize(() => {
                self.blockedDocument = false;
            }))
            .subscribe(data => {
                self.f.order.setValue(data);
            });
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

        self.blockedDocument = true;

        if (self.id) {
            const updateCmd = new TemplateFieldUpdateCommand();

            updateCmd.templateSection = self.templateSection;
            updateCmd.id = self.model.id;
            updateCmd.name = self.f.name.value;
            updateCmd.fieldType = self.f.fieldType.value;
            updateCmd.fieldSize = self.f.fieldType.value === TemplateFieldType.Text.toString()
                || self.f.fieldType.value === TemplateFieldType.Decimal.toString() ? self.f.fieldSize.value : null;
            updateCmd.fieldControl = self.f.fieldControl.value;
            updateCmd.inputMask = self.f.inputMask.value;
            updateCmd.hasKeyFilter = self.f.hasKeyFilter.value;
            updateCmd.keyFilter = self.f.hasKeyFilter.value ? self.f.keyFilter.value : null;
            updateCmd.templateFieldRelationTemplateField = self.f.fieldType.value === TemplateFieldType.Template.toString() ?
                self.f.templateFieldRelationTemplateField.value : null;
            updateCmd.isRequired = self.f.isRequired.value;
            updateCmd.showOnGrid = self.f.showOnGrid.value;
            updateCmd.order = self.f.order.value;
            updateCmd.inheritSecurity = self.f.fieldType.value === TemplateFieldType.Template.toString() ?
                self.f.inheritSecurity.value : false;

            updateCmd.options = self.mustFieldControlHaveOptions(self.f.fieldControl.value) ? self.model.options : [];

            self.blockedDocument = true;

            self.service.updateTemplateField(updateCmd)
                .pipe(finalize(() => {
                    self.blockedDocument = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('TemplateFields.TemplateField.SuccessfulUpdate'), self.l('Success'));
                    self.isSaved = true;
                    self.return();
                });
        } else {
            const createCmd = new TemplateFieldCreateCommand();

            createCmd.templateSection = self.templateSection;
            createCmd.name = self.f.name.value;
            createCmd.fieldType = self.f.fieldType.value;
            createCmd.fieldSize = self.f.fieldType.value === TemplateFieldType.Text.toString()
                || self.f.fieldType.value === TemplateFieldType.Decimal.toString() ? self.f.fieldSize.value : null;
            createCmd.fieldControl = self.f.fieldControl.value;
            createCmd.inputMask = self.f.inputMask.value;
            createCmd.hasKeyFilter = self.f.hasKeyFilter.value;
            createCmd.keyFilter = self.f.hasKeyFilter.value ? self.f.keyFilter.value : null;
            createCmd.templateFieldRelationTemplateField = self.f.fieldType.value === TemplateFieldType.Template.toString() ?
                self.f.templateFieldRelationTemplateField.value : null;
            createCmd.isRequired = self.f.isRequired.value;
            createCmd.showOnGrid = self.f.showOnGrid.value;
            createCmd.order = self.f.order.value;
            createCmd.inheritSecurity = self.f.fieldType.value === TemplateFieldType.Template.toString() ?
                self.f.inheritSecurity.value : false;

            createCmd.options = self.mustFieldControlHaveOptions(self.f.fieldControl.value) ? self.model.options : [];

            self.blockedDocument = true;

            self.service.createTemplateField(createCmd)
                .pipe(finalize(() => {
                    self.blockedDocument = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('TemplateFields.TemplateField.SuccessfulCreate'), self.l('Success'));
                    self.isSaved = true;
                    self.activateNewMode();
                });
        }
    }

    showChangeHistory(): void {
        const self = this;

        self.changeLogService.open('TemplateField', self.id);
    }

    onChangeFieldType(): void {
        const self = this;

        self.fieldControlComboFiltered = [];
        self.f.fieldControl.setValue(null);

        self.f.fieldSize.clearValidators();
        self.f.templateFieldRelationTemplate.clearValidators();
        self.f.templateFieldRelationTemplateField.clearValidators();

        if (self.f.fieldType.value) {
            switch (Number.parseInt(self.f.fieldType.value, 10)) {
                case TemplateFieldType.Boolean:
                    self.fieldControlComboFiltered = self.fieldControlCombo.filter(p => p.value === '14');
                    break;
                case TemplateFieldType.Text:
                    self.fieldControlComboFiltered = self.fieldControlCombo
                        .filter(p => '10,11,12,13,15,16'.split(',').some(x => x === p.value));
                    self.f.fieldSize.setValidators([Validators.required, Validators.min(1), Validators.max(32000)]);
                    break;
                case TemplateFieldType.Multivalue:
                    self.fieldControlComboFiltered = self.fieldControlCombo
                        .filter(p => Number.parseInt(p.value, 10) >= 21 && Number.parseInt(p.value, 10) <= 23);
                    break;
                case TemplateFieldType.Date:
                    self.fieldControlComboFiltered = self.fieldControlCombo.filter(p => p.value === '30');
                    break;
                case TemplateFieldType.Time:
                    self.fieldControlComboFiltered = self.fieldControlCombo.filter(p => p.value === '32');
                    break;
                case TemplateFieldType.DateTime:
                    self.fieldControlComboFiltered = self.fieldControlCombo.filter(p => p.value === '31');
                    break;
                case TemplateFieldType.Integer:
                    self.fieldControlComboFiltered = self.fieldControlCombo.filter(p => p.value === '40' || p.value === '42');
                    break;
                case TemplateFieldType.Decimal:
                    self.fieldControlComboFiltered = self.fieldControlCombo.filter(p => p.value === '41' || p.value === '42');
                    self.f.fieldSize.setValidators([Validators.required, Validators.min(1), Validators.max(32000)]);
                    break;
                case TemplateFieldType.GoogleAddress:
                    self.fieldControlComboFiltered = self.fieldControlCombo.filter(p => p.value === '50');
                    break;
                case TemplateFieldType.Template:
                    self.fieldControlComboFiltered = self.fieldControlCombo.filter(p => p.value === '60' || p.value === '61');
                    self.f.templateFieldRelationTemplate.setValidators([Validators.required]);
                    self.f.templateFieldRelationTemplateField.setValidators([Validators.required]);
                    break;
                case TemplateFieldType.User:
                    self.fieldControlComboFiltered = self.fieldControlCombo.filter(p => p.value === '61');
                    break;
            }
        }

        self.f.fieldSize.updateValueAndValidity();
        self.f.templateFieldRelationTemplate.updateValueAndValidity();
        self.f.templateFieldRelationTemplateField.updateValueAndValidity();

        self.onChangeFieldControl();
    }

    onChangeFieldControl(): void {
        const self = this;

        if (self.f.fieldControl.value === TemplateFieldControl.InputText.toString() && self.f.hasKeyFilter.value) {
            self.f.keyFilter.setValidators([Validators.required, Validators.maxLength(500)]);
        } else {
            self.f.keyFilter.clearValidators();
        }

        if (self.f.fieldControl.value === TemplateFieldControl.InputMask.toString() && self.f.hasKeyFilter.value) {
            self.f.inputMask.setValidators([Validators.maxLength(50)]);
        } else {
            self.f.inputMask.clearValidators();
        }

        self.f.keyFilter.updateValueAndValidity();
        self.f.inputMask.updateValueAndValidity();
    }

    onChangeHasKeyFilter(): void {
        const self = this;

        if (self.f.hasKeyFilter.value) {
            self.f.keyFilter.setValidators([Validators.required, Validators.maxLength(500)]);
        } else {
            self.f.keyFilter.clearValidators();
        }

        self.f.keyFilter.updateValueAndValidity();
    }

    onChangeTemplate(): void {
        const self = this;

        self.blockedDocument = true;
        self.f.templateFieldRelationTemplateField.setValue(null);

        self.service.getTemplateFieldCombo(new TemplateFieldGetComboQuery({ template: self.f.templateFieldRelationTemplate.value }))
            .pipe(finalize(() => {
                self.blockedDocument = false;
            }))
            .subscribe(data => {
                self.templateFieldCombo = data;
            });
    }

    optionCreate(): void {
        const self = this;
        const dto = new TemplateFieldOptionDto();

        dto['isNew'] = true;
        self.model.options.push(dto);

        const index = self.model.options.length - 1;

        self.onRowEditInit(dto, index);

        setTimeout(() => document.getElementById('description' + index).focus(), 100);
    }

    onRowEditInit(option: TemplateFieldOptionDto, index: number) {
        const self = this;

        self.clonedOptions[index] = new TemplateFieldOptionDto({
            id: option.id,
            templateField: self.id,
            value: option.value,
            description: option.description
        });

        option['isEditable'] = true;

        setTimeout(() => document.getElementById('description' + index).focus(), 100);
        console.log('final onRowEditInit');
    }

    onRowEditSave(option: TemplateFieldOptionDto, index: number) {
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

    onRowEditCancel(option: TemplateFieldOptionDto, index: number) {
        const self = this;
        console.log(option);
        if (option['isNew']) {
            self.onRowEditDelete(index);
            return;
        }

        self.model.options[index] = self.clonedOptions[index];
        delete self.clonedOptions[index];

        option['isEditable'] = false;
    }

    onRowEditDelete(index: number) {
        const self = this;

        self.model.options.splice(index, 1);
        delete self.clonedOptions[index];
    }

    onRowEditValidate(option: TemplateFieldOptionDto): string[] {
        const self = this;
        const messages: string[] = [];

        if (!option.description) {
            messages.push(self.l('RequiredField', self.optionFieldLabels['description']));
        }

        if (self.model.options.some((item) => item.description === option.description && !item['isEditable'])) {
            messages.push(self.l('FieldDuplicated', self.optionFieldLabels['description']));
        }

        if (!option.value) {
            messages.push(self.l('RequiredField', self.optionFieldLabels['value']));
        }

        if (self.model.options.some((item) => item.value === option.value && !item['isEditable'])) {
            messages.push(self.l('FieldDuplicated', self.optionFieldLabels['value']));
        }

        return messages;
    }

    mustFieldControlHaveOptions(fieldControl: number): boolean {
        const self = this;

        if (fieldControl) {
            const fieldControlStr = fieldControl.toString();

            return fieldControlStr === TemplateFieldControl.Checkbox.toString()
                || fieldControlStr === TemplateFieldControl.DropDown.toString()
                || fieldControlStr === TemplateFieldControl.Listbox.toString()
                || fieldControlStr === TemplateFieldControl.ListboxMultivalue.toString()
                || fieldControlStr === TemplateFieldControl.Multiselect.toString()
                || fieldControlStr === TemplateFieldControl.RadioButton.toString();
        } else {
            return false;
        }
    }

    validate(): ControlError[] {
        const self = this;
        const messages: ControlError[] = [];

        if (self.mustFieldControlHaveOptions(self.f.fieldControl.value)) {
            if (self.model.options.length > 0) {
                if (self.model.options.some((item) => !(item.description) || item.value === null || item.value === undefined)) {
                    messages.push({
                        controlName: 'fieldControl', message: self.l('TemplateFields.TemplateField.OptionsFullyCapturedMessage') });
                }
            } else {
                messages.push({
                    controlName: 'fieldControl', message: self.l('RequiredField', self.fieldLabels['options']) });
            }
        }

        return messages;
    }

    return(): void {
        const self = this;

        self.modalRef.close(self.isSaved);
    }
}
