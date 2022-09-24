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
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { KeyFilterModule } from 'primeng/keyfilter';
import { ListboxModule } from 'primeng/listbox';
import { MenuModule } from 'primeng/menu';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SpeedDialModule } from 'primeng/speeddial';
import { SpinnerModule } from 'primeng/spinner';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { TreeModule } from 'primeng/tree';
import { TreeTableModule } from 'primeng/treetable';
import { DialogCustomService } from 'src/shared/services/dialog.custom.service';
import { SharedModule } from '../../shared/shared.module';
import { CatalogsCustomComponent } from './catalogscustom/catalogscustom.component';
import { EditCatalogsCustomComponent } from './catalogscustom/editcatalogscustom.component';
import { QuestionnairesRoutingModule } from './questionnaires-routing.module';
import { EditQuestionnairesComponent } from './questionnaires/editquestionnaires.component';
import { EditQuestionnaireFieldsComponent } from './questionnaires/fields/editquestionnairefields.component';
import { QuestionnairesComponent } from './questionnaires/questionnaires.component';
import { EditQuestionnaireSectionsComponent } from './questionnaires/sections/editquestionnairesections.component';

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
        TreeModule,

        QuestionnairesRoutingModule,
        InputNumberModule,
        SpeedDialModule,
        TagModule
    ],
    declarations: [
        QuestionnairesComponent,
        EditQuestionnairesComponent,
        EditQuestionnaireSectionsComponent,
        EditQuestionnaireFieldsComponent,
        CatalogsCustomComponent,
        EditCatalogsCustomComponent
    ],
    providers: [
        DialogService,
        DialogCustomService
    ],
    entryComponents: [
        EditQuestionnaireSectionsComponent,
        EditQuestionnaireFieldsComponent
    ]
})
export class QuestionnairesModule { }
