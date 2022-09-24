import { Injectable, Compiler } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConsts } from '../AppConsts';
import { BrowserStorageService } from './storage.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class VersionCheckService {
    public versionChanged: Observable<boolean>;

    private newVersion: string;
    private versionChangedSubject: BehaviorSubject<boolean>;

    constructor(private http: HttpClient, private compiler: Compiler, private browserStorageService: BrowserStorageService) {
        this.versionChangedSubject = new BehaviorSubject<boolean>(false);
        this.versionChanged = this.versionChangedSubject.asObservable();
    }

    /**
     * Checks in every set frequency the version of frontend application
     * @param url
     * @param {number} frequency - in minutes
     */
    public initVersionCheck(frequency = AppConsts.frequencyCheckVersion) {
        if (!frequency) {
            frequency = 30;
        }

        setInterval(() => {
            this.checkVersion();
        }, 1000 * 60 * frequency);
    }

    public checkVersion(refresh = false): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.http.request('get', AppConsts.appVersionUrl + '?t=' + new Date().getTime()).toPromise().then((result: any) => {
                this.newVersion = result.version;
                const hasVersionChanged = this.browserStorageService.get('version') !== this.newVersion;
                this.versionChangedSubject.next(hasVersionChanged);

                if (refresh && hasVersionChanged) {
                    this.updateVersion();
                }

                resolve(true);
            });
        });
    }

    public updateVersion() {
        this.compiler.clearCache();
        this.browserStorageService.set('version', this.newVersion);

        location.reload();
    }
}
