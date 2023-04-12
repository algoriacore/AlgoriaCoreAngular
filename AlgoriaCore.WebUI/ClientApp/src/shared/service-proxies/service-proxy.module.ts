import { NgModule } from '@angular/core';

import * as ApiServiceProxies from './service-proxies';

@NgModule({
    providers: [
        ApiServiceProxies.AuthServiceProxy,
        ApiServiceProxies.LanguageServiceProxy,
        ApiServiceProxies.PermissionServiceProxy,
        ApiServiceProxies.RegisterServiceProxy,
        ApiServiceProxies.RoleServiceProxy,
        ApiServiceProxies.SampleDataServiceProxy,
        ApiServiceProxies.TenantServiceProxy,
        ApiServiceProxies.UserServiceProxy,
        ApiServiceProxies.OrgUnitServiceProxy,
        ApiServiceProxies.UserConfigurationServiceProxy,
        ApiServiceProxies.ChangeLogServiceProxy,
        ApiServiceProxies.MailGroupServiceProxy,
        ApiServiceProxies.FileServiceProxy,
        ApiServiceProxies.HostSettingsServiceProxy,
        ApiServiceProxies.TenantSettingsServiceProxy,
        ApiServiceProxies.AuditLogServiceProxy,
        ApiServiceProxies.WebLogServiceProxy,
        ApiServiceProxies.SampleDateDataServiceProxy,
        ApiServiceProxies.FriendshipServiceProxy,
        ApiServiceProxies.ChatMessageServiceProxy,
        ApiServiceProxies.HelpServiceProxy,
        ApiServiceProxies.SettingClientServiceProxy,
        ApiServiceProxies.SampleLogServiceProxy,
        ApiServiceProxies.ChatRoomServiceProxy,
        ApiServiceProxies.MailServiceMailServiceProxy,
        ApiServiceProxies.MailServiceMailConfigServiceProxy,
        ApiServiceProxies.MailServiceMailAttachServiceProxy,
        ApiServiceProxies.QuestionnaireServiceProxy,
        ApiServiceProxies.CatalogCustomServiceProxy,
        ApiServiceProxies.CatalogCustomImplServiceProxy
    ]
})
export class ServiceProxyModule { }
