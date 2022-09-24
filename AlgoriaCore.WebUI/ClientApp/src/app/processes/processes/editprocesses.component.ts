import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import {
    ComboboxItemDto,
    ProcessServiceProxy,
    TemplateResponse,
    TemplateFieldResponse,
    TemplateFieldType,
    TemplateFieldControl,
    TemplateSectionForListResponse,
    ProcessGetComboQuery,
    ProcessCreateCommand,
    ProcessUpdateCommand,
    UserServiceProxy,
    ProcessGetForEditQuery,
    ProcessForEditResponse,
    ProcessToDoActivityCommand,
    ProcessToDoActivityForEditResponse
} from '../../../shared/service-proxies/service-proxies';
import { FormService } from '../../../shared/services/form.service';
import { ChangeLogService } from '../../_services/changelog.service';
import { DateTimeService } from 'src/shared/services/datetime.service';
import * as moment from 'moment';
import { AppPermissions } from '../../../shared/AppPermissions';
import { AppComponent } from '../../app.component';
import { EditProcessSecurityComponent } from './security/editprocesssecurity.component';
import { Location } from '@angular/common';

@Component({
    templateUrl: './editprocesses.component.html'
})
export class EditProcessesComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    templateId?: number = null;
    id?: number = null;
    model: ProcessForEditResponse;
    fieldLabels: any = {};

    templateSections: TemplateSectionForListResponse[] = [];

    TemplateFieldType = TemplateFieldType;
    TemplateFieldControl = TemplateFieldControl;

    permissions = { create: false, edit: false };

    userCombo: ComboboxItemDto[] = [];

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private service: ProcessServiceProxy,
        private serviceUser: UserServiceProxy,
        private formService: FormService,
        private changeLogService: ChangeLogService,
        private dateTimeService: DateTimeService,
        private app: AppComponent,
        private location: Location
    ) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;
    }

    ngOnInit() {
        const self = this;

        if (self.activatedRoute.snapshot.url.length > 1 && (self.activatedRoute.snapshot.url[1].path === 'consult'
            || self.activatedRoute.snapshot.url[1].path === 'edit')) {
            self.id = self.activatedRoute.snapshot.params['id'] ? Number(self.activatedRoute.snapshot.params['id']) : null;
        }

        self.templateId = Number(self.activatedRoute.snapshot.params['template']);
        self.permissions.create = self.permission.isGranted(
            AppPermissions.calculatePermissionNameForProcess(AppPermissions.processesCreate, self.templateId, self.app.currentUser.tenantId)
        );
        self.permissions.edit = self.permission.isGranted(
            AppPermissions.calculatePermissionNameForProcess(AppPermissions.processesEdit, self.templateId, self.app.currentUser.tenantId)
        );

        self.getForEdit();
    }

    prepareLabels(template: TemplateResponse, templateFields: TemplateFieldResponse[]) {
        const self = this;

        self.fieldLabels = {};

        if (template.isActivity) {
            self.fieldLabels['ACT_UserCreator'] = self.l('Processes.Process.Activity.UserCreator');
            self.fieldLabels['ACT_CreationTime'] = self.l('Processes.Process.Activity.CreationTime');
            self.fieldLabels['ACT_Description'] = self.l('Processes.Process.Activity.Description');
            self.fieldLabels['ACT_Status'] = self.l('Processes.Process.Activity.Status');
            self.fieldLabels['ACT_InitialPlannedDate'] = self.l('Processes.Process.Activity.InitialPlannedDate');
            self.fieldLabels['ACT_InitialRealDate'] = self.l('Processes.Process.Activity.InitialRealDate');
            self.fieldLabels['ACT_FinalPlannedDate'] = self.l('Processes.Process.Activity.FinalPlannedDate');
            self.fieldLabels['ACT_FinalRealDate'] = self.l('Processes.Process.Activity.FinalRealDate');
            self.fieldLabels['ACT_IsOnTime'] = self.l('Processes.Process.Activity.IsOnTime');
            self.fieldLabels['ACT_Executor'] = self.l('Processes.Process.Activity.Executor');
            self.fieldLabels['ACT_Evaluator'] = self.l('Processes.Process.Activity.Evaluator');
        }

        for (const field of templateFields) {
            self.fieldLabels[field.fieldName] = field.name;
        }
    }

    prepareForm(template: TemplateResponse, templateFields: TemplateFieldResponse[]) {
        const self = this;
        let validators: ValidatorFn[] = [];

        self.form = self.formBuilder.group({});

        if (template.isActivity) {
            self.form.addControl('ACT_Description', new FormControl(null, [Validators.required, Validators.maxLength(100)]));
            self.form.addControl('ACT_Status', new FormControl(null, [Validators.required]));
            self.form.addControl('ACT_InitialPlannedDate', new FormControl(null));
            self.form.addControl('ACT_FinalPlannedDate', new FormControl(null, [Validators.required]));
            self.form.addControl('ACT_InitialRealDate', new FormControl(null));
            self.form.addControl('ACT_FinalRealDate', new FormControl(null));
            self.form.addControl('ACT_Executor', new FormControl(null, [Validators.required]));
            self.form.addControl('ACT_Evaluator', new FormControl(null, [Validators.required]));
        }

        for (const field of templateFields) {
            validators = [];

            if (field.isRequired) {
                validators.push(Validators.required);
            }

            if (field.fieldType === TemplateFieldType.Text) {
                if (field.fieldSize) {
                    validators.push(Validators.maxLength(field.fieldSize));
                }

                if (field.hasKeyFilter && field.keyFilter) {
                    validators.push(Validators.pattern(field.keyFilter));
                }
            }

            self.form.addControl(field.fieldName, new FormControl(null, validators));
        }
    }

    getForEdit(): void {
        const self = this;

        self.app.blocked = true;

        self.service.getProcessForEdit(new ProcessGetForEditQuery({ template: self.templateId, id: self.id }))
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.prepareLabels(data.template, data.templateFields);
                self.prepareForm(data.template, data.templateFields);

                self.model = data;

                if (data.templateFields && data.templateFields.length > 0) {
                    data.templateFields = data.templateFields.sort((a, b) => a.templateSection - b.templateSection);
                    let templateSection: number = null;
                    let ts: TemplateSectionForListResponse;

                    for (const field of data.templateFields) {
                        if (templateSection !== field.templateSection) {
                            ts = new TemplateSectionForListResponse({
                                id: field.templateSection,
                                name: field.templateSectionDesc,
                                order: field.templateSectionOrder,
                                iconAF: field.templateSectionIconAF
                            });

                            ts['fields'] = data.templateFields.filter(p => p.templateSection === ts.id);

                            self.templateSections.push(ts);
                        }

                        templateSection = field.templateSection;

                        if (field.fieldType === TemplateFieldType.Template) {
                            self.fillAutocomplete(field);
                        } else if (field.mustHaveOptions && field.options) {
                            field['optionsCombo'] = field.options.map(p => new ComboboxItemDto({
                                value: p.value.toString(), label: p.description
                            }));
                        }
                    }

                    self.templateSections = self.templateSections.sort((a, b) => a.order - b.order);
                }

                setTimeout(() => {
                    if (self.id) {
                        if (data.activity) {
                            self.model.activity['creationTimeDesc'] = self.dateTimeService.getDateTimeToDisplay(data.activity.creationTime);
                            self.setActivityData(data.activity);
                        }

                        self.setFieldsData(data.data, data.templateFields);
                    } else if (data.template.isActivity) {
                        self.f['ACT_Evaluator'].setValue([new ComboboxItemDto({
                            value: self.app.currentUser.userId.toString(),
                            label: (self.app.currentUser.firstName + ' ' + self.app.currentUser.lastName).trim()
                        })]);
                    }
                }, 0);
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
            const cmd = new ProcessUpdateCommand();
            cmd.template = self.templateId;
            cmd.id = self.id;
            cmd.data = self.getFieldsData();

            if (self.model.template.isActivity) {
                cmd.activity = self.getActivityData();
            }

            self.app.blocked = true;
            self.service.updateProcess(cmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('Processes.Process.SuccessfulUpdate'), self.l('Success'));
                    self.return();
                });
        } else {
            const cmd = new ProcessCreateCommand();
            cmd.template = self.templateId;
            cmd.data = self.getFieldsData();

            if (self.model.template.isActivity) {
                cmd.activity = self.getActivityData();
            }

            self.app.blocked = true;
            self.service.createProcess(cmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('Processes.Process.SuccessfulCreate'), self.l('Success'));

                    if (self.model.template.hasChatRoom && self.permissions.edit) {
                        self.router.navigate(['/app/processes', self.templateId, 'edit', data]);
                    } else {
                        self.activaModoNuevo();
                    }
                });
        }
    }

    fillAutocompleteDynamicUser(event: any): void {
        const self = this;

        self.app.blocked = true;

        self.serviceUser.getUserAutocompleteList(event.query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.userCombo = data.map(p => new ComboboxItemDto({ value: p.id.toString(), label: p.fullName }));
            });
    }

    fillAutocomplete(field: TemplateFieldResponse): void {
        const self = this;

        self.app.blocked = true;

        self.service.getProcessCombo(new ProcessGetComboQuery({ templateField: field.templateFieldRelationTemplateField }))
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                field['optionsCombo'] = data;
            });
    }

    fillAutocompleteDynamic(event: any, field: TemplateFieldResponse): void {
        const self = this;

        self.app.blocked = true;

        if (field.fieldType === TemplateFieldType.Template) {
            self.service.getProcessCombo(new ProcessGetComboQuery({
                templateField: field.templateFieldRelationTemplateField, filter: event.query
            })).pipe(finalize(() => {
                self.app.blocked = false;
            }))
                .subscribe(data => {
                    field['optionsCombo'] = data;
                });
        } else if (field.fieldType === TemplateFieldType.User) {
            self.serviceUser.getUserAutocompleteList(event.query)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    field['optionsCombo'] = data.map(p => new ComboboxItemDto({ value: p.id.toString(), label: p.fullName }));
                });
        }
    }

    setFieldsData(data: { [key: string]: any }, fields: TemplateFieldResponse[]): void {
        const self = this;

        if (data && fields && fields.length > 0) {
            let fieldValue;
            let control: AbstractControl;

            for (const field of fields) {
                fieldValue = data[field.fieldName];

                if (fieldValue) {
                    control = self.f[field.fieldName];

                    switch (field.fieldType) {
                        case TemplateFieldType.Date:
                            control.setValue(moment(fieldValue, 'YYYY-MM-DDT00:00').toDate());
                            break;
                        case TemplateFieldType.DateTime:
                            control.setValue(moment(fieldValue, 'YYYY-MM-DDTHH:mmZ').toDate());
                            break;
                        case TemplateFieldType.Time: {
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
                            break;
                        }
                        case TemplateFieldType.Multivalue:
                            control.setValue(fieldValue.split(','));
                            break;
                        default:
                            if (field.fieldControl === TemplateFieldControl.AutocompleteDynamic) {
                                control.setValue(new ComboboxItemDto({ value: fieldValue, label: data[field.fieldName + '_DESC'] }));
                            } else {
                                control.setValue(fieldValue.toString());
                            }
                    }
                }
            }
        }
    }

    setActivityData(data: ProcessToDoActivityForEditResponse): void {
        const self = this;

        self.f['ACT_Description'].setValue(data.description);
        self.f['ACT_Status'].setValue(data.status.toString());
        self.f['ACT_InitialPlannedDate'].setValue(data.initialPlannedDate ?
            self.dateTimeService.getDateToAssignInFormControl(data.initialPlannedDate) : null);
        self.f['ACT_FinalPlannedDate'].setValue(self.dateTimeService.getDateToAssignInFormControl(data.finalPlannedDate));
        self.f['ACT_InitialRealDate'].setValue(data.initialRealDate ?
            self.dateTimeService.getDateToAssignInFormControl(data.initialRealDate) : null);
        self.f['ACT_FinalRealDate'].setValue(data.finalRealDate ?
            self.dateTimeService.getDateToAssignInFormControl(data.finalRealDate) : null);
        self.f['ACT_Executor'].setValue(data.executor.map(p => new ComboboxItemDto({ value: p.user.toString(), label: p.userDesc })));
        self.f['ACT_Evaluator'].setValue(data.evaluator.map(p => new ComboboxItemDto({ value: p.user.toString(), label: p.userDesc })));
    }

    getFieldsData(): any {
        const self = this;
        const data = {};
        let fieldValue;

        for (const field of self.model.templateFields) {
            data[field.fieldName] = null;
            fieldValue = self.f[field.fieldName].value;

            if (fieldValue) {
                switch (field.fieldType) {
                    case TemplateFieldType.Date:
                        data[field.fieldName] = self.dateTimeService.getDateToSaveServer(fieldValue).utc().format('YYYY-MM-DD');
                        break;
                    case TemplateFieldType.DateTime:
                        data[field.fieldName] = self.dateTimeService.getDateTimeToSaveServer(fieldValue).utc().format('YYYY-MM-DD HH:mm');
                        break;
                    case TemplateFieldType.Time:
                        data[field.fieldName] = self.dateTimeService.getTimeToSaveServer(fieldValue).format('HH:mm');
                        break;
                    case TemplateFieldType.Multivalue:
                        data[field.fieldName] = fieldValue.join(',');
                        break;
                    default:
                        if (field.fieldControl === TemplateFieldControl.AutocompleteDynamic) {
                            data[field.fieldName] = fieldValue.value;
                        } else {
                            data[field.fieldName] = fieldValue;
                        }
                }
            }
        }

        return data;
    }

    getActivityData(): ProcessToDoActivityCommand {
        const self = this;

        return new ProcessToDoActivityCommand({
            description: self.f['ACT_Description'].value,
            status: self.f['ACT_Status'].value,
            initialPlannedDate: self.f['ACT_InitialPlannedDate'].value ?
                self.dateTimeService.getDateToSaveServer(self.f['ACT_InitialPlannedDate'].value) : null,
            finalPlannedDate: self.dateTimeService.getDateToSaveServer(self.f['ACT_FinalPlannedDate'].value),
            initialRealDate: self.f['ACT_InitialRealDate'].value ?
                self.dateTimeService.getDateToSaveServer(self.f['ACT_InitialRealDate'].value) : null,
            finalRealDate: self.f['ACT_FinalRealDate'].value ?
                self.dateTimeService.getDateToSaveServer(self.f['ACT_FinalRealDate'].value) : null,
            executor: self.f['ACT_Executor'].value.map(p => Number.parseInt(p.value, 10)),
            evaluator: self.f['ACT_Evaluator'].value.map(p => Number.parseInt(p.value, 10))
        });
    }

    activaModoNuevo(): void {
        const self = this;

        self.form.reset();
        // self.prepareForm(self.model.template, self.model.templateFields);
    }

    showChangeHistory(): void {
        const self = this;

        self.changeLogService.open(self.model.template.tableName, self.id);
    }

    configSecurity(): void {
        const self = this;

        const ref = self.dialogService.open(EditProcessSecurityComponent, {
            width: '70%',
            header: self.l('ProcessSecurity'),
            showHeader: true,
            closeOnEscape: true,
            dismissableMask: false,
            data: {
                template: self.templateId,
                parent: self.id
            }
        });
    }

    getControlSizeClass(fieldControl: TemplateFieldControl): string {
        if (fieldControl === TemplateFieldControl.CalendarBasic || fieldControl === TemplateFieldControl.CalendarTime
            || fieldControl === TemplateFieldControl.CalendarTimeOnly || fieldControl === TemplateFieldControl.Spinner
            || fieldControl === TemplateFieldControl.SpinnerFormatInput) {
            return 'p-lg-3';
        }

        return 'p-lg-10';
    }

    return(): void {
        const self = this;

        self.location.back();
    }
}
