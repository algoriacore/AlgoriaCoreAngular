import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, LazyLoadEvent, MenuItem } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppComponentBase, PagedTableSummary } from 'src/app/app-component-base';
import { DateTimeService } from 'src/shared/services/datetime.service';
import { NumberFormatter } from 'src/shared/utils/numberformatter.class';
import { AppPermissions } from '../../../shared/AppPermissions';
import {
    ProcessDeleteCommand, ProcessGetListQuery, ProcessServiceProxy,
    ProcessViewType, SecurityMemberLevel, TemplateFieldGetListByTemplateQuery,
    TemplateFieldResponse, TemplateFieldType, TemplateResponse, TemplatesServiceProxy
} from '../../../shared/service-proxies/service-proxies';
import { AppComponent } from '../../app.component';
import { EditToDoTimeSheetComponent } from './activities/timesheets/edittodotimesheets.component';

@Component({
    templateUrl: './processes.component.html',
    styleUrls: ['../../../assets/css-custom/p-datatable-general.scss']
})
export class ProcessesComponent extends AppComponentBase implements OnInit {

    @ViewChild('dt1', { static: false }) table;

    form: FormGroup;

    data: any;
    pagedTableSummary: PagedTableSummary = new PagedTableSummary();

    templateId?: number = null;
    template = new TemplateResponse();
    templateFields: TemplateFieldResponse[];
    cols: any[];
    selectedItem: any;
    items: MenuItem[];
    loadingTemplate = false;
    loadingTemplateFields = false;
    query: ProcessGetListQuery = new ProcessGetListQuery();

    browserStorageTableKey: string;
    browserStorageTableFilterKey: string;

    TemplateFieldType = TemplateFieldType;

    permissions = { create: false, edit: false, delete: false };
    title = '';

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private service: ProcessServiceProxy,
        private serviceTemplate: TemplatesServiceProxy,
        private confirmationService: ConfirmationService,
        private dateTimeService: DateTimeService,
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

        const path = self.activatedRoute.snapshot.routeConfig.path;

        self.query.viewType = path.endsWith('/own') ? ProcessViewType.Own
            : path.endsWith('/ownpendings') ? ProcessViewType.OwnPendings
                : ProcessViewType.Normal;

        self.templateId = Number(self.activatedRoute.snapshot.params['template']);
        self.permissions.create = self.permission.isGranted(
            AppPermissions.calculatePermissionNameForProcess(AppPermissions.processesCreate, self.templateId, self.app.currentUser.tenantId)
        );
        self.permissions.edit = self.permission.isGranted(
            AppPermissions.calculatePermissionNameForProcess(AppPermissions.processesEdit, self.templateId, self.app.currentUser.tenantId)
        );
        self.permissions.delete = self.permission.isGranted(
            AppPermissions.calculatePermissionNameForProcess(AppPermissions.processesDelete, self.templateId, self.app.currentUser.tenantId)
        );

        self.browserStorageTableKey = self.browserStorageService.calculateKey('table-process_' + self.templateId);
        self.browserStorageTableFilterKey = 'table-process_' + self.templateId + '-filters';
        self.query.template = self.templateId;

        self.getTemplate(self.templateId);
        self.getTemplateFields(self.templateId);

        // Asigno los filtro guardados en localStorage
        const filters: any = self.getFilters(self.browserStorageTableFilterKey);

