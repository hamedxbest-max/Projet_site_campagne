/**
 * Once you send the Campay payment link(s) generated from your dashboard,
 * paste them here. If PAYMENT_LINKS.default is set, Step10 can offer a
 * "Payer via lien sécurisé" button that opens Campay's hosted checkout
 * directly, as an alternative to the in-app amount/phone flow already
 * wired to the /pay/ API endpoint.
 *
 * Example once you have it:
 *   export const PAYMENT_LINKS = {
 *     default: 'https://pay.campay.net/xxxxxxxx',
 *   };
 */
export const PAYMENT_LINKS = {
  default: '',
};
