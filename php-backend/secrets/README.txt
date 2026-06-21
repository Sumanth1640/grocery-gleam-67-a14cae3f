Place your Firebase Admin SDK service account JSON here as:
  fcm-service-account.json

It MUST be readable by PHP but should ideally live OUTSIDE the public web root.
On Hostinger you can upload it via File Manager / FTP. Set the absolute path via
env var FCM_SERVICE_ACCOUNT_PATH if you put it elsewhere.

This folder is gitignored — do NOT commit the JSON.
