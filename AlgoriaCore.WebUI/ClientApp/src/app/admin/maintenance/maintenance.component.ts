import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { finalize } from 'rxjs/operators';
import {
    WebLogDownloadZipQuery,
    WebLogGetLastestQuery,
    WebLogServiceProxy
} from '../../../shared/service-proxies/service-proxies';
import { AppComponentBase } from '../../app-component-base';
import { AppComponent } from '../../app.component';

@Component({
    templateUrl: './maintenance.component.html',
    styleUrls: ['./maintenance.component.less']
})
export class MaintenanceComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    selectedItem: any;
    logs: any = '';

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private webLogService: WebLogServiceProxy,
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

        self.form = self.formBuilder.group({
            filterText: ['']
        });

        self.getCaches();
        self.getWebLogs();
    }

    clearAllCaches(): void {}

    getCaches(): void {}

    getWebLogs(): void {
        const self = this;

        self.app.blocked = true;

        self.webLogService.getLatestWebLogs(new WebLogGetLastestQuery())
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.logs = data.latesWebLogLines;
            });
    }

    downloadWebLogs(): void {
        const self = this;

        self.app.blocked = true;

        self.webLogService.downloadWebLogs(new WebLogDownloadZipQuery())
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(file => {
                self.downloadTempFile(file);
            });
    }

    downloadTempFile(file: any): void {
        const url = this.getBaseServiceUrl() + '/api/File/DownloadTempFile?fileType=' +
            file.fileType + '&fileToken=' + file.fileToken + '&fileName=' + file.fileName;
        // location.href = url; //TODO: This causes reapp.blocked of same page in Firefox
        window.open(url, '_blank');
    }

    getLogClass(log: string): string {
        const classes = {
            trace: 'badge badge-trace',
            debug: 'badge badge-debug',
            info: 'badge badge-info',
            warn: 'badge badge-warning',
            error: 'badge badge-error',
            fatal: 'badge badge-critical'
        };

        if (log.indexOf('TRACE') === 0) {
            return classes.trace;
        }

        if (log.indexOf('DEBUG') === 0) {
            return classes.debug;
        }

        if (log.indexOf('INFO') === 0) {
            return classes.info;
        }

        if (log.indexOf('WARN') === 0) {
            return classes.warn;
        }

        if (log.indexOf('ERROR') === 0) {
            return classes.error;
        }

        if (log.indexOf('FATAL') === 0) {
            return classes.fatal;
        }

        return '';
    }

    getLogType(log: string): string {

        if (log.indexOf('TRACE') === 0) {
            return 'TRACE';
        }

        if (log.indexOf('DEBUG') === 0) {
            return 'DEBUG';
        }

        if (log.indexOf('INFO') === 0) {
            return 'INFO';
        }

        if (log.indexOf('WARN') === 0) {
            return 'WARN';
        }

        if (log.indexOf('ERROR') === 0) {
            return 'ERROR';
        }

        if (log.indexOf('FATAL') === 0) {
            return 'FATAL';
        }

        return '';
    }

    getRawLogContent(log: string): string {
        return _.escape(log)
            .replace('TRACE', '')
            .replace('DEBUG', '')
            .replace('INFO', '')
            .replace('WARN', '')
            .replace('ERROR', '')
            .replace('FATAL', '');
    }
}
