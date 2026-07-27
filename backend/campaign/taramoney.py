import logging
from typing import Optional, Dict, Any
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

class TaramoneyError(Exception):
    pass

class TaramoneyClient:
    """Simple client to initiate payments via Taramoney (TaraMoney).

    Usage:
        client = TaramoneyClient()
        resp = client.initiate_payment(
            business_id=settings.TARAMONEY_BUSINESS_ID,
            product_id='product-456',
            product_name='Donation',
            product_price=100,
            phone_number='2376xxxxxxx',
            web_hook_url=settings.TARAMONEY_DEFAULT_WEBHOOK,
            network='WAVE'  # optional
        )

    The client reads configuration from Django settings. Add the following in your settings or .env:
    - TARAMONEY_API_KEY
    - TARAMONEY_BUSINESS_ID
    - TARAMONEY_BASE_URL (default: https://www.dklo.co/api/tara/mobilepay)
    - TARAMONEY_DEFAULT_WEBHOOK (optional)
    """

    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        self.api_key = api_key or getattr(settings, 'TARAMONEY_API_KEY', '')
        self.base_url = base_url or getattr(settings, 'TARAMONEY_BASE_URL', 'https://www.dklo.co/api/tara/mobilepay')
        if not self.api_key:
            logger.warning('Taramoney API key is not configured (TARAMONEY_API_KEY)')

    def initiate_payment(
        self,
        business_id: str,
        product_id: str,
        product_name: str,
        product_price: int,
        phone_number: str,
        web_hook_url: str,
        network: Optional[str] = '',
        timeout: int = 10,
    ) -> Dict[str, Any]:
        """Initiate a mobile payment request.

        Returns the parsed JSON response from Taramoney on success.
        Raises TaramoneyError on HTTP or API failure.
        """
        payload = {
            'apiKey': self.api_key,
            'businessId': business_id,
            'productId': product_id,
            'productName': product_name,
            'network': network or '',
            'productPrice': int(product_price),
            'phoneNumber': phone_number,
            'webHookUrl': web_hook_url,
        }

        headers = {'Content-Type': 'application/json'}
        try:
            logger.debug('Sending Taramoney initiate request to %s payload=%s', self.base_url, payload)
            resp = requests.post(self.base_url, json=payload, headers=headers, timeout=timeout)
        except requests.RequestException as exc:
            logger.exception('Network error when calling Taramoney')
            raise TaramoneyError('Network error when calling Taramoney') from exc

        if resp.status_code != 200:
            logger.error('Taramoney returned non-200 status: %s body=%s', resp.status_code, resp.text)
            raise TaramoneyError(f'Taramoney returned status {resp.status_code}')

        try:
            data = resp.json()
        except ValueError:
            logger.error('Taramoney returned invalid JSON: %s', resp.text)
            raise TaramoneyError('Invalid JSON received from Taramoney')

        # Basic API-level failure handling: expect a status or message field
        status = data.get('status') or data.get('message')
        if status and status.upper() == 'FAILURE':
            logger.error('Taramoney API signalled failure: %s', data)
            raise TaramoneyError('Taramoney API signalled failure')

        logger.info('Taramoney initiate successful: %s', data)
        return data
