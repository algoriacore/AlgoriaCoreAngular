import { Component, Input, OnInit } from '@angular/core';
import {
    AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators
} from '@angular/forms';
import * as moment from 'moment';
import {
    CatalogCustomImplGetComboQuery,
    CatalogCustomImplServiceProxy,
    ComboboxItemDto,
    QuestionnaireFieldControl,
    QuestionnaireFieldResponse,
    QuestionnaireFieldType,
    QuestionnaireResponse,
    QuestionnaireSectionResponse,
    UserServiceProxy
} from '../service-proxies/service-proxies';
import { DateTimeService } from '../services/datetime.service';
import { ControlError, FormService, maxSelecting, minSelecting } from '../services/form.service';
import { LocalizationService } from '../services/localization.service';
import { NumberFormatter } from '../utils/numberformatter.class';

@Component({
    selector: 'app-questionnaire',
    templateUrl: './app.questionnaire.component.html'
})
export class AppQuestionnaireComponent implements OnInit {
    @Input() questionnaire: QuestionnaireResponse;
    @Input() value: { [key: string]: any } = {};
    @Input() readOnly = false;
    @Input() disabled = false;

    questionnaireSections: QuestionnaireSectionResponse[] = [];
    questionnaireFields: QuestionnaireFieldResponse[] = [];

    QuestionnaireFieldType = QuestionnaireFieldType;
    QuestionnaireFieldControl = QuestionnaireFieldControl;

    form: FormGroup;
    fieldLabels: any = {};

    userCombo: ComboboxItemDto[] = [];

    constructor(
        private localizationService: LocalizationService,
        private dateTimeService: DateTimeService,
        private formBuilder: FormBuilder,
        private formService: FormService,
        private serviceCatalogCustomImpl: CatalogCustomImplServiceProxy,
        private serviceUser: UserServiceProxy) {
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;
    }

    ngOnInit() {
        const self = this;

        self.value = self.value ? self.value : {};
        self.questionnaireFields = self.questionnaire.sections.flatMap(p => p.fields);

        if (self.questionnaireFields && self.questionnaireFields.length > 0) {
            self.prepareLabels(self.questionnaireFields);
            self.questionnaireSections = self.questionnaire.sections.filter(p => p.fields.length > 0)
                .sort((a, b) => a.order - b.order);

            for (const section of self.questionnaireSections) {
                section.fields = section.fields.sort((a, b) => a.order - b.order);

                if (!self.readOnly) {
                    for (const field of section.fields) {
                        if (field.fieldType === QuestionnaireFieldType.CatalogCustom) {
                            self.fillAutocomplete(field);
                        } else if (field.mustHaveOptions && field.options) {
                            field['optionsCombo'] = field.options.map(p => new ComboboxItemDto({
                                value: p.value.toString(), label: p.description
                            }));
                        }
                    }
                }
            }
        }

        if (self.value && !self.readOnly) {
            self.prepareForm(self.questionnaireFields);
            self.setFieldsData(self.value, self.questionnaireFields);
        }
    }

    prepareLabels(questionnaireFields: QuestionnaireFieldResponse[]) {
        const self = this;

        self.fieldLabels = {};

        for (const field of questionnaireFields) {
            self.fieldLabels[field.fieldName] = field.name;
        }
    }

    prepareForm(questionnaireFields: QuestionnaireFieldResponse[]) {
        const self = this;
        let validators: ValidatorFn[] = [];
        let formControl: FormControl;

        self.form = self.formBuilder.group({});

        for (const field of questionnaireFields) {
            validators = [];

            if (field.isRequired) {
                validators.push(Validators.required);
            }

            if (field.fieldType === QuestionnaireFieldType.Text) {
                if (field.fieldSize) {
                    validators.push(Validators.maxLength(field.fieldSize));
                }

                if (field.hasKeyFilter && field.keyFilter) {
                    validators.push(Validators.pattern(field.keyFilter));
                }
            } else if (field.fieldType === QuestionnaireFieldType.Integer || field.fieldType === QuestionnaireFieldType.Decimal
                || field.fieldType === QuestionnaireFieldType.Currency) {
                if (field.customProperties && !Number.isNaN(field.customProperties.minValue)) {
                    validators.push(Validators.min(field.customProperties.minValue));
                }

                if (field.customProperties && !Number.isNaN(field.customProperties.maxValue)) {
                    validators.push(Validators.max(field.customProperties.maxValue));
                }
            } else if (field.fieldType === QuestionnaireFieldType.Multivalue) {
                if (field.customProperties && field.customProperties.minValue && !Number.isNaN(field.customProperties.minValue)) {
                    validators.push(minSelecting(field.customProperties.minValue));
                }

                if (field.customProperties && field.customProperties.maxValue && !Number.isNaN(field.customProperties.maxValue)) {
                    validators.push(maxSelecting(field.customProperties.maxValue));
                }
            }

            if (field.fieldType === QuestionnaireFieldType.Boolean) {
                formControl = new FormControl(false, { nonNullable: true });
                formControl.setValidators(validators);

                self.form.addControl(field.fieldName, formControl);
            } else {
                formControl = new FormControl(null, validators);
                self.form.addControl(field.fieldName, formControl);
            }

            if (self.disabled) {
                formControl.disable();
            }
        }
    }

