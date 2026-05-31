# Uploads directory

PHP uploads are written under this folder by `api/uploads/upload.php`:

```
php-backend/uploads/
  catalog/         # admin-uploaded product / category / banner images (public)
  partner-docs/    # restaurant partner KYC docs (semi-public, served by URL)
```

Ensure your web server has write permission on this folder. On Hostinger
shared hosting, the typical setup is `chmod 755` on the directory and
`chmod 644` on the files (handled automatically by the upload script).

Files placed here are served directly by the web server at
`https://yourdomain.com/php-backend/uploads/<bucket>/<folder>/<filename>`.

For local XAMPP testing, the URL is
`http://localhost/HalliFresh/Phase_1/grocery-gleam-67/php-backend/uploads/...`.
