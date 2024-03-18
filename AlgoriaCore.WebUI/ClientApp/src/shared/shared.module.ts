import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { BlockUIModule } from 'primeng/blockui';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { EditorModule } from 'primeng/editor';
import { FileUploadModule } from 'primeng/fileupload';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ListboxModule } from 'primeng/listbox';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { MultiSelectModule } from 'primeng/multiselect';
import { OrderListModule } from 'primeng/orderlist';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import { PasswordModule } from 'primeng/password';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ScrollerModule } from 'primeng/scroller';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SidebarModule } from 'primeng/sidebar';
import { TableModule } from 'primeng/table';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { TextNumberComponent } from './components/algoria/app.textnumber.component';
import { AppAlertComponent } from './components/app.alert.component';
import { BlockableDivComponent } from './components/app.blockable.component';
import { AppChatLogComponent } from './components/app.chatlog.component';
import { AppCustomCodeComponent } from './components/app.customcode.component';
import { AppDataGridViewComponent } from './components/app.datagridview.component';
import { AppEditorComponent } from './components/app.editor.component';
import { GoogleAddressComponent } from './components/app.googleaddress.component';
import { GoogleMapAddressComponent } from './components/app.googlemapaddress.component';
import { AppHelpOnScreenComponent } from './components/app.help.onscreen.component';
import { PasswordFieldComponent } from './components/app.passwordfield.component';
import { AppPreloaderComponent } from './components/app.preloader.component';
import { AppQuestionnaireComponent } from './components/app.questionnaire.component';
import { AppViewConfigComponent } from './components/app.viewconfig.component';
import { GoogleMapAddressModalComponent } from './components/googlemapaddressmodal.component';
import { SelectUsersComponent } from './components/selectusers.component';
import { CharacterCounterDirective } from './directives/CharacterCounterDirective';
import { NativeElementInjectorDirective } from './directives/NativeElementInjectorDirective ';
import { SharedRoutingModule } from './shared-routing.module';
import { AppPromptComponent } from './components/app.prompt.component';

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
        ScrollerModule,
        MenubarModule,
        MenuModule,
        InputTextareaModule,
        EditorModule,
        FileUploadModule,
        PanelModule,
        OverlayPanelModule,
        InputMaskModule,
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
        SharedRoutingModule,
        OrderListModule,
        GoogleMapsModule
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
        NativeElementInjectorDirective,
        AppViewConfigComponent,
        CharacterCounterDirective,
        AppPromptComponent
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
        NativeElementInjectorDirective,
        AppViewConfigComponent,
        CharacterCounterDirective,
        AppPromptComponent
    ]
})
export class SharedModule { }

