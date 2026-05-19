- [ ] Inspect current server/index.js for port conflict and startup flow
- [ ] Implement port-in-use detection + automatic fallback (5000 -> 5001)
- [ ] Add proper server.listen() error handling (EADDRINUSE etc.)
- [ ] Prevent duplicate server instances on nodemon restart (global guard)
- [ ] Preserve env.js, Razorpay init, and MongoDB connection behavior
- [ ] Add clean startup logs
- [ ] Prevent app crash from uncaught exceptions/unhandled rejections
- [ ] Replace server/index.js with production-safe final startup code

- [ ] Run server locally to verify logs and behavior

