import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppConsts } from 'src/shared/AppConsts';
import { AppComponentBase } from '../../app/app-component-base';
import { AuthenticationService } from '../../app/_services/authentication.service';
import { UserResetPasswordCommand } from '../../shared/service-proxies/service-proxies';
import { AccountComponent } from '../account.component';

@Component({
    templateUrl: 'forgotpassword.component.html',
    providers: [MessageService]
})
export class ForgotPasswordComponent extends AppComponentBase implements OnInit {
    form: FormGroup;
    submitted = false;
    returnUrl: string;
    userResetPassword: UserResetPasswordCommand = new UserResetPasswordCommand();
    AppConsts = AppConsts;

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private app: AccountComponent) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;
    }

    ngOnInit() {
        this.form = this.formBuilder.group({
            tenancyname: [AppConsts.multiTenancy ? '' : AppConsts.tenancyName],
            username: ['', Validators.required]
        });


        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    onSubmit() {
        const self = this;

        self.submitted = true;

        // stop here if form is invalid
        if (self.form.invalid) {
            return;
        }

        self.userResetPassword.tenancyName = self.f.tenancyname.value;
        self.userResetPassword.userName = self.f.username.value;

        self.app.blocked = true;

        self.authenticationService.resetPassword(self.userResetPassword)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(
                data => {
                    self.alertService.custom(self.l('Confirmation'), self.l('ForgotPasswrod.Successfully'), function () {
                        self.router.navigate(['/account/login']);
                    });
                });
    }

    return(): void {
        this.router.navigate(['/account/login']);
    }
}
