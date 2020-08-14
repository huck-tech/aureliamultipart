import {inject} from 'aurelia-framework';
import config from 'app-config';

@inject(config)
export class P2Folder {

    constructor(config) {
        this.config = config;
    }
    
    isFolderStructureMatch(files) {
        // a P2 folder should have at least 3 sub-folders - CLIP, VIDEO, AUDIO
        let foundClip = false;
        let foundVideo = false;
        let foundAudio = false;

        // check for at least 1 file in each of the expected folders
        for (let i = 0; i < files.length; i++) {
            if (files[i].webkitRelativePath) {
                if (files[i].webkitRelativePath.includes('/CLIP/'))
                    foundClip = true;
                if (files[i].webkitRelativePath.includes('/VIDEO/'))
                    foundVideo = true;
                if (files[i].webkitRelativePath.includes('/AUDIO/'))
                    foundAudio = true;
            }
        }

        // if we found a file for each of the 3 expected folders, it's a match
        return foundClip && foundVideo && foundAudio;
    }

    getClips(files) {
        const map = {};

        // loop through and group all files by file name
        for (let i = 0; i < files.length; i++) {
            let path = files[i].webkitRelativePath;
            if (!path)
                continue;

            path = path.toUpperCase();
            if ((!path.includes('/VIDEO/') && !path.includes('/AUDIO/')) || !path.endsWith('MXF'))
                continue;

            const baseFilename = this.getBaseFilename(path);
            if (!baseFilename) continue;
            
            // if this is the first time we're seeing this file name, create a new group for it
            if (!map[baseFilename])
                map[baseFilename] = [];

            // if it's video, add it as the first file for this file name
            if (path.includes('/VIDEO/')) {
                // if (this.config.dalet.cameraFolderFormats['p2'])
                //     files[i].formatId = this.config.dalet.cameraFolderFormats['p2'];
                map[baseFilename].unshift(files[i]);
            }

            // if it's audio, add it to the end of the group
            if (path.includes('/AUDIO/'))
                map[baseFilename].push(files[i]);
        }

        const groups = [];

        // create file uploaders for each group of files
        for (let groupName in map)
            if (map.hasOwnProperty(groupName))
                groups.push(map[groupName]);

        return groups;
    }

    getBaseFilename(path) {
        // get the file name without its extension
        let baseFilename = path.substr(path.lastIndexOf('/') + 1, path.lastIndexOf('.') - path.lastIndexOf('/') - 1);

        // audio files have a two-digit number appended to the end of the base file name
        if (path.includes('/AUDIO/'))
            baseFilename = baseFilename.substring(0, baseFilename.length - 2);

        return baseFilename;
    }
}