const { Gitlab } = require('gitlab');

module.exports = (answers, project) => {
  if (answers && project) {
    const gitlab = new Gitlab({ token: answers.token });
    return gitlab.Projects.remove(project.id);
  }

  return Promise.resolve();
};
