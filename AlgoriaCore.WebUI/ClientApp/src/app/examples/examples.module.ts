import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { BlockUIModule } from 'primeng/blockui';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { EditorModule } from 'primeng/editor';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { ScrollerModule } from 'primeng/scroller';
import { DialogCustomService } from 'src/shared/services/dialog.custom.service';
import { SharedModule } from '../../shared/shared.module';
import { UtilsModule } from '../../shared/utils/utils.module';
import { SampleChartsComponent } from './charts/samplecharts.component';
import { SampleChatLogComponent } from './chat/chatlog/samplechatlog.component';
import { SampleChatComponent } from './chat/samplechat.component';
import { SampleChatFindUsersComponent } from './chat/samplechat.findusers.component';
import { ExamplesRoutingModule } from './examples-routing.module';
import { SampleMultiselectComponent } from './multiselect/samplemultiselect.component';
import { SampleNumbersComponent } from './numbers/samplenumbers.component';
import { SamplePEditorComponent } from './peditor/samplepeditor.component';
import { SampleLogComponent } from './samplelog/samplelog.component';
import { EditSamplesDateDataComponent } from './samplesdatedata/editsamplesdatedata.component';
import { SamplesDateDataComponent } from './samplesdatedata/samplesdatedata.component';
import { SampleGoogleMapsComponent } from './googlemaps/samplegooglemaps.component';

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        BlockUIModule,
        ButtonModule,
        CalendarModule,
        DynamicDialogModule,
        TableModule,
        MenuModule,
        ConfirmDialogModule,
        InputTextModule,
        ToggleButtonModule,
        DropdownModule,
        VirtualScrollerModule,
        ScrollerModule,
        ExamplesRoutingModule,
        UtilsModule,
        AutoCompleteModule,
        CheckboxModule,
        ChartModule,
        EditorModule,
        SharedModule
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
    ],
    entryComponents: [
        SampleChatFindUsersComponent
    ]
})
export class ExamplesModule { }
