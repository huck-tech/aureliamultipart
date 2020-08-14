import { inject, bindable } from "aurelia-framework";
import dragula from "dragula";

export class FileDropZone {
  static isDropOutsideDisabled = false;

  dropZoneDivId = null;
  dropHandler = null;

  isDropActive = false;
  hasDirectory = false;

  attach(
    dropZoneDivId,
    clipsUpload,
    dropHandler,
    folderError,
    dropZoneIndexArray,
    hasDirectory,
    cameraFolders,
    clips,
    clipsErrorMessage
  ) {
    this.dropZoneDivId = dropZoneDivId;
    this.clipsUpload = clipsUpload;
    this.dropHandler = dropHandler;
    this.folderError = folderError;
    this.dropZoneIndexArray = dropZoneIndexArray;
    this.cameraFolders = cameraFolders;
    this.clips = clips;
    this.clipsErrorMessage = clipsErrorMessage;
    if (this.dropZoneIndexArray && this.dropZoneIndexArray.length > 0) {
      if (this.dropZoneIndexArray.length !== this.dropZoneIndexArray[-1]) {
        return;
      }
    }

    const dropZone = document.getElementById(this.dropZoneDivId);
    if (!FileDropZone.isDropOutsideDisabled) {
      document.addEventListener("dragover", e => {
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = "none";
          e.preventDefault();
        }
      });

      FileDropZone.isDropOutsideDisabled = true;
    }
    dropZone.addEventListener("dragenter", e => this.handleDragEnter(e));
    dropZone.addEventListener("dragleave", e => this.handleDragLeave(e));
    dropZone.addEventListener("dragover", e => this.handleDragOver(e));
    // dropZone.addEventListener("drop", e => this.handleDrop(e));
    dropZone.addEventListener("drop", e => {
      e.preventDefault();
      var items = e.dataTransfer.items;
      let directoryInfo = {
        name: null,
        size: 0,
        complete: false,
        fileNameList: []
      };
      if (items) {
        for (var i = 0; i < items.length; i++) {
          // webkitGetAsEntry is where the magic happens
          var item = items[i].webkitGetAsEntry();
          if (item) {
            this.traverseFileTree(item, null, i, directoryInfo);
          }
        }
      } else {
        if (this.cameraFolders.length > 0) {
          this.folderError('folders_already');
          return;
        }
        this.handleDrop(e);
      }
    });
  }

  handleDragEnter(e) {
    e.stopPropagation();
    e.preventDefault();

    this.isDropActive = true;
  }

  handleDragLeave(e) {
    e.stopPropagation();
    e.preventDefault();

    const dropZoneElt = document.getElementById(this.dropZoneDivId);
    const hintElt = document.getElementById(this.dropZoneDivId + "hint");
    const leaveElt = document.elementFromPoint(e.clientX, e.clientY);

    this.isDropActive = leaveElt !== dropZoneElt && leaveElt !== hintElt;
  }

  handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    if (!this.dropHandler) return;
    const files = e.dataTransfer.files; // Array of all files
    for (let i = 0; i < files.length; i++) {
      this.dropHandler(files[i], "", true);
      
    }
  }
  traverseFileTree = (item, path, index, directoryInfo) => {
    let self = this;
    path = path || "";
    if (item.isFile) {
      // Get file
      if (this.clipsUpload !== "on" && this.hasDirectory !== true) {
        this.folderError("clips");
        return;
      }
      if (this.clipsUpload === "on" && this.cameraFolders.length > 0) {
        this.folderError("folders_already");
        return;
      }
      item.file(function(file) {
        directoryInfo.size = directoryInfo.size + file.size;
        if (file.name !== ".DS_Store") {
        directoryInfo.fileNameList.push(file.name);
        }
        self.dropHandler(file, path, true);
      });
    } else if (item.isDirectory) {
      if (this.clipsUpload === "on") {
        this.folderError("clips");
        return;
      }
      if (this.clips.length > 0) {
        this.folderError('clips_already');
        return;
      }
      if (item.fullPath.split("/").length === 2) {
        directoryInfo.name = item.name;
        this.hasDirectory = true;
        this.cameraFolders.push(directoryInfo);
      }

      // Get folder contents
      let dirReader = item.createReader();
      dirReader.readEntries(function(entries) {
        for (let i = 0; i < entries.length; i++) {
          self.traverseFileTree(
            entries[i],
            path + item.name + "/",
            i,
            directoryInfo
          );
          if (i === entries.length - 1) {
            directoryInfo.complete = true;
          }
        }
      });
    }
  };
}
