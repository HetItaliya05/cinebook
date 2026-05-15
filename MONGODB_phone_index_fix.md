# MongoDB phone unique index fix (for CINEBOOK)

## What was happening
Your error:

`E11000 duplicate key error collection: test.users index: phone_1 dup key: { phone: null }`

means MongoDB has a **unique index on `phone`** (likely named `phone_1`).
When you insert multiple users with `phone: null` (or missing/empty mapped to null), MongoDB treats them as duplicates and rejects registration.

## Required behavior
- `phone` must be **optional**
- uniqueness should apply **only when phone has an actual value**
- registration must work when `phone` is `null`/empty

## 1) Update Mongoose schema
File: `server/models/User.js`
- `phone` is optional (`required: false`, default `null`)
- adds **unique + sparse + partial unique index** so uniqueness is enforced only when phone is a non-empty string.

## 2) Drop old broken MongoDB index
Run this in MongoDB shell (or mongosh):

```js
db.users.dropIndex("phone_1")
```

### Important
- If your collection is not `users`, change it accordingly.
- If the old index has a different name, list indexes first.

## 3) Create the correct partial unique index (shell)
After dropping the old one, create the production-safe index:

```js
db.users.createIndex(
  { phone: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { phone: { $type: 'string', $ne: '' } },
    name: 'phone_unique_partial'
  }
)
```

## 4) Restart backend
Restart your Express backend so Mongoose can pick up the updated schema/index.

## 5) Verify
- Register multiple users with `phone` omitted (or `null`)
- Registration should succeed (no duplicate null error)
- Adding a real phone number twice should fail with a uniqueness error

