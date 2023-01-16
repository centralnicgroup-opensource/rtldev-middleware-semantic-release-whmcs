import AggregateError from "aggregate-error";
import resolveConfig from "./resolve-config.js";
import getError from "./get-error.js";

export default async (pluginConfig, context) => {
  const cfg = resolveConfig(context);
  const errors = [];
  if (cfg.ghtoken === false) {
    errors.push(getError("ENOGHTOKEN"));
  }
  if (cfg.login === false || cfg.password === false) {
    errors.push(getError("EWHMCSNOCREDENTIALS"));
  }
  // TODO: we might test Marketplace login using given credentials
  if (cfg.productid === false) {
    errors.push(getError("EWHMCSNOPRODUCTID"));
  }
  if (!/^[0-9]+$/.test(cfg.productid) || !parseInt(cfg.productid, 10)) {
    errors.push(getError("EWHMCSINVALIDPRODUCTID"));
  }
  if (errors.length > 0) {
    throw new AggregateError(errors);
  }
};
