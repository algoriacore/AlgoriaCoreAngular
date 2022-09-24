import { Injectable } from '@angular/core';
import { UserPermissionConfigResponse } from '../../shared/service-proxies/service-proxies';

@Injectable()
export class PermissionCheckerService {

    private _permission: UserPermissionConfigResponse;

    set permission(permission) {
        this._permission = permission;
    }

    isGranted(permissionName: string): boolean {
        const p = this._permission.values[permissionName];
        return p === true;
    }
}
