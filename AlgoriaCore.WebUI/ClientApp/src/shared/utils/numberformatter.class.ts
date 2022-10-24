import { Utils } from "./utils";

export class NumberFormatter {

    // métodos privados
    public format(value, nDecs): string {

        let valor: any = '';

        if (Utils.isNullOrUndefined(value)) {
            value = '0';
        }

        valor = parseFloat(value.toString().replace(/,/gi, ''));

        if (nDecs > 0) {
            valor = this.round(valor, nDecs);
        }

        if (isNaN(valor)) {
            return;
        }

        // Trabaja sobre el valor absoluto
        valor = Math.abs(valor);

        const vals = valor.toString();
        const partes = vals.split('.');
        let entero = this.getEntero(partes[0]);

        // Decimales default
        let nDecimals = -1;
        let strDecs = '';

        for (let j = 1; j <= nDecs; j++) {
            strDecs += '0';
        }

        if (nDecimals === -1) {
            if (!Utils.isNullOrUndefined(partes[1])) {
                nDecimals = partes[1];
            }
        } else if (!Utils.isNullOrUndefined(partes[1])) {
            nDecimals = partes[1];
            nDecimals = parseInt((nDecimals + strDecs).substring(0, nDecimals), 10);
        } else {
            nDecimals += parseInt(strDecs, 10);
        }

        let resp = nDecimals === -1 || nDecimals === 0 ? entero : entero + '.' + nDecimals;

        // Rellenar con ceros los decimales que falten al final..
        if (nDecs > 0) {
            if (resp.indexOf('.') < 0) {
                resp += ('.' + strDecs);
            } else {
                let so = resp.substring(resp.indexOf('.'));

                so = so.replace('.', '');

                for (let i = (so.length + 1); i <= nDecs; i++) {
                    resp += '0';
                }
            }
        }

        const esNegativo = (valor < 0);

        if (esNegativo) {
            resp = '-' + resp;
        }

        // Se regresa el valor formateado correctamente
        return resp;
    }

    public round(value, nDecimals): string {

        const num = value;
        if (!('' + num).includes('e')) {
            const esx = +(Math.round(parseFloat(num.toString() + 'e+' + nDecimals)) + 'e-' + nDecimals);
            return esx.toString();
        } else {
            const arr = ('' + num).split('e');
            let sig = '';
            if (+arr[1] + nDecimals > 0) {
                sig = '+';
            }

            const esx = +(Math.round(parseFloat(+arr[0] + 'e' + sig + (+arr[1] + nDecimals))) + 'e-' + nDecimals);

            return esx.toString();
        }
    }

    private getEntero(value: string): string {
        let entero = '';
        let cont = 0;

        for (let i = value.length - 1; i >= 0; i--) {
            cont++;
            entero = value[i] + entero;

            // Si es el tercer carácter, se le pone una coma
            if (cont % 3 === 0 && i > 0) {
                entero = ',' + entero;
            }
        }

        return entero;
    }
}
