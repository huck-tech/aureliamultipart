/* document name: configuration.js
 * copyright (c) 2015 Unlimi-Tech Software, Inc.
 *
 * This configuration file contains necessary parameters for configuring the
 * FileCatalyst TransferAgent application.
 *
 * MINIMUM CONFIGURATION REQUIRED:
 * At least one remote server must be configured in the pg.config.remoteNodes object
 * and for that remote server must be online when the web application is run.
 * Acceleration is only possible to FileCatalyst Direct servers; third party FTP servers will only use non-accelerated TCP
 */

var pg = pg || {};
pg.config = {};

/* minimum configuration requires *either* a valid pgpMessage (generated with
 * encrypt.html) or for the clear-text remoteServer and remotePort to be set.
 */
pg.config.remoteNodes = {
  server1: {
    name: "", // "pretty" name visible to the end user and used for UI. WARNING: do not use any of these characters: ~!@#$%^&*()+=
    remoteServer: "", // IP or hostname of an active FileCatalyst Server or FTP server
    remotePort:"", // Default 21 non-secure port, FTPS is 990
    username: "", //username as set on the Direct server, if left empty and pgpMessage is not set the end user will be prompted
    password: "", //password as set on the Direct server, if left empty and pgpMessage is not set the end user will be prompted
    usesSSL: "", //set to true if FTPS (Implicit) is required and enabled on the server
    remoteDirectory: "", //remote directory on the server, if the directory doesn't exist it will automatically be created
    lockInitialDirectory: "", // if set to true, for download with browse, the user will not be able to navigate higher than the remoteDirectory that they were given
    servletURL: "", // if you wish to use HTTP transfers, this value must be set with the servlet location from the FileCatalyst server
    connectionMode: "", //CACHED = -1 (the last valid value found by AUTO), FTP = 1, AUTO = 2, HTTP = 3 and UDP = 4
    pgpMessage: ["-----BEGIN PGP MESSAGE-----",
    "Version: OpenPGP.js v0.6.0",
    "Comment: http://openpgpjs.org",
    "",
    "wYwDdjw46XMAoVEBA/0WPgAkqlyrRWc3RMk7g+fRcRM9726+14InrNXJD4Fx",
    "aHDSqxTM9iSDQsceVAegVepsJbt90/OWsls5OYkQ6G9M1+kp02563jSs/ODt",
    "O4Ovk41AK4TCzhfVC9yRUZdHRvTMWJLhfsi1NhYD26FCy88T6UjrehMbj+41",
    "ecr3WWU2FNLAgwG0enkl9m0Yh8t3GGmzwqt1RD1TZT90NKdmwuOrSJNcH81N",
    "PCOiBctd/Zl5VGk9jMfnDFMXeAsDXPNLQp3MjNMjCv+VRmvhbkWHi40o4Ye5",
    "CRx41Ky1lQuUye2/h/HEkqlFR/Uzq1qETYtF6wdMsn/bXuqNUc3+IdOARCEs",
    "zTXyRCudJFMb/meu7xnD8M004vvcLRFt4fI9ZH4zaMe6ulnxoqFetb/z6yPs",
    "gC+jilf8vepwrs9r+tYGDzGRdnNfmXYbre8t5QRI3FDwy9MjdL2xHEUvWxad",
    "bxf1cwAFA3lzxhD94xN0ORSADsfMLhbjzUTctxye/vAYPL6qPFB3zYRsmAfl",
    "aTCOgmj7eyKg4ncytPBs23MwUqamuhkAATU+YxDXAhY2WNFX7qBCWj0iSk54",
    "bJjNQ3odpqTr/kgT8gZFlFh2",
    "=G6Q5",
    "-----END PGP MESSAGE-----"] //use encrypted values so the login credentials are not visible, see encrypt.html for more details
  }
};

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
    fileList: [] // an array of strings representing paths (either individual files or entire directories) to be downloaded, and if the path is for a directory, make sure add "/" after the path, for example, "/folder/" or "/file".
  }
};

/*
 * Used only by Express (2-way) to customize the file listings
 *
 */
pg.config.fileListDefaults = {
  sortby: "name",
  invert: false,
  isInitial: false
};

