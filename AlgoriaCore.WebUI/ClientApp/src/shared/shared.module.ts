import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { BlockUIModule } from 'primeng/blockui';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { EditorModule } from 'primeng/editor';
import { FileUploadModule } from 'primeng/fileupload';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { MultiSelectModule } from 'primeng/multiselect';
import { OrderListModule } from 'primeng/orderlist';
import { PanelModule } from 'primeng/panel';
import { PasswordModule } from 'primeng/password';
import { PopoverModule } from 'primeng/popover';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ScrollerModule } from 'primeng/scroller';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
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
import { AppPromptComponent } from './components/app.prompt.component';
import { AppViewConfigComponent } from './components/app.viewconfig.component';
import { GoogleMapAddressModalComponent } from './components/googlemapaddressmodal.component';
import { SelectUsersComponent } from './components/selectusers.component';
import { CharacterCounterDirective } from './directives/CharacterCounterDirective';
import { NativeElementInjectorDirective } from './directives/NativeElementInjectorDirective ';
import { SharedRoutingModule } from './shared-routing.module';
import { FluidModule } from 'primeng/fluid';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,

        DialogModule,
        ButtonModule,
        DrawerModule,
        CheckboxModule,
        BlockUIModule,
        TableModule,
        InputTextModule,
        ScrollerModule,
        MenubarModule,
        MenuModule,
        TextareaModule,
        EditorModule,
        FileUploadModule,
        PanelModule,
        PopoverModule,
        InputMaskModule,
        ScrollPanelModule,
        PasswordModule,
        DividerModule,
        ListboxModule,
        DatePickerModule,
        ToggleSwitchModule,
        InputNumberModule,
        MultiSelectModule,
        RadioButtonModule,
        AutoCompleteModule,
        SelectModule,
        SharedRoutingModule,
        OrderListModule,
        GoogleMapsModule,
        FluidModule,
        IconFieldModule,
        InputIconModule,
        InputGroupModule,
        InputGroupAddonModule
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
        AppCustomCodeComponent,
        NativeElementInjectorDirective,
        AppViewConfigComponent,
        CharacterCounterDirective,
        AppPromptComponent
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
        AppCustomCodeComponent,
        NativeElementInjectorDirective,
        AppViewConfigComponent,
        CharacterCounterDirective,
        AppPromptComponent
    ]
})
export class SharedModule { }

