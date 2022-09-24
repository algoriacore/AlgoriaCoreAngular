import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FileUpload } from 'primeng/fileupload';
import { finalize, first } from 'rxjs/operators';
import { AppComponentBase, PagedTableSummary } from 'src/app/app-component-base';
import { ChangeLogService } from 'src/app/_services/changelog.service';
import { FormService } from 'src/shared/services/form.service';
import {
    FileServiceProxy,
    TemplateCreateCommand,
    TemplateFieldForListResponse,
    TemplateForEditResponse,
    TemplateGetForEditQuery,
    TemplatesServiceProxy,
    TemplateUpdateCommand,
    TemplateSectionGetListQuery,
    TemplateSectionForListResponse,
    TemplateFieldGetListQuery,
    TemplateFieldStatus,
    TemplateToDoStatusForListResponse,
    TemplateToDoStatusGetListQuery
} from '../../../shared/service-proxies/service-proxies';
import { EditTemplateFieldsComponent } from './fields/edittemplatefields.component';
import { EditTemplateSectionsComponent } from './sections/edittemplatesections.component';
import { Menu } from 'primeng/menu';
import { MenuItem, ConfirmationService, LazyLoadEvent } from 'primeng/api';
import { EditTemplateToDoStatusComponent } from './todostatus/edittemplatetodostatus.component';
import { EditTemplateSecurityComponent } from './security/edittemplatesecurity.component';
import { AppComponent } from '../../app.component';

@Component({
    templateUrl: './edittemplates.component.html',
    styleUrls: ['../../../assets/css-custom/p-datatable-general.scss']
})
export class EditTemplatesComponent extends AppComponentBase implements OnInit {

    @ViewChild('fileUpload', { static: false }) fileUpload: FileUpload;
    @ViewChild('menuToDoStatus', { static: false }) btnMenuToDoStatus: Menu;
    @ViewChild('dtUsers', { static: false }) tableToDoStatus;
    @ViewChild('sectionMenu', { static: false }) btnSectionMenu: Menu;
    @ViewChild('fieldMenu', { static: false }) btnFieldMenu: Menu;

    form: FormGroup;

    id?: number = null;
    model: TemplateForEditResponse = new TemplateForEditResponse();
    fieldLabels: any = {};

    permissions: any;
    tempFileName: string;
    urlIcon: string;

    isRegenerateTable = false;

    // ACTIVTY SECTION

    toDoStatusList: TemplateToDoStatusForListResponse[];
    pagedTableSummaryToDoStatus: PagedTableSummary = new PagedTableSummary();
    colsToDoStatus: any[];
    selectedItemToDoStatus: any;
    queryToDoStatus: TemplateToDoStatusGetListQuery = new TemplateToDoStatusGetListQuery();
    itemsToDoStatus: MenuItem[];

    // FIELDS SECTION
    waitForSections = false;
    waitForFields = false;
    templateSections: TemplateSectionForListResponse[] = [];
    templateFields: TemplateFieldForListResponse[] = [];
    templateFieldsData: TemplateFieldForListResponse[] = [];
    templateFieldsDataGrouped: any;
    templateFieldsPagedTableSummary: PagedTableSummary = new PagedTableSummary();
    templateFieldsCols: any[];
    sectionItems: MenuItem[];
    fieldItems: MenuItem[];

    constructor(
        private formBuilder: FormBuilder,
        injector: Injector,
        private router: Router,
        private service: TemplatesServiceProxy,
        private activatedRoute: ActivatedRoute,
        private fileService: FileServiceProxy,
        private formService: FormService,
        private changeLogService: ChangeLogService,
        private confirmationService: ConfirmationService,
        private app: AppComponent
    ) {
        super(injector);
    }

    // convenience getter for easy access to form fields

    get f() {
        return this.form.controls;
    }

