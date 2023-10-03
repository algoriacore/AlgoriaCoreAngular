import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LazyLoadEvent, MenuItem } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppSettingsClient } from '../../../shared/AppSettingsClient';
import {
    RoleDeleteCommand,
    RoleExportCSVQuery,
    RoleExportPDFQuery,
    RoleExportQuery,
    RoleForListResponse,
    RoleGetListQuery,
    RoleServiceProxy
} from '../../../shared/service-proxies/service-proxies';
import { FileService } from '../../../shared/services/file.service';
import { SettingsClientService } from '../../../shared/services/settingsclient.service';
import { AppComponentBase, PagedTableSummary } from '../../app-component-base';
import { AppComponent } from '../../app.component';
import { ChangeLogService } from '../../_services/changelog.service';

@Component({
    templateUrl: './roles.component.html',
    styleUrls: ['../../../assets/css-custom/p-datatable-general.scss']
})
export class RolesComponent extends AppComponentBase implements OnInit {

    @ViewChild('dt1', { static: false }) table;

    form: FormGroup;

    data: RoleForListResponse[];
    pagedTableSummary: PagedTableSummary = new PagedTableSummary();

    cols: any[];
    selectedItem: any;
    items: MenuItem[];
    query: RoleGetListQuery = new RoleGetListQuery();

    browserStorageTableKey: string;
    browserStorageTableFilterKey = 'table-role-filters';

    permissions: any;

    AppSettingsClient = AppSettingsClient;
    exportMenuItems: MenuItem[];

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private router: Router,
        private roleService: RoleServiceProxy,
        private changeLogService: ChangeLogService,
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
            create: self.permission.isGranted('Pages.Administration.Roles.Create'),
            edit: self.permission.isGranted('Pages.Administration.Roles.Edit'),
            delete: self.permission.isGranted('Pages.Administration.Roles.Delete')
        };

        self.browserStorageTableKey = self.browserStorageService.calculateKey('table-role');

        // Asigno los filtro guardados en localStorage
        const filters: any = self.getFilters(self.browserStorageTableFilterKey);

        self.form = self.formBuilder.group({
            filterText: [filters.filter]
        });

        self.setColumns();
        self.setUpExportMenu();

        self.query.pageSize = 10;
        self.query.sorting = 'Id';
        self.query.pageNumber = 1;
    }

    setColumns(): void {
        const self = this;
        const settingViewConfig = self.settingsClient.getSetting(AppSettingsClient.ViewRolesConfig);

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
                field: 'id',
                header: self.l('Id'),
                width: '100px',
                isActive: true
            },
            {
                field: 'name',
                header: self.l('Roles.NameColGrid'),
                isActive: true
            },
            {
                field: 'displayName',
                header: self.l('Roles.DisplayNameColGrid'),
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

    getList(): void {
        const self = this;

        self.query.filter = self.f.filterText.value;

        self.app.blocked = true;

        self.roleService.getRoleList(self.query)
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

        self.getList();
    }

    create(): void {
        this.router.navigate(['/app/admin/roles/create']);
    }

    edit(id: number): void {
        this.router.navigate(['/app/admin/roles/edit', id]);
    }

    delete(rowData: RoleForListResponse): void {
        const self = this;

        self.alertService.confirmDelete(
            self.l('ConfirmationDeleteRecordWithNameMessage', rowData.displayName), self.l('Confirmation'),
            function () {
                const cmd = new RoleDeleteCommand();

                cmd.id = rowData.id;

                self.app.blocked = true;

                self.roleService.deleteRole(cmd)
                    .pipe(finalize(() => {
                        self.app.blocked = false;
                    }))
                    .subscribe(data => {
                        self.notify.success(self.l('RecordSoftDeleted'), self.l('Success'));
                        self.getList();
                    });
            }
        );
    }

    showChangeHistory(id: number): void {
        const self = this;

        self.changeLogService.open('Role', id);
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
        const query = new RoleExportQuery();

        query.filter = self.f.filterText.value;
        query.viewColumnsConfigJSON = JSON.stringify(self.cols);
        query.isPaged = false;

        self.app.blocked = true;

        self.roleService.exportRole(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(file => {
                self.fileService.createAndDownloadBlobFileFromBase64(file.fileBase64, file.fileName);
            });
    }

    exportViewToCSV(): void {
        const self = this;
        const query = new RoleExportCSVQuery();

        query.filter = self.f.filterText.value;
        query.viewColumnsConfigJSON = JSON.stringify(self.cols);
        query.isPaged = false;

        self.app.blocked = true;

        self.roleService.exportCSVRole(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(file => {
                self.fileService.createAndDownloadBlobFileFromBase64(file.fileBase64, file.fileName);
            });
    }

    exportViewToPDF(): void {
        const self = this;
        const query = new RoleExportPDFQuery();

        query.filter = self.f.filterText.value;
        query.viewColumnsConfigJSON = JSON.stringify(self.cols);
        query.isPaged = false;

        self.app.blocked = true;

        self.roleService.exportPDFRole(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(file => {
                self.fileService.createAndDownloadBlobFileFromBase64(file.fileBase64, file.fileName);
            });
    }
}
