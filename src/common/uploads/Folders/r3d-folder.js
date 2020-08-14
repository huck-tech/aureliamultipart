import {inject} from 'aurelia-framework';
import config from 'app-config';

@inject(config)
export class R3dFolder {

    constructor(config) {
        this.config = config;
    }

    isFolderStructureMatch(files) {
        let foundRdcFolder = false;
        let foundR3dFile = false;
        for (let i = 0; i < files.length; i++) {
            console.log(files[i].webkitRelativePath)
            if (files[i].webkitRelativePath.includes('.RDC/'))
                foundRdcFolder = true;
            if (files[i].webkitRelativePath.endsWith('.R3D'))
                foundR3dFile = true;
        }

        return foundRdcFolder && foundR3dFile;
    }

    getClips(files) {
        const map = {};
        
        for (let i = 0; i < files.length; i++) {
            // get relative path for file
            const path = files[i].webkitRelativePath;

            // skip files that are not R3D files inside of .RDC folders
            if (!path.includes('.RDC/') || !path.endsWith('.R3D'))
                continue;

            // start at the .RDC index
            const rdcIndex = path.indexOf('.RDC/');

            // move backward in the string until we find a slash
            let curIndex = rdcIndex - 1;
            while (path[curIndex] !== '/' && curIndex > 0) {
                curIndex--;
            }

            // if the first char is not a slash, that means the root folder is the .RDC folder,
            // and its path does not have a leading slash
            if (path[curIndex] === '/') {
                curIndex++;
            }

            // get base file name from path
            const baseFileName = path.substring(curIndex, rdcIndex);

            // if this is the first instance of a file with this name, create a property on the object for it
            if (!map[baseFileName]) {
                map[baseFileName] = {
                    displayName: baseFileName,
                    files: []
                };
            }

            // set format id for R3D
            // if (this.config.dalet.cameraFolderFormats['r3d']) {
            //     files[i].formatId = this.config.dalet.cameraFolderFormats['r3d'];
            // }

            // add to collection of files for this clip
            map[baseFileName].files.push(files[i]);
        }

        const groups = [];

        // create file uploaders for each group of files
        for (let groupName in map)
            if (map.hasOwnProperty(groupName))
                groups.push(map[groupName]);

        return groups;
    }
}