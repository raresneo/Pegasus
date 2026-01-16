# 🛡️ Pegasus Elite Hub - Ghid Producție (v2)

## 1. Configurare Firebase
- Proiect: `pegasus-hub`
- Firestore: Enabled (Production Mode)
- Colecții: `users`, `members`, `payments`, `bookings`, `products`.

## 2. Utilizatori & Roluri (Inițializare)
În colecția `users`, adaugă manual primul admin:
```json
{
  "email": "admin@fitable.com",
  "name": "Super Admin",
  "role": "admin",
  "avatar": "SA",
  "password": "password" 
}
```
*Note: La prima rulare, sistemul va accepta 'password' dar recomandăm schimbarea ei imediată.*

## 3. Management Permisiuni
- **ADMIN**: Acces total la `Settings`, `Reports`, `Staff Management`, `Financials`.
- **TRAINER**: Acces la `Agenda`, `Members Hub`, `Tasks`, `POS`.
- **MEMBER**: Acces limitat la `Personal Dashboard`, `Own Bookings`, `Referrals`.

## 4. Deploy Cloud Run
```bash
# Setează variabilele în consola Google Cloud Run:
FIREBASE_SERVICE_ACCOUNT='{...}'
JWT_SECRET='o-cheie-foarte-lunga-si-complexa'
API_KEY='cheia-gemini'
NODE_ENV='production'
```

---
Aplicația este configurată să servească automat Frontend-ul din folderul `/dist` pe portul definit de Cloud Run.
