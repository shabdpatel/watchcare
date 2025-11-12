# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

## Negotiated Pricing Feature

This app supports buyer–seller price negotiation on individual products. The flow is fully client-driven via Firestore and is scoped to the requesting buyer only.

### How it works

- On the product details page, authenticated buyers see a "Negotiate Price" button.
- Buyers submit a proposed price. A document is created/updated in `negotiations/{productId}_{buyerEmail}` with status `pending`.
- Admin reviews requests in the Admin Dashboard → Negotiations tab and approves or rejects.
- On approval, `approvedPrice` and `status=approved` are set on the same negotiation doc. The product page and checkout automatically apply this price for that buyer only.

### Data model

- Collection: `negotiations`
  - Doc ID: `${productId}_${buyerEmail}`
  - Fields: `{ productId, productCollection, buyerId, originalPrice, proposedPrice, status, approvedPrice?, createdAt, updatedAt?, approvedAt?, approvedBy?, rejectedAt?, notes? }`

No global product price is modified; cart and checkout use the approved per-buyer price when present.

### Firestore security rules (recommended)

Add the following constraints to your Firestore rules to keep the flow secure and scoped:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && (
        request.auth.token.email in [
          'shabdpatel0@gmail.com',
          '22bph028@nith.ac.in',
          'prameetsw@gmail.com',
          'shabdpatel87@gmail.com'
        ]
      );
    }

    match /negotiations/{id} {
      allow read: if request.auth != null && (
        // Buyer can read their own negotiation
        request.auth.token.email == resource.data.buyerId || isAdmin());

      // Create or update by buyer: only pending status and immutable identity fields
      allow create, update: if request.auth != null
        && request.auth.token.email == request.resource.data.buyerId
        && request.resource.data.productId is string
        && request.resource.data.originalPrice is number
        && request.resource.data.proposedPrice is number
        && request.resource.data.proposedPrice > 0
        && request.resource.data.proposedPrice < request.resource.data.originalPrice
        && request.resource.data.status == 'pending'
        && !(request.resource.data.keys().hasAny(['approvedPrice','approvedAt','approvedBy','rejectedAt']))
        ;

      // Approve/reject by admin only
      allow update: if isAdmin()
        && request.resource.data.status in ['approved','rejected']
        && (request.resource.data.status != 'approved' || request.resource.data.approvedPrice is number)
        ;
    }
  }
}
```

Note: Adjust the admin email whitelist to match your project. Deploy rules through Firebase Console or CLI.

### Indexes

For the Admin tab, if you add filters by status/buyer, you may need composite indexes in Firestore. The current implementation uses a collection snapshot without filters, so no new indexes are required by default.

### Testing the flow

1. Login as a buyer, open a product details page, click "Negotiate Price", and submit a valid offer below the list price.
2. Login as an admin, open Admin Dashboard → Negotiations, and approve the pending request.
3. Refresh the product page as the buyer. You should see the approved price applied. Add to cart and proceed to checkout; the negotiated price is used for totals.

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
