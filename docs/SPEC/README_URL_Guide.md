# 🌍 Start Marketing – Global URL Structure Guide

> This document defines the global URL architecture for **Start Marketing**,  
> a modular performance marketing SaaS platform (UTM Checker, Media Mix Planner, CRM Dashboard).

---

## 🧭 1. Purpose

The goal is to create a **global and scalable URL system** that supports:
- Multi-language routing (`/ko/`, `/en/`, `/jp/`)
- SEO optimization
- Consistent RESTful API structure
- Clear separation between frontend modules and backend endpoints

---

## 🧱 2. Domain Structure

| Type | Example | Description |
|------|----------|-------------|
| **Global Root** | `https://startmktg.com` | Main marketing website |
| **Subdomain (Modules)** | `https://utm.startmktg.com` | SaaS module (UTM Checker) |
| **Admin Console** | `https://admin.startmktg.com` | Internal operations |
| **API Server** | `https://api.startmktg.com` | Backend REST API |
| **Optional Country Domain** | `https://startmktg.kr`, `https://startmktg.jp` | Local marketing sites if needed |

🟩 **Recommended:**  
Use one global domain (`startmktg.com`) and manage each module via subdomains.

---

## 🧩 3. Service Modules

| Module | Subdomain | Function |
|--------|------------|-----------|
| UTM Checker | `utm.startmktg.com` | Generate, validate, and analyze UTM links |
| Media Mix Planner | `mix.startmktg.com` | Budget allocation and performance tracking |
| CRM Insight Dashboard | `crm.startmktg.com` | Customer segmentation and insights |
| Landing Builder (Future) | `landing.startmktg.com` | Landing page generator |
| Admin Console | `admin.startmktg.com` | User management and monitoring |

---

## 🧭 4. URL Path Principles

1. Use **lowercase only**
2. Use **hyphens (-)**, not underscores
3. Keep it **RESTful and noun-based**
4. Keep paths **short and meaningful**
5. Multi-language routing uses **folder-based structure**

✅ Example:  
`/ko/utm-builder`  
`/en/media-mix-planner`

❌ Avoid:  
`/UTM_Builder`, `/utm-builder-tool-long-name`

---

## ⚙️ 5. Public Web URL Structure

| Section | Path Example | Purpose |
|----------|---------------|----------|
| Home | `/` | Global homepage |
| Product | `/products/utm-checker` | Product introduction |
| Pricing | `/pricing` | Subscription plans |
| Case Studies | `/case-studies` | Customer success stories |
| Docs / Help | `/help/docs` | Support center |
| Blog | `/blog/utm-builder-guide` | SEO content |
| Login / Signup | `/login`, `/signup` | User authentication |

---

## 🧩 6. API Structure (RESTful)

| Method | Endpoint | Description |
|---------|-----------|-------------|
| `POST` | `/api/v1/utms/generate` | Generate UTM parameters |
| `POST` | `/api/v1/utms/save` | Save user’s generated UTM |
| `GET` | `/api/v1/campaigns` | Retrieve campaign list |
| `POST` | `/api/v1/auth/login` | User authentication |
| `PATCH` | `/api/v1/config/locale` | Update language preference |

**Versioning Rule:** `/api/v1/` → `/api/v2/` for major updates

---

## 🌐 7. Multi-language Routing (i18n)

| Language | Example | Description |
|-----------|----------|-------------|
| Korean | `/ko/utm-builder` | Default for Korean users |
| English | `/en/utm-builder` | Global default |
| Japanese | `/jp/utm-builder` | Localized content |

Use Next.js `i18n` routing and `hreflang` tags for SEO.

---

## 🧠 8. SEO & Tracking Policy

| Category | Policy | Purpose |
|-----------|--------|----------|
| **Canonical URL** | Define per page | Avoid duplicate indexing |
| **hreflang** | Connect `/ko/`, `/en/`, `/jp/` pages | Multi-language SEO |
| **robots.txt / sitemap.xml** | Country-specific versions | Crawling control |
| **GA4 / GTM** | Event-based setup per locale | Tracking & conversion |
| **UTM parameters** | `?utm_source=...` | External traffic tracking |

---

## 🔧 9. Example Scenarios

### 🇰🇷 Korean User  
`https://utm.startmktg.com/ko/utm-builder`

### 🌎 English User  
`https://utm.startmktg.com/en/utm-builder`

### 🧱 API Example  
`POST https://api.startmktg.com/v1/utms/generate`

---

## 🚀 10. Scalability

| Category | Expansion |
|-----------|------------|
| New Module | `ads.startmktg.com`, `ai.startmktg.com` |
| New Language | `/fr/`, `/de/`, `/es/` |
| API Version | `/api/v2/...` |
| Mobile Support | Same URL, responsive layout |
| Tracking | Unified GA4 + BigQuery schema |

---

## 🧾 11. Developer Notes (for Cursor)

- Use **Next.js App Router** with middleware for locale routing.  
- Add redirects in `middleware.ts` for `/` → `/en/` based on `Accept-Language`.  
- Example `next.config.js`:
  ```js
  i18n: {
    locales: ['en', 'ko', 'jp'],
    defaultLocale: 'en'
  }
  ```
- API endpoints should live under `/pages/api/v1/`.

---

## ✅ 12. Summary

**Goals achieved:**
- Unified URL hierarchy  
- Global & SEO-ready routing  
- RESTful API standardization  
- Multi-language & scalable design  

---

**Maintainer:** BK Choi  
**Updated:** 2025-11-09  
**Version:** v1.0
