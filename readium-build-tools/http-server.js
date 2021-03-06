
var networkInterfaces = require('os').networkInterfaces()

var localIP = function ()
{
  for(var k in networkInterfaces)
  {
    var networkInterface = networkInterfaces[k];
    for(var j in networkInterface)
    {
      if(networkInterface[j].family === 'IPv4' && !networkInterface[j].internal)
      {
        return networkInterface[j].address;
      }
    }
  }

  return undefined;
}

var args = process.argv.slice(2);



var PORT = 7777;

for (var i = 0; i < args.length; i++) {
    if (args[i] === "-p") {
        if (++i < args.length) PORT = args[i];
        console.log(PORT);
        break;
    }
}


var PATH = undefined;

for (var i = 0; i < args.length; i++) {
    if (args[i] === "-OPEN") {
        args.splice(i, 1);
        
        if (i < args.length) {
            PATH = args[i];
            args.splice(i, 1);
        }
        
        console.log(PATH);
        break;
    }
}


var LOGFILE = undefined;

for (var i = 0; i < args.length; i++) {
    if (args[i] === "-LOGFILE") {
        args.splice(i, 1);
        
        if (i < args.length) {
            LOGFILE = args[i];
            args.splice(i, 1);
        }
        
        console.log(LOGFILE);
        break;
    }
}


var IP = undefined;

for (var i = 0; i < args.length; i++) {
    if (args[i] === "-a") {
        if (++i < args.length) IP = args[i];
        break;
    }
}

if (!IP) {
    IP = localIP();
    
    args.unshift(IP);
    args.unshift("-a");
}
console.log(IP);



console.log("http-server.js arguments: ");
console.log(args);

var fs = require('fs');
var path = require('path');
var child_process = require('child_process');

args.unshift(path.join(process.cwd(), 'node_modules', 'http-server', 'bin', 'http-server'));



// fs.existsSync is marked as deprecated, so accessSync is used instead (if it's available in the running version of Node).
function doesFileExist(path) {
    var exists;
    if (fs.accessSync) {
        try {
            fs.accessSync(path);
            exists = true;
        } catch (ex) {
            exists = false;
        }
    } else {
        exists = fs.existsSync(path);
    }
    return exists;
}

if (LOGFILE) {
    LOGFILE = path.join(process.cwd(), LOGFILE); 
        
    if (doesFileExist(LOGFILE)) {
        console.log("~~ delete: " + LOGFILE);
        fs.unlinkSync(LOGFILE);
    }
}

var child = child_process.spawn('node', args);
child.stdout.on('data', function(data) {
    if (LOGFILE) {
        fs.appendFileSync(LOGFILE, data.toString());
    } else {
        console.log(data.toString());
    }
});
child.stderr.on('data', function(data) {
    if (LOGFILE) {
        fs.appendFileSync(LOGFILE, data.toString());
    } else {
        console.log(data.toString());
    }
});
child.on('close', function(code) {
    console.log('HTTP child process exit code: ' + code);
    if (LOGFILE) {
        console.log("HTTP log: " + LOGFILE);
    }
});



if (PATH) {
    var child2 = child_process.spawn('node', ['node_modules/opener/opener.js', 'http://'+IP+':'+PORT+PATH]);
    child2.stdout.on('data', function(data) {
        console.log(data.toString());
    });
    child2.stderr.on('data', function(data) {
        console.log(data.toString());
    });
    child2.on('close', function(code) {
        console.log('OPENER child process exit code: ' + code);
    });
}