import { NgModule } from '@angular/core';
import { RouterModule, Routes, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { EditTemplatesComponent } from './templates/edittemplates.component';
import { TemplatesComponent } from './templates/templates.component';
import { ProcessesComponent } from './processes/processes.component';
import { Observable, NEVER } from 'rxjs';
import { EditProcessesComponent } from './processes/editprocesses.component';
import { AppPermissions } from '../../shared/AppPermissions';
import { ConsultProcessesComponent } from './processes/consultprocesses.component';

export class ExampleRouteResolver implements Resolve<any> {

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return NEVER;
    }
}

const routes: Routes = [

    { path: 'templates', component: TemplatesComponent, data: { permission: 'Pages.Processes.Templates' } },
    { path: 'templates/create', component: EditTemplatesComponent, data: { permission: 'Pages.Processes.Templates.Create' } },
    { path: 'templates/edit/:id', component: EditTemplatesComponent, data: { permission: 'Pages.Processes.Templates.Edit' } },

    { path: ':template', component: ProcessesComponent, data: { permission: AppPermissions.processes } },
    { path: ':template/own', component: ProcessesComponent, data: { permission: AppPermissions.processes } },
    { path: ':template/ownpendings', component: ProcessesComponent, data: { permission: AppPermissions.processes } },
    { path: ':template/create', component: EditProcessesComponent, data: { permission: AppPermissions.processesCreate } },
    { path: ':template/consult/:id', component: ConsultProcessesComponent, data: { permission: AppPermissions.processes } },
    { path: ':template/edit/:id', component: EditProcessesComponent, data: { permission: AppPermissions.processesEdit } }

];

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forChild(routes)]
})
export class ProcessesRoutingModule { }
