<!-- Generated by SpecStory -->

# Fixing type error in SparklesText component (2025-06-11 13:08:50)

_**User**_

For the code present, we get this error:
```
Type '{ text: string; className: string; }' is not assignable to type 'IntrinsicAttributes & SparklesTextProps'.
  Property 'text' does not exist on type 'IntrinsicAttributes & SparklesTextProps'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

I need to check the SparklesText component to understand its correct props structure.

---

<details>
            <summary>Searched codebase "SparklesText component props interface" • **25** results</summary>
        
| File | Lines |
|------|-------|
| `src/components/magicui/sparkles-text.tsx` | L40-85 |
| `src/components/magicui/sparkles-text.tsx` | L85-150 |
| `src/components/magicui/sparkles-text.tsx` | L1-16 |
| `src/components/magicui/sparkles-text.tsx` | L16-40 |
| `src/app/annual-passes/page.tsx` | L149-185 |
| `src/app/annual-passes/page.tsx` | L292-325 |
| `src/components/magicui/shine-border.tsx` | L1-23 |
| `src/components/theme-provider/theme-utils.ts` | L337-392 |
| `src/components/theme-provider/theme-showcase.tsx` | L27-73 |
| `docs/components/3d-interactive-castle.md` | L121-209 |
| `src/components/magicui/shine-border.tsx` | L23-52 |
| `src/components/theme-provider/README.md` | L229-323 |
| `src/app/annual-passes/page.tsx` | L349-369 |
| `src/components/dashboard/DashboardHeader.tsx` | L112-128 |
| `src/components/ui/particles.tsx` | L36-48 |
| `src/app/dashboard/parks/hollywood-studios/page.tsx` | L938-953 |
| `src/components/magicui/morphing-text.tsx` | L92-97 |
| `src/components/magicui/particles.tsx` | L36-48 |
| `src/components/shared/Navbar.tsx` | L428-467 |
| `src/app/dashboard/settings/components/settings-header.tsx` | L1-15 |
| `src/app/dashboard/parks/history/page.tsx` | L255-283 |
| `src/components/magicui/marquee.tsx` | L1-33 |
| `src/components/magicui/shimmer-button.tsx` | L49-80 |
| `src/app/page.tsx` | L196-246 |
| `src/components/magicui/neon-gradient-card.tsx` | L17-68 |

</details>

---

Based on the search results, I can see that the `SparklesText` component expects `children` as a prop, not `text`. The component uses `children` to display the content.

Here's the fix:

---



---

The fix is simple: `SparklesText` uses `children` prop instead of `text` prop. The content should be passed as children between the opening and closing tags, not as a `text` prop.

---