    fillAutocompleteDynamicUser(event: any): void {
        const self = this;

        self.serviceUser.getUserAutocompleteList(event.query)
            .subscribe(data => {
                self.userCombo = data.map(p => new ComboboxItemDto({ value: p.id.toString(), label: p.fullName }));
            });
    }

    fillAutocomplete(field: QuestionnaireFieldResponse): void {
        const self = this;

        self.serviceCatalogCustomImpl.getCatalogCustomImplCombo(new CatalogCustomImplGetComboQuery({
            catalog: field.catalogCustom.catalogCustom,
            fieldName: field.catalogCustom.fieldName
        }))
            .subscribe(data => {
                field['optionsCombo'] = data;
            });
    }

    fillAutocompleteDynamic(event: any, field: QuestionnaireFieldResponse): void {
        const self = this;

        if (field.fieldType === QuestionnaireFieldType.CatalogCustom) {
            self.serviceCatalogCustomImpl.getCatalogCustomImplCombo(new CatalogCustomImplGetComboQuery({
                catalog: field.catalogCustom.catalogCustom,
                fieldName: field.catalogCustom.fieldName,
                filter: event.query
            }))
                .subscribe(data => {
                    field['optionsCombo'] = data;
                });
        } else if (field.fieldType === QuestionnaireFieldType.User) {
            self.serviceUser.getUserAutocompleteList(event.query)
                .subscribe(data => {
                    field['optionsCombo'] = data.map(p => new ComboboxItemDto({ value: p.id.toString(), label: p.fullName }));
                });
        }
    }

    setFieldsData(data: { [key: string]: any }, fields: QuestionnaireFieldResponse[]): void {
        const self = this;

        if (data && fields && fields.length > 0) {
            let fieldValue;
            let control: AbstractControl;

            for (const field of fields) {
                fieldValue = data[field.fieldName];

                if (fieldValue !== null && fieldValue !== undefined) {
                    control = self.f[field.fieldName];

                    switch (field.fieldType) {
                        case QuestionnaireFieldType.Date:
                            if (typeof(fieldValue) === 'string') {
                                control.setValue(moment(fieldValue, 'YYYY-MM-DDT00:00').toDate());
                            }
                            break;
                        case QuestionnaireFieldType.DateTime:
                            if (typeof (fieldValue) === 'string') {
                                control.setValue(moment(fieldValue, 'YYYY-MM-DDTHH:mmZ').toDate());
                            }
                            break;
                        case QuestionnaireFieldType.Time: {
                            if (typeof (fieldValue) === 'string') {
                                const now = moment();
                                const duration = moment.duration(fieldValue);
                                const date = new Date(
                                    now.year(),
                                    now.month(),
                                    now.date(),
                                    duration.hours(),
                                    duration.minutes(),
                                    duration.seconds(),
                                    duration.milliseconds()
                                );

                                control.setValue(date);
                            }
                            break;
                        }
                        case QuestionnaireFieldType.Multivalue:
                            if (Array.isArray(fieldValue)) {
                                control.setValue(fieldValue.map(p => p.value.toString()));
                            } else if (fieldValue.value) {
                                control.setValue(fieldValue.value.toString());
                            }
                            break;
                        case QuestionnaireFieldType.CatalogCustom:
                            if (typeof(fieldValue) === 'object' && fieldValue.value) {
                                if (field.fieldControl === QuestionnaireFieldControl.Autocomplete) {
                                    control.setValue(fieldValue.value);
                                } else if (field.fieldControl === QuestionnaireFieldControl.AutocompleteDynamic) {
                                    control.setValue(new ComboboxItemDto({
                                        value: fieldValue.value, label: fieldValue.description
                                    }));
                                }
                            }
                            break;
                        case QuestionnaireFieldType.Integer:
                        case QuestionnaireFieldType.Decimal:
                        case QuestionnaireFieldType.Currency:
                            if (!isNaN(fieldValue)) {
                                control.setValue(fieldValue);
                            }
                            break;
                        default:
                            if (field.fieldControl === QuestionnaireFieldControl.AutocompleteDynamic) {
                                if (typeof(fieldValue) === 'object' && fieldValue.value) {
                                    control.setValue(new ComboboxItemDto({
                                        value: fieldValue.value.toString(), label: fieldValue.description
                                    }));
                                }
                            } else if (field.mustHaveOptions) {
                                if (typeof(fieldValue) === 'object') {
                                    control.setValue(fieldValue.value.toString());
                                }
                            } else {
                                if (typeof (fieldValue) !== 'object' && !Array.isArray(fieldValue)) {
                                    control.setValue(fieldValue);
                                }
                            }
                    }
                }
            }
        }
    }

