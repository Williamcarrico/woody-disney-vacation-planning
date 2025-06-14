<!-- Generated by SpecStory -->

# Fixing CSS Background Property Error (2025-05-27 22:28:37)

_**User**_

For the code present, we get this error:
```
Unexpected shorthand "background" after "background-size"
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

The error occurs because you have both `background-size` and `background` properties in the same rule, and `background` is a shorthand that resets `background-size`. You need to move `background-size` after the `background` property.

---

```diff
  
  .warp-grid {
-   background-size: var(--warp-beam-size) var(--warp-beam-size);
    background: linear-gradient(
          var(--warp-grid-color) 0 1px,
```

```diff
        )
        50% 50% / var(--warp-beam-size) var(--warp-beam-size);
+   background-size: var(--warp-beam-size) var(--warp-beam-size);
  }
  
```

---

The fix moves `background-size` after the `background` shorthand property. This resolves the error because CSS shorthand properties reset all related properties, so specific properties like `background-size` must come after shorthand properties to avoid being overridden.

---

