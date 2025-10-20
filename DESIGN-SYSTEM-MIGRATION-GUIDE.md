# Design System Migration Guide: Matching BattenSpaceFrontEnd

This comprehensive guide documents every step taken to migrate the BattenSpace (RoomTool) project to match the design system and appearance of BattenSpaceFrontEnd. Use this as a reference for migrating other projects to the same design system.

---

## Overview

**Goal**: Transform existing project to match BattenSpaceFrontEnd's visual design, typography, layout, and background styling.

**Reference Projects**:
- **BattenSpaceFrontEnd**: `C:\Users\bh4hb\OneDrive - University of Virginia\Desktop\AI_Working\BattenSpaceFrontEnd`
- **APPExplorer**: `C:\Users\bh4hb\OneDrive - University of Virginia\Desktop\AI_Working\APPExplorerGit\APPExplorer`

**Key Design Elements**:
- Typography: Libre Baskerville (serif) + Inter (sans-serif)
- Background: Garrett Hall sunset image with grayscale filter and white overlay
- Colors: UVA Navy (#232D4B) and UVA Orange (#E57200)
- Layout: Wide (1840px), full-bleed, no card containers
- Header: Solid navy bar with user authentication display

---

## Step 1: Typography System

### 1.1 Identify Target Fonts

**Examine BattenSpaceFrontEnd**:
```bash
# Check layout.tsx for font imports
cat src/app/layout.tsx
```

**Findings**:
- **Serif font**: Libre Baskerville (weights: 400, 700)
- **Sans-serif font**: Inter (variable weights)
- **Body text**: Libre Baskerville (serif)
- **UI elements/buttons**: Inter (sans-serif)

### 1.2 Add Google Fonts

**Method 1: Using `<link>` tags (RECOMMENDED)**
```html
<head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap" rel="stylesheet">
</head>
```

**Method 2: Using `@import` (NOT RECOMMENDED for production)**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap');
```

**⚠️ IMPORTANT**: Always use `<link>` tags for production. `@import` can cause:
- Flash of Unstyled Text (FOUT)
- Inconsistent loading on CDN deployments (like Azure)
- Slower page load times

### 1.3 Apply Typography

**Body and headings**:
```css
body {
    font-family: 'Libre Baskerville', Georgia, serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
    font-family: 'Libre Baskerville', Georgia, serif;
}
```

**UI elements and buttons**:
```css
button, .button, .btn {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

input, select, textarea {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

label, .label {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
```

**Font smoothing** (critical for clean rendering):
```css
* {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
```

---

## Step 2: Background Image System

### 2.1 Copy Background Asset

**Source**: `APPExplorer/public/garrett-hall-sunset.jpg`
**Destination**: `YourProject/garrett-hall-sunset.jpg` (root of public directory)

```bash
cp /path/to/APPExplorer/public/garrett-hall-sunset.jpg /path/to/YourProject/
```

### 2.2 Implement Two-Layer Background

**CRITICAL**: Use this exact HTML structure inside your main container:

```html
<div class="container">
    <!-- Background Image -->
    <div class="background-image"></div>

    <!-- Background Overlay -->
    <div class="background-overlay"></div>

    <!-- Your content here -->
    <header>...</header>
    <main>...</main>
</div>
```

**CSS for background layers**:
```css
.container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
}

/* Background Image Layer */
.background-image {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('/garrett-hall-sunset.jpg');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    background-repeat: no-repeat;
    filter: grayscale(100%);
    z-index: -10;
}

/* Background Overlay Layer */
.background-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.85);
    z-index: -10;
}
```

**⚠️ IMPORTANT NOTES**:
- Use **absolute paths** (`/garrett-hall-sunset.jpg`) not relative paths (`./garrett-hall-sunset.jpg`)
- Use `position: fixed` not `position: absolute` for parallax effect
- Use `z-index: -10` (not -1 or -2) to ensure content stays above
- Must have TWO separate divs (one for image, one for overlay)
- Don't use CSS pseudo-elements (::before, ::after) - use actual HTML divs

### 2.3 Test Background Loading

**Local testing**:
```bash
# MUST use HTTP server, not file:// protocol
python serve.py
# or
python -m http.server 8000
```

Open browser console and verify:
```javascript
// Should NOT see this error:
// "garrett-hall-sunset.jpg:1 Failed to load resource: net::ERR_FILE_NOT_FOUND"
```

---

## Step 3: Color System

### 3.1 Define CSS Variables

```css
:root {
    /* UVA Brand Colors */
    --uva-navy: #232d4b;
    --uva-orange: #e57200;
    --uva-blue: #4f8cc9;

    /* Primary/Secondary (for compatibility) */
    --primary: #e57200;        /* UVA Orange */
    --primary-light: #ff8c42;
    --primary-dark: #b85c00;
    --secondary: #232d4b;      /* UVA Navy */

    /* Neutral Palette */
    --white: #ffffff;
    --gray-50: #f8fafc;
    --gray-100: #f1f5f9;
    --gray-200: #e2e8f0;
    --gray-300: #cbd5e1;
    --gray-400: #94a3b8;
    --gray-500: #64748b;
    --gray-600: #475569;
    --gray-700: #334155;
    --gray-800: #1e293b;
    --gray-900: #0f172a;

    /* Semantic Colors */
    --success: #22c55e;
    --success-light: #dcfce7;
    --warning: #f59e0b;
    --warning-light: #fef3c7;
    --error: #ef4444;
    --error-light: #fee2e2;
    --info: #3b82f6;
    --info-light: #dbeafe;

    /* Shadows */
    --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

    /* Border Radius */
    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
    --radius-2xl: 1.5rem;

    /* Transitions */
    --transition-fast: 150ms ease;
    --transition-normal: 200ms ease;
    --transition-slow: 300ms ease;
}
```

### 3.2 Apply Colors Throughout

**Headers and titles**:
```css
h1, h2, h3, h4, h5, h6 {
    color: var(--uva-navy);
}
```

**Body text**:
```css
body {
    color: var(--gray-900);
}
```

**Accents and highlights**:
```css
.accent, .highlight {
    color: var(--uva-orange);
}

.border-accent {
    border-color: var(--uva-orange);
}
```

---

## Step 4: Layout Transformation

### 4.1 Remove Card-Based Layout

**Before** (card-based):
```css
.container {
    max-width: 1400px;
    margin: 2rem auto;
    padding: 2rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

**After** (full-bleed):
```css
.container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    /* NO background, border-radius, or box-shadow */
}
```

### 4.2 Increase Content Width

**Before**: 1400px max-width
**After**: 1840px max-width

```css
main {
    flex: 1;
    max-width: 1840px;
    width: 100%;
    margin: 0 auto;
    padding: 0 2rem 3rem 2rem;
}
```

**Rationale**: Wider layout allows more content cards per row (critical for grid displays)

### 4.3 Update Grid Layouts

**Before**:
```css
.rooms-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}
```

**After**: Keep the same, but the wider container (1840px) naturally fits more columns

---

## Step 5: Header Implementation

### 5.1 Header Structure

**HTML**:
```html
<header>
    <div>
        <div class="header-left">
            <h1>The Batten Space</h1>
            <p class="header-subtitle">Frank Batten School Digital Tools</p>
        </div>
        <div class="header-right">
            <div class="user-info" id="headerUserInfo">
                <span class="user-name">Loading...</span>
                <span class="user-role"></span>
            </div>
            <button class="sign-out-btn" onclick="window.location.href='/.auth/logout'">Sign Out</button>
        </div>
    </div>
</header>
```

### 5.2 Header Styling

```css
header {
    background: #232D4B;
    color: white;
    padding: 1rem 2rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

header > div {
    max-width: 80rem;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-left {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
}

.header-left h1 {
    font-family: 'Libre Baskerville', Georgia, serif;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: white;
    letter-spacing: normal;
}

.header-subtitle {
    font-family: 'Libre Baskerville', Georgia, serif;
    font-size: 0.875rem;
    font-weight: 400;
    margin: 0;
    color: #d1d5db;
    letter-spacing: normal;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.125rem;
    text-align: right;
}

.user-name {
    font-family: 'Libre Baskerville', Georgia, serif;
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
}

.user-role {
    font-family: 'Libre Baskerville', Georgia, serif;
    font-size: 0.75rem;
    font-weight: 400;
    color: #d1d5db;
}

.sign-out-btn {
    font-family: 'Inter', sans-serif;
    background: #E57200;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 150ms;
}

.sign-out-btn:hover {
    background: #F28C28;
}
```

**⚠️ KEY POINTS**:
- Header title uses **Libre Baskerville** (serif), not Inter
- User info uses **Libre Baskerville** (serif), not Inter
- ONLY the Sign Out button uses **Inter** (sans-serif)
- All header text must have explicit font-smoothing
- Use exact color values: navy #232D4B, orange #E57200

### 5.3 Dynamic User Info (Azure Authentication)

See complete implementation in [ENTRA-ID-SETUP-GUIDE.md](ENTRA-ID-SETUP-GUIDE.md#how-to-display-dynamic-user-info-in-header)

**Quick reference**:
```javascript
async function loadHeaderUserInfo() {
    try {
        const response = await fetch('/.auth/me');
        const payload = await response.json();
        const userInfo = payload.clientPrincipal;

        if (userInfo) {
            let displayName = userInfo.userDetails;

            // Extract from claims
            const claims = userInfo.claims;
            if (claims) {
                const givenName = claims.find(c => c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname')?.val;
                const surname = claims.find(c => c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname')?.val;

                if (givenName && surname) {
                    displayName = `${givenName} ${surname}`;
                }
            }

            // Format email-based usernames
            if (displayName.includes('@')) {
                const namePart = displayName.split('@')[0];
                displayName = namePart.split('.').map(part =>
                    part.charAt(0).toUpperCase() + part.slice(1)
                ).join(' ');
            }

            // Get roles
            const roles = userInfo.userRoles.filter(role => role !== 'anonymous' && role !== 'authenticated');
            const roleDisplay = roles.join(', ') || 'Staff';

            // Update DOM
            const userInfoDiv = document.getElementById('headerUserInfo');
            if (userInfoDiv) {
                userInfoDiv.innerHTML = `
                    <span class="user-name">${displayName}</span>
                    <span class="user-role">${roleDisplay}</span>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadHeaderUserInfo);
```

---

## Step 6: Page Title Section

### 6.1 Page Title Structure

**HTML**:
```html
<main>
    <div class="page-title-section">
        <h2 class="page-title">Room Reservations</h2>
        <p class="page-description">View real-time room availability and reservations for all Batten School facilities. Track room usage, identify booking patterns, and find available spaces efficiently.</p>
    </div>

    <!-- Rest of content -->
</main>
```

### 6.2 Page Title Styling

```css
/* Page Title Section */
.page-title-section {
    padding: 3rem 0 2rem 0;
}

.page-title {
    font-family: 'Libre Baskerville', Georgia, serif;
    font-size: 2.5rem;
    font-weight: 400;
    color: #232D4B;
    margin: 0 0 1rem 0;
    letter-spacing: -0.02em;
    padding-bottom: 0.75rem;
    border-bottom: 4px solid #E57200;
    display: inline-block;
}

.page-description {
    font-family: 'Libre Baskerville', Georgia, serif;
    font-size: 1.125rem;
    line-height: 1.75;
    color: #232D4B;
    margin: 0;
    max-width: 60rem;
}
```

**Key features**:
- Orange underline (4px solid)
- Navy text color
- Generous padding
- Descriptive paragraph under title

---

## Step 7: Component Styling

### 7.1 Buttons

```css
.btn, button {
    font-family: 'Inter', sans-serif;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 150ms ease;
    border: none;
}

.btn-primary {
    background: var(--uva-orange);
    color: white;
}

.btn-primary:hover {
    background: #F28C28;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

.btn-secondary {
    background: var(--uva-navy);
    color: white;
}

.btn-secondary:hover {
    background: #2A3C5F;
}
```

### 7.2 Cards

```css
.card {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-200);
    transition: all 200ms ease;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}
```

### 7.3 Form Inputs

```css
input, select, textarea {
    font-family: 'Inter', sans-serif;
    padding: 0.75rem 1rem;
    border: 1px solid var(--gray-200);
    border-radius: 0.5rem;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    background-color: white;
}

input:focus, select:focus, textarea:focus {
    outline: 2px solid var(--uva-orange);
    outline-offset: 0;
    border-color: var(--uva-orange);
    box-shadow: 0 0 0 3px rgba(229, 114, 0, 0.1);
}
```

---

## Step 8: Testing and Deployment

### 8.1 Local Testing Checklist

- [ ] Fonts load correctly (check Network tab)
- [ ] Background image displays with grayscale + overlay
- [ ] Header shows user info dynamically
- [ ] All text uses correct fonts (serif for content, sans for UI)
- [ ] Layout is 1840px wide
- [ ] Colors match UVA brand (Navy #232D4B, Orange #E57200)
- [ ] Buttons have hover effects
- [ ] Cards have shadows and hover states
- [ ] Sign Out button works

### 8.2 Azure Deployment Issues

**Common Issue #1: Fonts not loading**
- ✅ Use `<link>` tags, not `@import`
- ✅ Add preconnect for fonts.googleapis.com
- ✅ Combine fonts in single URL when possible

**Common Issue #2: Background not showing**
- ✅ Use absolute paths (`/image.jpg`) not relative (`./image.jpg`)
- ✅ Test via HTTP server (`python serve.py`), not file:// protocol
- ✅ Use actual HTML divs for layers, not CSS pseudo-elements

**Common Issue #3: Fonts render differently on live vs localhost**
- ✅ Add explicit `-webkit-font-smoothing: antialiased` to header
- ✅ Use `<link>` tags instead of `@import`
- ✅ Clear browser cache with hard refresh (Ctrl+Shift+R)

### 8.3 Git Deployment

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "Apply BattenSpace design system"

# Push to trigger Azure deployment
git push origin main
```

**Azure Static Web Apps** will auto-deploy in 2-3 minutes via GitHub Actions.

---

## Step 9: Verification

### 9.1 Visual Comparison Checklist

Compare your site with BattenSpaceFrontEnd:

- [ ] **Typography**:
  - Body text: Libre Baskerville
  - Headers: Libre Baskerville
  - Buttons/UI: Inter
- [ ] **Background**:
  - Garrett Hall image visible
  - Grayscale filter applied
  - White overlay (85% opacity)
- [ ] **Header**:
  - Solid navy bar
  - "The Batten Space" title in serif
  - User info shows actual logged-in user
  - Orange Sign Out button
- [ ] **Layout**:
  - 1840px max width
  - No card container around entire page
  - Full-bleed background
- [ ] **Colors**:
  - Navy: #232D4B
  - Orange: #E57200
  - Consistent throughout
- [ ] **Page Title**:
  - Large serif title
  - Orange underline (4px)
  - Descriptive paragraph below

### 9.2 Browser Testing

Test in multiple browsers:
- Chrome
- Firefox
- Safari (Mac)
- Edge

Check:
- Font rendering consistency
- Background display
- Shadow effects
- Hover states
- Mobile responsiveness

---

## Troubleshooting Common Issues

### Issue: Fonts not loading on Azure

**Symptoms**: Fonts work on localhost but not on live site

**Solution**:
```html
<!-- Change from @import to <link> tags -->
<head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap" rel="stylesheet">
</head>
```

### Issue: Background not visible

**Symptoms**: Background works on localhost but not on Azure

**Solution**:
1. Use absolute paths: `/garrett-hall-sunset.jpg`
2. Use two separate HTML divs (not CSS pseudo-elements)
3. Use `z-index: -10` (not -1 or -2)

### Issue: Header text looks different on live site

**Symptoms**: Header fonts render differently between localhost and Azure

**Solution**:
```css
header {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.header-left h1,
.header-subtitle,
.user-name,
.user-role {
    font-family: 'Libre Baskerville', Georgia, serif;
}
```

### Issue: Layout too narrow

**Symptoms**: Not enough cards fit per row

**Solution**:
```css
main {
    max-width: 1840px; /* Not 1400px or less */
}
```

---

## Files Modified Checklist

When migrating a project, you'll typically modify:

- [ ] `index.html` (or main HTML file)
  - [ ] Add Google Fonts `<link>` tags
  - [ ] Add background HTML divs
  - [ ] Update header structure
  - [ ] Add page title section
  - [ ] Add user info loading JavaScript

- [ ] `styles.css` (or main stylesheet)
  - [ ] Update CSS variables
  - [ ] Add background layers
  - [ ] Update header styles
  - [ ] Update typography
  - [ ] Update component styles

- [ ] Assets
  - [ ] Copy `garrett-hall-sunset.jpg` to root

- [ ] Documentation
  - [ ] Update README with design system info
  - [ ] Document any custom modifications

---

## Quick Reference: Key Values

**Typography**:
- Body: `'Libre Baskerville', Georgia, serif`
- UI: `'Inter', system-ui, -apple-system, sans-serif`

**Colors**:
- Navy: `#232D4B`
- Orange: `#E57200`
- Orange Hover: `#F28C28`
- Gray subtitle: `#d1d5db`

**Layout**:
- Container: `min-height: 100vh; display: flex; flex-direction: column;`
- Main: `max-width: 1840px;`
- Header: `max-width: 80rem;`

**Background**:
- Image: `url('/garrett-hall-sunset.jpg')`
- Filter: `grayscale(100%)`
- Overlay: `rgba(255, 255, 255, 0.85)`
- Z-index: `-10`

**Font Loading**:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap" rel="stylesheet">
```

---

## Additional Resources

- **BattenSpaceFrontEnd**: Reference implementation (Next.js/TypeScript/Tailwind)
- **APPExplorer**: Background image source
- **ENTRA-ID-SETUP-GUIDE.md**: Authentication implementation details
- **Google Fonts**: https://fonts.google.com/

---

## Summary

Follow these steps in order:
1. Add Google Fonts via `<link>` tags
2. Copy and implement background image system
3. Update color system with CSS variables
4. Transform layout from card-based to full-bleed
5. Implement header with authentication
6. Add page title section
7. Update component styles
8. Test locally and deploy
9. Verify on live site

**Total time estimate**: 2-4 hours for a typical project migration

---

*Last updated: October 20, 2025*
