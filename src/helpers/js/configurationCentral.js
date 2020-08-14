/* document name: configuration.js
 * copyright (c) 2015 Unlimi-Tech Software, Inc.
 *
 * This configuration file contains necessary parameters for configuring the
 * FileCatalyst TransferAgent application.
 *
 * MINIMUM CONFIGURATION REQUIRED:
 * At least one remote server must be configured in the pg.config.remoteNodes object
 * and for that remote server must be online when the web application is run.
 * Connectivity is only possible to FileCatalyst Direct servers, third party FTP servers are NOT supported.
 */

var pg = pg || {};
pg.config = {};

/* minimum configuration requires *either* a valid pgpMessage (generated with
 * encrypt.html) or for the clear-text remoteServer and remotePort to be set.
 */


pg.config.remoteNodes = {
  server1: {
    name: "", //pretty name visible to the end user
    remoteServer: "", // IP or hostname of an active FileCatalyst Server, third party FTP servers are not supported
    remotePort: 21, // Default 21 non-secure port, FTPS is 990
    username: "", //username as set on the Direct server, if left empty and pgpMessage is not set the end user will be prompted
    password: "", //password as set on the Direct server, if left empty and pgpMessage is not set the end user will be prompted
    usesSSL: false, //set to true if FTPS (Implicit) is required and enabled on the server
    remoteDirectory: "", //remote directory on the server, if the directory doesn't exist it will automatically be created
    lockInitialDirectory: false, // if set to true, for download with browse, the user will not be able to navigate higher than the remoteDirectory that they were given
    servletURL: "", // if you wish to use HTTP transfers, this value must be set with the servlet location from the FileCatalyst server
    pgpMessage: [] //use encrypted values so the login credentials are not visible, see encrypt.html for more details
  }
};
pg.config.remoteNodes.server1.remoteServer = window.localStorage.getItem("ta-deployment-central-server");
pg.config.remoteNodes.server1.remotePort = window.localStorage.getItem("ta-deployment-central-port");

pg.config.helper = function(){
    pg.config.remoteNodes.server1.username = window.sessionStorage.getItem("ta-deployment-central-username");
    pg.config.remoteNodes.server1.password = window.sessionStorage.getItem("ta-deployment-central-password");
    pg.config.remoteNodes.server1.usesSSL = window.sessionStorage.getItem("ta-deployment-central-usesSSL");
}

if(window.localStorage.getItem("ta-deployment-central-pgp")==="null"){
  pg.config.helper();
}else{
    try{
      var pgpSaved = JSON.parse(window.localStorage.getItem("ta-deployment-central-pgp"));
      pg.config.remoteNodes.server1.pgpMessage = pgpSaved.pgp;
    }catch(e){
      console.log("error, proceding with clear pass+user" , e);
      pg.config.helper();
    }
}

/*
 * Configuration of the "download with button" mode where you can build a download package containing files located on the FC Server and
 * the end user will be able to download all the files with click of a single button, the user will not be allowed to browse the
 * remote directory structure.
 */
pg.config.downloadButtons = {
  tester1: {
    label: "", //the button label. If left blank, it will default to "Download"
    sourceId: "server1", // must correspond to a connected remoteNode
    destinationId: "", // if blank or not present, will default to "local"
    fileList: [] // an array of strings representing paths (either individual files or entire directories) to be downloaded
  }
};


pg.config.nodeDefaults = {
  sortOn: "name", // determines default sort column. Options are: name, type, size, lastmodified
  invertSort: false, // default sort is A-Z, smallest-to-largest, and oldest-to-newest. invertSort reverses this
  gridClass: "col-lg-6" // adds this class to each file listing "area" when the HTML is generated
};

