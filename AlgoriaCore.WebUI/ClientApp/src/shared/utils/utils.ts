import { AuthenticationService } from "../../app/_services/authentication.service";

export class Utils {

    public static isNullOrUndefined(value: any): boolean {
        return value === undefined || value === null;
    }

    public static isHost(authenticationService: AuthenticationService): boolean {
        return !(authenticationService.currentUserValue) || authenticationService.currentUserValue.tenantId === null;
    }

    public static normalizeAppBaseUrl(appBaseUrl: any): string {
        const position = appBaseUrl.indexOf('//');

        if (position >= 0) {
            return document.location.protocol + appBaseUrl.substring(position);
        } else {
            return document.location.protocol + '//' + appBaseUrl;
        }
    }
}
