import { HttpClient } from '@angular/common/http';
import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import * as moment from 'moment';
import 'moment-duration-format';
import 'moment-timezone';
import { PrimeNGConfig } from 'primeng/api';
import { AppModule } from './app/app.module';
import { AuthenticationService } from './app/_services/authentication.service';
import { PermissionCheckerService } from './app/_services/permission.checker.service';
import { RootRoutingModule } from './root-routing.module';
import { RootComponent } from './root.component';
import { AppConsts } from './shared/AppConsts';
import { AppSettings } from './shared/AppSettings';
import { SubdomainTenancyNameFinder } from './shared/helpers/SubdomainTenancyNameFinder';
import {
    API_BASE_URL, UserConfigurationGetAllQuery, UserConfigurationResponse, UserConfigurationServiceProxy
} from './shared/service-proxies/service-proxies';
import { ServiceProxyModule } from './shared/service-proxies/service-proxy.module';
import { CatalogsCustomService } from './shared/services/catalogscustom.service';
import { DateTimeService } from './shared/services/datetime.service';
import { LocalizationService } from './shared/services/localization.service';
import { SettingsService } from './shared/services/settings.service';
import { SettingsClientService } from './shared/services/settingsclient.service';
import { TitleService } from './shared/services/title.service';
import { VersionCheckService } from './shared/services/version.check.service';
import { Utils } from './shared/utils/utils';

export function appInitializerFactory(injector: Injector) {
    return () => RootModule.getAppInitializerFactoryFunction(injector);
}

export function getRemoteServiceBaseUrl(): string {
    return AppConsts.remoteServiceBaseUrl;
}

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppModule,
        ServiceProxyModule,
        RootRoutingModule
    ],
    declarations: [
        RootComponent
    ],
    providers: [
        { provide: API_BASE_URL, useFactory: getRemoteServiceBaseUrl },
        LocalizationService, PermissionCheckerService, TitleService,
        {
            provide: APP_INITIALIZER,
            useFactory: appInitializerFactory,
            deps: [Injector],
            multi: true
        }
    ],
    bootstrap: [RootComponent]
})
export class RootModule {

    public static getAppInitializerFactoryFunction(injector: Injector): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const http: HttpClient = injector.get(HttpClient);

            http.request('get', AppConsts.appSettingsUrl).toPromise().then((result: any) => {
                const promises = [];

                const promiseGooglePlaces = new Promise(resolve2 => {
                    const scriptElement = document.createElement('script');
                    scriptElement.src = 'https://maps.googleapis.com/maps/api/js?key='
                        + result.googleAPIKey + '&libraries=places';
                    scriptElement.onload = resolve2;
                    document.body.appendChild(scriptElement);
                });

                AppConsts.appTitle = result.appTitle;
                AppConsts.appPrefix = result.appPrefix;
                AppConsts.remoteServiceBaseUrl = result.remoteServiceBaseUrl;
                AppConsts.timeouts = result.timeouts;

                if (result.frequencyCheckVersion) {
                    AppConsts.frequencyCheckVersion = result.frequencyCheckVersion;
                }

                const userConfigurationServiceProxy: UserConfigurationServiceProxy = injector.get(UserConfigurationServiceProxy);
                const authenticationService: AuthenticationService = injector.get(AuthenticationService);

                const titleService: TitleService = injector.get(TitleService);
                const versionCheckService: VersionCheckService = injector.get(VersionCheckService);


                AppConsts.isHost = Utils.isHost(authenticationService);
                titleService.setTitle(AppConsts.appTitle);

                const promiseUserConfiguration = userConfigurationServiceProxy.getAll(new UserConfigurationGetAllQuery({
                    clientType: AppConsts.clientType
                })).toPromise();

                promiseUserConfiguration.then((result2) => {
                    RootModule.proccessUserConfiguration(injector, result, result2);

                    resolve(true);
                });

                promises.push(versionCheckService.checkVersion(true));
                promises.push(promiseGooglePlaces);
                promises.push(promiseUserConfiguration);

                return Promise.all(promises);
            });
        });
    }

    private static proccessUserConfiguration(injector: Injector, result: any, result2: UserConfigurationResponse) {
        const localizationService: LocalizationService = injector.get(LocalizationService);
        const permissionService: PermissionCheckerService = injector.get(PermissionCheckerService);
        const settingsClientService: SettingsClientService = injector.get(SettingsClientService);
        const catalogsCustomService: CatalogsCustomService = injector.get(CatalogsCustomService);
        const dateTimeService: DateTimeService = injector.get(DateTimeService);
        const settingsService: SettingsService = injector.get(SettingsService);
        const config: PrimeNGConfig = injector.get(PrimeNGConfig);

        AppConsts.multiTenancy = result2.multiTenancyConfig.enabled;

        if (AppConsts.multiTenancy) {
            const subdomainTenancyNameFinder = new SubdomainTenancyNameFinder();
            const tenancyName = subdomainTenancyNameFinder.getCurrentTenancyNameOrNull(result.appBaseUrl);

            AppConsts.tenancyName = (tenancyName !== null && tenancyName.toLowerCase() === 'www' ? null : tenancyName);

            if (tenancyName === null) {
                AppConsts.appBaseUrl = result.appBaseUrl.replace(AppConsts.tenancyNamePlaceHolderInUrl + '.', '');
            } else {
                AppConsts.appBaseUrl = result.appBaseUrl.replace(AppConsts.tenancyNamePlaceHolderInUrl, tenancyName);
            }
        } else {
            AppConsts.tenancyName = result2.multiTenancyConfig.tenancyNameDefault;
            AppConsts.appBaseUrl = result.appBaseUrl;
        }

        AppConsts.appBaseUrl = Utils.normalizeAppBaseUrl(AppConsts.appBaseUrl);

        localizationService.localization = result2.localization;
        permissionService.permission = result2.permission;
        settingsClientService.settings = result2.settingsClient;
        catalogsCustomService.catalogs = result2.catalogsCustom;
        settingsService.passwordComplexity = result2.passwordComplexity;

        moment.locale(result2.localization.currentLanguage.name);

        dateTimeService.setTimeZone(settingsClientService.getSetting(AppSettings.timeZone));

        AppConsts.appDatetimeControlsLocale = {
            firstDayOfWeek: 0,
            dayNames: moment.weekdays(),
            dayNamesShort: moment.weekdaysShort(),
            dayNamesMin: moment.weekdaysMin(),
            monthNames: moment.months(),
            monthNamesShort: moment.monthsShort(),
            today: localizationService.l('Today'),
            clear: localizationService.l('Clear'),
            dateFormat: 'dd/mm/yy'
        };

        config.setTranslation({
            dayNames: moment.weekdays(),
            dayNamesShort: moment.weekdaysShort(),
            dayNamesMin: moment.weekdaysMin(),
            monthNames: moment.months(),
            monthNamesShort: moment.monthsShort(),
            today: localizationService.l('Today'),
            clear: localizationService.l('Clear'),
            dateFormat: 'dd/mm/yy'
        });
    }
}
