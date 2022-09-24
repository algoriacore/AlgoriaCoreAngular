import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from '../../app/app-component-base';
import { AuthenticationService } from '../../app/_services/authentication.service';
import { AppConsts } from '../../shared/AppConsts';
import { StringsHelper } from '../../shared/helpers/StringsHelper';
import { UserLoginQuery } from '../../shared/service-proxies/service-proxies';
import { AccountComponent } from '../account.component';

@Component({
    templateUrl: 'login.component.html',
    providers: [MessageService]
})
export class LoginComponent extends AppComponentBase implements OnInit {
    form: FormGroup;
    submitted = false;
    returnUrl: string;
    userLoginQuery: UserLoginQuery = new UserLoginQuery();
    multiTenancy: boolean = AppConsts.multiTenancy;

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private messageService: MessageService,
        private app: AccountComponent
    ) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;
    }

    ngOnInit() {
        this.form = this.formBuilder.group({
            tenancyname: [{ value: AppConsts.tenancyName, disabled: !StringsHelper.isNullOrWhiteSpace(AppConsts.tenancyName) }],
            username: ['', Validators.required],
            password: ['', Validators.required]
        });

        // get return url from route parameters or default to '/'
        if (this.route.snapshot.queryParams['returnUrl'] && this.route.snapshot.queryParams['returnUrl'] !== '') {
            this.returnUrl = this.baseUrl + this.route.snapshot.queryParams['returnUrl'];
        } else {
            this.returnUrl = this.baseUrl;
        }
    }

    gotoRegister(): void {
        const self = this;

        self.router.navigate(['/account/register']);
    }

    onSubmit(): void {
        const self = this;

        self.submitted = true;

        // stop here if form is invalid
        if (self.form.invalid) {
            return;
        }

        self.userLoginQuery.tenancyName = self.f.tenancyname.value;
        self.userLoginQuery.userName = self.f.username.value;
        self.userLoginQuery.password = self.f.password.value;

        self.app.blocked = true;

        self.authenticationService.login(self.userLoginQuery)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(
                data => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.l('Login.Welcome'),
                        detail: data.firstName + ' ' + data.lastName
                    });
                    location.href = this.returnUrl;
                },
                error => {
                    if (error.StatusCode === 401) {
                        this.messageService.add({
                            severity: 'warn', summary: this.l('Login.FailLogin'), detail: this.l('Login.FailLoginMessage')
                        });
                        return false;
                    } else if (error.StatusCode === 409) {
                        this.messageService.add({ severity: 'warn', summary: error.Title, detail: error.Message });
                        return false;
                    } else if (error.StatusCode === 400) {
                        this.messageService.add({ severity: 'error', summary: error.Title, detail: error.Message });
                        return false;
                    } else if (error.StatusCode === 406) {
                    // Requiere cambio de contraseña
                        this.messageService.add({ severity: 'warn', summary: error.Title, detail: error.Message });

                        setTimeout(function () {
                            const a = {
                                queryParams: {
                                    tn: self.userLoginQuery.tenancyName,
                                    un: self.userLoginQuery.userName
                                }
                            };

                            self.router.navigate(['/account/changep'], a);
                        }, 2000);
                    }
                }
            );
    }
}
