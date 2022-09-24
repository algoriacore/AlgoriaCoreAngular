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
import { ProcessesRoutingModule } from './processes-routing.module';
import { TemplatesComponent } from './templates/templates.component';
import { EditTemplatesComponent } from './templates/edittemplates.component';
import { EditTemplateFieldsComponent } from './templates/fields/edittemplatefields.component';
import { EditTemplateSectionsComponent } from './templates/sections/edittemplatesections.component';
import { SpinnerModule } from 'primeng/spinner';
import { BlockUIModule } from 'primeng/blockui';
import { MenuModule } from 'primeng/menu';
import { SharedModule } from '../../shared/shared.module';
import { KeyFilterModule } from 'primeng/keyfilter';
import { ProcessesComponent } from './processes/processes.component';
import { EditProcessesComponent } from './processes/editprocesses.component';
import { ListboxModule } from 'primeng/listbox';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputMaskModule } from 'primeng/inputmask';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { TabViewModule } from 'primeng/tabview';
import { EditTemplateToDoStatusComponent } from './templates/todostatus/edittemplatetodostatus.component';
import { EditToDoTimeSheetComponent } from './processes/activities/timesheets/edittodotimesheets.component';
import { EditTemplateSecurityComponent } from './templates/security/edittemplatesecurity.component';
import { EditProcessSecurityComponent } from './processes/security/editprocesssecurity.component';
import { ConsultProcessesComponent } from './processes/consultprocesses.component';
import {  InputNumberModule } from 'primeng/inputnumber';
import { SpeedDialModule } from 'primeng/speeddial';
import { TagModule } from 'primeng/tag';

@NgModule({
    imports: [
        CommonModule,
        ButtonModule,
        TooltipModule,
        TreeTableModule,
        TableModule,
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
        ListboxModule,
        InputSwitchModule,
        InputMaskModule,
        MultiSelectModule,
        CalendarModule,
        AutoCompleteModule,
        MessagesModule,
        MessageModule,
        TabViewModule,
        SharedModule,

        ProcessesRoutingModule,
        InputNumberModule,
        SpeedDialModule,
        TagModule
    ],
    declarations: [
        TemplatesComponent,
        EditTemplatesComponent,
        EditTemplateSectionsComponent,
        EditTemplateFieldsComponent,
        EditTemplateToDoStatusComponent,
        ProcessesComponent,
        EditProcessesComponent,
        ConsultProcessesComponent,
        EditToDoTimeSheetComponent,
        EditTemplateSecurityComponent,
        EditProcessSecurityComponent
    ],
    providers: [
        DialogService,
        DialogCustomService
    ],
    entryComponents: [
        EditTemplateSectionsComponent,
        EditTemplateFieldsComponent,
        EditTemplateToDoStatusComponent,
        EditToDoTimeSheetComponent,
        EditTemplateSecurityComponent,
        EditProcessSecurityComponent
    ]
})
export class ProcessesModule { }
