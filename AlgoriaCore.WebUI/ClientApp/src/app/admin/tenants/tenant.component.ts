import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LazyLoadEvent, MenuItem } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { SelectUsersComponent } from 'src/shared/components/selectusers.component';
import { AppSettingsClient } from '../../../shared/AppSettingsClient';
import {
    TenantDeleteCommand,
    TenantExportCSVQuery,
    TenantExportPDFQuery,
    TenantExportQuery,
    TenantGetListQuery,
    TenantListResponse,
    TenantServiceProxy,
    UserListResponse
} from '../../../shared/service-proxies/service-proxies';
import { FileService } from '../../../shared/services/file.service';
import { SettingsClientService } from '../../../shared/services/settingsclient.service';
import { AppComponentBase, PagedTableSummary } from '../../app-component-base';
import { AppComponent } from '../../app.component';
import { AuthenticationService } from '../../_services/authentication.service';

@Component({
    templateUrl: './tenant.component.html',
    styleUrls: ['../../../assets/css-custom/p-datatable-general.scss']
})
export class TenantComponent extends AppComponentBase implements OnInit {

    @ViewChild('dt1', { static: false }) table;

    form: FormGroup;

    data: TenantListResponse[];
    pagedTableSummary: PagedTableSummary = new PagedTableSummary();

    cols: any[];
    selectedItem: any;
    items: MenuItem[];
    query: TenantGetListQuery = new TenantGetListQuery();

    browserStorageTableKey: string;
    browserStorageTableFilterKey = 'table-tenant-filters';

    permissions: any;

    AppSettingsClient = AppSettingsClient;
    exportMenuItems: MenuItem[];

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private router: Router,
        private tenantService: TenantServiceProxy,
        private authenticationService: AuthenticationService,
        private app: AppComponent,
        private fileService: FileService,
        private settingsClient: SettingsClientService
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
            create: self.permission.isGranted('Pages.Tenants.Create'),
            edit: self.permission.isGranted('Pages.Tenants.Edit'),
            delete: self.permission.isGranted('Pages.Tenants.Delete'),
            impersonalize: self.permission.isGranted('Pages.Tenants.Impersonation')
        };

        self.browserStorageTableKey = self.browserStorageService.calculateKey('table-tenant');

        // Asigno los filtro guardados en localStorage
        const filters: any = self.getFilters(self.browserStorageTableFilterKey);

        self.form = self.formBuilder.group({
            filterText: [filters.filter]
        });

        self.setColumns();
        self.setUpExportMenu();
    }

    setColumns(): void {
        const self = this;
        const settingViewConfig = self.settingsClient.getSetting(AppSettingsClient.ViewTenantsConfig);

        if (settingViewConfig) {
            self.cols = self.parseColumnsFromJSON(settingViewConfig);
        } else {
            self.cols = self.getDefaultColumns();
        }
    }

    getDefaultColumns(): any[] {
        const self = this;

        return [
            {
                field: 'id',
                header: self.l('Id'),
                width: '100px',
                isActive: true
            },
            {
                field: 'name',
                header: self.l('Tenants.NameColGrid'),
                isActive: true
            },
            {
                field: 'tenancyName',
                header: self.l('Tenants.TenancyNameColGrid'),
                isActive: true
            },
            {
                field: 'isActiveDesc',
                header: self.l('IsActive'),
                width: '100px',
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

    getTenants(): void {
        const self = this;

        self.query.filter = self.f.filterText.value;

        self.app.blocked = true;

        self.tenantService.getTenantsList(self.query)
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

        if (event.sortField) {
            self.query.sorting = event.sortField + ' ' + (event.sortOrder === 1 ? 'ASC' : 'DESC');
        } else {
            self.query.sorting = '';
        }

        self.getTenants();
    }

    createTenant(): void {
        this.router.navigate(['/app/admin/tenant/create']);
    }

    editTenant(id: number): void {
        this.router.navigate(['/app/admin/tenant/edit', id]);
    }

    impersonalize(tenant: number): void {
        const self = this;

        const ref = self.dialogService.open(SelectUsersComponent, {
            width: '70%',
            header: self.l('Impersonalize'),
            showHeader: true,
            closeOnEscape: true,
            dismissableMask: false,
            data: {
                tenant: tenant
            }
        });

        ref.onClose.subscribe((user: UserListResponse) => {
            if (user) {
                self.authenticationService.impersonalizeTenant(user.id, tenant);
            }
        });
    }

    deleteTenant(rowData: TenantListResponse): void {
        const self = this;

        self.alertService.confirmDelete(
            self.l('ConfirmationDeleteRecordWithNameMessage', rowData.name), self.l('Confirmation'),
            function () {
                const cmd = new TenantDeleteCommand();
                cmd.id = rowData.id;

                self.app.blocked = true;

                self.tenantService.deleteTenant(cmd)
                    .pipe(finalize(() => {
                        self.app.blocked = false;
                    }))
                    .subscribe(data => {
                        self.notify.success(self.l('RecordSoftDeleted'), self.l('Success'));
                        self.getTenants();
                    });
            }
        );
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
        const query = new TenantExportQuery();

        query.filter = self.f.filterText.value;
        query.viewColumnsConfigJSON = JSON.stringify(self.cols);
        query.isPaged = false;

        self.app.blocked = true;

        self.tenantService.exportTenant(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(file => {
                self.fileService.createAndDownloadBlobFileFromBase64(file.fileBase64, file.fileName);
            });
    }

    exportViewToCSV(): void {
        const self = this;
        const query = new TenantExportCSVQuery();

        query.filter = self.f.filterText.value;
        query.viewColumnsConfigJSON = JSON.stringify(self.cols);
        query.isPaged = false;

        self.app.blocked = true;

        self.tenantService.exportCSVTenant(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(file => {
                self.fileService.createAndDownloadBlobFileFromBase64(file.fileBase64, file.fileName);
            });
    }

    exportViewToPDF(): void {
        const self = this;
        const query = new TenantExportPDFQuery();

        query.filter = self.f.filterText.value;
        query.viewColumnsConfigJSON = JSON.stringify(self.cols);
        query.isPaged = false;

        self.app.blocked = true;

        self.tenantService.exportPDFTenant(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(file => {
                self.fileService.createAndDownloadBlobFileFromBase64(file.fileBase64, file.fileName);
            });
    }
}
