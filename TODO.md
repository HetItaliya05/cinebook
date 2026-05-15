# TODO

## Fix: API login/registration failing due to broken phone unique index
- [ ] Update `server/models/User.js` user schema and indexes to make `phone` optional and use proper partial unique index with `sparse: true`.
- [ ] Add/verify code path ensures `phone` is not set to `null`/empty in a way that triggers duplicate index.
- [ ] Provide MongoDB commands to drop old broken `phone_1` index and create correct partial unique index.
- [ ] Verify registration works when phone is empty/null.
- [ ] Verify login works after registration (401 issue).
- [ ] Document production-ready deployment notes.

