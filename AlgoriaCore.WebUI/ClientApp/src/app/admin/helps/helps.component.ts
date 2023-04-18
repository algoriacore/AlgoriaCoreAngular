import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LazyLoadEvent, MenuItem } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppComponentBase, PagedTableSummary } from 'src/app/app-component-base';
import { AppSettingsClient } from '../../../shared/AppSettingsClient';
import {
    HelpExportCSVQuery,
    HelpExportPDFQuery,
    HelpExportQuery,
    HelpForListResponse,
    HelpGetListQuery,
    HelpServiceProxy
} from '../../../shared/service-proxies/service-proxies';
import { FileService } from '../../../shared/services/file.service';
import { SettingsClientService } from '../../../shared/services/settingsclient.service';
import { AppComponent } from '../../app.component';

@Component({
    templateUrl: './helps.component.html',
    styleUrls: ['../../../assets/css-custom/p-datatable-general.scss']
})
export class HelpsComponent extends AppComponentBase implements OnInit {

    @ViewChild('dt1', { static: false }) table;

    form: FormGroup;

    data: HelpForListResponse[];
    pagedTableSummary: PagedTableSummary = new PagedTableSummary();

    cols: any[];
    selectedItem: any;
    items: MenuItem[];
    query: HelpGetListQuery = new HelpGetListQuery();

    browserStorageTableKey: string;
    browserStorageTableFilterKey = 'table-help-filters';

    permissions: any;

    AppSettingsClient = AppSettingsClient;
    exportMenuItems: MenuItem[];

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private router: Router,
        private service: HelpServiceProxy,
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
            create: self.permission.isGranted('Pages.Administration.Helps.Create'),
            edit: self.permission.isGranted('Pages.Administration.Helps.Edit'),
            delete: self.permission.isGranted('Pages.Administration.Helps.Delete')
        };

        self.browserStorageTableKey = self.browserStorageService.calculateKey('table-help');

        // Asigno los filtro guardados en localStorage
        const filters: any = self.getFilters(self.browserStorageTableFilterKey);

        self.form = self.formBuilder.group({
            filterText: [filters.filter]
        });

        self.setColumns();
        self.setUpExportMenu();

        self.query.pageSize = 10;
        self.query.sorting = 'id';
        self.query.pageNumber = 1;
    }

    setColumns(): void {
        const self = this;
        const settingViewConfig = self.settingsClient.getSetting(AppSettingsClient.ViewHelpsConfig);

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
                field: 'languageDesc',
                header: self.l('Helps.Help.Language'),
                headerLanguageLabel: 'Helps.Help.Language',
                isActive: true
            },
            {
                field: 'key',
                header: self.l('Helps.Help.Key'),
                headerLanguageLabel: 'Helps.Help.Key',
                isActive: true
            },
            {
                field: 'displayName',
                header: self.l('Roles.DisplayNameColGrid'),
                headerLanguageLabel: 'Roles.DisplayNameColGrid',
                isActive: true
            },
            {
                field: 'isActiveDesc',
                header: self.l('IsActive'),
                headerLanguageLabel: 'IsActive',
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

        self.service.getHelpList(self.query)
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
        this.router.navigate(['/app/admin/helps/create']);
    }

    edit(id: number): void {
        this.router.navigate(['/app/admin/helps/edit', id]);
    }

    delete(id: number): void {
        const self = this;

        self.alertService.confirm(self.l('ConfirmationSoftDeleteRecordMessage'), self.l('Confirmation'),
            function (res) {
                if (res === true) {
                    self.app.blocked = true;

                    self.service.deleteHelp(id)
                        .pipe(finalize(() => {
                            self.app.blocked = false;
                        }))
                        .subscribe(data => {
                            self.notify.success(self.l('RecordDeletedSuccessful'), self.l('Success'));
                            self.getList();
                        });
                }
            });
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
        const query = new HelpExportQuery();

        query.filter = self.f.filterText.value;
        query.viewColumnsConfigJSON = JSON.stringify(self.cols);
        query.isPaged = false;

        self.app.blocked = true;

        self.service.exportHelp(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(file => {
                self.fileService.createAndDownloadBlobFileFromBase64(file.fileBase64, file.fileName);
            });
    }

    exportViewToCSV(): void {
        const self = this;
        const query = new HelpExportCSVQuery();

        query.filter = self.f.filterText.value;
        query.viewColumnsConfigJSON = JSON.stringify(self.cols);
        query.isPaged = false;

        self.app.blocked = true;

        self.service.exportCSVHelp(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(file => {
                self.fileService.createAndDownloadBlobFileFromBase64(file.fileBase64, file.fileName);
            });
    }

    exportViewToPDF(): void {
        const self = this;
        const query = new HelpExportPDFQuery();

        query.filter = self.f.filterText.value;
        query.viewColumnsConfigJSON = JSON.stringify(self.cols);
        query.isPaged = false;

        self.app.blocked = true;

        self.service.exportPDFHelp(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(file => {
                self.fileService.createAndDownloadBlobFileFromBase64(file.fileBase64, file.fileName);
            });
    }
}
