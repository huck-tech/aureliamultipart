import {inject} from 'aurelia-framework';

import {Factory} from 'helpers/factory';
import {P2Folder} from './p2-folder';
import {XdcamFolder} from './xdcam-folder';
import {R3dFolder} from './r3d-folder';

@inject(P2Folder, XdcamFolder, R3dFolder)
export class CameraFolderFileExtractor {

    constructor(p2Folder, xdcamFolder, r3dFolder) {
        this.folderTypes = {
            p2: p2Folder,
            xdcam: xdcamFolder,
            r3d: r3dFolder
        };
    }

    getFolderType(files) {
        for (let folderTypeName in this.folderTypes) {
            if (this.folderTypes.hasOwnProperty(folderTypeName)) {
                const folderType = this.folderTypes[folderTypeName];
                if (folderType.isFolderStructureMatch(files))
                    return folderType;
            }
        }

        return null;
    }
}