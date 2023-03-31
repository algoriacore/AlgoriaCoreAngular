import * as ngCommon from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BlockUIModule } from 'primeng/blockui';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { SharedModule } from '../shared/shared.module';
import { AccountRoutingModule } from './account-routing.module';
import { AccountComponent } from './account.component';
import { ChangePasswordComponent } from './login/changepassword.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './login/register.component';
import { TenantConfirmRegistrationComponent } from './login/registerconfirm.component';
import { ForgotPasswordComponent } from './password/forgotpassword.component';
import { ResetPasswordComponent } from './password/resetpassword.component';

@NgModule({
    imports: [
        ngCommon.CommonModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        InputTextModule,
        ButtonModule,
        PasswordModule,
        MessagesModule,
        ToastModule,
        AccountRoutingModule,
        SharedModule,
        BlockUIModule,
        CheckboxModule
    ],
    declarations: [
        AccountComponent,
        LoginComponent,
        ForgotPasswordComponent,
        ResetPasswordComponent,
        RegisterComponent,
        TenantConfirmRegistrationComponent,
        ChangePasswordComponent
    ],
    providers: []
})
export class AccountModule {

}
