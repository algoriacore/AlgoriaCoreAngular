import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { StringsHelper } from 'src/shared/helpers/StringsHelper';
import { AppComponentBase } from '../../app/app-component-base';
import { AuthenticationService } from '../../app/_services/authentication.service';
import { AppConsts } from '../../shared/AppConsts';
import { TenantCreateRegistrationCommand } from '../../shared/service-proxies/service-proxies';
import { AccountComponent } from '../account.component';

@Component({
    templateUrl: 'register.component.html',
    providers: [MessageService]
})
export class RegisterComponent extends AppComponentBase implements OnInit {
    form: FormGroup;
    submitted = false;
    returnUrl: string;
    userDto: TenantCreateRegistrationCommand = new TenantCreateRegistrationCommand();

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
            tenancyname: [{
                value: AppConsts.tenancyName,
                disabled: !StringsHelper.isNullOrWhiteSpace(AppConsts.tenancyName)
            }, Validators.required],
            tenantName: ['', Validators.required],
            password: ['', Validators.required],
            passwordConfirm: ['', Validators.required],
            name: ['', Validators.required],
            lastName: ['', Validators.required],
            secondLastName: [''],
            emailAddress: ['', Validators.required],
            noticeOfPrivacyAccepted: [false, Validators.requiredTrue]
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

        self.userDto.tenancyName = self.f.tenancyname.value;
        self.userDto.tenantName = self.f.tenantName.value;
        self.userDto.password = self.f.password.value;
        self.userDto.passwordConfirm = self.f.passwordConfirm.value;
        self.userDto.name = self.f.name.value;
        self.userDto.lastName = self.f.lastName.value;
        self.userDto.secondLastName = self.f.secondLastName.value;
        self.userDto.emailAddress = self.f.emailAddress.value;

        self.app.blocked = true;

        self.authenticationService.register(self.userDto)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.alertService.custom(self.l('Confirmation'), self.l('Register.User.Successfully'), function () {
                    self.router.navigate(['/account/login']);
                });
            });
    }

    return(): void {
        this.router.navigate(['/account/login']);
    }
}
