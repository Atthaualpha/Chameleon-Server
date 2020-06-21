const cnn = require("../config/dbConfig").getConnection();
const logger = require("../config/logger");

class Project {
  #projectId;
  #name;

  /**
   *
   * @param {String} name
   * @param {function} callback
   */
  async createProject(name, callback) {
    try {
      let response = await cnn.collection("project").insertOne({ name });

      let projectCreated = {
        id: response.insertedId,
        name,
      };

      callback(null, projectCreated);
    } catch (err) {
      logger.error(err);
      callback(err);
    }
  }

  get projectId() {
    return this.projectId;
  }

  /**
   *  @param {String} projectId
   */
  set projectId(projectId) {
    this.#projectId = projectId;
  }

  /**
   * @param {String} name
   */
  set name(name) {
    this.name = name;
  }

  get name() {
    return this.name;
  }
}

module.exports = Project;
