import { AfterContentChecked, Directive, ElementRef } from '@angular/core';

@Directive({
    selector: '[appCharacterCounter]'
})
export class CharacterCounterDirective implements AfterContentChecked {
    textElement: HTMLFormElement;

    constructor(private el: ElementRef) {
        const self = this;

        self.textElement = self.el.nativeElement as HTMLFormElement;

        self.textElement.addEventListener('keyup', (e) => {
            self.textElement.nextSibling.textContent = self.calculateCounterText();
        });

        self.textElement.insertAdjacentHTML('afterend', '<small>' + self.calculateCounterText() + '</small>');
        self.textElement.classList.add('appCharacterCounter');
    }

    ngAfterContentChecked(): void {
        const self = this;

        self.textElement.nextSibling.textContent = self.calculateCounterText();
    }

    calculateCounterText(): string {
        const self = this;

        return self.textElement.value.length + '/' + self.textElement.maxLength;
    }
}
