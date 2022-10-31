import { AfterViewInit, Component, ElementRef, Injector, Input, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { FileUpload } from 'primeng/fileupload';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from '../../app/app-component-base';
import { AppComponent } from '../../app/app.component';
import { StringsHelper } from '../helpers/StringsHelper';
import {
    ChatRoomChatCreateCommand, ChatRoomChatFileCreateCommand,
    ChatRoomChatForListResponse,
    ChatRoomChatGetForLogListQuery,
    ChatRoomChatGetListQuery, ChatRoomGetOrCreateCommand,
    ChatRoomResponse, ChatRoomServiceProxy,
    FileServiceProxy, UserServiceProxy
} from '../service-proxies/service-proxies';
import { DateTimeService } from '../services/datetime.service';
import { FileService } from '../services/file.service';

import Mention from 'quill-mention';

@Component({
    selector: 'app-chatlog',
    templateUrl: 'app.chatlog.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class AppChatLogComponent extends AppComponentBase implements OnInit, AfterViewInit {

    @Input() chatRoomId: string;
    @Input() name: string;
    @Input() description: string;

    @ViewChild('fileUpload') fileUpload: FileUpload;
    @ViewChild('attachmentWindowList', { static: false }) attachmentWindowList: ElementRef;
    @ViewChild('chatbox', { static: false }) chatbox: ElementRef;

    configInputMessageObject: any;

    isReady = false;
    blocked = false;

    chatRoom = new ChatRoomResponse;
    usersMentioned = [];

    isSeeAttachments = false;
    currentAttachmentModeObject: any;

    // Attachment Window
    attachmentWindowBlocked = false;
    isAttachmentWindowOpen = false;

    quillInstance: any;
    quillContentInstance: any;
    mentions: Mention;

    allMessages: ChatRoomChatForListResponse[] = [];
    messagesCount = 0;

    lastChatId = 0;
    loadingScroll = false;
    lastScrollHeight = 0;

    constructor(
        injector: Injector,
        private service: ChatRoomServiceProxy,
        private userService: UserServiceProxy,
        public dateTimeService: DateTimeService,
        private app: AppComponent,
        private fileLocalService: FileService,
        private fileService: FileServiceProxy,
        private renderer: Renderer2
    ) {
        super(injector);
    }

    ngOnInit() {
        const self = this;

        self.chatRoom.chatRoomId = self.chatRoomId;
        self.chatRoom.name = self.name;
        self.chatRoom.description = self.description;

        self.initializeCurrentAttachmentModeObject();

        self.loadMessages();
    }

    ngAfterViewInit(): void {
        const self = this;

        self.getChatRoom();
        self.isReady = true;
    }

    getChatRoom(): void {
        const self = this;

        self.app.blocked = true;

        self.service.getChatRoomByChatRoomId(self.chatRoomId)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                if (data) {
                    self.chatRoom = data;
                }
            });
    }

    search(opts: any, callback: any): void {
        const self = this;

        self.userService.getUserAutocompleteList(opts.query)
            .subscribe(data => {
                callback(data);
            });
    }

    editorOnInit(event: any) {
        const self = this;

        self.quillInstance = event.editor;
        self.mentions = new Mention(self.quillInstance, {
            mentionDenotationChars: ['@', '#'],
            source: function (searchTerm, renderList, mentionChar) {
                const values = [];
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

    contentAreaOnInit(event: any) {
        const self = this;

        self.quillContentInstance = event.editor;
        self.quillContentInstance.disable();
    }

    loadMessages(): void {
        const self = this;

        self.app.blocked = true;
        self.loadingScroll = true;

        const req = new ChatRoomChatGetForLogListQuery();
        req.lastId = self.lastChatId;

        self.service.getChatRoomChatForLogList(req)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {

                if (data.length <= 0) {
                    return;
                }

                for (let i = 0, len = data.length; i < len; i++) {
                    self.allMessages.splice(0, 0, data[i]);

                    self.lastChatId = data[i].id;
                }

                self.scrollToPos();

                if (req.lastId <= 0) {
                    self.addScrollEvent();
                }

                self.loadingScroll = false;
            });
    }

    addScrollEvent(): void {
        const self = this;

        self.renderer.listen(self.chatbox.nativeElement, 'scroll', (e) => {
            const scrolltop = (e.target as Element).scrollTop;
            if (scrolltop <= 30) {
                self.doScroll(e);
            }
        });
    }

    scrollToBottom(): void {
        const self = this;
        self.lastScrollHeight = 0;
        self.scrollToPos();
    }

    scrollToPos(): void {
        const self = this;
        setTimeout(function () {
            try {
                const newPos = self.chatbox.nativeElement.scrollHeight - self.lastScrollHeight;
                self.chatbox.nativeElement.scrollTo(0, newPos);
            } catch (err) {
                console.log(err);
            }
        }, 0);
    }

    doScroll($event): void {
        const self = this;

        if (self.loadingScroll) {
            return;
        }

        self.loadingScroll = true;
        self.lastScrollHeight = self.chatbox.nativeElement.scrollHeight;
        self.loadMessages();
    }

    sanitizeComments(comments: string): string {
        comments = comments ? comments : '';

        return comments.replace('?<span', '<span')
            .replace('/span>?', '/span>')
            .replace('? <span', '<span')
            .replace('/span> ?', '/span>');
    }

    getUrlUserPicture(user: number): string {
        const self = this;

        return self.getBaseServiceUrl() + '/api/User/GetPictureProfile?id=' + user;
    }

    getAttachementDownloadIcon(extension: string): string {
        let res = '';

        switch (extension.toLowerCase()) {
            case 'jpeg':
            case 'jpg':
                res = 'jpg';
                break;
            case 'png':
                res = 'png';
                break;
            case 'pdf':
                res = 'pdf';
                break;
            case 'txt':
                res = 'txt';
                break;
            case 'doc':
            case 'docx':
                res = 'doc';
                break;
            case 'xls':
            case 'xlsx':
                res = 'xls';
                break;
            case 'pptx':
            case 'ppt':
                res = 'ppt';
                break;
            case 'csv':
                res = 'csv';
                break;
            case 'js':
                res = 'js';
                break;
            case 'css':
                res = 'css';
                break;
            case 'json':
                res = 'json';
                break;
            default:
                res = 'archivo';
                break;
        }

        return 'assets/chatlogeditor/img/' + res + '.png';
    }

    sendMessage(): void {
        const self = this;
        const messageStr = self.quillInstance.root.innerHTML;

        if (messageStr) {
            if (self.chatRoom.id) {
                self.sendMessageAux();
            } else {
                self.app.blocked = true;

                self.service.getOrCreateChatRoom(new ChatRoomGetOrCreateCommand({
                    chatRoomId: self.chatRoomId,
                    name: self.name,
                    description: self.description
                }))
                    .pipe(finalize(() => {
                        self.app.blocked = false;
                    }))
                    .subscribe(data => {
                        self.chatRoom = data;
                        self.sendMessageAux();
                    });
            }
        }
    }

    sendMessageAux(): void {
        const self = this;
        const messageStr = self.quillInstance.root.innerHTML;

        if (messageStr) {
            const taggedUsers = [];
            const files = [];
            const promises = [];
            let promise;
            let pointPosition;

            const delta = self.quillInstance.getContents();
            for (const element of delta.ops) {
                if (element.insert.mention) {
                    taggedUsers.push(element.insert.mention.id);
                }
            }

            for (const file of self.fileUpload.files) {
                promise = self.fileLocalService.getBase64(file);
                promise.then(base64 => {
                    pointPosition = file.name.lastIndexOf('.');

                    files.push(new ChatRoomChatFileCreateCommand({
                        fileName: file.name.substring(0, pointPosition),
                        fileExtension: file.name.substring(pointPosition + 1),
                        base64: base64
                    }));
                });

                promises.push(promise);
            }

            Promise.all(promises).then(() => {
                // Mandar llamar servicio para agregar nuevo comentario
                // self.blocked = true;
                self.app.blocked = true;

                self.service.createChatRoomChat(new ChatRoomChatCreateCommand({
                    chatRoom: self.chatRoom.id,
                    comment: messageStr,
                    taggedUsers: taggedUsers,
                    files: files
                }))
                    // .pipe(finalize(() => { self.blocked = false; }))
                    .pipe(finalize(() => {
                        self.app.blocked = false;
                    }))
                    .subscribe(data => {

                        self.allMessages.push(new ChatRoomChatForListResponse({
                            id: data.id,
                            chatRoom: data.chatRoom,
                            comment: data.comment,
                            creationTime: data.creationTime,
                            files: data.files,
                            user: data.user,
                            userDesc: data.userDesc
                        }));

                        self.scrollToBottom();

                        // self.currentModeObject.query.skip++;
                        self.fileUpload.clear();

                        self.quillInstance.setContents('');
                    }, error => {
                        self.fileUpload.clear();
                    });
            });
        }
    }

    downloadAttachedFile(uuid: string, fileName: string, fileExtension: string): void {
        const self = this;

        self.app.blocked = true;

        self.fileService.getFileB64(uuid)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.fileLocalService.createAndDownloadBlobFileFromBase64(
                    data,
                    fileName, fileExtension
                );
            });
    }

    // Attachments

    initializeCurrentAttachmentModeObject(): void {
        const self = this;

        self.currentAttachmentModeObject = {
            totalMessages: 0, cke: null, addedToTheEnd: true, lastScrollHeight: 0, lastScrollTop: 0, isFirstLoad: true,
            query: new ChatRoomChatGetListQuery()
        };

        self.currentAttachmentModeObject.query.chatRoomId = self.chatRoomId;
        self.currentAttachmentModeObject.query.onlyFiles = true;
        self.currentAttachmentModeObject.query.pageNumber = 0;
        self.currentAttachmentModeObject.query.pageSize = 10;
        self.currentAttachmentModeObject.query.skip = 0;
        self.currentAttachmentModeObject.query.sorting = 'CreationTime DESC';
    }

    getAttachments(): void {
        const self = this;

        self.app.blocked = true;

        self.service.getChatRoomChatList(self.currentAttachmentModeObject.query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.currentAttachmentModeObject.query.skip += data.items.length;
                self.currentAttachmentModeObject.totalMessages = data.totalCount;

                self.getAttachmentItemHTML(data.items);
            });
    }

    getAttachmentItemHTML(messages: ChatRoomChatForListResponse[]): void {
        const self = this;
        let dvUser;
        let dvFileSection;
        let dvFile;
        let dvFileA;
        let dvFileImg;
        let dvFileAText;

        for (const message of messages) {
            dvUser = self.renderer.createElement('div');
            dvFileSection = self.renderer.createElement('div');

            dvUser.innerHTML = StringsHelper.formatString(
                '{0} {1}',
                [
                    self.dateTimeService.getDateTimeToDisplay(message.creationTime),
                    message.userDesc
                ]);

            dvUser.style = 'font-weight: 700;';
            dvFileSection.style = 'margin-top: 10px; margin-bottom: 30px;';

            self.renderer.appendChild(self.attachmentWindowList.nativeElement, dvUser);
            self.renderer.appendChild(self.attachmentWindowList.nativeElement, dvFileSection);

            for (const file of message.files) {
                dvFile = self.renderer.createElement('div');
                dvFileA = self.renderer.createElement('a');
                dvFileImg = self.renderer.createElement('img');
                dvFileAText = self.renderer.createText(file.fileName + '.' + file.fileExtension);

                dvFileA.style = 'cursor: pointer;';
                dvFileImg.style = 'height: 32px; cursor: pointer; display: inline; margin-right: 5px;';

                self.renderer.setAttribute(dvFileA, 'data-file', file.file);
                self.renderer.setAttribute(dvFileA, 'data-file-name', file.fileName);
                self.renderer.setAttribute(dvFileA, 'data-file-extension', file.fileExtension);
                self.renderer.setAttribute(dvFileImg, 'src', self.getAttachementDownloadIcon(file.fileExtension));

                self.renderer.listen(dvFileA, 'click', function (event) {
                    self.downloadAttachedFile(file.file, file.fileName, file.fileExtension);
                });

                self.renderer.appendChild(dvFileSection, dvFile);
                self.renderer.appendChild(dvFile, dvFileA);
                self.renderer.appendChild(dvFileA, dvFileImg);
                self.renderer.appendChild(dvFileA, dvFileAText);
            }
        }
    }

    openAttachmentWindow(attachmentWindow: any, event): void {
        const self = this;

        if (!self.isAttachmentWindowOpen) {
            self.initializeCurrentAttachmentModeObject();
            self.attachmentWindowList.nativeElement.innerHTML = '';
            self.getAttachments();
            attachmentWindow.show(event);
        }
    }

    onScrollAttachmentWindow(event: any): void {
        const self = this;
        const scrollTop = event.target.scrollTop;

        if (event.target.scrollHeight - scrollTop - 500 <= 100) {
            if (self.currentAttachmentModeObject.query.skip < self.currentAttachmentModeObject.totalMessages
                && self.attachmentWindowBlocked !== true) {
                self.getAttachments();
                self.currentAttachmentModeObject.lastScrollTop = scrollTop;
            }
        }
    }
}
