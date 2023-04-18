import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LazyLoadEvent, MenuItem } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppSettingsClient } from '../../../shared/AppSettingsClient';
import {
    UserDeleteCommand,
    UserExportCSVQuery,
    UserExportPDFQuery,
    UserExportQuery,
    UserGetListQuery,
    UserListResponse,
    UserServiceProxy
} from '../../../shared/service-proxies/service-proxies';
import { FileService } from '../../../shared/services/file.service';
import { SettingsClientService } from '../../../shared/services/settingsclient.service';
import { AppComponentBase, PagedTableSummary } from '../../app-component-base';
import { AppComponent } from '../../app.component';
import { AuthenticationService } from '../../_services/authentication.service';

@Component({
    templateUrl: './user.component.html',
    styleUrls: ['../../../assets/css-custom/p-datatable-general.scss']
})
export class UsersComponent extends AppComponentBase implements OnInit {

    @ViewChild('dt1', { static: false }) table;

    form: FormGroup;

    data: UserListResponse[];
    pagedTableSummary: PagedTableSummary = new PagedTableSummary();

    cols: any[];
    selectedItem: any;
    items: MenuItem[];
    query: UserGetListQuery = new UserGetListQuery();

    browserStorageTableKey: string;
    browserStorageTableFilterKey = 'table-user-filters';

    permissions: any;

    AppSettingsClient = AppSettingsClient;

