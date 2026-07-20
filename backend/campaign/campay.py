"""
Thin wrapper around the Campay Collect API.
Docs: https://documenter.getpostman.com/view/2333644/T1LPCzoW (Campay public API)

Flow used here:
1. get_token()          -> OAuth2 token using CAMPAY_USERNAME / CAMPAY_PASSWORD
2. request_payment()    -> POST /collect/  triggers the USSD prompt on the
                            contributor's phone (Orange Money / MTN MoMo)
3. check_status()       -> GET /transaction/{reference}/ used for polling,
                            complemented by the /webhook endpoint below.
"""
import requests
from django.conf import settings


class CampayError(Exception):
    pass


def _base_url():
    return settings.CAMPAY_BASE_URL.rstrip('/')


def get_token():
    resp = requests.post(
        f"{_base_url()}/token/",
        data={
            'username': settings.CAMPAY_USERNAME,
            'password': settings.CAMPAY_PASSWORD,
        },
        timeout=15,
    )
    if resp.status_code != 200:
        raise CampayError(f"Impossible d'obtenir un token Campay: {resp.text}")
    return resp.json()['token']


def request_payment(amount, phone, description="Don BOUAN'O DOUMAINTANG"):
    """
    amount: int, in FCFA
    phone: str, e.g. '+237690000000' or '690000000'
    Returns Campay's response containing `reference` used to track the transaction.
    """
    token = get_token()
    resp = requests.post(
        f"{_base_url()}/collect/",
        headers={'Authorization': f'Token {token}'},
        json={
            'amount': str(amount),
            'currency': 'XAF',
            'from': phone,
            'description': description,
            'external_reference': '',
        },
        timeout=20,
    )
    if resp.status_code not in (200, 201):
        raise CampayError(f"Échec de la demande de paiement Campay: {resp.text}")
    return resp.json()


def check_status(reference):
    token = get_token()
    resp = requests.get(
        f"{_base_url()}/transaction/{reference}/",
        headers={'Authorization': f'Token {token}'},
        timeout=15,
    )
    if resp.status_code != 200:
        raise CampayError(f"Impossible de vérifier la transaction: {resp.text}")
    data = resp.json()
    # Campay returns e.g. {"status": "SUCCESSFUL"} / "PENDING" / "FAILED"
    return data.get('status', 'PENDING')
