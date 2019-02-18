const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;

function createPackageFile() {
  try {
    const packageData = fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8');
    // packageData.version = semver.inc(packageData.version, 'patch'); // increase version
    const { scripts, engines, files, devDependencies, ...packageDataOther } = JSON.parse(packageData);

    delete packageDataOther['lint-staged'];

    ['asn1js', 'pkijs', 'pvutils', 'tslib', 'xml-core'].forEach(package => {
      delete packageDataOther.dependencies[package];
    });

    const newPackageData = {
      ...packageDataOther,
      main: './index.js',
      types: './index.d.ts',
      private: false
    };
    const buildPath = path.resolve(__dirname, '../dist/package.json');

    fs.writeFileSync(buildPath, JSON.stringify(newPackageData, null, 2), 'utf8');
    console.log(`Created package.json in ${buildPath}`);
  } catch (err) {
    console.error(err.message);
  }
}

function packModule() {
  const spawnArgs = { shell: true };
  try {
    spawn('cd', [path.resolve(__dirname, '../dist')], spawnArgs);

    spawn('ls', ['-la'], spawnArgs);
    spawn('npm', ['pack'], spawnArgs);
  } catch (err) {
    console.log(err.message);
  }
}

createPackageFile();
// packModule();

// cd dist/ && npm pack && mv document-signing-toolkit-*tgz document-signing-toolkit-latest.tgz
