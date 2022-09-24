import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { BlockUIModule } from 'primeng/blockui';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { DialogCustomService } from 'src/shared/services/dialog.custom.service';
import { UtilsModule } from '../../shared/utils/utils.module';
import { SampleChatComponent } from './chat/samplechat.component';
import { SampleChatFindUsersComponent } from './chat/samplechat.findusers.component';
import { ExamplesRoutingModule } from './examples-routing.module';
import { SampleLogComponent } from './samplelog/samplelog.component';
import { EditSamplesDateDataComponent } from './samplesdatedata/editsamplesdatedata.component';
import { SamplesDateDataComponent } from './samplesdatedata/samplesdatedata.component';
import { SampleNumbersComponent } from './numbers/samplenumbers.component';
import { SampleMultiselectComponent } from './multiselect/samplemultiselect.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { SampleChartsComponent } from './charts/samplecharts.component';
import { SampleArrobarComponent } from './ckeditor/samplearrobar.component';
import { CKEditorModule } from 'ngx-ckeditor';
import { SharedModule } from '../../shared/shared.module';
import { SampleChatLogComponent } from './chat/chatlog/samplechatlog.component';

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
        ExamplesRoutingModule,
        UtilsModule,
        AutoCompleteModule,
        CheckboxModule,
        ChartModule,
        CKEditorModule,
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
        SampleArrobarComponent
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
