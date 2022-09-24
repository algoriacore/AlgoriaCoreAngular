export class StringsHelper {

    /* Find and replaces a string (search) to another string (replacement) in
    *  given string (str).
    *  Example:
    *  StringsHelper.replaceAll('This is a test string', 'is', 'X') = 'ThX X a test string'
    ************************************************************/
    static replaceAll(str, search, replacement): any {
        const fix = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return str.replace(new RegExp(fix, 'g'), replacement);
    }

    /* Formats a string just like string.format in C#.
    *  Example:
    *  StringsHelper.formatString('Hello {0}','Tuana') = 'Hello Tuana'
    ************************************************************/
    static formatString(str: string, args: any[]) {
        if (args.length < 1) {
            return null;
        }

        for (let i = 0; i < args.length; i++) {
            const placeHolder = '{' + i + '}';
            str = this.replaceAll(str, placeHolder, args[i]);
        }

        return str;
    }

    static strRight(value: string, searchedValue: string, includeSearchedValue = false) {
        if (!value) {
            return value;
        }

        const index: number = value.indexOf(searchedValue);

        if (index >= 0) {
            return value.substring(index + (includeSearchedValue ? 0 : searchedValue.length));
        } else {
            return '';
        }
    }

    static strLeft(value: string, searchedValue: string, includeSearchedValue = false) {
        return this.strLeftAux(value, searchedValue, includeSearchedValue, false);
    }

    static strLeftLast(value: string, searchedValue: string, includeSearchedValue = false) {
        return this.strLeftAux(value, searchedValue, includeSearchedValue, true);
    }

    static strLeftAux(value: string, searchedValue: string, includeSearchedValue: boolean, isLast: boolean) {
        if (!value) {
            return value;
        }

        const index: number = isLast ? value.lastIndexOf(searchedValue) : value.indexOf(searchedValue);

        if (index >= 0) {
            return value.substring(0, index + (includeSearchedValue ? searchedValue.length : 0));
        } else {
            return '';
        }
    }

    static isNullOrWhiteSpace(value: string): boolean {
        return value === null || value === undefined || value.trim() === '';
    }

    static addToEndIfNotExist(value: string, valueToAdd: string): string {
        return value.endsWith(valueToAdd) ? value : value + valueToAdd;
    }
}
