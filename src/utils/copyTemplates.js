const { join } = require('path');
const {
  writeFileSync,
  readFileSync,
  readdirSync,
  existsSync,
  mkdirSync,
  lstatSync,
} = require('fs');

const copyTemplates = (source, target, callback = fileContents => fileContents) => {
  if (!existsSync(target)) {
    mkdirSync(target);
  }

  readdirSync(source).forEach(fileName => {
    const filePath = join(source, fileName);

    if (lstatSync(filePath).isDirectory()) {
      copyTemplates(filePath, join(target, fileName), callback);
    } else {
      const fileContents = callback(readFileSync(filePath, 'utf8'));
      writeFileSync(join(target, fileName.replace(/^_/, '.')), fileContents);
    }
  });
};

module.exports = copyTemplates;
