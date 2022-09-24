import { Location } from '@angular/common';
import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import {
    CatalogCustomImplForEditResponse,
    CatalogCustomImplGetForReadQuery,
    CatalogCustomImplServiceProxy
} from '../../shared/service-proxies/service-proxies';
import { AppComponent } from '../app.component';

@Component({
    templateUrl: './consultcatalogscustomimpl.component.html'
})
export class ConsultCatalogsCustomImplComponent extends AppComponentBase implements OnInit {

    catalogId?: string = null;
    id?: string = null;
    model: CatalogCustomImplForEditResponse;

    constructor(
        injector: Injector,
        private activatedRoute: ActivatedRoute,
        private service: CatalogCustomImplServiceProxy,
        private app: AppComponent,
        private location: Location
    ) {
        super(injector);
    }

    ngOnInit() {
        const self = this;

        self.id = self.activatedRoute.snapshot.params['id'];
        self.catalogId = self.activatedRoute.snapshot.params['catalog'];

        self.getForRead();
    }

    getForRead(): void {
        const self = this;

        self.app.blocked = true;

        self.service.getCatalogCustomImplForRead(new CatalogCustomImplGetForReadQuery({ catalog: self.catalogId, id: self.id }))
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.model = data;
            });
    }

    return(): void {
        const self = this;

        self.location.back();
    }
}
