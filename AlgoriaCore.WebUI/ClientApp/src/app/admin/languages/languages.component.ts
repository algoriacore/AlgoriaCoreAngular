import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LazyLoadEvent, MenuItem } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppComponentBase, PagedTableSummary } from 'src/app/app-component-base';
import { AppSettingsClient } from '../../../shared/AppSettingsClient';
import {
    LanguageExportCSVQuery,
    LanguageExportPDFQuery,
    LanguageExportQuery,
    LanguageForListResponse,
    LanguageGetListQuery,
    LanguageInfoResponse,
    LanguageServiceProxy
} from '../../../shared/service-proxies/service-proxies';
import { FileService } from '../../../shared/services/file.service';
import { SettingsClientService } from '../../../shared/services/settingsclient.service';
import { AppComponent } from '../../app.component';

@Component({
    templateUrl: './languages.component.html',
    styleUrls: ['../../../assets/css-custom/p-datatable-general.scss']
})
export class LanguagesComponent extends AppComponentBase implements OnInit {

    @ViewChild('dt1', { static: false }) table;

    form: FormGroup;

    data: LanguageForListResponse[];
    pagedTableSummary: PagedTableSummary = new PagedTableSummary();

    cols: any[];
    selectedItem: any;
    items: MenuItem[];
    query: LanguageGetListQuery = new LanguageGetListQuery();

    browserStorageTableKey: string;
    browserStorageTableFilterKey = 'table-language-filters';

    defaultLanguage: LanguageInfoResponse = null;
    permissions: any;

    AppSettingsClient = AppSettingsClient;
    exportMenuItems: MenuItem[];

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private router: Router,
        private service: LanguageServiceProxy,
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
            create: self.permission.isGranted('Pages.Administration.Languages.Create'),
            edit: self.permission.isGranted('Pages.Administration.Languages.Edit'),
            delete: self.permission.isGranted('Pages.Administration.Languages.Delete')
        };

        self.browserStorageTableKey = self.browserStorageService.calculateKey('table-language');
        self.defaultLanguage = self.localization.defaultLanguage;

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
        const settingViewConfig = self.settingsClient.getSetting(AppSettingsClient.ViewLanguagesConfig);

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
                header: self.l('Languages.Language.Name'),
                isActive: true
            },
            {
                field: 'displayName',
                header: self.l('Languages.Language.DisplayName'),
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

        self.service.getLanguageList(self.query)
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

        if (event.sortField) {
            self.query.sorting = event.sortField + ' ' + (event.sortOrder === 1 ? 'ASC' : 'DESC');
        } else {
            self.query.sorting = '';
        }

        self.query.pageNumber = 1 + (event.first / event.rows);
        self.query.pageSize = event.rows;
        self.getList();
    }

    create(): void {
        this.router.navigate(['/app/admin/languages/create']);
    }

    edit(id: number): void {
        this.router.navigate(['/app/admin/languages/edit', id]);
    }

    delete(rowData: LanguageForListResponse): void {
        const self = this;

        self.alertService.confirmDelete(self.l('ConfirmationDeleteRecordWithNameMessage', rowData.displayName), self.l('Confirmation'),
            function () {
                self.app.blocked = true;

                self.service.deleteLanguage(rowData.id)
                    .pipe(finalize(() => {
                        self.app.blocked = false;
                    }))
                    .subscribe(data => {
                        self.notify.success(self.l('SavedSuccessfully'), self.l('Confirmation'));
                        self.getList();
                    });
            });
    }

    changeTexts(id: number): void {
        this.router.navigate(['/app/admin/languages/texts', id]);
    }

    setAsDefaultLanguage(rowData: LanguageForListResponse): void {
        const self = this;

        self.alertService.confirmCustom({
            type: 'confirm',
            message: self.l('Languages.ConfirmationDefaultLanguageMessage', rowData.displayName),
            header: self.l('Confirmation'),
            accept: function () {
                self.app.blocked = true;

                self.service.setLanguageDefault(rowData.id)
                    .pipe(finalize(() => {
                        self.app.blocked = false;
                    }))
                    .subscribe(data => {
                        self.notify.success(self.l('SavedSuccessfully'), self.l('Success'));
                        self.localization.defaultLanguage = new LanguageInfoResponse({
                            name: rowData.name, displayName: rowData.displayName
                        });
                        self.defaultLanguage = self.localization.defaultLanguage;
                        self.getList();
                    });
            },
            cancelTitle: this.localization.l('Cancel'),
            acceptTitle: this.localization.l('Accept'),
            colorStyle: 'warning'
        });
    }

    createMenuItems(rowData: any): MenuItem[] {
        const self = this;

        const ll = [
            {
                tooltipOptions: {
                    tooltipLabel: self.l('Languages.ChangeTexts'),
                    tooltipPosition: 'top'
                },
                icon: 'fa fa-fw fa-edit',
                queryParams: rowData,
                command: (event) => {
                    self.changeTexts(event.item.queryParams.id);
                },
                permissionName: 'Pages.Administration.Languages.ChangeTexts'
            }
        ];

        return self.getGrantedMenuItems(ll);
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
        const query = new LanguageExportQuery();

        query.filter = self.f.filterText.value;
        query.viewColumnsConfigJSON = JSON.stringify(self.cols);
        query.isPaged = false;

        self.app.blocked = true;

        self.service.exportLanguage(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(file => {
                self.fileService.createAndDownloadBlobFileFromBase64(file.fileBase64, file.fileName);
            });
    }

    exportViewToCSV(): void {
        const self = this;
        const query = new LanguageExportCSVQuery();

        query.filter = self.f.filterText.value;
        query.viewColumnsConfigJSON = JSON.stringify(self.cols);
        query.isPaged = false;

        self.app.blocked = true;

        self.service.exportCSVLanguage(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(file => {
                self.fileService.createAndDownloadBlobFileFromBase64(file.fileBase64, file.fileName);
            });
    }

    exportViewToPDF(): void {
        const self = this;
        const query = new LanguageExportPDFQuery();

        query.filter = self.f.filterText.value;
        query.viewColumnsConfigJSON = JSON.stringify(self.cols);
        query.isPaged = false;

        self.app.blocked = true;

        self.service.exportPDFLanguage(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(file => {
                self.fileService.createAndDownloadBlobFileFromBase64(file.fileBase64, file.fileName);
            });
    }
}
