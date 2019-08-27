const { spawn } = require('child_process');

module.exports = (...args) =>
  new Promise((resolve, reject) => {
    const job = spawn(...args);
    job.on('close', code => (code === 0 ? resolve() : reject()));
  });
