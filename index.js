/*
  node index.js --user=GIT_USER_NAME --output=OUTPUT_FILE
*/

const spawn = require('child_process').spawn;
const fs = require('fs');

function rightPad(str, len, ch) {
  const padlen = len - str.length;
  return (padlen <= 0) ? str : str + (ch || ' ').repeat(padlen);
}

function logger(title, content) {
  console.log(` - ${rightPad(title, 6)}: ${content}`);
}

function makeMarkdown(dataArr, outputPath) {
  let str = '';
  dataArr.forEach((item) => {
    str = str + `# ${item.date}\n\n${item.value.join('\n').replace(/^/mg, ' - ')}\n\n`;
  });
  if (outputPath) {
    fs.writeFileSync(outputPath, str);
  } else {
    console.log('\n\n', str);
  }
}

function processData(raw) {
  const resArr = [];
  let currentArr;
  let currentDate = '';
  const lines = raw.split('\n');
  logger('Git Done', `${lines.length} Commits Found\n`)
  lines.forEach((item) => {
    item = item.replace(/^"/, '').replace(/"$/, '');
    const vs = item.split('$@$');
    if (vs.length !== 3) {
      return;
    }
    if ((/^merge.*branch.*into/i).test(vs[2])) {
      logger('Skip', `${vs[2].slice(0,55)}`);
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
  const params = {
    user: 'WangLei',
    output: false
  };
  process.argv.splice(2).forEach((arg) => {
    argPair = arg.split('=');
    if (argPair.length !== 2) {
      return;
    }
    const pName = argPair[0].replace(/^--/, '');
    if (pName && typeof params[pName] !== 'undefined') {
      params[pName] = argPair[1];
    }
  });
  logger('User', `${params.user}`);
  params.output && logger('Output', `${params.output}`);
  let rawData = '';
  let shell = spawn('git', ['log', '--pretty=format:"%ad$@$%an$@$%s"', '--author=' + params.user, '--since=4.weeks', '--reverse', '--date=short']);
  shell.stdout.on('data', function(data) {
    rawData = rawData + data;
  });
  shell.on('error', function() {
    logger('Error', 'Something is wrong. Is Git installed ?');
  });
  shell.on('exit', function(code, signal) {
    setTimeout(function() {
      makeMarkdown(processData(rawData), params.output);
      if (params.output) {
        logger('Done', `See ${params.output}`);
      }
      process.exit()
    }, 2000);
  });

})();
