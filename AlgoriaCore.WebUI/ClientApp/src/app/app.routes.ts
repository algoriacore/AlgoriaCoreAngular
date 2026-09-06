import { ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { DummyComponent } from './dummy.component';
import { AuthGuard } from './_guards/auth.guard';

export const AppRoutes: ModuleWithProviders<any> = RouterModule.forRoot([{
    path: 'app',
    component: AppComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
        {
            path: '',
            children: [
                { path: '', redirectTo: '/app/main/dashboard', pathMatch: 'full' }
            ]
        },
        { path: 'dummy', component: DummyComponent },
        {
            path: 'main',
            loadChildren: () => import('../app/main/main.module').then(m => m.MainModule)
        },
        {
            path: 'admin',
            loadChildren: () => import('../app/admin/admin.module').then(m => m.AdminModule)
        },
        {
            path: 'examples',
            loadChildren: () => import('../app/examples/examples.module').then(m => m.ExamplesModule)
        },
        {
            path: 'chatrooms',
            loadChildren: () => import('../app/chatrooms/chatrooms.module').then(m => m.ChatRoomsModule)
        },
        {
            path: 'mailgrpcservice',
            loadChildren: () => import('../app/mailgrpcservice/mailgrpcservice.module').then(m => m.MailGrpcServiceModule)
        }
    ]
// }], { relativeLinkResolution: 'legacy' });
}]);
