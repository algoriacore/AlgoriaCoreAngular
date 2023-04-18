import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { BlockUIModule } from 'primeng/blockui';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputMaskModule } from 'primeng/inputmask';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { KeyFilterModule } from 'primeng/keyfilter';
import { ListboxModule } from 'primeng/listbox';
import { MenuModule } from 'primeng/menu';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { PanelModule } from 'primeng/panel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SpinnerModule } from 'primeng/spinner';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { TreeTableModule } from 'primeng/treetable';
import { DialogCustomService } from 'src/shared/services/dialog.custom.service';
import { SharedModule } from '../../shared/shared.module';
import { MailGrpcServiceRoutingModule } from './mailgrpcservice-routing.module';
import { EditMailServiceMailComponent } from './mailservicemail/editmailservicemail.component';
import { MailServiceMailComponent } from './mailservicemail/mailservicemail.component';
import { MailServiceMailAttachComponent } from './mailservicemailattach/mailservicemailattach.component';
import { EditMailServiceMailConfigComponent } from './mailservicemailconfig/editmailservicemailconfig.component';

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
        MailGrpcServiceRoutingModule,
        SplitButtonModule
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
