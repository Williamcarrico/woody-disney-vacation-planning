<!-- Generated by SpecStory -->

# Fixing TypeScript Unexpected Any Error (2025-05-26 14:42:06)

_**User**_

For the code present, we get this error:
```
Unexpected any. Specify a different type.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

Looking at your code, the issue is with the `createdAt?: any;` field in the `ContactFormData` interface. The linter is correctly flagging this as problematic because `any` disables TypeScript's type checking.

Since you're using Firebase's `serverTimestamp()`, the correct type should be `Timestamp` from Firebase. Here's the fix:

---



---

The fix:
1. **Import `Timestamp`** from `firebase/firestore`
2. **Replace `any` with `Timestamp`** for the `createdAt` field

This provides proper type safety while maintaining compatibility with Firebase's `serverTimestamp()` function, which returns a `Timestamp` object when the document is written to Firestore.

---

