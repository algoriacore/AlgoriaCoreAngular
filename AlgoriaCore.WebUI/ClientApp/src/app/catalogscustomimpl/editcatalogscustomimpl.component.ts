import { Location } from '@angular/common';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import { DateTimeService } from 'src/shared/services/datetime.service';
import { AppPermissions } from '../../shared/AppPermissions';
import { AppQuestionnaireComponent } from '../../shared/components/app.questionnaire.component';
import {
    CatalogCustomImplCreateCommand,
    CatalogCustomImplForEditResponse, CatalogCustomImplGetForEditQuery,
    CatalogCustomImplServiceProxy,
    CatalogCustomImplUpdateCommand, UserServiceProxy
} from '../../shared/service-proxies/service-proxies';
import { FormService } from '../../shared/services/form.service';
import { AppComponent } from '../app.component';

@Component({
    templateUrl: './editcatalogscustomimpl.component.html'
})
export class EditCatalogsCustomImplComponent extends AppComponentBase implements OnInit {

    @ViewChild('questionnaireComponent', { static: false }) questionnaireComponent;
    form: FormGroup;

    catalogId?: string = null;
    id?: string = null;
    model: CatalogCustomImplForEditResponse;

    permissions = { create: false, edit: false };

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private service: CatalogCustomImplServiceProxy,
        private serviceUser: UserServiceProxy,
        private formService: FormService,
        private dateTimeService: DateTimeService,
        private app: AppComponent,
        private location: Location
    ) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;
    }

    ngOnInit() {
        const self = this;

        if (self.activatedRoute.snapshot.url.length > 1 && (self.activatedRoute.snapshot.url[1].path === 'consult'
            || self.activatedRoute.snapshot.url[1].path === 'edit')) {
            self.id = self.activatedRoute.snapshot.params['id'] ? self.activatedRoute.snapshot.params['id'] : null;
        }

        self.catalogId = self.activatedRoute.snapshot.params['catalog'];
        self.permissions.create = self.permission.isGranted(
            AppPermissions.calculatePermissionNameForCatalogCustom(
                AppPermissions.catalogsCustomCreate, self.catalogId, self.app.currentUser.tenantId)
        );
        self.permissions.edit = self.permission.isGranted(
            AppPermissions.calculatePermissionNameForCatalogCustom(
                AppPermissions.catalogsCustomEdit, self.catalogId, self.app.currentUser.tenantId)
        );

        self.getForEdit();
    }

    getForEdit(): void {
        const self = this;

        self.app.blocked = true;

        self.service.getCatalogCustomImplForEdit(new CatalogCustomImplGetForEditQuery({ catalog: self.catalogId, id: self.id }))
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.model = data;
            });
    }

    save(): void {
        const self = this;
        const questionnaireComponent = self.questionnaireComponent as AppQuestionnaireComponent;
        console.log(questionnaireComponent.getFieldsData());
        // stop here if form is invalid
        if (!questionnaireComponent.validate()) {
            return;
        }

        if (self.id) {
            const cmd = new CatalogCustomImplUpdateCommand();

            cmd.catalog = self.catalogId;
            cmd.id = self.id;
            cmd.data = questionnaireComponent.getFieldsData();

            self.app.blocked = true;

            self.service.updateCatalogCustomImpl(cmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('CatalogsCustomImpl.CatalogCustomImpl.SuccessfulUpdate'), self.l('Success'));
                    self.return();
                });
        } else {
            const cmd = new CatalogCustomImplCreateCommand();

            cmd.catalog = self.catalogId;
            cmd.data = questionnaireComponent.getFieldsData();

            self.app.blocked = true;

            self.service.createCatalogCustomImpl(cmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('CatalogsCustomImpl.CatalogCustomImpl.SuccessfulCreate'), self.l('Success'));

                    questionnaireComponent.activaModoNuevo();
                });
        }
    }

    return(): void {
        const self = this;

        self.location.back();
    }
}
