import * as ngCommon from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AvatarModule } from 'primeng/avatar';
import { BlockUIModule } from 'primeng/blockui';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DataViewModule } from 'primeng/dataview';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { EditorModule } from 'primeng/editor';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { PanelModule } from 'primeng/panel';
import { PasswordModule } from 'primeng/password';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SpeedDialModule } from 'primeng/speeddial';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TreeModule } from 'primeng/tree';
import { TreeTableModule } from 'primeng/treetable';
import { DialogCustomService } from '../../shared/services/dialog.custom.service';
import { SharedModule } from '../../shared/shared.module';
import { UtilsModule } from '../../shared/utils/utils.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AuditLogsComponent } from './auditlogs/auditlogs.component';
import { AuditLogsDetailComponent } from './auditlogs/auditlogsdetail.component';
import { ChatRoomsComponent } from './chatrooms/chatrooms.component';
import { EditChatRoomsComponent } from './chatrooms/edithchatrooms.component';
import { CopyEmailGroupsComponent } from './emailgroups/copyemailgroups.component';
import { EditEmailGroupsComponent } from './emailgroups/editemailgroups.component';
import { EmailGroupsComponent } from './emailgroups/emailgroups.component';
import { EditEmailTemplatesComponent } from './emailtemplates/editemailtemplates.component';
import { EmailTemplatesComponent } from './emailtemplates/emailtemplates.component';
import { SendTestEmailTemplatesComponent } from './emailtemplates/testemailtemplates.component';
import { EditHelpsComponent } from './helps/edithelps.component';
import { HelpsComponent } from './helps/helps.component';
import { EditLanguagesComponent } from './languages/editlanguages.component';
import { LanguagesComponent } from './languages/languages.component';
import { EditLanguageTextsComponent } from './languages/texts/editlanguagetexts.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { EditOrgUnitsComponent } from './orgunits/editorgunits.component';
import { OrgUnitsComponent } from './orgunits/orgunits.component';
import { EditOrgUnitPersonsComponent } from './orgunits/security/editorgunitpersons.component';
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
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FluidModule } from 'primeng/fluid';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

@NgModule({
    imports: [
        ngCommon.CommonModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        UtilsModule,
        BlockUIModule,
        ButtonModule,
        DatePickerModule,
        CheckboxModule,
        ContextMenuModule,
        SelectModule,
        EditorModule,
        InputTextModule,
        InputNumberModule,
        MenuModule,
        TableModule,
        TabsModule,
        FileUploadModule,
        ToastModule,
        TreeModule,
        TreeTableModule,
        ConfirmDialogModule,
        AutoCompleteModule,
        DynamicDialogModule,
        TextareaModule,
        MessageModule,
        RadioButtonModule,
        SelectButtonModule,
        DataViewModule,
        PanelModule,
        SharedModule,
        TagModule,
        AdminRoutingModule,
        PasswordModule,
        DividerModule,
        SplitButtonModule,
        SpeedDialModule,
        TooltipModule,
        AvatarModule,
        MultiSelectModule,
        ToggleSwitchModule,
        CheckboxModule,
        FluidModule,
        IconFieldModule,
        InputIconModule,
        InputGroupModule,
        InputGroupAddonModule
    ],
    declarations: [
        RolesComponent,
        EditRolesComponent,
        LanguagesComponent,
        UsersComponent,
        EditUsersComponent,
        OrgUnitsComponent,
        EditOrgUnitsComponent,
        EditOrgUnitPersonsComponent,
        UserProfileComponent,
        EditHostSettingsComponent,
        EditTenantSettingsComponent,
        LanguagesComponent,
        EditLanguagesComponent,
        EditLanguageTextsComponent,
        EmailGroupsComponent,
        EditEmailGroupsComponent,
        CopyEmailGroupsComponent,
        EmailTemplatesComponent,
        EditEmailTemplatesComponent,
        SendTestEmailTemplatesComponent,
        ChatRoomsComponent,
        EditChatRoomsComponent,
        HelpsComponent,
        EditHelpsComponent,
        TenantComponent,
        EditTenantComponent,
        CreateTenantComponent,
        AuditLogsComponent,
        AuditLogsDetailComponent,
        MaintenanceComponent
    ],
    providers: [
        MessageService,
        ConfirmationService,
        DialogService,
        DialogCustomService
    ]
})
export class AdminModule { }
