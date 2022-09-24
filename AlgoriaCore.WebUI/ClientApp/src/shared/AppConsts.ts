export class AppConsts {
    static clientType = 'web';
    static appSettingsUrl = 'assets/appconfig.json';
    static appVersionUrl = 'version.json';
    static remoteServiceBaseUrl: string;
    static appBaseUrl: string;
    static appDatetimeControlsLocale: {};
    static appTitle: string;
    static appPrefix: string;
    static readonly tenancyNamePlaceHolderInUrl = '{TENANCY_NAME}';
    static multiTenancy = true;
    static isHost = true;
    static tenancyName: string;
    static helpOnScreenNamePrefix = 'HelpOnScreen.';
    static timeouts = { default: 30000, urls: [] };
    static frequencyCheckVersion = 30;
}
