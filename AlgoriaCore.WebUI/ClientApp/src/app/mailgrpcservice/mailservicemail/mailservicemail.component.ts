import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LazyLoadEvent, MenuItem } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppComponentBase, PagedTableSummary } from 'src/app/app-component-base';
import { AppComponent } from 'src/app/app.component';
import {
    MailServiceMailExportCSVQuery,
    MailServiceMailExportPDFQuery,
    MailServiceMailExportQuery,
    MailServiceMailGetListQuery,
    MailServiceMailListResponse,
    MailServiceMailServiceProxy,
    TenantGetListCompleterQuery,
    TenantListResponse,
    TenantServiceProxy
} from 'src/shared/service-proxies/service-proxies';
import { DateTimeService } from 'src/shared/services/datetime.service';
import { AppSettingsClient } from '../../../shared/AppSettingsClient';
import { FileService } from '../../../shared/services/file.service';
import { SettingsClientService } from '../../../shared/services/settingsclient.service';

@Component({
    templateUrl: './mailservicemail.component.html',
    styleUrls: ['../../../assets/css-custom/p-datatable-general.scss']
})

export class MailServiceMailComponent extends AppComponentBase implements OnInit {

    @ViewChild('dt1', { static: false }) table;

    form: FormGroup;

    data: MailServiceMailListResponse[];
    pagedTableSummary: PagedTableSummary = new PagedTableSummary();

    cols: any[];
    selectedItem: any;
    items: MenuItem[];
    query: MailServiceMailGetListQuery = new MailServiceMailGetListQuery();

    browserStorageTableKey: string;
    browserStorageTableFilterKey = 'table-mailservicemail-filters';
    permissions: any;

    isHost = false;
    filteredTenants: TenantListResponse[] = [];
    advancedFiltersAreShown = false;

    AppSettingsClient = AppSettingsClient;
    exportMenuItems: MenuItem[];

    constructor(
        injector: Injector,
        public app: AppComponent,
        private formBuilder: FormBuilder,
        private router: Router,
        private service: MailServiceMailServiceProxy,
        private dateTimeService: DateTimeService,
        private tenantService: TenantServiceProxy,
        private fileService: FileService,
        private settingsClient: SettingsClientService
    ) {
        super(injector);
    }

    get f() {
        return this.form.controls;
    }

    ngOnInit() {

        const self = this;

        self.permissions = {
            consult: self.permission.isGranted('Pages.Administration.MailServiceMail')
        };

        self.isHost = self.app.currentUser.tenantId == null;

        // eslint-disable-next-line max-len
        self.browserStorageTableKey = self.browserStorageService.calculateKey('table-mailservicemail'); self.helpOnScreenService.show('MAILSERVICEMAIL.MAILSERVICEMAIL.VIEW');

        const filters: any = self.getFilters(self.browserStorageTableFilterKey);

        self.form = self.formBuilder.group({
            filterText: [filters.filter],
            rangeDates: [],
            tenantId: [null],
            onlyHost: [self.isHost === true],
            filteredTenant: [{ value: null, disabled: true }]
        });

        self.setColumns();
        self.setUpExportMenu();

        self.query.pageSize = 10;
        self.query.sorting = 'id';
        self.query.pageNumber = 1;
    }

    setColumns(): void {
        const self = this;
        const settingViewConfig = self.settingsClient.getSetting(AppSettingsClient.ViewLogMailServicEmailConfig);

        if (settingViewConfig) {
            self.cols = self.normalizeColumnsFromJSON(settingViewConfig, self.getDefaultColumns());
        } else {
            self.cols = self.getDefaultColumns();
        }
    }

