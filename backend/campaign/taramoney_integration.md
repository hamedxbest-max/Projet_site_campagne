Integration notes: Taramoney (TaraMoney)

1) Environment / settings

Add the following variables to your backend `.env` (or to your environment):

TARAMONEY_API_KEY=your-public-api-key
TARAMONEY_BUSINESS_ID=your-business-id
TARAMONEY_BASE_URL=https://www.dklo.co/api/tara/mobilepay
TARAMONEY_DEFAULT_WEBHOOK=https://your-public-domain/api/payments/taramoney/webhook/

If you use `python-decouple` (the project does), expose these in your settings.py similarly to other keys. Example addition in `backend/bouano/settings.py`:

    TARAMONEY_API_KEY = config('TARAMONEY_API_KEY', default='')
    TARAMONEY_BUSINESS_ID = config('TARAMONEY_BUSINESS_ID', default='')
    TARAMONEY_BASE_URL = config('TARAMONEY_BASE_URL', default='https://www.dklo.co/api/tara/mobilepay')
    TARAMONEY_DEFAULT_WEBHOOK = config('TARAMONEY_DEFAULT_WEBHOOK', default='')

2) Usage example (Django view)

Here's a minimal view that starts a payment using the client in `campaign/taramoney.py`::

    from rest_framework.views import APIView
    from rest_framework.response import Response
    from rest_framework import status
    from django.conf import settings
    from .taramoney import TaramoneyClient, TaramoneyError

    class StartTaraPayment(APIView):
        def post(self, request):
            payload = request.data
            client = TaramoneyClient()
            try:
                resp = client.initiate_payment(
                    business_id=settings.TARAMONEY_BUSINESS_ID,
                    product_id=payload.get('productId', 'product-1'),
                    product_name=payload.get('productName', 'Donation'),
                    product_price=int(payload.get('productPrice', 0)),
                    phone_number=payload.get('phoneNumber'),
                    web_hook_url=payload.get('webHookUrl') or settings.TARAMONEY_DEFAULT_WEBHOOK,
                    network=payload.get('network', ''),
                )
            except TaramoneyError as exc:
                return Response({'detail': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

            return Response(resp)

3) Webhook

Taramoney will POST notifications to the `webHookUrl` you provide. Implement a view to receive the JSON payload shown in Taramoney docs and update your `Payment` records accordingly. Ensure the webhook URL is publicly reachable (ngrok for local development).

4) Notes
- Ensure phone numbers include the ISO country code as required by Taramoney (e.g. `2376xxxxxxx`).
- `requests` is already in `requirements.txt`.

5) Next steps I can implement for you
- Add the Django view and URL route for starting payments.
- Create a `Payment` model and migration.
- Add the webhook endpoint and signature/verification (if Taramoney provides one).
- Connect the frontend call from `frontend/src/api/paymentLinks.js` to the new endpoint.

Tell me which of the next steps you want me to implement now.
