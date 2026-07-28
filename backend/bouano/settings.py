from pathlib import Path
from decouple import config, Csv

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('DJANGO_SECRET_KEY', default='change-me-in-production')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    'campaign',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'bouano.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'bouano.wsgi.application'

DATABASE_URL = config('DATABASE_URL', default='')

if DATABASE_URL:
    from urllib.parse import urlparse, unquote
    db = urlparse(DATABASE_URL)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': unquote(db.path[1:]),
            'USER': unquote(db.username or ''),
            'PASSWORD': unquote(db.password or ''),
            'HOST': db.hostname,
            'PORT': db.port or '5432',
        }
    }
elif config('USE_SQLITE', default=False, cast=bool):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('DB_NAME', default='bouano_doumaintang'),
            'USER': config('DB_USER', default='postgres'),
            'PASSWORD': config('DB_PASSWORD', default='postgres'),
            'HOST': config('DB_HOST', default='localhost'),
            'PORT': config('DB_PORT', default='5432'),
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Douala'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DATA_UPLOAD_MAX_MEMORY_SIZE = 6 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 6 * 1024 * 1024

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ---- CORS / frontend ----
# Allow Vite dev server default port and common fallback port used locally
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='http://localhost:5173,http://localhost:5174', cast=Csv())
# Vercel génère plusieurs URLs (*.vercel.app) selon la branche / le déploiement
CORS_ALLOWED_ORIGIN_REGEXES = [
    r'^https://.*\.vercel\.app$',
]

# ---- DRF ----
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
}

# ---- Campay ----
CAMPAY_BASE_URL = config('CAMPAY_BASE_URL', default='https://demo.campay.net/api')  # switch to https://www.campay.net/api in production
CAMPAY_USERNAME = config('CAMPAY_USERNAME', default='')
CAMPAY_PASSWORD = config('CAMPAY_PASSWORD', default='')
CAMPAY_WEBHOOK_KEY = config('CAMPAY_WEBHOOK_KEY', default='')

MINIMUM_CONTRIBUTION_AMOUNT = config('MINIMUM_CONTRIBUTION_AMOUNT', default=20000, cast=int)
FUNDRAISING_GOAL = config('FUNDRAISING_GOAL', default=5000000, cast=int)

# ---- Taramoney ----
TARAMONEY_API_KEY = config('TARAMONEY_API_KEY', default='')
TARAMONEY_BUSINESS_ID = config('TARAMONEY_BUSINESS_ID', default='')
TARAMONEY_BASE_URL = config('TARAMONEY_BASE_URL', default='https://www.dklo.co/api/tara/mobilepay')
TARAMONEY_DEFAULT_WEBHOOK = config('TARAMONEY_DEFAULT_WEBHOOK', default='')
