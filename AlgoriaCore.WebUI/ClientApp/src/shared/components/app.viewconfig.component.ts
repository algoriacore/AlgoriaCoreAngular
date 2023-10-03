import { Component, Injector, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs';
import { AppComponentBase } from 'src/app/app-component-base';
import { SettingClientChangeCommand, SettingClientServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { AppConsts } from '../AppConsts';
import { AppSettingsClient } from '../AppSettingsClient';
import { StringsHelper } from '../helpers/StringsHelper';
import { SettingsClientService } from '../services/settingsclient.service';

@Component({
    templateUrl: './app.viewconfig.component.html'
})
export class AppViewConfigComponent extends AppComponentBase implements OnInit {

    settingViewConfigName: string;
    originalCols: any[];
    cols: any[];

    blockedDocument = false;

    constructor(
        injector: Injector,
        private modalRef: DynamicDialogRef,
        private modalConfig: DynamicDialogConfig,
        private settingClientService: SettingClientServiceProxy,
        private settingsClient: SettingsClientService
    ) {
        super(injector);
    }

    ngOnInit() {
        const self = this;

        self.settingViewConfigName = self.modalConfig.data.settingViewConfigName;
        self.originalCols = JSON.parse(JSON.stringify(self.modalConfig.data.originalCols));
        self.cols = self.originalCols.concat([]);

        const settingViewConfig = self.settingsClient.getSetting(self.settingViewConfigName);

        if (settingViewConfig) {
            self.cols = self.normalizeColumnsFromJSON(settingViewConfig, self.originalCols);
        }

        if (self.modalRef) {
            self.initModalMode();
        }
    }

    initModalMode(): void {
        const self = this;
        const templateHTML = '<button id="{0}"class="p-button p-button-secondary" type="button">{1}</button>'
            + '<button id="{2}"class="p-button" type="button">{3}</button>';
        const footer = document.getElementsByClassName('p-dialog-footer')[0];
        const idButton1 = 'btn' + new Date().getMilliseconds() + (Math.random() * 100);
        const idButton2 = 'btn' + new Date().getMilliseconds() + (Math.random() * 100);

        footer.innerHTML = StringsHelper.formatString(templateHTML, [
            idButton1,
            self.l('Return'),
            idButton2,
            self.l('Save')
        ]);

        let button = document.getElementById(idButton1);

        button.addEventListener('click', (e) => {
            self.return();
        });

        button = document.getElementById(idButton2);

        button.addEventListener('click', (e) => {
            self.save();
        });
    }

    save(): void {
        const self = this;
        const cmd = new SettingClientChangeCommand();

        cmd.clientType = AppConsts.clientType;
        cmd.name = self.settingViewConfigName;
        cmd.value = JSON.stringify(self.cols);

        self.blockedDocument = true;

        self.settingClientService.changeSettingClient(cmd)
            .pipe(finalize(() => {
                self.blockedDocument = false;
            }))
            .subscribe(data => {
                self.settingsClient.setSetting(self.settingViewConfigName, cmd.value);
                self.return(self.cols);
            });
    }

    return(cols: any[] = null): void {
        const self = this;

        self.modalRef.close(cols);
    }
}
