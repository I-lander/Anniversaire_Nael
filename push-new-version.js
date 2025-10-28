const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { log } = require('console');

const packageJsonPath = path.join(__dirname, 'package.json');
const packageLockJsonPath = path.join(__dirname, 'package-lock.json');
const electronPackageJsonPath = path.join(__dirname, 'electron', 'package.json');

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath));
}

function writeJsonFile(filePath, jsonContent) {
  fs.writeFileSync(filePath, JSON.stringify(jsonContent, null, 2));
}

function incrementVersion(version, type = 'patch') {
  const parts = version.split('.').map(Number);

  switch (type) {
    case 'major':
      parts[0] += 1;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1] += 1;
      parts[2] = 0;
      break;
    case 'patch':
    default:
      parts[2] += 1;
      break;
  }

  return parts.join('.');
}


const packageJson = readJsonFile(packageJsonPath);
packageJson.version = incrementVersion(packageJson.version, process.argv[2]);
writeJsonFile(packageJsonPath, packageJson);

if (fs.existsSync(packageLockJsonPath)) {
  const packageLockJson = readJsonFile(packageLockJsonPath);
  packageLockJson.version = packageJson.version;
  packageLockJson.packages[''].version = packageJson.version;
  writeJsonFile(packageLockJsonPath, packageLockJson);
}

if (fs.existsSync(electronPackageJsonPath)) {
  const electronPackageJson = readJsonFile(electronPackageJsonPath);
  electronPackageJson.version = packageJson.version;
  writeJsonFile(electronPackageJsonPath, electronPackageJson);
}

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`error: ${error.message}`);
        return;
      }

      if (stdout.trim()) console.log(`stdout: ${stdout.trim()}`);
      if (stderr.trim()) console.log(`stderr: ${stderr.trim()}`);

      resolve(stdout);
    });
  });
}

async function gitPushAll(message) {
  try {
    await runCommand(
      'git add ./package.json ./package-lock.json',
    );

    await runCommand(`git commit -m "${message}"`);

    await runCommand(`git tag "v${packageJson.version}"`);

    await runCommand('git push');

    await runCommand('git push --tags');
  } catch (error) {
    console.error(`An error occurred: ${error}`);
  }
}

const commitMessage = `Create tag v${packageJson.version}`;
console.log(`Pushing changes with commit message: "${commitMessage}"`);
gitPushAll(commitMessage);
