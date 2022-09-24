import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuditLogsComponent } from './auditlogs/auditlogs.component';
import { ChatRoomsComponent } from './chatrooms/chatrooms.component';
import { EditChatRoomsComponent } from './chatrooms/edithchatrooms.component';
import { EditEmailGroupsComponent } from './emailgroups/editemailgroups.component';
import { EmailGroupsComponent } from './emailgroups/emailgroups.component';
import { EditEmailTemplatesComponent } from './emailtemplates/editemailtemplates.component';
import { EmailTemplatesComponent } from './emailtemplates/emailtemplates.component';
import { EditHelpsComponent } from './helps/edithelps.component';
import { HelpsComponent } from './helps/helps.component';
import { EditLanguagesComponent } from './languages/editlanguages.component';
import { LanguagesComponent } from './languages/languages.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { EditOrgUnitsComponent } from './orgunits/editorgunits.component';
import { OrgUnitsComponent } from './orgunits/orgunits.component';
import { EditRolesComponent } from './roles/editroles.component';
import { RolesComponent } from './roles/roles.component';
import { EditHostSettingsComponent } from './settings/host/edithostsettings.component';
import { EditTenantSettingsComponent } from './settings/tenants/edittenantsettings.component';
import { CreateTenantComponent } from './tenants/createtenant.component';
import { EditTenantComponent } from './tenants/edittenant.component';
import { TenantComponent } from './tenants/tenant.component';
import { EditUsersComponent } from './users/editusers.component';
import { UsersComponent } from './users/user.component';
import { UserProfileComponent } from './users/userprofile.component';

const routes: Routes = [
    { path: 'roles', component: RolesComponent, data: { permission: 'Pages.Administration.Roles' } },
    { path: 'roles/create', component: EditRolesComponent, data: { permission: 'Pages.Administration.Roles.Create' } },
    { path: 'roles/edit/:id', component: EditRolesComponent, data: { permission: 'Pages.Administration.Roles.Edit' } },
    { path: 'languages', component: LanguagesComponent, data: { permission: 'Pages.Administration.Languages' } },
    { path: 'languages/create', component: EditLanguagesComponent, data: { permission: 'Pages.Administration.Languages.Create' } },
    { path: 'languages/edit/:id', component: EditLanguagesComponent, data: { permission: 'Pages.Administration.Languages.Edit' } },
    { path: 'users', component: UsersComponent, data: { permission: 'Pages.Administration.Users' } },
    { path: 'users/create', component: EditUsersComponent, data: { permission: 'Pages.Administration.Users.Create' } },
    { path: 'users/edit/:id', component: EditUsersComponent, data: { permission: 'Pages.Administration.Users.Edit' } },
    { path: 'orgunits', component: OrgUnitsComponent, data: { permission: 'Pages.Administration.OrgUnits' } },
    { path: 'orgunits/create', component: EditOrgUnitsComponent, data: { permission: 'Pages.Administration.OrgUnits.Create' } },
    { path: 'orgunits/:ou/create', component: EditOrgUnitsComponent, data: { permission: 'Pages.Administration.OrgUnits.Create' } },
    { path: 'orgunits/edit/:id', component: EditOrgUnitsComponent, data: { permission: 'Pages.Administration.OrgUnits.Edit' } },
    { path: 'users/profile', component: UserProfileComponent },
    { path: 'host/settings', component: EditHostSettingsComponent, data: { permission: 'Pages.Administration.Host.Settings' } },
    { path: 'tenants/settings', component: EditTenantSettingsComponent, data: { permission: 'Pages.Administration.Tenant.Settings' } },
    { path: 'emailgroups', component: EmailGroupsComponent, data: { permission: 'conftcor.0' } },
    {
        path: 'emailgroups/create',
        component: EditEmailGroupsComponent,
        data: { permission: 'conftcor.1', feature: 'App.AdminEmailTemplate' }
    },
    {
        path: 'emailgroups/edit/:id',
        component: EditEmailGroupsComponent,
        data: { permission: 'conftcor.2', feature: 'App.AdminEmailTemplate' }
    },
    { path: 'emailtemplates/group/:group', component: EmailTemplatesComponent, data: { permission: 'conftcor.4' } },
    { path: 'emailtemplates/group/:group/create', component: EditEmailTemplatesComponent, data: { permission: 'conftcor.5' } },
    { path: 'emailtemplates/group/:group/edit/:id', component: EditEmailTemplatesComponent, data: { permission: 'conftcor.6' } },
    { path: 'chatrooms', component: ChatRoomsComponent, data: { permission: 'Pages.Administration.ChatRooms' } },
    { path: 'chatrooms/create', component: EditChatRoomsComponent, data: { permission: 'Pages.Administration.ChatRooms.Create' } },
    { path: 'chatrooms/edit/:id', component: EditChatRoomsComponent, data: { permission: 'Pages.Administration.ChatRooms.Edit' } },
    { path: 'helps', component: HelpsComponent, data: { permission: 'Pages.Administration.Helps' } },
    { path: 'helps/create', component: EditHelpsComponent, data: { permission: 'Pages.Administration.Helps.Create' } },
    { path: 'helps/edit/:id', component: EditHelpsComponent, data: { permission: 'Pages.Administration.Helps.Edit' } },
    { path: 'tenant', component: TenantComponent, data: { permission: 'Pages.Tenants' } },
    { path: 'tenant/create', component: CreateTenantComponent, data: { permission: 'Pages.Tenants.Create' } },
    { path: 'tenant/edit/:id', component: EditTenantComponent, data: { permission: 'Pages.Tenants.Edit' } },
    { path: 'auditLogs', component: AuditLogsComponent, data: { permission: 'Pages.Administration.AuditLogs' } },
    { path: 'maintenance', component: MaintenanceComponent, data: { permission: 'Pages.Administration.Host.Maintenance' } }
];

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forChild(routes)]
})
export class AdminRoutingModule { }
