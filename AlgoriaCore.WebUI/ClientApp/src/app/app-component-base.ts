import { Injector } from '@angular/core';
import { AppConsts } from 'src/shared/AppConsts';
import { AlertService } from '../shared/services/alert.service';
import { DialogCustomService } from '../shared/services/dialog.custom.service';
import { HelpOnScreenService } from '../shared/services/help.onscreen.service';
import { LocalizationService } from '../shared/services/localization.service';
import { NotifyService } from '../shared/services/notify.service';
import { BrowserStorageService } from '../shared/services/storage.service';
import { PermissionCheckerService } from './_services/permission.checker.service';

export class PagedTableSummary {
    totalRecords = 0;
    firstRecordInPage = 0;
    lastRecordInPage = 0;
}

export abstract class AppComponentBase {

    localization: LocalizationService;
    permission: PermissionCheckerService;
    dialogService: DialogCustomService;
    notify: NotifyService;
    alertService: AlertService;
    baseUrl: string;
    urlPictureProfile: string;
    appDatetimeControlsLocale: any = AppConsts.appDatetimeControlsLocale;
    browserStorageService: BrowserStorageService;
    helpOnScreenService: HelpOnScreenService;

    currentDateTime = new Date();

    constructor(injector: Injector) {
        this.localization = injector.get(LocalizationService);
        this.permission = injector.get(PermissionCheckerService);
        this.dialogService = injector.get(DialogCustomService);
        this.notify = injector.get(NotifyService);
        this.alertService = injector.get(AlertService);
        this.baseUrl = AppConsts.appBaseUrl;
        this.browserStorageService = injector.get(BrowserStorageService);
        this.helpOnScreenService = injector.get(HelpOnScreenService);
    }

    l(key: string, ...args: any[]): string {
        return this.localization.l(key, ...args);
    }

    replaceLabel(value: string): string {
        return this.localization.replaceLabel(value);
    }

    getBaseServiceUrl(): string {
        return AppConsts.remoteServiceBaseUrl;
    }

    getFilters(browserStorageTableFilterKey: string): any {
        if (!browserStorageTableFilterKey) {
            return {};
        }

        const self = this;

        const filters: any = self.browserStorageService.get(browserStorageTableFilterKey);

        return filters ? filters : {};
    }

    getPagedTableSummay(totalRecords: number, pageNumber: number, pageSize: number): PagedTableSummary {
        const pagedTableSummary: PagedTableSummary = new PagedTableSummary();

        pagedTableSummary.totalRecords = totalRecords;

        if (pagedTableSummary.totalRecords > 0) {
            pagedTableSummary.firstRecordInPage = (pageNumber - 1) * pageSize + 1;
            pagedTableSummary.lastRecordInPage = pagedTableSummary.firstRecordInPage + pageSize - 1;

            if (pagedTableSummary.lastRecordInPage > pagedTableSummary.totalRecords) {
                pagedTableSummary.lastRecordInPage = pagedTableSummary.totalRecords;
            }
        }

        return pagedTableSummary;
    }

    getGrantedMenuItems(items: any[]): any[] {
        const self = this;

        return items.filter(item => !item.permissionName || self.permission.isGranted(item.permissionName));
    }

    getHeaderTitleColumn(cols: any[], field: string): string {
        return cols.find(p => p.field === field).header;
    }

    isActiveColumn(cols: any[], field: string): boolean {
        return cols.some(p => p.field === field && p.isActive !== false);
    }

    parseColumnsFromJSON(json: string): any[] {
        const self = this;
        const cols = JSON.parse(json);

        for (const col of cols) {
            if (col.headerLanguageLabel) {
                col.header = self.l(col.headerLanguageLabel);
            }
        }

        return cols;
    }

    normalizeColumns(currentColumns: any[], defaultColumns: any[]): any[] {
        const existingCols = [];
        const newCols = defaultColumns.concat([]).filter(p => currentColumns.findIndex(q => q.field === p.field) < 0);

        for (const col of currentColumns) {
            const p = defaultColumns.find(q => q.field === col.field);

            if (p) {
                p.isActive = col.isActive === true;
                existingCols.push(p);
            }
        }

        return existingCols.concat(newCols);;
    }

    normalizeColumnsFromJSON(json: string, defaultColumns: any[]): any[] {
        const self = this;

        return self.normalizeColumns(self.parseColumnsFromJSON(json), defaultColumns);
    }

    downloadTempFile(file: any): void {
        const url = this.getBaseServiceUrl() + '/api/File/DownloadTempFile?fileType=' +
            file.fileType + '&fileToken=' + file.fileToken + '&fileName=' + file.fileName;

        window.open(url, '_blank');
    }
}