/*
 * Used only by Express (2-way) to customize file operations for the end user. These permissions are only cosmetic and should also be enforced by the user permissions set on the FileCatalyst Server.
 *
 */
pg.config.permissions = {
  showDownloadArrow: "true",
  showUploadArrow: "true",
  //Delete, Open, DirInfo, Refresh, Rename, ChangeDir, MakeDir
  allowDelete: "true",
  allowOpen: "true", //not implemented
  allowGetDirInfo: "true",
  allowRefresh: "true",
  allowRename: "true",
  allowChangeDir: "true",
  allowMakeDir: "true"
};

/* Used only in Express to show/hide server messages logs */

pg.config.express = {
  showLogs: true
};

// Used by Express (as opposed to Upload/Download) for finding the TransferAgent installers.
// To configure the paths used by Upload/Download, modify the "appDownloadLink___" parameters in pg.config.webapp.
pg.config.links = {
  installWindowsLocation:
    "/file_catalyst/files/Windows/install_fc_transferagent.exe",
  installMacLocation:
    "/file_catalyst/files/MacOSX/FileCatalystTransferAgent.pkg",
  installLinuxLocation: "/file_catalyst/files/Linux/fc_transferagent.tar.gz",
  helpInstallWindowsLocation: "/file_catalyst/docs/install-windows.html",
  helpInstallMacLocation: "/file_catalyst/docs/install-mac.html",
  helpInstallLinuxLocation: "/file_catalyst/docs/install-linux.html"
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
  //The download paths assume that all the html files are at the same level as the /files/ folder. If the HTML pages are moved to a higher or a lower directory,
  //you must provide fully qualified or relative paths for appDownloadLink____ parameters. Note: to update the paths for Express, see the pg.config.links object.
  appDownloadLinkWindows: "/file_catalyst/files/Windows/install_fc_transferagent.exe",
  appDownloadLinkLinux: "/file_catalyst/files/Linux/fc_transferagent.tar.gz",
  appDownloadLinkMac: "/file_catalyst/files/MacOSX/FileCatalystTransferAgent.pkg", //mime type supporting pkg files must be added to your web server's configuration
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
   * Progress status fields. There are three distinct types of status fields:
   * current, currentMulti, and overall. Comment or uncomment in order to show
   * or hide their presence in the progress area of the UI.
   */
  statusFields: {
    /* "current" statusFields are the fields visible for SINGLE transfers; ie. when only one
     * file transfer is happening either as the result of multi-client not being
     * enabled, or multi-client only having one file to transfer.
     */
    current: [
      //"actualRate",  //Returns the rate for the current file in Kbps.  This is the average rate for the current file since it started.
      //"bytesSoFarCurrentFile", //number of bytes transferred for the current file including resume offset
      "currentFilename", //name of the file currently being transferred
      //"currentFileTimeRemaining", //time remaining in human readable format for the current file. Converted from milliseconds to HH:MM.ss format.
      "currentPercent", //Returns the percent complete for the current file. When transferring a directory as a single job, then this value becomes an overall rate for the directory.
      //"currentRate", // a snapshot rate for the last second (in Kbps) for the current file.
      //"packetLossPercent", //packet loss as a percentage of the current file
      // "percentBar", //shown as a nice progress bar for the current file
      //"rateAverageInKBperSecond", //rate average in KB/sec over the last 30 seconds for the current file
      //"rTT", //latency in milliseconds for the current file
      //"sizeCurrentFile", //size in bytes of the current file
      //"throughputRate", //net throughput (gross throughput minus overhead and packet loss)
      //"transferTime", //time since the current file started transferring, in human readable format. Converted from milliseconds to HH:MM.ss format.
      "statusMessage"
      //"transferDirection" //transfer direction
    ],
    /* "currentMulti" will show table columns rather than status fields. In order
     * to keep the view compact, usually a small set is chosen by the administrator.
     * The default is considered to be "currentFilename", "statusMessage", "percentBar"
     */
    currentMulti: [
      //"actualRate",  //Returns the rate for the current file in Kbps.  This is the average rate for the current file since it started.
      //"bytesSoFarCurrentFile", //number of bytes transferred for the current file including resume offset
      "currentFilename", //name of the file currently being transferred
      //"currentFileTimeRemaining", //time remaining in human readable format for the current file. Converted from milliseconds to HH:MM.ss format.
      "currentPercent", //Returns the percent complete for the current file. When transferring a directory as a single job, then this value becomes an overall rate for the directory.
      //"currentRate", // a snapshot rate for the last second (in Kbps) for the current file.
      //"packetLossPercent", //packet loss as a percentage of the current file
      //"rateAverageInKBperSecond", //rate average in KB/sec over the last 30 seconds for the current file
      //"rTT", //latency in milliseconds for the current file
      //"sizeCurrentFile", //size in bytes of the current file
      //"throughputRate", //net throughput (gross throughput minus overhead and packet loss)
      //"transferTime", //time since the current file started transferring, in human readable format. Converted from milliseconds to HH:MM.ss format.
      "statusMessage"
      // "percentBar" //shown as a nice progress bar for the current file
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
      "percent", //percent of the entire file transfer for all the files
      "percentBar" //nice progress bar
      //"remoteServer", //host name of the remote server
      //"rTT", //overall latency for all the files
      //"sizeAllFiles", //full size in bytes of files to be transferred
      //"totalFiles", // when commented out, rendered along with filesSoFar as #/#
      //"throughputRate", //Goodput minus the overhead, and the packet loss for the entire transfer
      //"transferID", //used internally
      //"transferTime", //total overall time in human readable format. Converted from milliseconds to HH:MM.ss format.
      //"transferMode" //shows the transfer mode, UDP, FTP, HTTP with a lock icon for SSL
    ]
  }
};

