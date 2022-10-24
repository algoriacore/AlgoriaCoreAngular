import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import { AuthenticationService } from '../../app/_services/authentication.service';
import { UserChangePasswordCommand, UserLoginQuery } from '../../shared/service-proxies/service-proxies';
import { AccountComponent } from '../account.component';

@Component({
    templateUrl: 'changepassword.component.html',
    providers: [MessageService]
})
export class ChangePasswordComponent extends AppComponentBase implements OnInit {
    form: FormGroup;

    submitted = false;
    returnUrl: string;
    userChangePassword: UserChangePasswordCommand = new UserChangePasswordCommand();

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

        const tName = this.route.snapshot.queryParams['tn'];
        const uName = this.route.snapshot.queryParams['un'];

        this.form = this.formBuilder.group({
            tenancyName: [tName],
            userName: [uName, Validators.required],
            currentPassword: ['', Validators.required],
            newPassword: ['', Validators.required],
            confirmPassword: ['', Validators.required]
        });

        // get return url from route parameters or default to '/'
        if (this.route.snapshot.queryParams['returnUrl'] && this.route.snapshot.queryParams['returnUrl'] !== '') {
            this.returnUrl = this.baseUrl + this.route.snapshot.queryParams['returnUrl'];
        } else {
            this.returnUrl = this.baseUrl;
        }
    }

    onSubmit() {
        const self = this;

        self.submitted = true;

        // stop here if form is invalid
        if (self.form.invalid) {
            return;
        }

        self.userChangePassword.tenancyName = self.f.tenancyName.value;
        self.userChangePassword.userName = self.f.userName.value;
        self.userChangePassword.currentPassword = self.f.currentPassword.value;
        self.userChangePassword.newPassword = self.f.newPassword.value;
        self.userChangePassword.confirmPassword = self.f.confirmPassword.value;

        self.app.blocked = true;

        try {
            self.authenticationService.changePassword(self.userChangePassword)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(
                    data => {

                        // Si entra por aquí, entonces se debe hacer un login automático al sistema
                        const userLoginQuery: UserLoginQuery = new UserLoginQuery();
                        userLoginQuery.tenancyName = self.f.tenancyName.value;
                        userLoginQuery.userName = self.f.userName.value;
                        userLoginQuery.password = self.f.newPassword.value;

                        self.app.blocked = true;

                        self.authenticationService.login(userLoginQuery)
                            .pipe(finalize(() => {
                                self.app.blocked = false;
                            }))
                            .subscribe(
                                data2 => {
                                    this.messageService.add({
                                        severity: 'success',
                                        summary: this.l('ChangePassword.Welcome'),
                                        detail: data2.firstName + ' ' + data2.lastName
                                    });
                                    location.href = this.returnUrl;
                                },
                                error => {

                                    if (error.status === 401) {
                                        this.messageService.add({
                                            severity: 'warn',
                                            summary: this.l('ChangePassword.FailLogin'),
                                            detail: this.l('ChangePassword.FailLoginMessage')
                                        });

                                        return false;
                                    } else if (error.status === 400) {
                                        // Requiere cambio de contraseña
                                        this.messageService.add({
                                            severity: 'warn',
                                            summary: this.l('ChangePassword.FailLogin'),
                                            detail: this.l('ChangePassword.AskForPaswordChange')
                                        });

                                        self.router.navigate(['/account/login']);
                                    }
                                }
                            );
                    }
                );
        } catch (err) {
            console.log(err);
        }
    }

    return(): void {
        this.router.navigate(['/account/login']);
    }
}
