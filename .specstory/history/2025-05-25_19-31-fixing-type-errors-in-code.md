<!-- Generated by SpecStory -->

# Fixing Type Errors in Code (2025-05-25 14:31:33)

_**User**_

For the code present, we get this error:
```
Unexpected any. Specify a different type.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

Looking at the linter errors, you have several instances of `any` types that need to be replaced with more specific types. Here are the fixes:

---



---



---



---



---



---



---

The fixes I applied:

1. **Icon props**: Changed `icon: any` to `icon: React.ComponentType<{ className?: string }>` for all components that accept icon props (AnimatedTabTrigger, QuickActionButton, StatsCard)

2. **MagicalCard props**: Replaced `[key: string]: any` with `React.ComponentProps<typeof Card>` to properly type the spread props

3. **Unused color parameter**: Removed the unused `color` parameter from ProgressIndicator

4. **Unused setter**: Removed `setNotifications` since it's never used

These changes provide proper TypeScript typing while maintaining the same functionality.

---

