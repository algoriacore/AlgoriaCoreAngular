import { AppConsts } from '../AppConsts';
import { FormattedStringValueExtracter } from './FormattedStringValueExtracter';

export class SubdomainTenancyNameFinder {

    getCurrentTenancyNameOrNull(rootAddress: string): string {
        if (rootAddress.indexOf(AppConsts.tenancyNamePlaceHolderInUrl) < 0) {
            // Web site does not support subdomain tenant name
            return null;
        }

        const currentRootAddress = document.location.href;
        const formattedStringValueExtracter = new FormattedStringValueExtracter();
        const values: any[] = formattedStringValueExtracter.isMatch(currentRootAddress, rootAddress);

        if (!values.length) {
            return null;
        }

        return values[0];
    }
}
