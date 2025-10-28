const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { log } = require('console');

const buildGradlePath = path.join(__dirname, 'android', 'app', 'build.gradle')
const buildGradlePathContent = fs.readFileSync(buildGradlePath, 'utf8');
const currentVersionMatch = buildGradlePathContent.match(/^\s*versionCode\s+(\d+)/m);console.log(buildGradlePathContent);

if (!currentVersionMatch) {
		console.error('Could not find versionCode in build.gradle');
		process.exit(1);
}
const currentVersionCode = parseInt(currentVersionMatch[1], 10);
const newVersionCode = currentVersionCode + 1;
let buildGradleContent = buildGradlePathContent.replace(
  /(^\s*versionCode\s+)(\d+)/m,
  (_, p1, p2) => `${p1}${Number(p2) + 1}`
);

fs.writeFileSync(
		buildGradlePath,
		buildGradleContent
);

async function gitPushAll(message) {
		try {
				await runCommand(
						'git add ./android/app/build.gradle',
				);

				await runCommand(`git commit -m "${message}"`);

				await runCommand('git push');

		} catch (error) {
				console.error(`An error occurred: ${error}`);
		}
}

const commitMessage = `Update versionCode to ${newVersionCode}`;
console.log(`Pushing changes with commit message: "${commitMessage}"`);
// gitPushAll(commitMessage);