        self.form = self.formBuilder.group({
            filterText: [filters.filter]
        });
    }

    getTemplate(template: number): void {
        const self = this;

        self.loadingTemplate = true;

        self.serviceTemplate.getTemplate(template)
            .pipe(finalize(() => {
                self.loadingTemplate = false;
            }))
            .subscribe(data => {
                self.template = data;

                self.title = self.template.namePlural
                    + (self.query.viewType === ProcessViewType.Own ? ' (' + self.l('Processes.ViewType.Own') + ')'
                        : self.query.viewType === ProcessViewType.OwnPendings ? ' (' + self.l('Processes.ViewType.OwnPendings') + ')'
                            : '');

                self.initializeCols();
            });
    }

    getTemplateFields(template: number): void {
        const self = this;

        self.loadingTemplateFields = true;

        self.serviceTemplate.getTemplateFieldListByTemplate(new TemplateFieldGetListByTemplateQuery({
            template: template, onlyProcessed: true
        })).pipe(finalize(() => {
            self.loadingTemplateFields = false;
        }))
            .subscribe(data => {
                self.templateFields = data;

                self.initializeCols();
            });
    }

    calculateColumnWidth(field: TemplateFieldResponse): number {
        let width = 180;

        switch (field.fieldType) {
            case TemplateFieldType.Boolean:
            case TemplateFieldType.Time:
                width = 100;
                break;
            case TemplateFieldType.Date:
                width = 120;
                break;
            case TemplateFieldType.Integer:
            case TemplateFieldType.Decimal:
            case TemplateFieldType.DateTime:
                width = 150;
                break;
            case TemplateFieldType.GoogleAddress:
                width = 250;
                break;
            case TemplateFieldType.Multivalue:
                width = 300;
                break;
        }

        return width;
    }

    initializeCols(): void {
        const self = this;

        if (self.template && self.templateFields) {
            if (self.template.isActivity) {
                self.cols = [
                    { field: 'ACT_Description', header: this.l('Processes.Process.Activity.Description'), width: '200px' },
                    {
                        field: 'ACT_CreationTime',
                        header: this.l('Processes.Process.Activity.CreationTime'),
                        fieldType: TemplateFieldType.DateTime,
                        width: '150px'
                    },
                    {
                        field: 'ACT_FinalPlannedDate',
                        header: this.l('Processes.Process.Activity.FinalPlannedDate'),
                        fieldType: TemplateFieldType.Date,
                        width: '110px'
                    },
                    {
                        field: 'ACT_FinalRealDate',
                        header: this.l('Processes.Process.Activity.FinalRealDate'),
                        fieldType: TemplateFieldType.Date,
                        width: '110px'
                    },
                    {
                        field: 'ACT_Status_DESC',
                        header: this.l('Processes.Process.Activity.Status'),
                        width: '130px'
                    }
                ];
            } else {
                self.cols = [];
            }

            self.cols = self.cols.concat(self.templateFields.filter(p => p.showOnGrid).sort((f1, f2) => {
                if (f1.order > f2.order) {
                    return 1;
                }

                if (f1.order < f2.order) {
                    return -1;
                }

                return 0;
            }).map(p => ({
                field: p.fieldName + (p.fieldType === TemplateFieldType.Template || p.fieldType === TemplateFieldType.Boolean
                        || p.fieldType === TemplateFieldType.User
                        || p.mustHaveOptions ? '_DESC' : ''),
                header: p.name,
                fieldType: p.fieldType,
                fieldSize: p.fieldSize,
                width: self.calculateColumnWidth(p) + 'px'
            })));
        }
    }

    filterSearch(event: any): void {
        const self = this;

        event.preventDefault();

        self.browserStorageService.remove(self.browserStorageTableKey);
        self.query.pageNumber = 1;
        self.table.reset();
    }

    getList(): void {
        const self = this;

        self.query.filter = self.f.filterText.value;

        self.app.blocked = true;

        self.service.getProcessList(self.query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.data = data.items;

                // Calculate paged table summary
                self.pagedTableSummary = self.getPagedTableSummay(data.totalCount, self.query.pageNumber, self.query.pageSize);

                // Asigno filtros para que se queden guardados en localStorage
                self.browserStorageService.set(self.browserStorageTableFilterKey, self.query);
            });
    }

    loadData(event: LazyLoadEvent) {
        const self = this;

        self.query.pageNumber = 1 + (event.first / event.rows);
        self.query.pageSize = event.rows;
        self.query.sorting = event.sortField ? (event.sortField + ' ' + (event.sortOrder === 1 ? 'ASC' : 'DESC')) : 'Id DESC';

        self.getList();
    }

    create(): void {
        const self = this;

        self.router.navigate(['/app/processes', self.templateId, 'create']);
    }

    consult(id: number): void {
        const self = this;

        self.router.navigate(['/app/processes', self.templateId, 'consult', id]);
    }

    edit(id: number): void {
        const self = this;

        self.router.navigate(['/app/processes', self.templateId, 'edit', id]);
    }

    delete(id: number): void {
        const self = this;

        self.alertService.confirm(
            self.l('ConfirmationSoftDeleteRecordMessage'), self.l('Confirmation'),
            function () {
                self.app.blocked = true;

                self.service.deleteProcess(new ProcessDeleteCommand({ id: id, template: self.templateId }))
                    .pipe(finalize(() => {
                        self.app.blocked = false;
                    }))
                    .subscribe(data => {
                        self.notify.success(self.l('RecordDeletedSuccessful'), self.l('Success'));
                        self.getList();
                    });
            }
        );
    }

    createTimeSheet(activity: number): void {
        const self = this;

        const ref = self.dialogService.open(EditToDoTimeSheetComponent, {
            width: '50%',
            styleClass: 'd-sm d-md-75 d-lg-70',
            header: self.l('Processes.Process.ToDoTimeSheets.Register'),
            showHeader: true,
            closeOnEscape: true,
            dismissableMask: false,
            data: {
                template: self.template.id,
                activity: activity
            }
        });

        ref.onClose.subscribe((isSaved = false) => {
            if (isSaved) {
                self.getList();
            }
        });
    }

    createMenuItems(rowData: any): MenuItem[] {
        const self = this;

        const ll = [
            {
                tooltipOptions: {
                    tooltipLabel: self.l('Consult'),
                    tooltipPosition: 'top'
                },
                icon: 'pi pi-eye',
                queryParams: rowData,
                command: (event) => {
                    self.consult(event.item.queryParams.Id);
                }
            },
            {
                tooltipOptions: {
                    tooltipLabel: self.l('Processes.Process.ToDoTimeSheets.Register'),
                    tooltipPosition: 'top'
                },
                icon: 'fa fa-fw fa-clock-o',
                queryParams: rowData,
                command: (event) => {
                    self.createTimeSheet(event.item.queryParams['ACT_Id']);
                },
                permissionName: AppPermissions.calculatePermissionNameForProcess(
                    AppPermissions.processesTimeSheetCreate, self.template.id, self.app.currentUser.tenantId),
                visible: self.template.isActivity
            }
        ];

        return self.getGrantedMenuItems(ll);
    }

    transformColumnValueToDisplay(value: any, col: any): any {
        const self = this;
        let res = value;

        if (value) {
            const formatter = new NumberFormatter();

            switch (col.fieldType) {
                case TemplateFieldType.Integer:
                    res = formatter.format(value, 0);
                    break;
                case TemplateFieldType.Decimal:
                    res = formatter.format(value, col.fieldSize ? col.fieldSize : 2);
                    break;
                case TemplateFieldType.Date:
                    res = self.dateTimeService.getDateStringISOToFormat(value);
                    break;
                case TemplateFieldType.DateTime:
                    res = self.dateTimeService.getDateTimeStringISOToFormat(value);
                    break;
            }
        }

        return res;
    }

    canEdit(rowData: any): boolean {
        const self = this;

        return self.permissions.edit && (!self.template.hasSecurity || rowData.UserMaxSecutiryLevel === SecurityMemberLevel.Editor);
    }

    canDelete(rowData: any): boolean {
        const self = this;

        return self.permissions.delete && (!self.template.hasSecurity || rowData.UserMaxSecutiryLevel === SecurityMemberLevel.Editor);
    }
}

