
## Security rules

```
{
  "rules": {
    ".read": "root.child('users').child(auth.email.replace('.', ',')).exists()",
    ".write": "root.child('users').child(auth.email.replace('.', ',')).exists()"
  }
}
```

Créer une collection ```users``` clés de la collection : emails autorisés ( "."" remplacé par ",").

Par exemple "tmoyse@gmail.com" stocker avec la clé "tmoyse@gmail,com"