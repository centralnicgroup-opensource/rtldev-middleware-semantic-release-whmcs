module.exports = {
  EWHMCSNOCREDENTIALS: () => ({
    message: 'No WHMCS Marketplace credentials specified.',
    details: 'WHMCS Marketplace credentails have to be set in the `WHMCS_LOGIN` and `WHMCS_PASSWORD` environment variables on your CI environment.'
  }),
  EWHMCSNOPRODUCTID: () => ({
    message: 'No WHMCS Marketplace Product ID specified.',
    details: 'The product id of your listed product at the WHMCS Marketplace has to be set in the `WHMCS_PRODUCTID` environment variable on your CI environment. You\'ll find that number in url when visiting the product page in WHMCS Marketplace.'
  }),
  EWHMCSINVALIDPRODUCTID: () => ({
    message: 'Invalid WHMCS Marketplace Product ID specified.',
    details: 'The product id of your listed product at the WHMCS Marketplace has to be set in the `WHMCS_PRODUCTID` environment variable on your CI environment. You\'ll find that number in url when visiting the product page in WHMCS Marketplace.'
  })
}
