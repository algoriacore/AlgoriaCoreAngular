import { LocalizationService } from '../services/localization.service';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FileService {

    constructor(private localizationService: LocalizationService) { }

    getBase64(file: File): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = function (readerEvt) {
                resolve(btoa(readerEvt.target['result'].toString()));
            };

            reader.onerror = error => reject(error);

            reader.readAsBinaryString(file);
        });
    }

    base64ToArrayBuffer(base64: string): Uint8Array {
        const binaryString = window.atob(base64); // Comment this if not using base64
        const bytes = new Uint8Array(binaryString.length);
        return bytes.map((byte, i) => binaryString.charCodeAt(i));
    }

    createAndDownloadBlobFile(body: Uint8Array, filename: string, extension: string) {
        const blob = new Blob([body]);
        const fileName = `${filename}.${extension}`;

        if (navigator['msSaveBlob']) {
            // IE 10+
            navigator['msSaveBlob'](blob, fileName);
        } else {
            const link = document.createElement('a');
            // Browsers that support HTML5 download attribute
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', fileName);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }

    createAndDownloadBlobFileFromBase64(base64: string, filename: string, extension: string) {
        const self = this;

        const arrayBuffer = self.base64ToArrayBuffer(base64);
        self.createAndDownloadBlobFile(arrayBuffer, filename, extension);
    }

    validate(file: File, validations: any): string[] {
        const self = this;
        const messages: string[] = [];

        if (validations['size'] && file.size > validations['size']) {
            let size = validations['size'];

            switch (validations['unit'].toLowerCase()) {
                case 'k':
                    size = size * 1000;
                    break;
                case 'mb':
                    size = size * 1000 * 1000;
                    break;
                case 'gb':
                    size = size * 1000 * 1000 * 1000;
                    break;
            }

            if (file.size > size) {
                messages.push(self.localizationService.l('InvalidFileSize', validations['size'] + validations['unit']));
            }
        }

        if (validations['extensions']) {
            let extensionFound = false;
            const fileExtension = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();

            for (const extension of validations['extensions']) {
                if (extension.toLowerCase() === fileExtension) {
                    extensionFound = true;
                    break;
                }
            }

            if (!extensionFound) {
                messages.push(self.localizationService.l('InvalidFileType', validations['extensions'].join(', ')));
            }
        }

        return messages;
    }
}
