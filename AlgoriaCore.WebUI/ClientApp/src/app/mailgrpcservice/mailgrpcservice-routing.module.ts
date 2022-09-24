import { NgModule } from '@angular/core';
import { RouterModule, Routes, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, NEVER } from 'rxjs';
import { EditMailServiceMailComponent } from './mailservicemail/editmailservicemail.component';
import { MailServiceMailComponent } from './mailservicemail/mailservicemail.component';

export class ExampleRouteResolver implements Resolve<any> {

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return NEVER;
    }
}

const routes: Routes = [

    { path: 'mailservicemail', component: MailServiceMailComponent, data: { permission: 'Pages.Administration.MailServiceMail' } },
    // eslint-disable-next-line max-len
    { path: 'mailservicemail/edit/:id', component: EditMailServiceMailComponent, data: { permission: 'Pages.Administration.MailServiceMail' } },

];

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forChild(routes)]
})
export class MailGrpcServiceRoutingModule { }
