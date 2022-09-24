import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BlockUIModule } from 'primeng/blockui';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SidebarModule } from 'primeng/sidebar';
import { TableModule } from 'primeng/table';
import { AppAlertComponent } from './components/app.alert.component';
import { AppDataGridViewComponent } from './components/app.datagridview.component';
import { AppEditorComponent } from './components/app.editor.component';
import { AppHelpOnScreenComponent } from './components/app.help.onscreen.component';
import { SelectUsersComponent } from './components/selectusers.component';
import { SharedRoutingModule } from './shared-routing.module';
import { TextNumberComponent } from './components/algoria/app.textnumber.component';
import { GoogleAddressComponent } from './components/app.googleaddress.component';
import { AppChatLogComponent } from './components/app.chatlog.component';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { MenubarModule } from 'primeng/menubar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CKEditorModule } from 'ngx-ckeditor';
import { FileUploadModule } from 'primeng/fileupload';
import { PanelModule } from 'primeng/panel';
import { BlockableDivComponent } from './components/app.blockable.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { GoogleMapAddressComponent } from './components/app.googlemapaddress.component';
import { InputMaskModule } from 'primeng/inputmask';
import { GoogleMapAddressModalComponent } from './components/googlemapaddressmodal.component';
import { GMapModule } from 'primeng/gmap';
import { LightboxModule } from 'primeng/lightbox';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { PasswordFieldComponent } from './components/app.passwordfield.component';
import { AppPreloaderComponent } from './components/app.preloader.component';
import { AppModule } from '../app/app.module';
import { AppQuestionnaireComponent } from './components/app.questionnaire.component';
import { CalendarModule } from 'primeng/calendar';
import { ListboxModule } from 'primeng/listbox';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { AppCustomCodeComponent } from './components/app.customcode.component';
import { NativeElementInjectorDirective } from './directives/NativeElementInjectorDirective ';

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,

        DialogModule,
        ButtonModule,
        SidebarModule,
        CheckboxModule,
        BlockUIModule,
        TableModule,
        InputTextModule,
        VirtualScrollerModule,
        MenubarModule,
        InputTextareaModule,
        CKEditorModule,
        FileUploadModule,
        PanelModule,
        OverlayPanelModule,
        InputMaskModule,
        GMapModule,
        LightboxModule,
        ScrollPanelModule,
        PasswordModule,
        DividerModule,
        ListboxModule,
        CalendarModule,
        InputSwitchModule,
        InputNumberModule,
        MultiSelectModule,
        RadioButtonModule,
        AutoCompleteModule,
        DropdownModule,
        SharedRoutingModule
    ],
    declarations: [
        AppAlertComponent,
        AppHelpOnScreenComponent,
        AppDataGridViewComponent,
        SelectUsersComponent,
        AppEditorComponent,
        TextNumberComponent,
        GoogleAddressComponent,
        GoogleMapAddressComponent,
        GoogleMapAddressModalComponent,
        AppChatLogComponent,
        BlockableDivComponent,
        PasswordFieldComponent,
        AppPreloaderComponent,
        AppQuestionnaireComponent,
        AppCustomCodeComponent,
        NativeElementInjectorDirective
    ],
    entryComponents: [
        GoogleMapAddressModalComponent
    ],
    exports: [
        AppAlertComponent,
        AppHelpOnScreenComponent,
        AppDataGridViewComponent,
        SelectUsersComponent,
        AppEditorComponent,
        TextNumberComponent,
        GoogleAddressComponent,
        GoogleMapAddressComponent,
        AppChatLogComponent,
        BlockableDivComponent,
        PasswordFieldComponent,
        AppPreloaderComponent,
        AppQuestionnaireComponent,
        AppCustomCodeComponent,
        NativeElementInjectorDirective
    ]
})
export class SharedModule { }

