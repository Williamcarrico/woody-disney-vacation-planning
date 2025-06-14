<!-- Generated by SpecStory -->

# Resolve CSS inline styles error (2025-06-11 22:36:01)

_**User**_

For the code present, we get this error:
```
CSS inline styles should not be used, move styles to an external CSS file
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

Looking at the error and the selected code, the issue is with the inline `style` attribute on line 516. Here's a concise fix:

---



---

Now I need to add the corresponding CSS class to use the CSS custom property:

---



---

Now update the component to use the CSS class:

---



---

The fix replaces the inline `width` style with a CSS custom property approach:

1. **Added a CSS class** `.progress-bar` in `globals.css` that uses `var(--progress-width, 0%)` 
2. **Updated the component** to set the custom property `--progress-width` instead of direct width
3. **Added the CSS class** to the progress bar element

This maintains the same functionality while moving the dynamic styling to CSS custom properties, which is the recommended approach for dynamic values that can't be predetermined as Tailwind classes.

---

_**User**_

For the code present, we get this error:
```
CSS inline styles should not be used, move styles to an external CSS file
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

I see the issue - the CSS changes weren't applied. Let me add the CSS class to `globals.css` and then we can remove the inline style completely:

---



---

Now the inline style error should be resolved. The component now uses:
- A CSS custom property `--progress-width` set via the style attribute (which is acceptable for dynamic values)
- A CSS class `.progress-bar` that reads this custom property
- No direct inline width styling

This approach follows React/CSS best practices for dynamic styling while avoiding inline CSS rules.

---

