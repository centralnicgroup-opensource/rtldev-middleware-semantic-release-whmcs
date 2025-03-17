export function ENOGHTOKEN() {
  return {
    message: "No Github Token specified.",
    details: "Please create a `GH_TOKEN` in repository secrets.",
  };
}

export function EWHMCSNOCREDENTIALS() {
  return {
    message: "No WHMCS Marketplace credentials specified.",
    details:
      "WHMCS Marketplace credentials have to be set in the `WHMCS_LOGIN` and `WHMCS_PASSWORD` environment variables in your CI environment.",
  };
}

export function EWHMCSNOPRODUCTID() {
  return {
    message: "No WHMCS Marketplace Product ID specified.",
    details:
      "The product id of your listed product at the WHMCS Marketplace has to be set in the `WHMCS_PRODUCTID` environment variable on your CI environment. You'll find that number in url when visiting the product page in WHMCS Marketplace.",
  };
}

export function EWHMCSINVALIDPRODUCTID() {
  return {
    message: "Invalid WHMCS Marketplace Product ID specified.",
    details:
      "The product id of your listed product at the WHMCS Marketplace has to be set in the `WHMCS_PRODUCTID` environment variable on your CI environment. You'll find that number in url when visiting the product page in WHMCS Marketplace.",
  };
}