pg.config.webapp = {
  showFileHeadings: true, // show h2 headings above each file area
  animateRevealedComponents: true, // uses a fade animation to show components as they are needed; does nothing if hideUnusedComponents is false
  collapseEmailAccordion: true, // when false, the email widget is expanded on page load; otherwise it is collapsed into an interactive bar
  autoConnect: true, // connect to and get listings from all configured nodes on page load; otherwise wait for pg.initialize() to be called
  language: "english",
  //The download paths assume that all the html files are in /filecatalyst/ folder. If the HTML pages are moved to a higher or a lower directory,
  //you must provide fully qualified paths for appDownloadLinkWindows and appDownloadLinkMac
  appDownloadLinkWindows: "files/Windows/install_fc_transferagent.exe",
  appDownloadLinkMac: "files/MacOSX/FileCatalystTransferAgent.pkg", //mime type supporting pkg files must be added to your web server's configuration
  showDownloadButtonProgress: true,
  iconSet: "fontawesome", // "fontawesome" (if included) "glyphicons" (if using Bootstrap 3) or arbitrarily configured icon set in pg.config.customIcons below
  maxListHeight: 616, // maximum height, in pixels, for a given file list (local or remote) to render before scroll bars appear
  launchDetectTimeout: 20, // time in seconds that the application will try to automatically launch and detect TransferAgent before displaying a manual prompt
  /* Each "doAfter" parameter functions the following way:
   * - empty string will simply reset UI.
   * - simple string will be considered absolute path from application root. Supplying "next" would redirect to "<webroot>/next" for example.
   * - string as fully-qualified URL is required to redirect to external resource: "http://filecatalyst.com" for example.
   * - function is an arbitrary JavaScript call which receives a status object
   */
  doAfterSuccess: "",
  doAfterError: "",
  doAfterCancel: "",
  doAfterOtherError: "",
  doAfterTransfer: "",
  /*
   * Progress status fields. Two types of fields on the progress dialog are available: current file and overall progress
   * You can add/remove what fields you want to be visible on the progress bar.
   * The fields will be visible to the end user in the same order as they appear below.
   * To change the description of the fields, follow localization instructions found at deploy-web.html#internationalization. In your new custom translation file, modify
   *   the statusFields section.
   */
  statusFields: {
    current: [
      //"actualRate",  //Returns the rate for the current file in Kbps.  This is the average rate for the current file since it started.
      //"bytesSoFarCurrentFile", //number of bytes transferred for the current file including resume offset
      "currentFilename", //name of the file currently being transferred
      //"currentFileTimeRemaining", //time remaining in human readable format for the current file. Converted from milliseconds to HH:MM.ss format.
      //"currentPercent", //Returns the percent complete for the current file. When transferring a directory as a single job, then this value becomes an overall rate for the directory.
      //"currentRate", // a snapshot rate for the last second (in Kbps) for the current file.
      //"packetLossPercent", //packet loss as a percentage of the current file
      //"percentBar", //shown as a nice progress bar for the current file
      //"rateAverageInKBperSecond", //rate average in KB/sec over the last 30 seconds for the current file
      //"rTT", //latency in milliseconds for the current file
      //"sizeCurrentFile", //size in bytes of the current file
      //"throughputRate", //net throughput (gross throughput minus overhead and packet loss)
      //"transferTime", //time since the current file started transferring, in human readable format. Converted from milliseconds to HH:MM.ss format.
      //"transferDirection" //transfer direction
    ],
    overall: [
      //"bytesSoFarAllFiles", //number of bytes sent for all the files
      //"connected", //returns true or false if the transfer agent is still connected and transferring data
      "filesSoFar", //will print file X of TOTAL, unless totalFile is turned on
      //"numberOfActiveTransfers", //when sending multiple files simultaneously, show number of connections
      "overallTimeRemaining", //overall time remaining human readable format. Converted from milliseconds to HH:MM.ss format.
      //"packetLossPercent", //packet loss as a percentage of the total transfer
      //"rateAverage", //the overall rate rate in Kbps as an average over last 30 seconds.
      "rateAverageInKBperSecond", //rate average in KB/sec over the last 30 seconds overall
      //"percent", //percent of the entire file transfer for all the files
      "percentBar", //nice progress bar
      //"remoteServer", //host name of the remote server
      //"rTT", //overall latency for all the files
      //"sizeAllFiles", //full size in bytes of files to be transferred
      //"totalFiles", // when commented out, rendered along with filesSoFar as #/#
      //"throughputRate", //Goodput minus the overhead, and the packet loss for the entire transfer
      //"transferID", //used internally
      //"transferTime" //total overall time in human readable format. Converted from milliseconds to HH:MM.ss format.
    ]
  }
};


