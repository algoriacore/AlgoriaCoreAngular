import { AuthenticationService } from '../../app/_services/authentication.service';

export class Utils {

    public static isNullOrUndefined(value: any): boolean {
        return value === undefined || value === null;
    }

    public static isNullOrWhiteSpace(value: any): boolean {
        return this.isNullOrUndefined(value) || (typeof(value) === 'string' && value.trim() === '');
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

    public static addItemCombo(combo: any[], item: any): any[] {
        const self = this;
        let comboAux = combo.concat([]);

        if (!(comboAux.some(p => p.value === item.value))) {
            comboAux.push(item);

            comboAux = comboAux.sort((a, b) => {
                const aLabel = a.label.toLowerCase();
                const bLabel = b.label.toLowerCase();

                if (aLabel > bLabel) {
                    return 1;
                } else if (aLabel < bLabel) {
                    return -1;
                } else {
                    return 0;
                }
            });
        }

        return comboAux;
    }

    public static normalizeTextToHTML(text: string): string {
        return text ? text.replaceAll('\n', '<br />') : text;
    }
}
