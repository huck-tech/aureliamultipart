import {inject} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';

@inject(DialogController)
export class UploadConfirmation {
    
    constructor(dialogController) {
        this.dialogController = dialogController;
    }

    doUploadAgain() {
        this.dialogController.ok({ close: false, goToUploads: false });
    }

    doGoToUploads() {
        this.dialogController.ok({ close: true, goToUploads: true });
    }

    doClose() {
        this.dialogController.ok({ close: true, goToUploads: false });
    }
}