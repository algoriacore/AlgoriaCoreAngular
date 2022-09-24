import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TitleService {
    /**
     * Get the title of the current HTML document.
     * @returns {string}
     */
    getTitle(): string {
        return document.title;
    }

    /**
     * Set the title of the current HTML document.
     * @param newTitle
     */
    setTitle(newTitle: string) {
        document.title = newTitle;
    }
}
