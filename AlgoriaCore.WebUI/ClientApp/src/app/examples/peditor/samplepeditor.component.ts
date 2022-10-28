import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import 'moment-duration-format';
import 'moment-timezone';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import { UserServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { AppComponent } from '../../app.component';

import Mention from 'quill-mention'
import { Editor } from 'primeng/editor';

@Component({
    templateUrl: './samplepeditor.component.html'
})
export class SamplePEditorComponent extends AppComponentBase implements OnInit {

    @ViewChild('editor', { static: true }) editor: Editor;

    form: FormGroup;

    fieldLabels: any = {};

    toolbar: any;
    heading: any;
    config: any;
    content: any;

    quillInstance: any;
    mentions: Mention;
    atValues: any;
    hashValues: any;

    savedData: any;

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private userService: UserServiceProxy,
        private app: AppComponent
    ) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;

    }
    ngOnInit() {
        const self = this;

        self.prepareForm();
    }

    editorOnInit(event: any) {
        const self = this;

        self.quillInstance = event.editor;
        self.mentions = new Mention(self.quillInstance, {
            mentionDenotationChars: ['@', '#'],
            source: function (searchTerm, renderList, mentionChar) {
                let values = [];

                if (mentionChar === '@') {

                    self.userService.getUserAutocompleteList(searchTerm)
                        .pipe(finalize(() => {
                            self.app.blocked = false;
                        }))
                        .subscribe(data => {
                            for (let i = 0, len = data.length; i < len; i++) {
                                values.push({
                                    id: data[i].id,
                                    value: (data[i].login + ' ' + data[i].fullName)
                                });
                            }
                            renderList(values, searchTerm);
                        });


                } else if (mentionChar === '#') {
                    self.userService.getUserAutocompleteList(searchTerm)
                        .pipe(finalize(() => {
                            self.app.blocked = false;
                        }))
                        .subscribe(data => {
                            for (let i = 0, len = data.length; i < len; i++) {
                                values.push({
                                    id: data[i].id,
                                    value: data[i].fullName
                                });
                            }
                            renderList(values, searchTerm);
                        });
                }
            }
        });
    }

    getMentions(): void {
        const self = this;

        console.log(self.quillInstance.editor.delta);
        console.log(self.quillInstance);
        console.log(self.quillInstance.getContents());
    }

    saveContent(): void {
        const self = this;

        const data = JSON.stringify(self.quillInstance.getContents());
        self.savedData = data;

        console.log(data);
    }

    setContent(): void {
        const self = this;

        const data = JSON.parse(self.savedData);
        self.quillInstance.setContents(data);

        console.log(data);
    }

    getHashtags(): void {
        const self = this;
    }

    prepareForm() {
        const self = this;

        self.fieldLabels = {
            simple: this.l('Examples.Autocomplete.Simple'),
            itemTemplate: this.l('Examples.Autocomplete.Itemtemplate'),
            multiple: this.l('Examples.Autocomplete.Multiple'),
            multipleWithChecks: this.l('Examples.Autocomplete.MultipleWithChecks'),
        };

        self.form = self.formBuilder.group({
            editorValue: [''],
            itemTemplateValue: [''],
            multiple: [[]],
            selectedValue: [[]]
        });
    }
}
