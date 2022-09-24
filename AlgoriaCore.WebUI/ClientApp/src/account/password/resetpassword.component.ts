import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from '../../app/app-component-base';
import { AuthenticationService } from '../../app/_services/authentication.service';
import { ConfirmPasswordCommandReset } from '../../shared/service-proxies/service-proxies';
import { AccountComponent } from '../account.component';

@Component({
    templateUrl: 'resetpassword.component.html',
    providers: [MessageService]
})
export class ResetPasswordComponent extends AppComponentBase implements OnInit {
    form: FormGroup;
    submitted = false;
    returnUrl: string;
    userDto: ConfirmPasswordCommandReset = new ConfirmPasswordCommandReset();

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private messageService: MessageService,
        private app: AccountComponent) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;

    }
    ngOnInit() {
        this.form = this.formBuilder.group({
            password: ['', Validators.required],
            confirmPassword: ['', Validators.required]
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

        self.userDto.confirmationCode = this.route.snapshot.queryParams['code'];
        self.userDto.password = self.f.password.value;
        self.userDto.confirmPassword = self.f.confirmPassword.value;

        self.app.blocked = true;

        self.authenticationService.confirmResetPassword(self.userDto)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(
                data => {
                    self.alertService.custom(self.l('Confirmation'), self.l('ResetPasswrod.Successfully'), function () {
                        self.router.navigate(['/account/login']);
                    });
                });
    }

    return(): void {
        this.router.navigate(['/account/login']);
    }
}
