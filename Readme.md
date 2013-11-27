## Installation

* Clone this repository
* npm install -g grunt-cli
* npm install -g bower
* npm install

## Firebase

### 1. Create a firebase account

### 2. Create a ```users``` collection

Add authorized users :

key must be emails (replace "." by ",", as firebase does not allow "." in key)

![alt tag](https://raw.github.com/t8g/fAct/master/firebase.png)

### Security rules

Update security rules

```
{
  "rules": {
    ".read": "root.child('users').child(auth.email.replace('.', ',')).exists()",
    ".write": "root.child('users').child(auth.email.replace('.', ',')).exists()"
  }
}
```

## Launch !

```grunt server --firebase=yourfirebaseurl```

### Build

```grunt build --firebase=yourfirebaseurl```