    ngOnInit() {
        const self = this;

        self.permissions = {
            create: self.permission.isGranted('Pages.Processes.Templates.Create'),
            edit: self.permission.isGranted('Pages.Processes.Templates.Edit')
        };

        if (self.activatedRoute.snapshot.url.length > 1 && self.activatedRoute.snapshot.url[1].path === 'edit') {
            self.id = self.activatedRoute.snapshot.params['id'] ? Number(self.activatedRoute.snapshot.params['id']) : null;
        }

        self.prepareLabels();
        self.prepareForm();

        if (self.id) {
            self.getForEdit(self.id);

            self.colsToDoStatus = [
                { field: 'typeDesc', header: this.l('TemplateToDoStatus.TemplateToDoStatus.Type') },
                { field: 'name', header: this.l('TemplateToDoStatus.TemplateToDoStatus.Name') },
                { field: 'isDefaultDesc', header: this.l('TemplateToDoStatus.TemplateToDoStatus.IsDefault') },
                { field: 'isActiveDesc', header: this.l('IsActive') }
            ];

            self.templateFieldsCols = [
                { field: 'name', header: this.l('TemplateFields.TemplateField.Name') },
                { field: 'fieldName', header: this.l('TemplateFields.TemplateField.FieldName') },
                { field: 'fieldTypeDesc', header: this.l('TemplateFields.TemplateField.Type') },
                { field: 'fieldControlDesc', header: this.l('TemplateFields.TemplateField.Control') },
                {
                    field: 'inputMask',
                    header: this.l('TemplateFields.TemplateField.InputMask') + ' / ' + this.l('TemplateFields.TemplateField.KeyFilter')
                },
                {
                    field: 'isRequiredDesc',
                    header: this.l('TemplateFields.TemplateField.IsRequired') + ' / ' + this.l('TemplateFields.TemplateField.ShowOnGrid')
                },
                { field: 'statusDesc', header: this.l('TemplateFields.TemplateField.Status') },
            ];

            self.getSectionsAndFields(self.id);
        }
    }

    prepareLabels() {
        const self = this;

        self.fieldLabels = {
            nameSingular: self.l('Templates.Template.NameSingular'),
            tableName: self.l('Templates.Template.TableName'),
            namePlural: self.l('Templates.Template.NamePlural'),
            description: self.l('Templates.Template.Description'),
            hasChatRoom: self.l('Templates.Template.HasChatRoom'),
            isActivity: self.l('Templates.Template.IsActivity'),
            hasSecurity: self.l('Templates.Template.HasSecurity'),
            color: self.l('Templates.Template.RGBColor'),
            icon: self.l('Templates.Template.Icon')
        };
    }

    prepareForm() {
        const self = this;

        self.form = self.formBuilder.group({
            nameSingular: [null, [Validators.required, Validators.maxLength(20)]],
            namePlural: [null, [Validators.required, Validators.maxLength(22)]],
            description: [null, [Validators.required, Validators.maxLength(1000)]],
            color: ['#FFFFFF', [Validators.required, Validators.maxLength(7)]],
            hasChatRoom: [false],
            isActivity: [false],
            hasSecurity: [false],
            isActive: [true]
        });
    }

