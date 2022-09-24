import { AfterViewInit, Component, ElementRef, forwardRef, Injector, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as Quill from 'quill';
import { AppComponentBase } from '../../app/app-component-base';

@Component({
    selector: 'app-editor',
    templateUrl: 'app.editor.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AppEditorComponent),
            multi: true
        }
    ]
})

export class AppEditorComponent extends AppComponentBase implements AfterViewInit, ControlValueAccessor  {

    @ViewChild('quillEditorContainer', { read: ElementRef, static: false }) quillEditorContainer: ElementRef;
    @ViewChild('quillEditorToolbarContainer', { read: ElementRef, static: false }) quillEditorToolbarContainer: ElementRef;

    @Input()
        _editorValue: any;

    @Input()
        style: any;

    quillEditor: Quill;

    constructor(
        injector: Injector
    ) {
        super(injector);

        Quill.register(Quill.import('attributors/style/font'), true);
        Quill.register(Quill.import('attributors/style/size'), true);
        Quill.register(Quill.import('attributors/style/align'), true);
        Quill.register(Quill.import('attributors/style/direction'), true);
    }

    propagateChange = (_: any) => { };

    writeValue(value: any) {
        const self = this;

        if (self.quillEditor) {
            self.quillEditor.root.innerHTML = value ? value.replace(/\n/g, '') : '';
        }

        self._editorValue = value;
        self.propagateChange(self._editorValue);
    }

    registerOnChange(fn) {
        this.propagateChange = fn;
    }

    registerOnTouched() { }

    transformStyle(style: any): string {
        let styleStr = '';

        if (style) {
            Object.keys(style).forEach(key => {
                styleStr += key + ':' + style[key] + ';';
            });
        }

        return styleStr;
    }

    ngAfterViewInit() {
        const self = this;

        self.quillEditor = new Quill(self.quillEditorContainer.nativeElement, {
            modules: {
                toolbar: self.quillEditorToolbarContainer.nativeElement
            },
            theme: 'snow'
        });

        self.quillEditor.on('text-change', function (delta, oldDelta, source) {
            self._editorValue = self.quillEditor.root.innerHTML.replace(/\n\n/g, '\n');
            self.propagateChange(self._editorValue);
        });

        const showHtmlButton = self.quillEditorToolbarContainer.nativeElement.querySelector('.ql-show-html');
        showHtmlButton.addEventListener('click', function () {
            const quill: Quill = self.quillEditor;

            let htmlEditor = quill.container.querySelector<HTMLTextAreaElement>('.ql-html-editor');

            if (htmlEditor) {
                this.innerHTML = 'HTML';
                this.classList.remove('fa');
                this.classList.remove('fa-eye');
                // quill.root.innerHTML = htmlEditor.value;
                // quill.root.innerHTML = htmlEditor.value.replace(/\n/g, '').replace(/ /g, '&nbsp;').replace(/\t/g, '&#9;');
                quill.root.innerHTML = htmlEditor.value.replace(/\n/g, '');
                quill.container.removeChild(htmlEditor);
            } else {
                this.innerHTML = '';
                this.classList.add('fa');
                this.classList.add('fa-eye');
                htmlEditor = document.createElement('textarea');
                htmlEditor.className = 'ql-html-editor';
                // htmlEditor.value = quill.root.innerHTML;
                // htmlEditor.value = quill.root.innerHTML.replace(/\n\n/g, '\n').replace(/ /g, '&nbsp;').replace(/\t/g, '&#9;');
                htmlEditor.value = quill.root.innerHTML.replace(/\n\n/g, '\n');
                quill.container.appendChild(htmlEditor);

                htmlEditor.addEventListener('change', function () {
                    self._editorValue = htmlEditor.value;
                    self.propagateChange(self._editorValue);
                });
            }
        });

        if (self.style) {
            self.quillEditor.container.style = self.transformStyle(self.style);
        }
    }
}