pg.config.transfer = {
/* MultiClient settings */
//  NumberOfClients: 2, // the number of clients used by a transfer. Each of these will use a connection on the target server.

  /* Timeout settings */
//  ConnectTimeout: 30000, //time in ms. waiting for a connection to the FC server
//  ExtendedReadTimeout: 1800000, //This is the length of time the client will wait for a reply after sending a long running command
//  ReadTimeout: 30000, //the length of time the client will wait for a reply after sending a command to the FileCatalyst server in milliseconds
//  NumberOfClients: 2, //the number of transfer clients that simultaneously handle an individual file transfer

  /* ZIP and compression settings */
//  AutoZip: false, // true or false (default false) -- zip files into a single archive before sending, the files are automatically unzipped on the other end. There's no option to leave the files zipped on the receiving end. Zip archive is not compressed.
//  UseCompression: false, //Enables/disables on the fly compression. When enabled, each block of data will be compressed on the fly before it is sent over the network. Compression rates will only be displayed if the file is larger than the block size times the number of transfer threads.
//  CompFileFilter: "*.zip,*.gz,*.tgz,*.rar,*.mp3,*.mpg,*.avi,*.mov,*.mp4,*.wmv",  //don't compress files that are already compressed
//  ZipFileSizeLimit: 1073741824 //a numeric value that can't be larger then 2GB (2147483648b). Defaults to 1GB.

  /* UDP Related Settings */
//  UseCongestionControl: true, //Enables/disables congestion control. When enabled, the client will automatically decrease its transmission or reception rate when congestion is detected.
//  NumThreads: 5, //For UDP transfers only, This value determines how many blocks will be sent into the pipe before redundant data will be sent.
//  OptimizeBlockSize: true, //If set to true, FileCatalyst will attempt to optimize the current block size to be an exact multiple of the data size that is being transmitted.
//  PacketSize: 1024, // This is the encoded unit size, and determines the eventual UDP packet size. If the unit size is greater than the MTU of the network with will create fragmented UDP packets.
//  BlockSize: 4096000, // increasing this uses more memory to buffer but may increase performance
//  StartRate: 0, // 0 reflects auto-detect start rate
//  TargetRate: 1000000, //maximum achievable transfer rate, default 1000000kbps
//  CongestionControlAggression : 7, // determines how aggressive to respond to network changes.  Default value of 7.
//  CongestionControlStrategy   : 1, // 0 for RTT based, 1 for Packet loss based.  default 1

  /* settings related to progressive transfers  NOTE: trying to transfer growth files without configuring for progressive is undefined behaviour and will yield unexpected results*/
//  ProgressiveTransfers: true, //upon completion of an upload or download, compare the size of the source file to the size when it began the transfer. If the file has grown, it will continue to transfer the new data until the file is no longer growing. In this way, it is able to download or upload files that are curently being copied, or are currently being encoded.
//  ProgressiveTimeout: 0, //the time between reaching the end of the file and the check to see if the file has grown and needs to be resumed in seconds.
//  ProgressiveTimeoutFilter: "", //perform progressive transfers only to files with the given extensions ex: "*.mxf"

  /* settings related to guaranteed delivery */
//  VerifyIntegrity: true, //after each file is transferred an MD5 sum will be performed on the destination file and the result will be compared to that of the source file to ensure the files are identical.
//  VerifyMode: 0, //Sets the desired MD5 mode: "0": Verification after file transfer "1": On-the-fly verification "2": Concurrent verification Default value: 0

  /* settings related to email
   * Outgoing email server (SMTP) settings must be set on the FileCatalyst Direct Server
   */
  SendEmailNotification: true, //when true, sends an email on completion of a transfer IN ADDITION to any emails being generated by the FileCatalyst Server configuration
  EmailAddress: "", //when set, attempts to send an email to the semicolon-delimited address(es) provided. The FileCatalyst Server may reject this list if configured to do so
  EmailBody: "", //arbitrary text that will be set in the message body in addition to some automatically-generated text
  SentFilelistInEmail: false, //when true, adds a list of files to the EmailBody text and doesn't display the checkbox

          /* Other file transfer settings */
//  MaxRetries: 3, //number of times, re-try to connect and resume the transfer before failing
//  WaitRetry: 3000, // wait in milliseconds before attempting to reconnect, default value 3000
//  Mode: 2, //FTP =1 AUTO = 2 HTTP = 3 UDP = 4
//  TransferEmptyDirectories: true, //transfer all folders, including the empty folders
//  TransferWithTempName: true, //files will be transferred with a temporary filename and renamed back to their original name when the transfer is complete.
//  NumFTPStreams: 5, //number of concurrent FTP connections for FTP mode only, multiple connections may be blocked by firewalls
//  AutoResume: true, //automatically resume partially transferred files
//  DeleteAfterTransfer: false, //With this option enabled, source files will be deleted after the transfer is complete. If the transfer is an upload, the local files will be deleted.
//  UseIncremental: false, //before each source file is transferred, it will be compared with the destination file if it exists and has not changed, the file will not be transmitted.
//  IncrementalMode: 0, // 0,1,2,3 (default 0) -- 0 transfers whole file if changed, 1 transfers only the changes (deltas), 2 transfers whole file with a new filename, 3 transfers only the changes with a new filename.
//  MaintainLastModified: false, //upon each successful transfer, the destination files modification date will be set to match that of the source file.
//  MaintainPermissions: false, //upon each successful transfer, the destination file permissions will be set to match those of the source file. This features only functions when both the source and destination are running a Linux/Unix
//  Md5RateLimit: 0, //when transferring multiple files, slow down the Md5 checksum to preserve CPU usage in kbps

  /* Begin Transfer Content Settings section -- for UPLOAD only */

//    maxfiles                    : 0,         // maximum number of files that can be added to queue. 0 is "unlimited"
//    maxsize                     : 0,
//    minsize                     : 0,
//    maxtotalsize                : 9223372036854775807,        //total size of all files in the cart cannot exceed the value set here. Default: (9223372036854775807, or max long)

    // Regular expression filter -- cannot upload a file that does not match this regular expression.
    // Leave blank ("") to disable the filter.
    // Note:  You must double up backspace characters (because javascript will interpret them), and
    //          :> convert any "+" signs as "%2B", as they will be removed by javascript (into spaces)
    //          :> convert any "%" into "%25", as the java script may not start up
    // Thus, the regular expression: ^[a-z,%]{4}\_[C|M][0-9]{1,2}[a-z]?\_S[0-9]{1,2}\_K[0-9]{1,2}\_[D,V,T,X][0-9]{1,2}\_[0-9]{8}\_[0-9]+\_?[0-9]*\.log$
    //       becomes:                ^[a-z,%25]{4}\\_[C|M][0-9]{1,2}[a-z]?\\_S[0-9]{1,2}\\_K[0-9]{1,2}\\_[D,V,T,X][0-9]{1,2}\\_[0-9]{8}\\_[0-9]%2B\\_?[0-9]*\\.log$

//    regex                       : "", // sample regex sorts on some common file extensions: "^.*\.(jpg|JPG|gif|GIF|doc|DOC|pdf|PDF)$"
//    *** Note: regex errors will result in a generic warning that may not make sense to users. To customize this message
//    *** (for example, "You are restricted to transferring image files.", modify the "filenameRegexFailMessage" language entry in your custom translation file
//    limitUploadToFiles          : false,        //true or false (default false). Disallow the uploading of directories to the queue.  Only files may be added.

  /* end Transfer Content Settings section */

          /*POST URL parameters are:
           "f"- contains a | (pipe) delimited list of the full remote paths that were transferred or schedule to be transferred
           "lf" - contains a | (pipe) delimited list of the full local paths that were transferred or schedule to be transferred
           "s" - contains a | (pipe) delimited list of the sizes of each file
           "status" - Status of each file transferred. "0" = File transfer was not attempted, "1" = File transfer was successful, "2" = File transfer was cancelled, "3" = File transfer failed with an error. For example, if the transfer included 5 files, and all files were transferred successfully, you would see status=11111. If the transfer was cancelled during the 3rd file, you would see status=11200.
           "allfiles"- contains a | (pipe) delimited list of the full paths that were transferred or schedule to be transferred, this list has a 1 to 1 relationship with the status value where each status value corresponds to each value in allfiles
           */
//  PostURL: "", //send file names to this URL via HTTP POST.
};