pg.config.transfer = {
  /* MultiClient settings */
  NumberOfClients: 20, // the number of clients used by a transfer. Each of these will use a connection on the target server.

  /* Timeout settings */
  //  ConnectTimeout: 30000, //time in ms. waiting for a connection to the FC server
  //  ExtendedReadTimeout: 1800000, //This is the length of time the client will wait for a reply after sending a long running command in milliseconds, and the minimum value is 600000, if you set the value less than the minimum value, it will be default minimum value.
  //  ReadTimeout: 30000, //the length of time the client will wait for a reply after sending a command to the FileCatalyst server in milliseconds

  /* ZIP and compression settings */
  //  AutoZip: false, // true or false (default false) -- zip files into a single archive before sending, the files are automatically unzipped on the other end. There's no option to leave the files zipped on the receiving end. Zip archive is not compressed.AutoZip is not supported on the downloading files which size exceeds 1GB.
  //  UseCompression: false, //Enables/disables on the fly compression. When enabled, each block of data will be compressed on the fly before it is sent over the network.
  //  CompFileFilter: "*.zip,*.gz,*.tgz,*.rar,*.mp3,*.mpg,*.avi,*.mov,*.mp4,*.wmv",  //don't compress files that are already compressed
  //  ZipFileSizeLimit: 1073741824, //a numeric value that can't be larger then 2GB (2147483648b). Defaults to 1GB.

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
  //  NumBlockReaders: 1",
  //  NumBlockWriters",
  //  NumSenderSockets",
  //  NumReceiveSockets",
  //  NumPacketProcessors",
  //  PacketQueueDepth",
  //  ReadBufferSize",
  //  WriteBufferSize",

  //  PacketQueueDepth : 1000 // Number of packets stored in memory by application prior to processing. Default value 1000 (download only).
  //  NumBlockWriters : 1 // Number of threads writing to disk per transfer.  Default value 1 (download only)
  //  NumBlockReaders : 1 // Number of threads writing to disk per transfer.  Default value 1 (download only)
  //  NumSenderSockets : 1, // numUDPStreams.  Should increase for every ~2gbps on link.  Default value 1 (upload only)
  //  NumReceiveSockets : 1, // Should increase for every ~5gbps on link.  Default value 1 (download only)
  //  NumPacketProcessors : 1, // Number of threads responsible for processing packets on receiving side (download only).
  //  WriteBufferSize           : "", // Size of write operation when saving file to disk. Defaults to MAX_INT.
  //  ReadBufferSize            : "", // Size of read operation when loading file from disk. DEfaults to MAX_INT.

  /* settings related to progressive transfers  NOTE: trying to transfer growth files without configuring for progressive is undefined behaviour and will yield unexpected results*/
  //  ProgressiveTransfers: true, //upon completion of an upload or download, compare the size of the source file to the size when it began the transfer. If the file has grown, it will continue to transfer the new data until the file is no longer growing. In this way, it is able to download or upload files that are curently being copied, or are currently being encoded.
  //  ProgressiveTimeout: 0, //the time between reaching the end of the file and the check to see if the file has grown and needs to be resumed in seconds.
  //  ProgressiveTimeoutFilter: "", //perform progressive transfers only to files matching the supplied wildcard (*) based pattern. Eg. to restrict to files with the mxf extension, value should be "*.mxf"

  /* settings related to guaranteed delivery */
   VerifyIntegrity: false, //after each file is transferred an MD5 sum will be performed on the destination file and the result will be compared to that of the source file to ensure the files are identical.
  //  VerifyMode: 0, //Sets the desired MD5 mode: "0": Verification after file transfer "2": Concurrent verification "3": Partial verification Default value: 0

  /* settings related to email
   * Outgoing email server (SMTP) settings must be set on the FileCatalyst Direct Server
   */
  SendEmailNotification: false, //when true, sends an email on completion of a transfer IN ADDITION to any emails being generated by the FileCatalyst Server configuration
  EmailAddress: "", //when set, attempts to send an email to the semicolon-delimited address(es) provided. The FileCatalyst Server may reject this list if configured to do so
  EmailBody: "", //arbitrary text that will be set in the message body in addition to some automatically-generated text
  SentFilelistInEmail: false, //when true, adds a list of files to the EmailBody text and doesn't display the checkbox
  SendEmailNotificationPerFile: false, //when true, sends an email notification for each succesful transfer. This is in addition to SendEmailNotification. If both values are set to true, an email will be sent for each file and an email will be sent when the transfer is complete.

  /* Other file transfer settings */
  //  MaxRetries: 3, //number of times, re-try to connect and resume the transfer before failing
  //  WaitRetry: 3000, // wait in milliseconds before attempting to reconnect, default value 3000
  //  Mode: 2, //FTP =1 AUTO = 2 HTTP = 3 UDP = 4
   TransferEmptyDirectories: true, //transfer all folders, including the empty folders
   TransferWithTempName: false, //files will be transferred with a temporary filename and renamed back to their original name when the transfer is complete.
  //  NumFTPStreams: 5, //number of concurrent FTP connections for FTP mode only, multiple connections may be blocked by firewalls
   AutoResume: false, //automatically resume partially transferred files
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
     limitUploadToFiles: true,        //true or false (default false). Disallow the uploading of directories to the queue.  Only files may be added.

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
    default: "", // a default icon to appear when other icons are not found
    directory: "", // represents directories, particularly within file browser widgets
    file: "", // represents an individual file, particularly within the file browser widgets
    upload: "", // associated with the action to start an upload
    download: "", // associated with the action to start a download
    checkedbox: "", // the application uses icons rather than built-in HTML checkboxes. This is for the checked state
    uncheckedbox: "", // the application uses icons rather than built-in HTML checkboxes. This is for the unchecked state
    trash: "", // associated with the action to remove or delete items (for example, a file from the queue)
    levelup: "", // associated with the action for navigating up one level in file browser widgets
    settings: "", // associated with the action to update settings for the application or widgets
    more: "", // associated with the action to expand hidden content (for example, a collapsed information row)
    less: "", // associated with the action to collapse content into a hidden element
    addqueue: "", // associated with adding an individual file to the queue
    envelope: "", // associated with the email widget
    ok: "", // associated with accepting or confirming an action, update, or information
    remove: "", // associated with removing an item; often but not necessarily set to the same icon as the "trash"
    repeat: "" // associated with repeating an action
  }
};

pg.config.webapp.useBootstrap = true; // not to be edited; current release requires this to be present and true
