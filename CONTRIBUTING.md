# Contributing to TaxFree

Thank you for your interest in contributing to TaxFree! This document provides guidelines and instructions for contributing to the project.

---

## 📋 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Report security issues privately

---

## 🐛 Reporting Issues

### Before Submitting

- Check [existing issues](https://github.com/MDaniel592/TaxFree/issues) to avoid duplicates
- Collect relevant information:
  - Browser and version
  - Operating system
  - Extension version
  - Steps to reproduce
  - Expected vs actual behavior

### Issue Template

```markdown
## Description
Brief description of the issue

## Browser Environment
- Browser: [Chrome/Firefox/Edge]
- Version: [version number]
- OS: [Windows/Mac/Linux]

## Steps to Reproduce
1. Go to amazon.XX...
2. Click...
3. Observe...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
If applicable, add screenshots

## Logs
Check browser console for error messages
```

---

## 💡 Suggesting Enhancements

Before starting work on a major feature:

1. **Open a discussion issue** to describe your idea
2. **Get feedback** from maintainers and community
3. **Discuss implementation** approach
4. **Wait for approval** before coding

Feature suggestions should include:
- Clear description of the feature
- Use cases and benefits
- Potential implementation approach
- Any concerns or drawbacks

---

## 🔧 Development Setup

### Prerequisites
- Git
- A browser (Chrome or Firefox)
- Basic knowledge of JavaScript and Chrome Extensions

### Installation

1. Clone the repository:
```bash
git clone https://github.com/MDaniel592/TaxFree.git
cd TaxFree
```

2. Load the extension in your browser:

**Chrome:**
- Go to `chrome://extensions`
- Enable "Developer mode" (top right)
- Click "Load unpacked"
- Select the `MV3` folder

**Firefox:**
- Go to `about:debugging`
- Click "This Firefox"
- Click "Load Temporary Add-on"
- Select `MV3/manifest.json`

### Project Structure

```
MV3/
├── manifest.json              # Extension metadata
├── background/
│   └── background.js         # Service worker
├── content_scripts/
│   ├── taxfree.js           # Product price handler
│   └── search.js            # Search results handler
├── core_js/
│   ├── popup.js             # Settings popup controller
│   ├── storage.js           # Storage manager
│   └── write_version.js     # Version utilities
├── css/
│   ├── core.css             # Main styles
│   ├── products.css         # Product display styles
│   └── switchButtons.css    # Toggle switch styles
├── html/
│   └── popup.html           # Settings UI
└── _locales/
    ├── en/
    └── es/                  # Localization files
```

### Testing Your Changes

1. **Reload the extension:**
   - Chrome: Press Ctrl+Shift+P, search "Reload extension"
   - Firefox: Click reload icon on the add-on

2. **Check console for errors:**
   - Chrome: Right-click page → Inspect → Console tab
   - Firefox: Right-click page → Inspect → Console tab

3. **Test on different Amazon sites:**
   - amazon.es (Spanish)
   - amazon.fr (French)
   - amazon.de (German)
   - amazon.it (Italian)
   - amazon.co.uk (British)

4. **Test with different settings:**
   - Toggle each feature on/off
   - Change tax percentage values
   - Test on product pages and search results

---

## 📝 Code Style Guide

### General Principles

- **Readability first** - Code is read more often than written
- **Explicit over implicit** - Clear intent is important
- **DRY** - Don't Repeat Yourself
- **KISS** - Keep It Simple, Stupid

### JavaScript Standards

```javascript
// Use const by default, let for variables that change
const immutableValue = 42;
let mutableValue = 0;

// Use template literals for string concatenation
const message = `Hello, ${name}!`;

// Use arrow functions when appropriate
const doubled = numbers.map(n => n * 2);

// Use async/await over Promise chains when possible
async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}
```

### Error Handling

Always wrap risky operations in try-catch:

```javascript
function safeOperation() {
  try {
    // Potentially risky code
    const result = riskyFunction();
    return result;
  } catch (error) {
    console.error("[TaxFree Component] Error description:", error);
    return null; // or a sensible default
  }
}
```

### Logging

Use consistent logging format with component prefix:

```javascript
// Standard log
console.log("[TaxFree Component] Operation succeeded");

// Warning
console.warn("[TaxFree Component] Something unexpected happened");

// Error
console.error("[TaxFree Component ERROR] Something failed:", error);
```

### Documentation

Add JSDoc comments to all functions:

```javascript
/**
 * Brief description of what the function does
 * @param {type} paramName - Description of parameter
 * @param {type} secondParam - Description
 * @returns {type} Description of return value
 */
function myFunction(paramName, secondParam) {
  // Implementation
}
```

### Naming Conventions

```javascript
// Constants - UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;

// Variables and functions - camelCase
let currentUser;
function getUserData() {}

// Classes - PascalCase
class UserManager {}

// Private functions - Prefix with underscore
function _privateHelper() {}
```

---

## 🚀 Making Changes

### 1. Create a Branch

```bash
git checkout -b feature/description-of-change
# or
git checkout -b fix/description-of-bug
```

Use clear, descriptive branch names.

### 2. Make Your Changes

- Focus on one feature or fix per branch
- Keep commits atomic and logical
- Write clear commit messages

### 3. Test Thoroughly

- Test in both Chrome and Firefox
- Test on multiple Amazon sites
- Test with different settings combinations
- Check browser console for errors

### 4. Add Comments

- Explain WHY, not WHAT
- Highlight any edge cases
- Document any workarounds for Amazon-specific issues

### 5. Update Documentation

- Update README.md if adding/changing features
- Update comments if changing logic
- Add JSDoc if adding functions

### 6. Commit and Push

```bash
git add .
git commit -m "feat: Add feature description"
git push origin feature/description-of-change
```

### Commit Message Format

```
[type]: [description]

[optional body for detailed explanation]

[optional footer: Fixes #123]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

---

## 📤 Submitting a Pull Request

1. **Push your branch** to your fork
2. **Create a Pull Request** with a clear title and description
3. **Link related issues** (Fixes #123)
4. **Wait for review** - maintainers will provide feedback
5. **Address feedback** with additional commits
6. **Celebrate!** when your PR is merged

### PR Checklist

- [ ] Code follows style guide
- [ ] All functions have JSDoc comments
- [ ] Changes are tested in Chrome and Firefox
- [ ] No console errors or warnings
- [ ] README updated if needed
- [ ] Commit messages are clear
- [ ] Related issues are linked

---

## 🧪 Testing Checklist

Before submitting:

### Product Pages
- [ ] Price displays correctly on product pages
- [ ] Custom tax calculation works
- [ ] Works on all 5 supported Amazon sites
- [ ] Non-deliverable products don't show prices
- [ ] Works with multiple currency formats

### Search Results
- [ ] URL shortening works
- [ ] Shipping detection marks non-deliverable items
- [ ] Alternative seller info displays
- [ ] Works with infinite scroll
- [ ] Loading indicator shows/hides properly

### Settings
- [ ] Toggle switches work correctly
- [ ] Tax percentage input validates (0-100)
- [ ] Settings persist after browser close
- [ ] Page reloads when settings change
- [ ] Localization works (en, es)

### Error Handling
- [ ] No JavaScript errors in console
- [ ] Extension handles missing DOM elements gracefully
- [ ] Extension handles network errors gracefully
- [ ] Extension handles malformed prices gracefully

---

## 📚 Documentation

### When to Update Docs

- Adding a new feature
- Changing how a feature works
- Adding support for a new Amazon site
- Fixing a significant bug

### Files to Update

- **README.md** - User-facing features and setup
- **Code comments** - Implementation details
- **JSDoc** - Function signatures and behavior
- **CONTRIBUTING.md** - Development guidelines (this file)

---

## 🎯 Areas for Contribution

### High Priority
- [ ] Add support for more Amazon sites
- [ ] Improve error handling and logging
- [ ] Add unit tests
- [ ] Performance optimizations

### Medium Priority
- [ ] Enhance UI/UX of settings popup
- [ ] Add more localization languages
- [ ] Improve mobile support
- [ ] Add feature analytics

### Low Priority
- [ ] Code style improvements
- [ ] Documentation enhancements
- [ ] Refactoring for clarity

---

## 🔐 Security

If you discover a security vulnerability:

1. **Do NOT open a public issue**
2. **Email security details to** the maintainer (see GitHub profile)
3. **Include:** Version, how to reproduce, potential impact
4. **Allow time** for fix before disclosure

---

## ❓ Questions?

- Check the README.md
- Search existing issues
- Open a discussion issue
- Contact the maintainer

---

## 📄 License

By contributing to TaxFree, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to TaxFree! 🎉**