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
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { ListboxModule } from 'primeng/listbox';
import { MenuModule } from 'primeng/menu';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { SpeedDialModule } from 'primeng/speeddial';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { TreeTableModule } from 'primeng/treetable';
import { DialogCustomService } from 'src/shared/services/dialog.custom.service';
import { SharedModule } from '../../shared/shared.module';
import { CatalogsCustomImpRoutingModule } from './catalogscustomimpl-routing.module';
import { CatalogsCustomImplComponent } from './catalogscustomimpl.component';
import { ConsultCatalogsCustomImplComponent } from './consultcatalogscustomimpl.component';
import { EditCatalogsCustomImplComponent } from './editcatalogscustomimpl.component';

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
        SelectModule,
        InputTextModule,
        TextareaModule,
        ColorPickerModule,
        FileUploadModule,
        BlockUIModule,
        MenuModule,
        KeyFilterModule,
        ListboxModule,
        ToggleSwitchModule,
        InputMaskModule,
        MultiSelectModule,
        DatePickerModule,
        AutoCompleteModule,
        MessageModule,
        TabsModule,
        SharedModule,

        CatalogsCustomImpRoutingModule,
        InputNumberModule,
        SpeedDialModule,
        TagModule
    ],
    declarations: [
        CatalogsCustomImplComponent,
        EditCatalogsCustomImplComponent,
        ConsultCatalogsCustomImplComponent
    ],
    providers: [
        DialogService,
        DialogCustomService
    ]
})
export class CatalogsCustomImplModule { }
