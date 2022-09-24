import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { TenantCreateCommand, TenantServiceProxy } from '../../../shared/service-proxies/service-proxies';
import { AppComponentBase } from '../../app-component-base';
import { AppComponent } from '../../app.component';

@Component({
    templateUrl: './createtenant.component.html'
})
export class CreateTenantComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    returnUrl: string;
    tenantDto: TenantCreateCommand = new TenantCreateCommand();

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private tenantService: TenantServiceProxy,
        private messageService: MessageService,
        private app: AppComponent) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;
    }

    ngOnInit() {
        const self = this;

        self.form = this.formBuilder.group({
            tenancyname: ['', [Validators.required, Validators.maxLength(50)]],
            tenantName: ['', [Validators.required, Validators.maxLength(150)]],
            password: ['', [Validators.required, Validators.maxLength(50)]],
            passwordConfirm: ['', [Validators.required, Validators.maxLength(50)]],
            name: ['', [Validators.required, Validators.maxLength(32)]],
            lastName: ['', [Validators.required, Validators.maxLength(50)]],
            secondLastName: ['', [Validators.maxLength(50)]],
            emailAddress: ['', [Validators.required, Validators.maxLength(250)]]
        });

        // get return url from route parameters or default to '/'
        self.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    save() {
        const self = this;

        self.tenantDto.tenancyName = self.f.tenancyname.value;
        self.tenantDto.tenantName = self.f.tenantName.value;
        self.tenantDto.password = self.f.password.value;
        self.tenantDto.passwordConfirm = self.f.passwordConfirm.value;
        self.tenantDto.name = self.f.name.value;
        self.tenantDto.lastName = self.f.lastName.value;
        self.tenantDto.secondLastName = self.f.secondLastName.value;
        self.tenantDto.emailAddress = self.f.emailAddress.value;

        self.app.blocked = true;

        self.tenantService.createTenant(self.tenantDto)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.notify.success(self.l('Tenants.Tenant.SuccessfulCreate2'), self.l('Success'));
                setTimeout(function () {
                    self.return();
                }, 3000);
            },
            error => {
                self.app.blocked = false;
                return false;
            });
    }

    return(): void {
        this.router.navigate(['/app/admin/tenant']);
    }
}
