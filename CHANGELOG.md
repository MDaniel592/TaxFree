# Changelog

All notable changes to TaxFree are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.4.0.5] - 2025-12-02

### Added
- Comprehensive error handling throughout codebase
- Enhanced logging with consistent formatting
- JSDoc documentation for all functions
- CONTRIBUTING.md guide for developers
- CHANGELOG.md to track version history
- Defensive checks in product price parsing
- Input validation for tax percentage (0-100%)
- Proper null/undefined checks before DOM operations
- Timeout handling for fetch operations in search results

### Changed
- **Complete code refactoring for maintainability:**
  - Reorganized popup.js with clear section divisions
  - Refactored taxfree.js with separate functions for parsing, calculation, insertion
  - Improved search.js with better error handling and factory patterns
  - Enhanced storage.js with detailed documentation
  - Simplified background.js with clearer purpose

- **Improved README.md:**
  - Added feature overview with use cases
  - Added installation instructions (manual and web store)
  - Added supported regions table
  - Added architecture diagrams
  - Added troubleshooting section
  - Added privacy & permissions details
  - Added browser compatibility chart

- **Better currency handling:**
  - Separate handling for pound (£) vs euro (€) placement
  - Improved German language detection (DE_EN variant)
  - Better handling of different decimal separators

### Fixed
- Duplicate "DE" country key in tax rates (now DE and DE_EN)
- Missing error handling in popup event listeners
- Unsafe DOM access in search results handler
- Incomplete validation of tax percentage input
- Race condition in storage initialization
- Improper cleanup of loading indicators
- Missing null checks in ProductItem factory
- Inconsistent error messages across components

### Improved
- Code organization and readability
- Error messages clarity and actionability
- Function documentation completeness
- Browser compatibility with better error fallbacks
- Performance of storage operations with proper debouncing
- Resilience of content scripts against DOM changes

### Deprecated
- Manifest Version 2 (MV2) - no longer maintained
  - Last supported version: 0.4.0.4
  - Users should migrate to MV3

---

## [0.4.0.4] - Previous Release

- Last version supporting Manifest Version 2 (MV2)
- Core functionality for VAT removal and price display
- SendHerePlz shipping detection feature
- ShortLinks URL shortening feature
- Multi-language support (English, Spanish)

---

## Structure Notes

- **MV3 folder:** Current version using Manifest Version 3 (recommended)
- **MV2 folder:** Legacy version using Manifest Version 2 (deprecated)

### Why MV2 is Deprecated

- Chrome 88+ requires MV3
- Firefox 109+ requires MV3
- MV2 had security and privacy limitations
- MV3 provides better extension governance

---

## Versioning

TaxFree uses semantic versioning: `MAJOR.MINOR.PATCH.BUILD`

- **MAJOR**: Breaking changes or complete rewrites
- **MINOR**: New features
- **PATCH**: Bug fixes
- **BUILD**: Build/release number

Example: `0.4.0.5`
- Major: 0 (pre-release)
- Minor: 4 (4 features)
- Patch: 0 (no fixes yet)
- Build: 5 (5th build)

---

## Release Process

1. Development on feature branches
2. Pull request review
3. Merge to main
4. Version bump in manifest.json
5. Testing across browsers
6. Release to web stores
7. Update changelog

---

## Future Plans

### Planned Features
- [ ] Support for more Amazon sites
- [ ] Custom price comparison tool
- [ ] Price history tracking
- [ ] Browser sync across devices
- [ ] Tax calculator tool
- [ ] User preferences import/export

### Under Discussion
- [ ] Mobile app version
- [ ] API for third-party integrations
- [ ] Advanced filtering options
- [ ] Wishlist integration

---

## Security Updates

Security patches are released as `PATCH` versions and applied immediately.

Report security issues privately to the maintainer.

---

## Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/MDaniel592/TaxFree/issues)
- Check the [README](./README.md)
- Read [CONTRIBUTING.md](./CONTRIBUTING.md)