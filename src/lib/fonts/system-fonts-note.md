# System Fonts Note

## Aubrey Font

I noticed you mentioned the **Aubrey** font with the following CSS:

```css
.aubrey-regular {
  font-family: "Aubrey", system-ui;
  font-weight: 400;
  font-style: normal;
}
```

### ⚠️ Important Note

**Aubrey** appears to be a **system font** or **local font** rather than a Google Font, as indicated by the `system-ui` fallback in the font-family declaration.

### 🔍 Font Classification

- **Type:** System/Local Font (not Google Fonts)
- **Fallback:** system-ui
- **Weight:** 400 (regular)
- **Category:** Appears to be sans-serif based on system-ui fallback

### 🚨 Integration Considerations

This font **cannot be integrated** into our Google Fonts configuration system because:

1. **Not available via Google Fonts API** - Our current system uses Next.js Google Fonts optimization
2. **System dependency** - Would require the font to be installed on user devices
3. **Licensing concerns** - System fonts may have different licensing requirements

### 🛠️ Alternative Solutions

If you want to use Aubrey-style typography, consider these options:

#### Option 1: Find a Similar Google Font
Look for Google Fonts with similar characteristics:
- Modern sans-serif fonts
- Clean, readable designs
- Contemporary styling

#### Option 2: Add as a Custom Font
If you have the font files and proper licensing:
1. Add font files to `/public/fonts/`
2. Create CSS `@font-face` declarations
3. Add utility classes manually
4. Ensure proper licensing compliance

#### Option 3: Use System Font Stack
If the goal is to use system fonts:
```css
.font-system {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

### 📝 Recommendation

For consistency with our Disney vacation planning app and to maintain the Google Fonts optimization benefits, I recommend:

1. **Stick with Google Fonts** for primary typography
2. **Find a similar Google Font** that matches Aubrey's characteristics
3. **Use system fonts only for UI elements** where appropriate

### 🔍 Finding Similar Fonts

Some Google Fonts that might provide similar modern, clean styling:
- **Inter** (already in use)
- **Open Sans**
- **Lato**
- **Source Sans Pro**
- **Nunito Sans**
- **DM Sans**

Would you like me to help you find a suitable Google Font alternative that matches the Aubrey style you're looking for? 