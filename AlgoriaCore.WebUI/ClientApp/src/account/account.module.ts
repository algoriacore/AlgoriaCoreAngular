import * as ngCommon from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BlockUIModule } from 'primeng/blockui';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
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
import { FluidModule } from 'primeng/fluid';

@NgModule({
    imports: [
        ngCommon.CommonModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        InputTextModule,
        ButtonModule,
        PasswordModule,
        MessageModule,
        ToastModule,
        AccountRoutingModule,
        SharedModule,
        BlockUIModule,
        CheckboxModule,
        FluidModule
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
