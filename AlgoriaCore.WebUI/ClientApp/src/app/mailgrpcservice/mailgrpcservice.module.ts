import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TooltipModule } from 'primeng/tooltip';
import { TreeTableModule } from 'primeng/treetable';
import { TableModule } from 'primeng/table';
import { DialogCustomService } from 'src/shared/services/dialog.custom.service';
import { SpinnerModule } from 'primeng/spinner';
import { BlockUIModule } from 'primeng/blockui';
import { MenuModule } from 'primeng/menu';
import { SharedModule } from '../../shared/shared.module';
import { KeyFilterModule } from 'primeng/keyfilter';
import { TabViewModule } from 'primeng/tabview';
import { PanelModule } from 'primeng/panel';
import { MessageModule } from 'primeng/message';
import { ListboxModule } from 'primeng/listbox';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputMaskModule } from 'primeng/inputmask';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MailGrpcServiceRoutingModule } from './mailgrpcservice-routing.module';
import { EditMailServiceMailComponent } from './mailservicemail/editmailservicemail.component';
import { MailServiceMailComponent } from './mailservicemail/mailservicemail.component';
import { EditMailServiceMailConfigComponent } from './mailservicemailconfig/editmailservicemailconfig.component';
import { MailServiceMailAttachComponent } from './mailservicemailattach/mailservicemailattach.component';

@NgModule({
    imports: [
        CommonModule,
        ButtonModule,
        TooltipModule,
        TreeTableModule,
        TableModule,
        TabViewModule,
        PanelModule,
        CheckboxModule,
        DynamicDialogModule,
        ConfirmDialogModule,
        RadioButtonModule,
        FormsModule,
        ReactiveFormsModule,
        DropdownModule,
        InputTextModule,
        InputTextareaModule,
        ColorPickerModule,
        FileUploadModule,
        SpinnerModule,
        BlockUIModule,
        MenuModule,
        KeyFilterModule,
        MessageModule,
        ListboxModule,
        InputSwitchModule,
        InputMaskModule,
        MultiSelectModule,
        CalendarModule,
        AutoCompleteModule,
        SharedModule,
        MailGrpcServiceRoutingModule
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
    ],
    entryComponents: [
    ]
})
export class MailGrpcServiceModule { }
