/*
alist-on-sillydev by Yucho
GitHub: https://github.com/yucho123987/alist-on-sillydev
*/
console.log('ERROR: This project has been officially banned by SillyDev, please do not risk it.');
process.exit(1);
const { spawn, execSync } = require('child_process'), axios = require('axios'), fs = require('fs'), inly = require('inly');
// Check if the Alist program exists
try {
    fs.accessSync('alist', fs.constants.F_OK);
    // Check if the Alist is the latest version
    console.log('Checking update for Alist...');
    console.log('Getting local Alist version...');
    const local_version = getLocalAlistVersion();
    console.log(`Local Alist version is ${local_version}. Now getting the latest version...`);
    compareWithLatestVersion(local_version);
} catch (e) {
    console.log("The Alist program doesn't seem to be there, try to download it automatically.");
    downloadAlist();
}
// Check if the Alist program executable
function isAlistExecutable() {
    try {
        fs.accessSync('alist', fs.constants.X_OK);
    } catch (e) {
        console.log("ERROR: The Alist program doesn't seem to be executable. Please make it executable manually.");
        process.exit();
    }
}
// Start the Alist server
function launchAlistServer() {
    console.log('Now launching the Alist server...');
    isAlistExecutable();
    var server_process = spawn('./alist', ['server']);
    server_process.stdout.pipe(process.stdout);
    server_process.stderr.pipe(process.stderr);
}
// Returns the local Alist version without the prefix 'v'
function getLocalAlistVersion() {
    isAlistExecutable();
    try {
        let cmd_output = execSync('./alist version').toString().toLowerCase();
        return cmd_output.split('version: ' + (cmd_output.indexOf('version: v') > -1 ? 'v' : ''))[1].split('\n')[0];
    } catch (e) {
        console.log('ERROR: Failed to get local Alist version');
        process.exit();
    }
}
// Fetch the latest version of Alist and compare it with the local version
function compareWithLatestVersion(local_version) {
    axios.get('https://github.com/AlistGo/alist/releases/latest')
        .then(function (response) {
            const latest_version = response.data.split('<h1 data-view-component="true" class="d-inline mr-3">v')[1].split('</h1>')[0];
            console.log(`The latest Alist version is ${latest_version}`);
            if (local_version == latest_version) {
                console.log('Great! The local Alist is the latest version.');
                launchAlistServer();
            } else {
                console.log('It seems that your local Alist is not the latest version. Now download the latest version for you...');
                downloadAlist(latest_version);
            }
        })
        .catch(function (error) {
            console.log('ERROR: Failed to get the latest version for Alist due to request failure: ' + error);
        });
}
// Download Alist from GitHub
function downloadAlist(version = 'latest') {
    console.log(`Downloading Alist...`);
    const writer = fs.createWriteStream('./alist.tar.gz');
    axios({
        url: `https://github.com/AlistGo/alist/releases/${version == 'latest' ? 'latest/download' : 'download/v' + version}/alist-linux-amd64.tar.gz`,
        method: 'GET',
        responseType: 'stream'
    }).then(function (response) {
        writer.on('finish', () => {
            console.log('Successfully downloaded Alist. Trying to extract it...');
            // Exact Alist with inly
            const extract = inly('./alist.tar.gz', './');
            extract.on('error', (error) => {
                console.error(`Failed to extraxt Alist: ${error}`);
                process.exit();
            });
            extract.on('end', () => {
                console.log('Successfully extracted Alist.');
                // Delete alist.tar.gz
                try {
                    fs.unlinkSync('./alist.tar.gz');
                } catch (e) {}
                launchAlistServer();
            });
        });
        writer.on('error', (err) => {
            console.log(`Failed to download Alist: ${err}`);
            process.exit();
        });
        response.data.pipe(writer);
    });
}
