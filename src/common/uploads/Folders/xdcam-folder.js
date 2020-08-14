
export class XdcamFolder {
   
    isFolderStructureMatch(files) {
        let foundClip = false;
        let foundSub = false;

        for (let i = 0; i < files.length; i++) {
            if (files[i].webkitRelativePath) {
                if (files[i].webkitRelativePath.includes('/Clip/'))
                    foundClip = true;
                if (files[i].webkitRelativePath.includes('/Sub/'))
                    foundSub = true;
            }
        }
        return foundClip && foundSub;
    }

    getClips(files) {
        const clips = [];

        for (let i = 0; i < files.length; i++) {
            if (files[i].webkitRelativePath.includes('/Clip/'))
                // create a new array of just 1 file and add it to the collection
                clips.push([ files[i] ]);
        }

        return clips;
    }
}