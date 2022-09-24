import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AccountComponent } from './account.component';
import { ChangePasswordComponent } from './login/changepassword.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './login/register.component';
import { TenantConfirmRegistrationComponent } from './login/registerconfirm.component';
import { ForgotPasswordComponent } from './password/forgotpassword.component';
import { ResetPasswordComponent } from './password/resetpassword.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: AccountComponent,
                children: [
                    { path: 'login', component: LoginComponent },
                    { path: 'forgot-password', component: ForgotPasswordComponent },
                    { path: 'reset-password', component: ResetPasswordComponent },
                    { path: 'register', component: RegisterComponent },
                    { path: 'confirm', component: TenantConfirmRegistrationComponent },
                    { path: 'changep', component: ChangePasswordComponent }
                ]
            }
        ])
    ],
    exports: [RouterModule]
})
export class AccountRoutingModule { }