    getForEdit(id: number): void {
        const self = this;

        self.app.blocked = true;

        self.service.getTemplateForEdit(new TemplateGetForEditQuery({ id: id }))
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.model = data;

                self.f.nameSingular.setValue(self.model.nameSingular);
                self.f.namePlural.setValue(self.model.namePlural);
                self.f.description.setValue(self.model.description);
                self.f.color.setValue('#' + self.model.rgbColor);
                self.f.hasChatRoom.setValue(data.hasChatRoom);
                self.f.isActivity.setValue(data.isActivity);
                self.f.hasSecurity.setValue(data.hasSecurity);
                self.f.isActive.setValue(data.isActive);

                if (data.icon) {
                    self.updateLocalIconImage(data.icon);
                }
            });
    }

    activateNewMode(): void {
        const self = this;

        self.prepareForm();

        // focus
    }

    showChangeHistory(): void {
        const self = this;

        self.changeLogService.open('Template', self.id);
    }

    colorToSave(color: string) {
        return color.substring(1, 7);
    }

    save(): void {
        const self = this;

        // stop here if form is invalid
        if (self.form.invalid) {
            self.formService.showErrors(self.form, self.fieldLabels);
            return;
        }

        self.app.blocked = true;

        if (self.id) {
            const updateCmd = new TemplateUpdateCommand();
            updateCmd.id = self.model.id;
            updateCmd.nameSingular = self.f.nameSingular.value;
            updateCmd.namePlural = self.f.namePlural.value;
            updateCmd.description = self.f.description.value;
            updateCmd.rgbColor = self.colorToSave(self.f.color.value);
            updateCmd.hasChatRoom = self.f.hasChatRoom.value;
            updateCmd.isActivity = self.f.isActivity.value;
            updateCmd.hasSecurity = self.f.hasSecurity.value;
            updateCmd.isActive = self.f.isActive.value;
            updateCmd.iconName = self.tempFileName;

            self.service.updateTemplate(updateCmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('Templates.Template.SuccessfulUpdate'), self.l('Success'));
                    self.return();
                });
        } else {
            const createCmd = new TemplateCreateCommand();
            createCmd.nameSingular = self.f.nameSingular.value;
            createCmd.namePlural = self.f.namePlural.value;
            createCmd.description = self.f.description.value;
            createCmd.rgbColor = self.colorToSave(self.f.color.value);
            createCmd.hasChatRoom = self.f.hasChatRoom.value;
            createCmd.isActivity = self.f.isActivity.value;
            createCmd.hasSecurity = self.f.hasSecurity.value;
            createCmd.isActive = self.f.isActive.value;
            createCmd.iconName = self.tempFileName;

            self.service.createTemplate(createCmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('Templates.Template.SuccessfulCreate'), self.l('Success'));

                    if (self.permissions.edit) {
                        self.router.navigate(['/app/processes/templates/edit', data]);
                    } else {
                        self.activateNewMode();
                    }
                });
        }
    }

    myUploader(event): void {
        const self = this;

        if (event.files.length === 0) {
            return;
        }

        const fileToUpload = event.files[0];

        const input = {
            data: fileToUpload,
            fileName: fileToUpload.name
        };

        self.fileService.uploadTemp(input)
            .pipe(finalize(() => { }))
            .subscribe(data => {
                self.fileUpload.clear();
                self.tempFileName = data.tempFileName;
                self.updateImgTemp(data.tempFileName);
            });
    }

    updateImgTemp(fileName): void {
        const self = this;

        self.urlIcon = self.getBaseServiceUrl() + '/api/File/GetFileTemp?tempFileName=' + fileName;
    }

    updateLocalIconImage(UUID: string): void {
        const self = this;

        self.urlIcon = self.getBaseServiceUrl() + '/api/File/GetFile?uuid=' + UUID + '&v' + (new Date().getTime());
    }

    return(): void {
        this.router.navigate(['/app/processes/templates']);
    }

    // ACTIVITY STATUS

    getToDoStatusList(): void {
        const self = this;

        self.queryToDoStatus.template = self.id;
        self.app.blocked = true;

        self.service.getTemplateToDoStatusList(self.queryToDoStatus)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.toDoStatusList = data.items;

                // Calculate paged table summary
                self.pagedTableSummaryToDoStatus = self.getPagedTableSummay(
                    data.totalCount,
                    self.queryToDoStatus.pageNumber,
                    self.queryToDoStatus.pageSize);
            });
    }

    loadDataToDoStatus(event: LazyLoadEvent) {
        const self = this;

        self.queryToDoStatus.sorting = event.sortField ? (event.sortField + ' ' + (event.sortOrder === 1 ? 'ASC' : 'DESC')) : '';
        self.queryToDoStatus.pageNumber = 1 + (event.first / event.rows);
        self.queryToDoStatus.pageSize = event.rows;

        self.getToDoStatusList();
    }

    createToDoStatus(): void {
        const self = this;

        const ref = self.dialogService.open(EditTemplateToDoStatusComponent, {
            width: '50%',
            header: self.l('TemplateToDoStatus.TemplateToDoStatus'),
            showHeader: true,
            closeOnEscape: true,
            dismissableMask: false,
            data: {
                template: self.id
            }
        });

        ref.onClose.subscribe((obj) => {
            if (obj) {
                self.getToDoStatusList();
            }
        });
    }

    editToDoStatus(id: number): void {
        const self = this;

        const ref = self.dialogService.open(EditTemplateToDoStatusComponent, {
            width: '50%',
            header: self.l('TemplateToDoStatus.TemplateToDoStatus'),
            showHeader: true,
            closeOnEscape: true,
            dismissableMask: false,
            data: {
                id: id
            }
        });

        ref.onClose.subscribe((obj) => {
            if (obj) {
                self.getToDoStatusList();
            }
        });
    }

    deleteToDoStatus(id: number): void {
        const self = this;

        self.alertService.confirm(self.l('ConfirmationSoftDeleteRecordMessage'), self.l('Confirmation'),
            function () {
                self.app.blocked = true;
                self.service.deleteTemplateToDoStatus(id)
                    .pipe(finalize(() => {
                        self.app.blocked = false;
                    }))
                    .subscribe(data => {
                        self.notify.success(self.l('RecordDeletedSuccessful'), self.l('Success'));
                        self.getToDoStatusList();
                    });
            });
    }

    createAndShowMenuToDoStatus(event: any, rowData: any): void {
        const self = this;

        self.itemsToDoStatus = self.createMenuItemsToDoStatus(rowData);

        self.btnMenuToDoStatus.toggle(event);
    }

    createMenuItemsToDoStatus(rowData: any): MenuItem[] {
        const self = this;

        const ll = [
            {
                label: this.l('Edit'),
                icon: 'fa fa-fw fa-edit',
                queryParams: rowData,
                command: (event) => {
                    self.editToDoStatus(event.item.queryParams.id);
                }
            },
            {
                label: this.l('Delete'),
                icon: 'pi pi-fw pi-times',
                queryParams: rowData,
                command: (event) => {
                    self.deleteToDoStatus(event.item.queryParams.id);
                }
            }
        ];

        return self.getGrantedMenuItems(ll);
    }

    // SECTIONS AND FIELDS

    getSectionsAndFields(template: number): void {
        const self = this;

        self.app.blocked = true;
        self.waitForSections = true;

        self.service.getTemplateSectionList(new TemplateSectionGetListQuery({ template: template, isPaged: false }))
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.templateSections = data.items;
                self.waitForSections = false;
                self.mergeSectionsAndFields();
            });

        self.app.blocked = true;
        self.waitForFields = true;

        self.service.getTemplateFieldList(new TemplateFieldGetListQuery({ template: template, isPaged: false, onlyProcessed: false }))
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.isRegenerateTable = data.items.some(p => p.status !== TemplateFieldStatus.Processed);
                self.templateFields = data.items;
                self.waitForFields = false;
                self.mergeSectionsAndFields();
            });
    }

    mergeSectionsAndFields(): void {
        const self = this;

        if (!(self.waitForSections || self.waitForFields)) {
            self.templateFieldsData = [];
            let sectionFields: TemplateFieldForListResponse[] = [];
            let sectionField: TemplateFieldForListResponse;

            self.templateSections.sort(function (a, b) {
                return a.order - b.order;
            });

            for (const section of self.templateSections) {
                sectionFields = self.templateFields.filter(p => p.templateSection === section.id);

                if (sectionFields.length > 0) {
                    sectionFields = sectionFields.sort(function (a, b) {
                        return a.order - b.order;
                    });
                    self.templateFieldsData = self.templateFieldsData.concat(sectionFields);
                } else {
                    sectionField = new TemplateFieldForListResponse();
                    sectionField.templateSection = section.id;
                    sectionField.templateSectionDesc = section.name;
                    sectionField.templateSectionIconAF = section.iconAF;
                    sectionField.templateSectionOrder = section.order;

                    self.templateFieldsData.push(sectionField);
                }
            }

            self.updateRowGroupMetaData();
        }
    }

    updateRowGroupMetaData() {
        this.templateFieldsDataGrouped = {};

        if (this.templateFieldsData) {
            for (let i = 0; i < this.templateFieldsData.length; i++) {
                const rowData = this.templateFieldsData[i];
                const templateSection = rowData.templateSection;

                if (i === 0) {
                    this.templateFieldsDataGrouped[templateSection] = { index: 0, size: 1 };
                } else {
                    const previousRowData = this.templateFieldsData[i - 1];
                    const previousRowGroup = previousRowData.templateSection;

                    if (templateSection === previousRowGroup) {
                        this.templateFieldsDataGrouped[templateSection].size++;
                    } else {
                        this.templateFieldsDataGrouped[templateSection] = { index: i, size: 1 };
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
                label: this.l('TemplateFields.TemplateField.Add'),
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
                    self.sectionEdit(event.item.queryParams.templateSection);
                }
            },
            {
                label: this.l('Delete'),
                icon: 'pi pi-fw pi-times',
                queryParams: rowData,
                command: (event) => {
                    self.sectionDelete(event.item.queryParams.templateSection);
                }
            }
        ];

        return self.getGrantedMenuItems(ll);
    }

    sectionCreate(): void {
        const self = this;

        const ref = self.dialogService.open(EditTemplateSectionsComponent, {
            width: '50%',
            header: self.l('TemplateSections.TemplateSection'),
            showHeader: true,
            closeOnEscape: false,
            closable: false,
            dismissableMask: false,
            data: {
                template: self.id
            }
        });

        ref.onClose.subscribe((obj) => {
            if (obj) {
                self.getSectionsAndFields(self.id);
            }
        });
    }

    sectionEdit(id: number): void {
        const self = this;

        const ref = self.dialogService.open(EditTemplateSectionsComponent, {
            width: '50%',
            header: self.l('TemplateSections.TemplateSection'),
            showHeader: true,
            closeOnEscape: false,
            closable: false,
            dismissableMask: false,
            data: {
                id: id
            }
        });

        ref.onClose.subscribe((obj) => {
            if (obj) {
                self.getSectionsAndFields(self.id);
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
                self.app.blocked = true;
                self.service.deleteTemplateSection(id)
                    .pipe(finalize(() => {
                        self.app.blocked = false;
                    }))
                    .subscribe(data => {
                        self.notify.success(self.l('RecordDeletedSuccessful'), self.l('Success'));
                        self.getSectionsAndFields(self.id);
                    });
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
                    self.fieldEdit(event.item.queryParams.id);
                }
            },
            {
                label: this.l('Delete'),
                icon: 'pi pi-fw pi-times',
                queryParams: rowData,
                command: (event) => {
                    self.fieldDelete(event.item.queryParams.id);
                }
            }
        ];

        return self.getGrantedMenuItems(ll);
    }

    fieldCreate(record: TemplateFieldForListResponse): void {
        const self = this;

        const ref = self.dialogService.open(EditTemplateFieldsComponent, {
            width: '50%',
            styleClass: 'dialog-sm dialog-md',
            header: self.l('TemplateFields.TemplateField'),
            showHeader: true,
            closeOnEscape: false,
            closable: false,
            dismissableMask: false,
            data: {
                template: self.id,
                templateSection: record.templateSection,
                templateSectionDesc: record.templateSectionDesc
            }
        });

        ref.onClose.subscribe((obj) => {
            if (obj) {
                self.getSectionsAndFields(self.id);
            }
        });
    }

    fieldEdit(id: number): void {
        const self = this;

        const ref = self.dialogService.open(EditTemplateFieldsComponent, {
            width: '50%',
            styleClass: 'd-sm d-md d-lg-70',
            header: self.l('TemplateFields.TemplateField'),
            showHeader: true,
            closeOnEscape: false,
            closable: false,
            dismissableMask: false,
            data: {
                id: id,
                template: self.id
            }
        });

        ref.onClose.subscribe((obj) => {
            if (obj) {
                self.getSectionsAndFields(self.id);
            }
        });
    }

    onCloseModalTemplateField(obj): void {
        const self = this;

        if (obj) {
            self.getSectionsAndFields(self.id);
        }
    }

    fieldDelete(id: number): void {
        const self = this;

        self.confirmationService.confirm({
            header: self.l('Confirmation'),
            icon: 'pi pi-exclamation-triangle',
            message: self.l('ConfirmationSoftDeleteRecordMessage'),
            acceptLabel: self.l('Yes'),
            rejectLabel: self.l('No'),
            accept: () => {
                self.app.blocked = true;
                self.service.deleteTemplateField(id)
                    .pipe(finalize(() => {
                        self.app.blocked = false;
                    }))
                    .subscribe(data => {
                        self.notify.success(self.l('RecordDeletedSuccessful'), self.l('Success'));
                        self.getSectionsAndFields(self.id);
                    });
            }
        });
    }

    generate(): void {
        const self = this;

        self.confirmationService.confirm({
            header: self.l('Confirmation'),
            icon: 'pi pi-exclamation-triangle',
            message: self.l('Templates.Template.GenerateTableConfirmation'),
            acceptLabel: self.l('Yes'),
            rejectLabel: self.l('No'),
            accept: () => {
                self.app.blocked = true;
                self.service.generateDbTable(self.id)
                    .pipe(finalize(() => {
                        self.app.blocked = false;
                    }))
                    .subscribe(data => {
                        self.notify.success(self.l('Templates.Template.SuccessfulGeneratedTable'), self.l('Success'));
                        self.return();
                    });
            }
        });
    }

    configSecurity(): void {
        const self = this;

        const ref = self.dialogService.open(EditTemplateSecurityComponent, {
            width: '70%',
            header: self.l('TemplateSecurity'),
            showHeader: true,
            closeOnEscape: false,
            closable: false,
            dismissableMask: false,
            data: {
                template: self.id
            }
        });
    }
}
