import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../_services/authentication.service';
import { PermissionCheckerService } from '../_services/permission.checker.service';
import { AppPermissions } from '../../shared/AppPermissions';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private _permissionChecker: PermissionCheckerService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        // verificar restricción
        if (route.data && route.data['restricted']) {
            return false;
        } else {
            // si no existe el usuario logueado, manda login
            const currentUser = this.authenticationService.currentUserValue;
            if (!currentUser) {
                this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
                return false;
            }

            let permission = route.data['permission'];

            // si no existe el objeto data o permission en data, regresa true
            if (!route.data || !permission) {
                return true;
            }

            if (AppPermissions.isPermissionNameForProcess(route.data['permission'])) {
                permission = AppPermissions.calculatePermissionNameForProcess(
                    AppPermissions.processes, route.params['template'], currentUser.tenantId);
            } else if (AppPermissions.isPermissionNameForCatalogCustom(route.data['permission'])) {
                permission = AppPermissions.calculatePermissionNameForCatalogCustom(
                    AppPermissions.catalogsCustom, route.params['catalog'], currentUser.tenantId);
            }

            if (this._permissionChecker.isGranted(permission)) {
                return true;
            }

            // not logged in so redirect to login page with the return url
            this.router.navigate([this.selectBestRoute()]);
            return false;
        }
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(route, state);
    }

    selectBestRoute(): string {
        if (!this.authenticationService.currentUserValue) {
            return '/account/login';
        }

        return '/app/main/dashboard';
    }
}
