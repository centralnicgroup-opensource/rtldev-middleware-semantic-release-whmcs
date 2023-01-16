import SemanticReleaseError from "@semantic-release/error";
import * as ERROR_DEFINITIONS from "./definitions/errors.js";

export default (code) => {
  const { message, details } = ERROR_DEFINITIONS[code]();
  return new SemanticReleaseError(message, code, details);
};