    getDefaultColumns(): any[] {
        const self = this;

        return [
            {
                field: 'status',
                header: self.l('MailServiceMailStatuss.MailServiceMailStatus'),
                width: '70px',
                isActive: true
            },
            {
                field: 'mailServiceRequestDate',
                header: self.l('MailServiceMails.MailServiceMail.MailServiceRequest'),
                isActive: true
            },
            {
                field: 'isLocalConfigDesc',
                header: self.l('MailServiceMails.MailServiceMail.IsLocalConfig'),
                isActive: true
            },
            {
                field: 'sendto',
                header: self.l('MailServiceMails.MailServiceMail.Sendto'),
                isActive: true
            },
            {
                field: 'copyTo',
                header: self.l('MailServiceMails.MailServiceMail.CopyTo'),
                isActive: true
            },
            {
                field: 'subject',
                header: self.l('MailServiceMails.MailServiceMail.Subject'),
                isActive: true
            }
        ];
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

        const startDate = self.f.rangeDates.value !== null &&
            self.f.rangeDates.value[0] !== null ? self.f.rangeDates.value[0] : self.dateTimeService.getCurrentDateTimeToDate();
        const endDate = self.f.rangeDates.value !== null && self.f.rangeDates.value[1] !== null ? self.f.rangeDates.value[1] : startDate;

        self.query.filter = self.f.filterText.value;
        self.query.startDate = self.dateTimeService.getDateTimeToSaveServer(startDate).startOf('day');
        self.query.endDate = self.dateTimeService.getDateTimeToSaveServer(endDate).endOf('day');
        self.query.onlyHost = self.f.onlyHost.value;
        self.query.tenantId = self.f.filteredTenant.value !== null ? self.f.filteredTenant.value.id : null;

        self.app.blocked = true;

        self.service.getMailServiceMailPagedList(self.query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.data = data.items;
                self.pagedTableSummary = self.getPagedTableSummay(data.totalCount, self.query.pageNumber, self.query.pageSize);
                self.browserStorageService.set(self.browserStorageTableFilterKey, self.query);
            });
    }

    loadData(event: LazyLoadEvent) {
        const self = this;

        if (event.sortField) {
            self.query.sorting = event.sortField + ' ' + (event.sortOrder === 1 ? 'ASC' : 'DESC');
        } else {
            self.query.sorting = '';
        }

        self.query.pageNumber = 1 + (event.first / event.rows);
        self.query.pageSize = event.rows;

        self.getList();
    }

    consult(id: number): void {
        this.router.navigate(['/app/mailgrpcservice/mailservicemail/edit', id]);
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

    configurateView(settingViewConfigName: string): void {
        const self = this;
        const callback = (response: any[]) => {
            if (response) {
                self.cols = response;
            }
        };

        self.app.configurateView(settingViewConfigName, self.getDefaultColumns(), callback);
    }

    // Export view

    setUpExportMenu(): void {
        const self = this;

        self.exportMenuItems = [
            {
                label: self.l('Views.Export.CSV'),
                icon: 'pi pi-file',
                command: () => {
                    self.exportViewToCSV();
                }
            },
            {
                label: self.l('Views.Export.Excel'),
                icon: 'pi pi-file-excel',
                command: () => {
                    self.exportView();
                }
            },
            {
                label: self.l('Views.Export.PDF'),
                icon: 'pi pi-file-pdf',
                command: () => {
                    self.exportViewToPDF();
                }
            }
        ];
    }

    exportView(): void {
        const self = this;
        const query = new MailServiceMailExportQuery();

        const startDate = self.f.rangeDates.value !== null &&
            self.f.rangeDates.value[0] !== null ? self.f.rangeDates.value[0] : self.dateTimeService.getCurrentDateTimeToDate();
        const endDate = self.f.rangeDates.value !== null && self.f.rangeDates.value[1] !== null ? self.f.rangeDates.value[1] : startDate;

        query.filter = self.f.filterText.value;
        query.startDate = self.dateTimeService.getDateTimeToSaveServer(startDate).startOf('day');
        query.endDate = self.dateTimeService.getDateTimeToSaveServer(endDate).endOf('day');
        query.onlyHost = self.f.onlyHost.value;
        query.tenantId = self.f.filteredTenant.value !== null ? self.f.filteredTenant.value.id : null;

        query.filter = self.f.filterText.value;
        query.viewColumnsConfigJSON = JSON.stringify(self.cols);
        query.isPaged = false;

        self.app.blocked = true;

        self.service.exportMailServiceMail(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(file => {
                self.fileService.createAndDownloadBlobFileFromBase64(file.fileBase64, file.fileName);
            });
    }

    exportViewToCSV(): void {
        const self = this;
        const query = new MailServiceMailExportCSVQuery();

        const startDate = self.f.rangeDates.value !== null &&
            self.f.rangeDates.value[0] !== null ? self.f.rangeDates.value[0] : self.dateTimeService.getCurrentDateTimeToDate();
        const endDate = self.f.rangeDates.value !== null && self.f.rangeDates.value[1] !== null ? self.f.rangeDates.value[1] : startDate;

        query.filter = self.f.filterText.value;
        query.startDate = self.dateTimeService.getDateTimeToSaveServer(startDate).startOf('day');
        query.endDate = self.dateTimeService.getDateTimeToSaveServer(endDate).endOf('day');
        query.onlyHost = self.f.onlyHost.value;
        query.tenantId = self.f.filteredTenant.value !== null ? self.f.filteredTenant.value.id : null;

        query.filter = self.f.filterText.value;
        query.viewColumnsConfigJSON = JSON.stringify(self.cols);
        query.isPaged = false;

        self.app.blocked = true;

        self.service.exportCSVMailServiceMail(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(file => {
                self.fileService.createAndDownloadBlobFileFromBase64(file.fileBase64, file.fileName);
            });
    }

    exportViewToPDF(): void {
        const self = this;
        const query = new MailServiceMailExportPDFQuery();

        const startDate = self.f.rangeDates.value !== null &&
            self.f.rangeDates.value[0] !== null ? self.f.rangeDates.value[0] : self.dateTimeService.getCurrentDateTimeToDate();
        const endDate = self.f.rangeDates.value !== null && self.f.rangeDates.value[1] !== null ? self.f.rangeDates.value[1] : startDate;

        query.filter = self.f.filterText.value;
        query.startDate = self.dateTimeService.getDateTimeToSaveServer(startDate).startOf('day');
        query.endDate = self.dateTimeService.getDateTimeToSaveServer(endDate).endOf('day');
        query.onlyHost = self.f.onlyHost.value;
        query.tenantId = self.f.filteredTenant.value !== null ? self.f.filteredTenant.value.id : null;

        query.filter = self.f.filterText.value;
        query.viewColumnsConfigJSON = JSON.stringify(self.cols);
        query.isPaged = false;

        self.app.blocked = true;

        self.service.exportPDFMailServiceMail(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(file => {
                self.fileService.createAndDownloadBlobFileFromBase64(file.fileBase64, file.fileName);
            });
    }
}

