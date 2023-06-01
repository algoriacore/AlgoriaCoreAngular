import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BrowserUtils } from '@azure/msal-browser';

const routes: Routes = [
    { path: '', redirectTo: 'app/main/dashboard', pathMatch: 'full' },
    {
        path: 'account',
        loadChildren: () => import('./account/account.module').then(m => m.AccountModule)
    }
];

const isIframe = window !== window.parent && !window.opener;

@NgModule({
    // imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
    imports: [RouterModule.forRoot(routes, {
        // Don't perform initial navigation in iframes or popups
        initialNavigation:
            !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup()
                ? 'enabledNonBlocking'
                : 'disabled', // Set to enabledBlocking to use Angular Universal
    })],
    exports: [RouterModule],
    providers: []
})
export class RootRoutingModule { }
