import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { BlockUIModule } from 'primeng/blockui';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { ListboxModule } from 'primeng/listbox';
import { MenuModule } from 'primeng/menu';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { PanelModule } from 'primeng/panel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { TreeTableModule } from 'primeng/treetable';
import { DialogCustomService } from 'src/shared/services/dialog.custom.service';
import { SharedModule } from '../../shared/shared.module';
import { MailGrpcServiceRoutingModule } from './mailgrpcservice-routing.module';
import { EditMailServiceMailComponent } from './mailservicemail/editmailservicemail.component';
import { MailServiceMailComponent } from './mailservicemail/mailservicemail.component';
import { MailServiceMailAttachComponent } from './mailservicemailattach/mailservicemailattach.component';
import { EditMailServiceMailConfigComponent } from './mailservicemailconfig/editmailservicemailconfig.component';
import { FluidModule } from 'primeng/fluid';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@NgModule({
    imports: [
        CommonModule,
        ButtonModule,
        TooltipModule,
        TreeTableModule,
        TableModule,
        TabsModule,
        PanelModule,
        CheckboxModule,
        DynamicDialogModule,
        ConfirmDialogModule,
        RadioButtonModule,
        FormsModule,
        ReactiveFormsModule,
        SelectModule,
        InputTextModule,
        TextareaModule,
        ColorPickerModule,
        FileUploadModule,
        BlockUIModule,
        MenuModule,
        KeyFilterModule,
        MessageModule,
        ListboxModule,
        ToggleSwitchModule,
        InputMaskModule,
        MultiSelectModule,
        DatePickerModule,
        AutoCompleteModule,
        SharedModule,
        MailGrpcServiceRoutingModule,
        SplitButtonModule,
        FluidModule,
        IconFieldModule,
        InputIconModule
    ],
    declarations: [
        MailServiceMailComponent,
        EditMailServiceMailComponent,
        EditMailServiceMailConfigComponent,
        MailServiceMailAttachComponent
    ],
    providers: [
        DialogService,
        DialogCustomService
    ]
})
export class MailGrpcServiceModule { }
