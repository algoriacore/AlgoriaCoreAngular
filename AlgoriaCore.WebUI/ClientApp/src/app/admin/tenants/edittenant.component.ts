import { AfterViewInit, Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import { TenantResponse, TenantServiceProxy, UpdateTenantCommand } from '../../../shared/service-proxies/service-proxies';
import { AppComponent } from '../../app.component';

@Component({
    templateUrl: './edittenant.component.html'
})
export class EditTenantComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    id?: number = null;
    model: TenantResponse;
    isactive: boolean;

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private tenantService: TenantServiceProxy,
        private app: AppComponent
    ) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;
    }

    ngOnInit() {
        const self = this;

        if (self.activatedRoute.snapshot.url.length > 1 && self.activatedRoute.snapshot.url[1].path === 'edit') {
            self.id = self.activatedRoute.snapshot.params['id'] ? Number(self.activatedRoute.snapshot.params['id']) : null;
        }

        self.form = self.formBuilder.group({
            name: [''],
            tenancyName: [''],
            isActive: ['true']
        });

        if (self.id) {
            self.getForEdit(self.id);
        }
    }

    getForEdit(id: number): void {
        const self = this;

        self.app.blocked = true;

        self.tenantService.getTenantById(id)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.model = data;

                self.f.name.setValue(self.model.name);
                self.f.tenancyName.setValue(self.model.tenancyName);
                self.f.isActive.setValue(self.model.isActive);
            });
    }

    save(): void {
        const self = this;

        const updateCmd = new UpdateTenantCommand();
        updateCmd.id = self.model.id;
        updateCmd.name = self.f.name.value;
        updateCmd.tenancyName = self.f.tenancyName.value;
        updateCmd.isActive = self.f.isActive.value;

        self.app.blocked = true;

        self.tenantService.updateTenant(updateCmd)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.notify.success(self.l('SavedSuccessfully'), self.l('Success'));
                self.return();
            });
    }

    activaModoNuevo(): void {
        const self = this;

        self.form = self.formBuilder.group({
            name: [''],
            tenancyName: [''],
            isActive: ['true']
        });
    }

    return(): void {
        this.router.navigate(['/app/admin/tenant']);
    }
}
