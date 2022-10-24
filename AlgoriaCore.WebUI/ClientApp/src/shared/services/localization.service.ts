import { Injectable } from '@angular/core';
import { UserLocalizationConfigResponse, LanguageInfoResponse } from '../service-proxies/service-proxies';
import { StringsHelper } from '../helpers/StringsHelper';
import { DateTimeService } from './datetime.service';

@Injectable({ providedIn: 'root' })
export class LocalizationService {
    private _localization: UserLocalizationConfigResponse;

    constructor(
        private dateTimeService: DateTimeService
    ) { }

    get currentLanguage(): LanguageInfoResponse {
        return this._localization.currentLanguage;
    }

    get defaultLanguage(): LanguageInfoResponse {
        return this._localization.defaultLanguage;
    }

    set localization(localization) {
        this._localization = localization;
    }

    set currentLanguage(language: LanguageInfoResponse) {
        this._localization.currentLanguage = language;
    }

    set defaultLanguage(language: LanguageInfoResponse) {
        this._localization.defaultLanguage = language;
    }

    localize(key: string): string {
        return this._localization.values[key];
    }

    l(key: string, ...args: any[]): string {
        let localizedText = this.localize(key);

        if (!localizedText) {
            localizedText = key;
        }

        if (!args || !args.length) {
            return localizedText;
        }

        return StringsHelper.formatString(localizedText, args);
    }

    replaceLabel(value: string) {
        const self = this;

        if (!value) {
            return value;
        }

        const beginOfLabel = '{{';
        const endOfLabel = '}}';
        let label: string;
        let strConcatenated = '';
        let strRemaining = value;
        let strAux = '';
        let beginOfLabelNestedPosition = -1;
        let endOfLabelPosition = -1;
        const endOfLabelLength: number = endOfLabel.length;
        let positionToSearch: number;

        while (strRemaining.indexOf(beginOfLabel) >= 0) {
            strConcatenated += strAux;
            strAux = StringsHelper.strRight(strRemaining, beginOfLabel);

            beginOfLabelNestedPosition = strAux.indexOf(beginOfLabel);
            endOfLabelPosition = strAux.indexOf(endOfLabel);

            while (beginOfLabelNestedPosition >= 0 && beginOfLabelNestedPosition < endOfLabelPosition) {
                positionToSearch = endOfLabelPosition + endOfLabelLength;

                beginOfLabelNestedPosition = strAux.indexOf(beginOfLabel, positionToSearch);
                endOfLabelPosition = strAux.indexOf(endOfLabel, positionToSearch);
            }

            label = strAux.substring(0, endOfLabelPosition);

            if (label) {
                strConcatenated = self.getStrConcatenated(strConcatenated, label);
                strRemaining = strAux.substring(endOfLabelPosition + endOfLabelLength);
            } else {
                strRemaining = strAux;
            }

            strAux = StringsHelper.strLeft(strRemaining, beginOfLabel);
        }

        return strConcatenated + strRemaining;
    }

    private getStrConcatenated(value: string, label: string): string {
        const self = this;
        let strConcatenated = value;
        let labelOnly: string;
        let labelElements: string[] = [];
        let labelArgs: any[] = [];

        if (label.indexOf('(DT)') === 0) {
            labelOnly = label.replace('(DT)', '') + 'Z';
            strConcatenated += self.dateTimeService.getDateTimeStringISOToFormat(labelOnly);
        } else if (label.indexOf('(D)') === 0) {
            labelOnly = label.replace('(D)', '');
            strConcatenated += self.dateTimeService.getDateStringISOToFormat(labelOnly);
        } else if (label.indexOf('(T)') === 0) {
            labelOnly = label.replace('(T)', '');
            strConcatenated += self.dateTimeService.getTimeStringISOToFormat(labelOnly);
        } else {
            labelElements = label.split(',');
            labelOnly = labelElements[0];
            labelArgs = [];

            if (labelElements.length > 1) {
                labelArgs = labelElements.slice(1);

                labelArgs = labelArgs.map(function (arg) {
                    return self.replaceLabel(arg.trim());
                });
            }

            strConcatenated += self.l(labelOnly, ...labelArgs);
        }

        return strConcatenated;
    }
}
