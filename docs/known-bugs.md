# Known bugs (server)

Found while writing the behavior tests in `server/tests/`. Nothing here is fixed. The tests assert the **current** behavior, so fixing one of these bugs will make its test fail. Update that test in the same change.

No open bugs: every row has been fixed and its test flipped.

## Correction to `current-state.md`

§6 says `updateProject`, `changeProjectStatus` and `verifyUser` return 500 when re-saving unchanged data. **They don't.** All three models use `timestamps: true`, so every `updateOne` also sets `updatedAt`, and `modifiedCount` is never 0. Re-saving the same data returns 200. This is covered by the "succeeds when ..." tests in `project.test.ts` and `admin.test.ts`.

## Notes on the test setup

- No SMS is sent: outside production `sendOTP` `console.log`s the code and returns it in the response. The tests read the OTP from the database.
- `Application.start()` connects to Mongo, then calls `listen()`; the express app stays private. `tests/helpers.ts` stubs `express.application.listen` to capture the app without opening a port.