    transformFieldValueToDisplay(value: any, field: QuestionnaireFieldResponse): any {
        const self = this;
        let res = value;

        if (value !== null && value !== undefined && value !== '') {
            const formatter = new NumberFormatter();

            switch (field.fieldType) {
                case QuestionnaireFieldType.Boolean:
                    res = value ? self.l('Yes') : self.l('No');
                    break;
                case QuestionnaireFieldType.Multivalue:
                    res = Array.isArray(value) ? value.sort((a, b) => {
                        const aStr = a.description.toLowerCase();
                        const bStr = b.description.toLowerCase();

                        if (aStr > bStr) {
                            return 1;
                        } else if (aStr < bStr) {
                            return -1;
                        } else {
                            return 0;
                        }
                    }).filter(p => p.description).map(p => p.description).join(', ') : '';
                    break;
                case QuestionnaireFieldType.CatalogCustom:
                case QuestionnaireFieldType.User:
                    res = value && value.description ? value.description : '';
                    break;
                case QuestionnaireFieldType.Integer:
                    res = formatter.format(value, 0);
                    break;
                case QuestionnaireFieldType.Decimal:
                case QuestionnaireFieldType.Currency:
                    res = formatter.format(value, field.fieldSize ? field.fieldSize : 2);
                    break;
                case QuestionnaireFieldType.Date:
                    res = self.dateTimeService.getDateStringISOToFormat(value);
                    break;
                case QuestionnaireFieldType.DateTime:
                    res = self.dateTimeService.getDateTimeStringISOToFormat(value);
                    break;
                default:
                    if (field.mustHaveOptions) {
                        res = value && value.description ? value.description : '';
                    }
                    break;
            }
        }

        return res;
    }

    l(key: string, ...args: any[]): string {
        return this.localizationService.l(key, ...args);
    }

    validate(): boolean {
        const self = this;

        // stop here if form is invalid
        if (self.form.invalid) {
            this.formService.showErrors(self.form, self.fieldLabels);
            return false;
        }

        return true;
    }

    isValid(): boolean {
        const self = this;

        return self.form.invalid;
    }

    getErrors(): ControlError[] {
        const self = this;

        return self.formService.getErrors(self.form, self.fieldLabels);
    }

    getFieldsData(): any {
        const self = this;
        const data = {};
        let fieldValue;

        for (const field of self.questionnaireFields) {
            data[field.fieldName] = null;
            fieldValue = self.f[field.fieldName].value;

            if (fieldValue !== null && fieldValue !== undefined) {
                switch (field.fieldType) {
                    case QuestionnaireFieldType.Date:
                        data[field.fieldName] = self.dateTimeService.getDateToSaveServer(fieldValue);
                        break;
                    case QuestionnaireFieldType.DateTime:
                        data[field.fieldName] = self.dateTimeService.getDateTimeToSaveServer(fieldValue);
                        break;
                    case QuestionnaireFieldType.Time:
                        data[field.fieldName] = self.dateTimeService.getTimeToSaveServer(fieldValue).format('HH:mm');
                        break;
                    case QuestionnaireFieldType.Multivalue:
                        data[field.fieldName] = fieldValue.map(p => field.options.find(q => q.value === Number(p)));
                        break;
                    case QuestionnaireFieldType.CatalogCustom:
                        if (field.fieldControl === QuestionnaireFieldControl.Autocomplete) {
                            fieldValue = field['optionsCombo'].find(q => q.value === fieldValue);
                        }

                        data[field.fieldName] = { value: fieldValue.value, description: fieldValue.label };
                        break;
                    default:
                        if (field.fieldControl === QuestionnaireFieldControl.AutocompleteDynamic) {
                            data[field.fieldName] = { value: fieldValue.value, description: fieldValue.label };
                        } else {
                            if (field.mustHaveOptions && field.options) {
                                data[field.fieldName] = field.options.find(q => q.value === Number(fieldValue));
                            } else {
                                data[field.fieldName] = fieldValue;
                            }
                        }
                }
            }
        }

        return data;
    }

    activaModoNuevo(): void {
        const self = this;

        self.form.reset();
        self.value = {};
    }

    caculateMinMaxSelectingMessage(field: QuestionnaireFieldResponse): string {
        const self = this;
        let res = '';

        if (field.customProperties.minValue && !Number.isNaN(field.customProperties.minValue)
            && field.customProperties.maxValue && !Number.isNaN(field.customProperties.maxValue)) {
            res = self.l(
                'CatalogsCustomImpl.CatalogCustomImpl.Multivalue.MinMaxSelectingMessage',
                field.customProperties.minValue.toString(),
                field.customProperties.maxValue.toString()
            );
        } else if (field.customProperties.minValue && !Number.isNaN(field.customProperties.minValue)) {
            res = self.l(
                'CatalogsCustomImpl.CatalogCustomImpl.Multivalue.MinSelectingMessage',
                field.customProperties.minValue.toString()
            );
        } else if (field.customProperties.maxValue && !Number.isNaN(field.customProperties.maxValue)) {
            res = self.l(
                'CatalogsCustomImpl.CatalogCustomImpl.Multivalue.MaxSelectingMessage',
                field.customProperties.maxValue.toString()
            );
        }

        return res;
    }
}
