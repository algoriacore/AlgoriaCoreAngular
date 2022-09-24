import { Component, Injector } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { first } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import { AppConsts } from '../shared/AppConsts';
import { SampleDataServiceProxy } from '../shared/service-proxies/service-proxies';
import { AppComponent } from './app.component';
import { VersionCheckService } from '../shared/services/version.check.service';
import * as moment from 'moment';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    providers: [MessageService]
})
export class AppTopBarComponent extends AppComponentBase {

    multiTenancy: boolean = AppConsts.multiTenancy;
    versionChanged: boolean;
    notificationsList = [];

    constructor(public app: AppComponent,
        private sampleDataClient: SampleDataServiceProxy,
        injector: Injector,
        private versionCheckService: VersionCheckService,
        private confirmationService: ConfirmationService) {
        super(injector);

        this.versionCheckService.versionChanged.subscribe(x => {
            this.versionChanged = x;

            if (x) {
                this.confirmationService.confirm({
                    header: this.l('NewVersion'),
                    icon: 'pi pi-info',
                    message: this.l('NewAppVersionMessage'),
                    acceptLabel: this.l('UpdateNow'),
                    rejectLabel: this.l('Cancel'),
                    accept: () => {
                        this.updateAppVersion();
                    }
                });
            }
        });

        this.updateImageProfile();

        for (let i = 1; i <= 6; i++) {
            this.notificationsList.push({
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ' +
                    'incididunt ut labore et dolore magna aliqua.Ut enim ad minim veniam, quis nostrud exercitation ' +
                    'ullamco laboris nisi ut aliquip ex ea commodo consequat.Duis aute irure dolor in reprehenderit in ' +
                    'voluptate velit esse cillum dolore eu fugiat nulla pariatur.Excepteur sint occaecat cupidatat non ' +
                    'proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                dateTime: moment().subtract(i, 'days')
            });
        }
    }

    traeDatosEjemplo(event) {
        this.sampleDataClient.weatherForecasts('12346')
            .pipe(first())
            .subscribe(
                data => {
                    const WeatherMsg = [];
                    data.forEach((element) => {
                        const newWeather = {
                            severity: 'success',
                            summary: 'Servicio',
                            detail: 'Fecha: ' + element.dateFormatted + ', Temperatura: ' + element.temperatureC +
                                ', Está: ' + element.summary
                        };
                        WeatherMsg.push(newWeather);
                    });

                    this.notify.success('¡Ejecutó el servicio!', 'Okkk!!');
                },
                error => {
                    this.notify.warning('Algo salió mal :-(', 'Error');
                });

        event.preventDefault();
    }

    updateImageProfile(): void {
        this.urlPictureProfile = this.getBaseServiceUrl() + '/api/User/GetPictureProfile?id=' +
            this.app.currentUser.userId + '&v' + (new Date().getTime());
    }

    updateAppVersion(): void {
        this.versionCheckService.updateVersion();
    }

    deleteNotifications(event): void {
        const self = this;

        self.notificationsList = [];
        self.app.topbarItemClick = true;

        event.preventDefault();
    }
}
