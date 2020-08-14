var $document = $(document);

// Let's make a new singleton for namespacing. Coz why not?
var shim = {};

shim.cachedQueue2 = {
  connectionKey: "local",
  fileList: [],
  fileObjectList: []
};
/*
 * The "copyQueue" just makes a copy of the current queue as defined
 * by the storedNodes.
 */
shim.copyQueue = function(step, previous) {
  // the sample always assumes the current LOCAL queue becomes the brand-new
  // cached queue. Will need additional code to store multiple queues.
  //   shim.cachedQueue = $.extend({}, pg.storedNodes.local.queue);
  var key;
  var node;
  if (step === "step1") {
    shim.cachedQueue2 = $.extend({}, pg.storedNodes.local.queue);
    shim.clearQueue();
    pg.storedNodes.local.queue = $.extend({}, shim.cachedQueue1);
    key = pg.storedNodes.local.queue.connectionKey;
    node = pg.storedNodes[key];
    pg.queue.render(node);
  } else if (step === "step2") {
    if (previous !== "step3") {
      shim.cachedQueue1 = $.extend({}, pg.storedNodes.local.queue);
    }
    shim.clearQueue();
    // if (shim.cachedQueue2) {
    pg.storedNodes.local.queue = $.extend({}, shim.cachedQueue2);
    key = pg.storedNodes.local.queue.connectionKey;
    node = pg.storedNodes[key];
    pg.queue.render(node);
    // }
  }
};

/*
 * The "combineQueue" takes the current queue and adds the cached queue to it,
 * producing a new copy of pg.storedNodes.local.queue, which is ultimately used
 * in the upload itself. Now, trying to extend the entire queue object will cause
 * a replacement. We need to actually extend the CONTENTS, a parallel set of representations
 * of the files.
 */
shim.combineQueue = function(e) {
  shim.clearQueue();
  // var queue = pg.storedNodes.local.queue;
  //   var cachedQueue = shim.cachedQueue;
  if (shim.cachedQueue1) {
    for (var i = 0; i < shim.cachedQueue1.fileObjectList.length; i++) {
      // we assume if there is a length to fileObjectList, fileList is also created (it is not
      // there with an empty queue). If that assumption proves fragile, might need some sanity checking.

      // fileList is an array of strings, so the value itself can get pushed.
      pg.storedNodes.local.queue.fileList.push(shim.cachedQueue1.fileList[i]);

      // fileListObjects are complex Objects, so we cannot just push. We need to pus of the world to use a reference UNTIL we decide to have forward/back, or OTHER
      // operations that destroy the cachedQueue. If the cachedQueue will survive until upload, fine.
      pg.storedNodes.local.queue.fileObjectList.push(
        $.extend({}, shim.cachedQueue1.fileObjectList[i])
      );
    }
  }
  if (shim.cachedQueue2) {
    for (var i = 0; i < shim.cachedQueue2.fileObjectList.length; i++) {
      // we assume if there is a length to fileObjectList, fileList is also created (it is not
      // there with an empty queue). If that assumption proves fragile, might need some sanity checking.

      // fileList is an array of strings, so the value itself can get pushed.
      pg.storedNodes.local.queue.fileList.push(shim.cachedQueue2.fileList[i]);

      // fileListObjects are complex Objects, so we cannot just push. We need to push a clone.
      // Not the end of the world to use a reference UNTIL we decide to have forward/back, or OTHER
      // operations that destroy the cachedQueue. If the cachedQueue will survive until upload, fine.
      pg.storedNodes.local.queue.fileObjectList.push(
        $.extend({}, shim.cachedQueue2.fileObjectList[i])
      );
    }
  }
};

/*
 * just to visually represent that a "next" has happened, since we are not in a series of modals.
 */
// shim.listFade = function() {
//     var $localFiles = $('#localFiles-list')
//     $localFiles.fadeOut(500, function() {
//       $localFiles.fadeIn(500);
//     })
// }

/*
 * You can look for the function bound to action-clearqueue within main.js; in the meantime,
 * we are just going to virtually click it!
 */
shim.clearQueue = function() {
  var $clearBtn = $("#localFiles-controls .action-clearqueue");
  $clearBtn.click();
};

shim.clearCachedQueue = function() {
  // shim.clearQueue();
  shim.cachedQueue1 = {
    connectionKey: "local",
    fileList: [],
    fileObjectList: []
  };
  shim.cachedQueue2 = {
    connectionKey: "local",
    fileList: [],
    fileObjectList: []
  };
};
/*
 * Similarly, you can trace through what happens when ".action-transfer" is clicked... or we
 * can just fire its functionality by virtually clicking it.
 */
// shim.upload = function() {
//   var $uploadBtn = $("#localFiles-controls .action-transfer");
//   pg.config.remoteNodes.remoteDirectory =
//   $uploadBtn.click();
// };

/*
 * Wire up the sample buttons once the document is ready. Each click handler serves as a "wrapper"
 * for functionality that gets fired serially but asynchronously.
 */
$document.ready(function() {
  $("#upload-button-step-1").on("click", function(e) {
    shim.copyQueue("step2");
    // shim.listFade();
  });
  $("#back-button-to-step-1").on("click", function(e) {
    shim.copyQueue("step1", "step2");
    // shim.listFade();
  });
  $("#back-button-to-step-2").on("click", function(e) {
    shim.copyQueue("step2", "step3");
    // shim.listFade();
  });
  // $("#upload-button-step-2").on("click", function(e) {
  // shim.combineQueue(e);
  // shim.upload();
  // });
  // $("#upload-button-step-3").on("click", function(e) {
  //   shim.combineQueue(e);
  //   console.log(pg.storedNodes.local.queue.fileList);
  //   shim.upload();
  // });
});
