# CHANGELOG

All notable changes to Fraviont will be documented in this file.

Format: `[version] — YYYY-MM-DD`
Types: `Added`, `Changed`, `Fixed`, `Removed`, `Security`

---

## [0.1.0] — 2025-04-21

### Added
- GSAP + @gsap/react animation system (replaces framer-motion)
  - src/lib/gsap/config.ts — plugin registration
  - src/lib/gsap/easings.ts — EASE constants
  - 8 animation modules (hero, scrollReveal, productCard, navigation, textEffects, scentProfile, admin, pageTransition)
  - Page curtain (gold wipe between routes)
- Complete skeleton loading system
  - Dark shimmer style (#1a1a1a → #222222), rounded-none
  - 6 pre-built skeleton components (ProductCard, ProductGrid, ProductDetail, KPICard, Table, ChatMessage)
- KIRO_PROMPT.md — full step-by-step build guide with exact prompts for Kiro IDE
- .kiro/steering/fraviont.md — Kiro steering rules file (auto-loaded by Kiro)
- DEPLOYMENT.md — Vercel deployment guide with DNS, PayFast production setup, cron config
- DB_SEED.md — Database seed guide with full seed file (8 products, 20+ variants)
- PayFast payment integration (replaces Stripe)
  - Redirect-based flow with MD5 signature
  - ITN webhook handler at /api/payfast/itn

### Changed
- framer-motion removed from tech stack — GSAP is the only animation library
- All KIRO prompts updated: no framer-motion references anywhere
- TECH_STACK.md dependencies updated (gsap, @gsap/react instead of framer-motion)
- CONTEXT.md steering rules updated with GSAP and skeleton requirements
- Prices clarified as ZAR cents (South African Rand)

---

## [0.0.0] — Project Init

> Features planned but not yet started.

### Planned
- Loyalty/rewards program
- Product bundling / gift sets builder
- Multi-currency support
- Advanced A/B testing (hero variations)
- Push notifications (PWA)
- WhatsApp order notifications

---

## [0.0.0] — Project Init

### Added
- README.md — Project overview and quick start
- TECH_STACK.md — Full technology decisions
- AI_FEATURES.md — AI integration specifications
- DESIGN_SYSTEM.md — Luxury visual language
- ADMIN_PANEL.md — Admin dashboard specification
- STORE_FEATURES.md — Customer store specification
- IMPLEMENTATION_GUIDE.md — Step-by-step build guide
- CONTEXT.md — AI IDE steering context file
- CHANGELOG.md — This file

---

<!-- TEMPLATE FOR FUTURE ENTRIES:

## [0.1.0] — YYYY-MM-DD

### Added
- 

### Changed
- 

### Fixed
- 

### Removed
- 

-->