pg.config.localAgent = {
  host: "https://localhost.filecatalyst.net", //do not change this value
  portDefault: 12680 //do not change this value
};

/*
 * To use custom icons, you have to set pg.config.webapp.iconSet to "custom1"
 * You can then enter any arbitrary HTML or just plain text below
 * The default icon set is based on "fontawesome"
 */
pg.config.customIcons = {
  custom1: {
    default: '', // a default icon to appear when other icons are not found
    directory: '', // represents directories, particularly within file browser widgets
    file: '', // represents an individual file, particularly within the file browser widgets
    upload: '', // associated with the action to start an upload
    download: '', // associated with the action to start a download
    checkedbox: '', // the application uses icons rather than built-in HTML checkboxes. This is for the checked state
    uncheckedbox: '', // the application uses icons rather than built-in HTML checkboxes. This is for the unchecked state
    trash: '', // associated with the action to remove or delete items (for example, a file from the queue)
    levelup: '', // associated with the action for navigating up one level in file browser widgets
    settings: '', // associated with the action to update settings for the application or widgets
    more: '', // associated with the action to expand hidden content (for example, a collapsed information row)
    less: '', // associated with the action to collapse content into a hidden element
    addqueue: '', // associated with adding an individual file to the queue
    envelope: '', // associated with the email widget
    ok: '', // associated with accepting or confirming an action, update, or information
    remove: '', // associated with removing an item; often but not necessarily set to the same icon as the "trash"
    repeat: '' // associated with repeating an action
  }
};

pg.config.webapp.useBootstrap = true; // not to be edited; current release requires this to be present and true
