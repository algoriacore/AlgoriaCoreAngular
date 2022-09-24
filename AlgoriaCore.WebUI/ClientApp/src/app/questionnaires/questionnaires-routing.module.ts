import { NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { NEVER, Observable } from 'rxjs';
import { CatalogsCustomComponent } from './catalogscustom/catalogscustom.component';
import { EditCatalogsCustomComponent } from './catalogscustom/editcatalogscustom.component';
import { EditQuestionnairesComponent } from './questionnaires/editquestionnaires.component';
import { QuestionnairesComponent } from './questionnaires/questionnaires.component';

export class ExampleRouteResolver implements Resolve<any> {

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return NEVER;
    }
}

const routes: Routes = [

    { path: 'questionnaires', component: QuestionnairesComponent, data: { permission: 'Pages.Questionnaires' } },
    { path: 'questionnaires/create', component: EditQuestionnairesComponent, data: { permission: 'Pages.Questionnaires.Create' } },
    { path: 'questionnaires/edit/:id', component: EditQuestionnairesComponent, data: { permission: 'Pages.Questionnaires.Edit' } },
    { path: 'catalogscustom', component: CatalogsCustomComponent, data: { permission: 'Pages.CatalogsCustom' } },
    { path: 'catalogscustom/create', component: EditCatalogsCustomComponent, data: { permission: 'Pages.CatalogsCustom.Create' } },
    { path: 'catalogscustom/edit/:id', component: EditCatalogsCustomComponent, data: { permission: 'Pages.CatalogsCustom.Edit' } }

];

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forChild(routes)]
})
export class QuestionnairesRoutingModule { }
