import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { BlockUIModule } from 'primeng/blockui';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { EditorModule } from 'primeng/editor';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { ScrollerModule } from 'primeng/scroller';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TooltipModule } from 'primeng/tooltip';
import { DialogCustomService } from 'src/shared/services/dialog.custom.service';
import { SharedModule } from '../../shared/shared.module';
import { UtilsModule } from '../../shared/utils/utils.module';
import { SampleChartsComponent } from './charts/samplecharts.component';
import { SampleChatLogComponent } from './chat/chatlog/samplechatlog.component';
import { SampleChatComponent } from './chat/samplechat.component';
import { SampleChatFindUsersComponent } from './chat/samplechat.findusers.component';
import { ExamplesRoutingModule } from './examples-routing.module';
import { SampleGoogleMapsComponent } from './googlemaps/samplegooglemaps.component';
import { SampleMultiselectComponent } from './multiselect/samplemultiselect.component';
import { SampleNumbersComponent } from './numbers/samplenumbers.component';
import { SamplePEditorComponent } from './peditor/samplepeditor.component';
import { SampleLogComponent } from './samplelog/samplelog.component';
import { EditSamplesDateDataComponent } from './samplesdatedata/editsamplesdatedata.component';
import { SamplesDateDataComponent } from './samplesdatedata/samplesdatedata.component';
import { FluidModule } from 'primeng/fluid';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        BlockUIModule,
        ButtonModule,
        DatePickerModule,
        DynamicDialogModule,
        TableModule,
        MenuModule,
        ConfirmDialogModule,
        InputTextModule,
        ToggleButtonModule,
        SelectModule,
        ScrollerModule,
        ExamplesRoutingModule,
        UtilsModule,
        AutoCompleteModule,
        CheckboxModule,
        ChartModule,
        EditorModule,
        SharedModule,
        TooltipModule,
        ScrollerModule,
        DialogModule,
        FluidModule,
        IconFieldModule,
        InputIconModule
    ],
    declarations: [
        SamplesDateDataComponent,
        EditSamplesDateDataComponent,
        SampleChatLogComponent,
        SampleChatComponent,
        SampleChatFindUsersComponent,
        SampleLogComponent,
        SampleNumbersComponent,
        SampleMultiselectComponent,
        SampleChartsComponent,
        SamplePEditorComponent,
        SampleGoogleMapsComponent
    ],
    providers: [
        DialogService,
        DialogCustomService,
    ]
})
export class ExamplesModule { }
