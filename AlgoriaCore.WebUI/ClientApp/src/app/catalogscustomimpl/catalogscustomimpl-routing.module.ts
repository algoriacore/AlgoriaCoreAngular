import { NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { NEVER, Observable } from 'rxjs';
import { AppPermissions } from '../../shared/AppPermissions';
import { CatalogsCustomImplComponent } from './catalogscustomimpl.component';
import { ConsultCatalogsCustomImplComponent } from './consultcatalogscustomimpl.component';
import { EditCatalogsCustomImplComponent } from './editcatalogscustomimpl.component';

export class ExampleRouteResolver implements Resolve<any> {

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return NEVER;
    }
}

const routes: Routes = [

    { path: ':catalog', component: CatalogsCustomImplComponent, data: { permission: AppPermissions.catalogsCustom } },
    { path: ':catalog/create', component: EditCatalogsCustomImplComponent, data: { permission: AppPermissions.catalogsCustomCreate } },
    { path: ':catalog/edit/:id', component: EditCatalogsCustomImplComponent, data: { permission: AppPermissions.catalogsCustomEdit } },
    { path: ':catalog/consult/:id', component: ConsultCatalogsCustomImplComponent, data: { permission: AppPermissions.catalogsCustom } }
];

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forChild(routes)]
})
export class CatalogsCustomImpRoutingModule { }
