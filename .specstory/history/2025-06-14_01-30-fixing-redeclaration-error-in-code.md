<!-- Generated by SpecStory -->

# Fixing redeclaration error in code (2025-06-13 20:30:41)

_**User**_

For the code present, we get this error:
```
Cannot redeclare block-scoped variable 'InteractiveMapPreview'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_



---

The issue is that you have two declarations of `InteractiveMapPreview`:

1. Line 25: A lazy import of an external component
2. Line 413: A local component definition

**Fix:** Rename the local component to avoid the conflict:

---



---



---



---



---

The error is now resolved. I renamed the local component from `InteractiveMapPreview` to `InteractiveMapSection` to avoid conflicting with the lazy import of the external component. The lazy import continues to be used inside the Suspense, while the renamed section component is used in the main page structure.

---

