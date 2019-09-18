const { join } = require('path');
const {
  writeFileSync,
  readFileSync,
  readdirSync,
  existsSync,
  mkdirSync,
  lstatSync,
} = require('fs');

const copyTemplates = (source, target, callback = file => file) => {
  if (!existsSync(target)) {
    mkdirSync(target, { recursive: true });
  }

  readdirSync(source).forEach(fileName => {
    const filePath = join(source, fileName);

    if (lstatSync(filePath).isDirectory()) {
      copyTemplates(filePath, join(target, fileName), callback);
    } else {
      const { fileName: newFileName, fileContents: newFileContents } = callback({
        fileName,
        fileContents: readFileSync(filePath, 'utf8'),
      });

      writeFileSync(join(target, newFileName), newFileContents);
    }
  });
};

module.exports = copyTemplates;
