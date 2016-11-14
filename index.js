/*
  node index.js --u=GIT_USER_NAME --o=OUTPUT_FILE
*/

var spawn = require('child_process').spawn;
var fs = require('fs');

function writeFile(dataArr, outputPath) {
  let str = '';
  dataArr.forEach((item) => {
    str = str + `# ${item.date}\n\n${item.value.join('\n').replace(/^/mg, ' - ')}\n\n`;
  });
  fs.writeFileSync(outputPath, str);
}

function processData(raw) {
  const resArr = [];
  let currentArr;
  let currentDate = '';
  const lines = raw.split('\n');
  console.log(` - Git Done: ${lines.length} Commits Found\n`)
  lines.forEach((item) => {
    item = item.replace(/^"/, '').replace(/"$/, '');
    const vs = item.split('$@$');
    if (vs.length !== 3) {
      return;
    }
    if ((/^merge.*branch.*into/i).test(vs[2])) {
      console.log(` - Skip: ${vs[2]}`);
      return;
    }
    vs[2] = vs[2].replace(/；|;/g, '\n');
    if (vs[0] == currentDate) {
      currentArr.push(vs[2]);
    } else {
      if (currentArr && currentArr.length > 0) {
        resArr.push({
          date: currentDate,
          value: currentArr
        });
      }
      currentDate = vs[0];
      currentArr = [];
      currentArr.push(vs[2]);
    }
  });
  if (currentArr && currentArr.length > 0) {
    resArr.push({
      date: currentDate,
      value: currentArr
    });
  }
  return resArr;
}


(function() {
  let user = 'WangLei';
  let outputPath = '../commits_log.md';
  var arguments = process.argv.splice(2);
  arguments.forEach((arg) => {
    argPair = arg.split('=');
    if (argPair.length !== 2) {
      return;
    }
    if (argPair[0] == '--u') {
      user = argPair[1];
    }
    if (argPair[0] == '--o') {
      outputPath = argPair[1];
    }
  });
  console.log(` - User  : ${user}\n - Output: ${outputPath}\n`);
  let rawData = '';
  let shell = spawn('git', ['log', '--pretty=format:"%ad$@$%an$@$%s"', '--author=' + user, '--since=4.weeks', '--reverse', '--date=short']);
  shell.stdout.on('data', function(data) {
    rawData = rawData + data;
  });
  shell.on('exit', function(code, signal) {
    setTimeout(function() {
      writeFile(processData(rawData), outputPath);
      console.log(`\n - Work Done. See ${outputPath}`);
      process.exit()
    }, 2000);
  });
})();