    exportMenuItems: MenuItem[];

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private router: Router,
        private userService: UserServiceProxy,
        private authenticationService: AuthenticationService,
        private app: AppComponent,
        private settingsClient: SettingsClientService,
        private fileService: FileService
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
            create: self.permission.isGranted('Pages.Administration.Users.Create'),
            edit: self.permission.isGranted('Pages.Administration.Users.Edit'),
            delete: self.permission.isGranted('Pages.Administration.Users.Delete'),
            block: self.permission.isGranted('Pages.Administration.Users.Edit'),
            impersonalize: self.permission.isGranted('Pages.Administration.Users.Impersonation')
        };

        self.browserStorageTableKey = self.browserStorageService.calculateKey('table-user');

        // Asigno los filtro guardados en localStorage
        const filters: any = self.getFilters(self.browserStorageTableFilterKey);

        self.form = self.formBuilder.group({
            filterText: [filters.filter]
        });

        self.setColumns();

        self.query.pageSize = 10;
        self.query.sorting = 'Id';
        self.query.pageNumber = 1;

        self.setUpExportMenu();
    }

    setColumns(): void {
        const self = this;
        const settingViewConfig = self.settingsClient.getSetting(AppSettingsClient.ViewUsersConfig);

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
                headerLanguageLabel: 'Id',
                width: '100px',
                isActive: true
            },
            {
                field: 'login',
                header: self.l('Users.UserNameColGrid'),
                headerLanguageLabel: 'Users.UserNameColGrid',
                isActive: true
            },
            {
                field: 'fullName',
                header: self.l('Users.NameColGrid'),
                headerLanguageLabel: 'Users.NameColGrid',
                isActive: true
            },
            {
                field: 'emailAddress',
                header: self.l('Users.EmailAddressColGrid'),
                headerLanguageLabel: 'Users.EmailAddressColGrid',
                isActive: true
            },
            {
                field: 'isActiveDesc',
                header: self.l('IsActive'),
                headerLanguageLabel: 'IsActive',
                width: '100px',
                isActive: true
            },
            {
                field: 'userLockedDesc',
                header: self.l('Users.Locked'),
                headerLanguageLabel: 'Users.Locked',
                width: '120px',
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

        self.userService.getUserList(self.query)
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
        this.router.navigate(['/app/admin/users/create']);
    }

    edit(id: number): void {
        this.router.navigate(['/app/admin/users/edit', id]);
    }

    impersonalizeUser(id: number): void {
        const self = this;

        self.authenticationService.impersonalizeUser(id);
    }

    unlockUser(rowData: UserListResponse): void {
        const self = this;

        self.alertService.confirmCustom({
            type: 'confirm',
            message: self.l('Users.ConfirmationUnlockedMessage', rowData.fullName),
            header: self.l('Confirmation'),
            accept: function (res) {
                if (res === true) {
                    self.app.blocked = true;

                    self.userService.unlockUser(rowData.id)
                        .pipe(finalize(() => {
                            self.app.blocked = false;
                        }))
                        .subscribe(data => {
                            self.notify.success(self.l('Users.UserSuccessfullyUnlocked'), self.l('Success'));
                            self.getList();
                        });
                }
            },
            cancelTitle: this.localization.l('Cancel'),
            acceptTitle: this.localization.l('Unlock'),
            colorStyle: 'warning'
        });
    }

    lockUser(rowData: UserListResponse): void {
        const self = this;

        self.alertService.confirmCustom({
            type: 'confirm',
            message: self.l('Users.ConfirmationLockedMessage', rowData.fullName),
            header: self.l('Confirmation'),
            accept: function (res) {
                if (res === true) {
                    self.app.blocked = true;

                    self.userService.lockUser(rowData.id)
                        .pipe(finalize(() => {
                            self.app.blocked = false;
                        }))
                        .subscribe(data => {
                            self.notify.success(self.l('Users.UserSuccessfullyLocked'), self.l('Success'));
                            self.getList();
                        });
                }
            },
            cancelTitle: this.localization.l('Cancel'),
            acceptTitle: this.localization.l('Lock'),
            colorStyle: 'warning'
        });
    }

    delete(rowData: UserListResponse): void {
        const self = this;

        self.alertService.confirmDelete(
            self.l('ConfirmationDeleteRecordWithNameMessage', rowData.fullName), self.l('Confirmation'),
            function (res) {
                if (res === true) {
                    const cmd = new UserDeleteCommand();

                    cmd.id = rowData.id;
                    self.app.blocked = true;

                    self.userService.deleteUser(cmd)
                        .pipe(finalize(() => {
                            self.app.blocked = false;
                        }))
                        .subscribe(data => {
                            self.notify.success(self.l('RecordSoftDeleted'), self.l('Success'));
                            self.getList();
                        });
                }
            }
        );
    }

    createMenuItems(rowData: any): MenuItem[] {
        const self = this;
        const ll = [];

        if (self.permission.isGranted('Pages.Administration.Users.Impersonation') &&
            self.authenticationService.currentUserValue.userId !== rowData.id) {
            ll.push({
                tooltipOptions: {
                    tooltipLabel: self.l('Impersonalize'),
                    tooltipPosition: 'top'
                },
                icon: 'pi pi-users',
                queryParams: rowData,
                command: (event) => {
                    self.impersonalizeUser(event.item.queryParams.id);
                },
                permissionName: 'Pages.Administration.Users.Impersonation'
            });
        }

        if (rowData.userLocked) {
            ll.push({
                tooltipOptions: {
                    tooltipLabel: self.l('Unlock'),
                    tooltipPosition: 'top'
                },
                icon: 'pi pi-unlock',
                queryParams: rowData,
                command: (event) => {
                    self.unlockUser(event.item.queryParams);
                },
                permissionName: 'Pages.Administration.Users.Edit'
            });
        } else {
            ll.push({
                tooltipOptions: {
                    tooltipLabel: self.l('Lock'),
                    tooltipPosition: 'top'
                },
                icon: 'pi pi-lock',
                queryParams: rowData,
                command: (event) => {
                    self.lockUser(event.item.queryParams);
                },
                permissionName: 'Pages.Administration.Users.Edit'
            });
        }

        return self.getGrantedMenuItems(ll);
    }

    configurateView(settingViewConfigName: string): void {
        const self = this;
        const callback = (response: any[]) => {
            if (response) {
                self.cols = response;
            }
        };

        self.app.configurateView(settingViewConfigName, self.cols, callback);
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
        const query = new UserExportQuery();

        query.filter = self.f.filterText.value;
        query.viewColumnsConfigJSON = JSON.stringify(self.cols);
        query.isPaged = false;

        self.app.blocked = true;

        self.userService.exportUser(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(file => {
                self.fileService.createAndDownloadBlobFileFromBase64(file.fileBase64, file.fileName);
            });
    }

    exportViewToCSV(): void {
        const self = this;
        const query = new UserExportCSVQuery();

        query.filter = self.f.filterText.value;
        query.viewColumnsConfigJSON = JSON.stringify(self.cols);
        query.isPaged = false;

        self.app.blocked = true;

        self.userService.exportCSVUser(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(file => {
                self.fileService.createAndDownloadBlobFileFromBase64(file.fileBase64, file.fileName);
            });
    }

    exportViewToPDF(): void {
        const self = this;
        const query = new UserExportPDFQuery();

        query.filter = self.f.filterText.value;
        query.viewColumnsConfigJSON = JSON.stringify(self.cols);
        query.isPaged = false;

        self.app.blocked = true;

        self.userService.exportPDFUser(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(file => {
                self.fileService.createAndDownloadBlobFileFromBase64(file.fileBase64, file.fileName);
            });
    }
}
