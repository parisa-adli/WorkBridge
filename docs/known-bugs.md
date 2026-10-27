# Known bugs (server)

Found while writing the behavior tests in `server/tests/`. Nothing here is fixed. The tests assert the **current** behavior, so fixing one of these bugs will make its test fail. Update that test in the same change.

| # | Bug | Where | Test |
|---|-----|-------|------|
| 11 | **`updateProject` references an undefined `createError`.** The module imports `createHttpError`. This is latent: the branch never runs (see the correction below), but it would throw a ReferenceError if it did. | `project.controller.js` `updateProject` | none (unreachable) |

## Correction to `current-state.md`

§6 says `updateProject`, `changeProjectStatus` and `verifyUser` return 500 when re-saving unchanged data. **They don't.** All three models use `timestamps: true`, so every `updateOne` also sets `updatedAt`, and `modifiedCount` is never 0. Re-saving the same data returns 200. This is covered by the "succeeds when ..." tests in `project.test.js` and `admin.test.js`.

## Notes on the test setup

- No SMS is sent: outside production `sendOTP` `console.log`s the code and returns it in the response. The tests read the OTP from the database.
- `Application` calls `listen()` in its constructor and keeps the express app private. `tests/helpers.js` stubs `express.application.listen` to capture the app without opening a port, so no source change was needed.
