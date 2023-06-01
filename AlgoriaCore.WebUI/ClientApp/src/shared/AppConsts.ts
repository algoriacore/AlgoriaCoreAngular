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

    static azureMSALAccountKey = 'msal.account.keys';
    static azureLocalStorageKey = 'msal.token.keys.e43c2736-6899-4dc0-8470-4b978ef35b2b';

    static azureClientId = 'e43c2736-6899-4dc0-8470-4b978ef35b2b';
    static azureTenantId = '72e9a344-1f95-4cf5-8fb7-e26b291f7906';
    static azureRedirectUri = 'http://localhost:4200';
}
