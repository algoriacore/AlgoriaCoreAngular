import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LazyLoadEvent } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import {
    AuditLogGetExcelQuery,
    AuditLogGetListQuery,
    AuditLogListResponse,
    AuditLogServiceProxy,
    ComboboxItemDto,
    TenantGetListCompleterQuery,
    TenantListResponse,
    TenantServiceProxy
} from '../../../shared/service-proxies/service-proxies';
import { DateTimeService } from '../../../shared/services/datetime.service';
import { AppComponentBase, PagedTableSummary } from '../../app-component-base';
import { AppComponent } from '../../app.component';
import { AuditLogsDetailComponent } from './auditlogsdetail.component';

@Component({
    templateUrl: './auditlogs.component.html',
    styleUrls: ['../../../assets/css-custom/p-datatable-general.scss']
})
export class AuditLogsComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    data: AuditLogListResponse[];
    pagedTableSummary: PagedTableSummary = new PagedTableSummary();

    advancedFiltersAreShown = false;
    loading: boolean;
    cols: any[];
    selectedItem: any;
    query: AuditLogGetListQuery = new AuditLogGetListQuery();
    errorStateList: ComboboxItemDto[] = [];

    tableFirstRecord = 0;

    isHost = false;
    filteredTenants: TenantListResponse[] = [];

    constructor(
        injector: Injector,
        public app: AppComponent,
        private formBuilder: FormBuilder,
        private router: Router,
        private auditLogService: AuditLogServiceProxy,
        private dateTimeService: DateTimeService,
        private tenantService: TenantServiceProxy
    ) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;
    }

    ngOnInit() {
        const self = this;

        self.isHost = self.app.currentUser.tenantId === null;

        self.form = self.formBuilder.group({
            filterText: [null],
            rangeDates: [],
            userName: [null],
            serviceName: [null],
            methodName: [null],
            browser: [null],
            severity: [''],
            minExecutionDuration: [0],
            maxExecutionDuration: [86400000],
            tenantId: [null],
            onlyHost: [self.isHost === true],
            filteredTenant: [{ value: null, disabled: true }]
        });

        self.cols = [
            {
                field: 'executionTime', header: self.l('AuditLogs.ExecutionTimeColGrid'), width: '160px', sorting: true, visible: true,
                getDataValue: (rowData: AuditLogListResponse) =>
                    self.dateTimeService.getDateTimeToDisplay(rowData.executionTime, 'YYYY-MM-DD HH:mm:ss')
            },
            {
                field: 'executionDuration',
                header: self.l('AuditLogs.ExecutionDurationColGrid'),
                width: '90px',
                sorting: true,
                visible: true
            },
            {
                field: 'serviceName',
                header: self.l('AuditLogs.ServiceColGrid'),
                width: '300px',
                sorting: false,
                visible: true
            },
            { field: 'tenantName', header: self.l('AuditLogs.TenantColGrid'), width: '250px', sorting: false, visible: self.isHost },
            { field: 'userName', header: self.l('AuditLogs.UserNameColGrid'), width: '150px', sorting: true, visible: true },
            {
                field: 'clientIpAddress',
                header: self.l('AuditLogs.ClientIpAddressColGrid'),
                width: '150px',
                sorting: false,
                visible: true
            },
            { field: 'clientName', header: self.l('AuditLogs.ClientNameColGrid'), width: '150px', sorting: false, visible: true },
            { field: 'browserInfo', header: self.l('AuditLogs.BrowserColGrid'), width: '900px', sorting: false, visible: true }
        ];

        const jsonErrorStateList = [];

        jsonErrorStateList.push({ value: null, label: self.l('AuditLogs.All') });
        jsonErrorStateList.push({ value: 0, label: self.l('LogLevelTrace') });
        jsonErrorStateList.push({ value: 1, label: self.l('LogLevelDebug') });
        jsonErrorStateList.push({ value: 2, label: self.l('LogLevelInformation') });
        jsonErrorStateList.push({ value: 3, label: self.l('LogLevelWarning') });
        jsonErrorStateList.push({ value: 4, label: self.l('LogLevelError') });
        jsonErrorStateList.push({ value: 5, label: self.l('LogLevelCritical') });
        self.errorStateList = jsonErrorStateList;

        self.f.rangeDates.setValue([self.dateTimeService.getCurrentDateTimeToDate(), self.dateTimeService.getCurrentDateTimeToDate()]);

        self.query.minExecutionDuration = self.f.minExecutionDuration.value;
        self.query.maxExecutionDuration = self.f.maxExecutionDuration.value;
        self.query.startDate = self.dateTimeService.getDateTimeToSaveServer(self.f.rangeDates.value[0]).startOf('day');
        self.query.endDate = self.dateTimeService.getDateTimeToSaveServer(self.f.rangeDates.value[1]).endOf('day');
        self.query.pageSize = 10;
        self.query.sorting = 'executionTime';
        self.query.pageNumber = 1;
    }

    filterSearch(): void {
        const self = this;

        self.getAuditLogs();
    }

    getAuditLogs(): void {
        const self = this;

        const startDate = self.f.rangeDates.value !== null &&
            self.f.rangeDates.value[0] !== null ? self.f.rangeDates.value[0] : self.dateTimeService.getCurrentDateTimeToDate();
        const endDate = self.f.rangeDates.value !== null && self.f.rangeDates.value[1] !== null ? self.f.rangeDates.value[1] : startDate;

        self.query.filter = self.f.filterText.value;
        self.query.startDate = self.dateTimeService.getDateTimeToSaveServer(startDate).startOf('day');
        self.query.endDate = self.dateTimeService.getDateTimeToSaveServer(endDate).endOf('day');
        self.query.userName = self.f.userName.value;
        self.query.serviceName = self.f.serviceName.value;
        self.query.minExecutionDuration = self.f.minExecutionDuration.value;
        self.query.maxExecutionDuration = self.f.maxExecutionDuration.value;
        self.query.methodName = self.f.methodName.value;
        self.query.severity = self.f.severity.value;
        self.query.browserInfo = self.f.browser.value;
        self.query.onlyHost = self.f.onlyHost.value;
        self.query.tenantId = self.f.filteredTenant.value !== null ? self.f.filteredTenant.value.id : null;

        self.app.blocked = true;

        self.auditLogService.getAuditLogList(self.query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.data = data.items;

                // Calculate paged table summary
                self.pagedTableSummary = self.getPagedTableSummay(data.totalCount, self.query.pageNumber, self.query.pageSize);
            });
    }

    loadData(event: LazyLoadEvent) {
        const self = this;

        self.tableFirstRecord = event.first;
        self.query.pageNumber = 1 + (event.first / event.rows);
        self.query.pageSize = event.rows;

        if (event.sortField) {
            self.query.sorting = event.sortField + ' ' + (event.sortOrder === 1 ? 'ASC' : 'DESC');
        } else {
            self.query.sorting = '';
        }

        self.getAuditLogs();
    }

    showDetails(record: AuditLogListResponse): void {
        const self = this;

        self.dialogService.open(AuditLogsDetailComponent, {
            styleClass: 'd-xl-70 d-lg-70 d-md-75 d-sm',
            showHeader: true,
            dismissableMask: false,
            data: record,
            header: self.l('AuditLogDetail')
        });
    }

    exportToExcel(): void {
        const self = this;

        const query = new AuditLogGetExcelQuery();
        const startDate = self.f.rangeDates.value !== null &&
            self.f.rangeDates.value[0] !== null ? self.f.rangeDates.value[0] : self.dateTimeService.getCurrentDateTimeToDate();
        const endDate = self.f.rangeDates.value !== null && self.f.rangeDates.value[1] !== null ? self.f.rangeDates.value[1] : startDate;

        query.startDate = self.dateTimeService.getDateTimeToSaveServer(startDate).startOf('day');
        query.endDate = self.dateTimeService.getDateTimeToSaveServer(endDate).endOf('day');
        query.userName = self.f.userName.value;
        query.serviceName = self.f.serviceName.value;
        query.minExecutionDuration = self.f.minExecutionDuration.value;
        query.maxExecutionDuration = self.f.maxExecutionDuration.value;
        query.methodName = self.f.methodName.value;
        query.severity = self.f.severity.value;
        query.browserInfo = self.f.browser.value;
        query.sorting = self.query.sorting;
        query.onlyHost = self.f.onlyHost.value;
        query.tenantId = self.f.filteredTenant.value !== null ? self.f.filteredTenant.value.id : null;

        self.loading = true;
        self.auditLogService.getAuditLogsToExcel(query)
            .pipe(finalize(() => {
                self.loading = false;
            }))
            .subscribe(file => {
                self.downloadTempFile(file);
            });
    }

    downloadTempFile(file: any): void {
        const url = this.getBaseServiceUrl() + '/api/File/DownloadTempFile?fileType=' + file.fileType +
            '&fileToken=' + file.fileToken + '&fileName=' + file.fileName;

        window.open(url, '_blank');
    }

    filterTenant(event): void {
        const self = this;
        const query = event.query;
        const cmd = new TenantGetListCompleterQuery();

        cmd.filter = query;

        self.tenantService.getTenantsListCompleter(cmd)
            .subscribe(data => {
                self.filteredTenants = data;
            });
    }

    onClickOnlyHost(): void {
        const self = this;

        if (self.f.onlyHost.value) {
            self.f.filteredTenant.disable();
            self.f.filteredTenant.setValue(null);
        } else {
            self.f.filteredTenant.enable();
        }
    }
}
