# Known bugs (server)

Found while writing the behavior tests in `server/tests/`. Nothing here is fixed. The tests assert the **current** behavior, so fixing one of these bugs will make its test fail. Update that test in the same change.

| # | Bug | Where | Test |
|---|-----|-------|------|
| 1 | **Status updates skip enum validation.** `updateOne` doesn't run validators by default, so `PATCH /project/:id {status:"DONE"}` saves `"DONE"`, and `PATCH /admin/user/verify/:id {status:5}` saves `5` (`Number("x")` would save `NaN`). Both return 200. | `project.controller.js` `changeProjectStatus`, `admin/user.controller.js` `verifyUser` | `project.test.js` "saves an invalid status value", `admin.test.js` "saves a status outside 0/1/2" |
| 3 | **Completing a profile without email always fails as "duplicate email".** `email` is optional in `completeProfileSchema`, but `UserModel.findOne({ email: undefined })` matches any user, including the caller. | `userAuth.controller.js` `completeProfile` | `auth.test.js` "rejects a profile without email as a duplicate" |
| 9 | **Project creation without `budget` returns 500.** Joi treats it as optional, but the model requires it, so a Mongoose ValidationError becomes a 500 instead of a 400. | `project.schema.js` vs `models/project.js` | `project.test.js` "returns 500 without budget" |
| 10 | **`/project/list?search=` returns 500.** `$text` is used, but `Project` has no text index. | `project.controller.js` `getListOfProjects` | `project.test.js` "/list?search fails with 500" |
| 11 | **`updateProject` references an undefined `createError`.** The module imports `createHttpError`. This is latent: the branch never runs (see the correction below), but it would throw a ReferenceError if it did. | `project.controller.js` `updateProject` | none (unreachable) |
| 13 | **`Proposal.price` is required in the model but optional in Joi.** Same pattern as #9. | `proposal.schema.js` vs `models/proposal.js` | none |

## Correction to `current-state.md`

§6 says `updateProject`, `changeProjectStatus` and `verifyUser` return 500 when re-saving unchanged data. **They don't.** All three models use `timestamps: true`, so every `updateOne` also sets `updatedAt`, and `modifiedCount` is never 0. Re-saving the same data returns 200. This is covered by the "succeeds when ..." tests in `project.test.js` and `admin.test.js`.

## Notes on the test setup

- No SMS is sent: outside production `sendOTP` `console.log`s the code and returns it in the response. The tests read the OTP from the database.
- `Application` calls `listen()` in its constructor and keeps the express app private. `tests/helpers.js` stubs `express.application.listen` to capture the app without opening a port, so no source change was needed.
