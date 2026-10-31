# AGENTS.md — Full-Stack Development Guidelines (Revised)

## Project Mission & Stack

You are an expert full-stack AI engineer. This repository is structured as a
two-folder monorepo containing:

- **Project Structure:** Monorepo with completely separate directories:
  - `/backend` — Spring Boot application
  - `/frontend` — Angular application
- **Backend:** Java latest version, Spring Boot latest version, Spring Data JPA, Spring Security,
  QueryDSL, Lombok
- **Backend Build Tool:** Gradle with Groovy DSL (`build.gradle`)
- **Backend Configuration:** `application.properties` (or profile-specific `.properties` files)
- **Frontend:** Angular latest version (Standalone Components, Signals), PrimeNG latest version,
  Tailwind CSS latest version, Fully Responsive Mobile-First Architecture (Mobile, Tablet, Desktop: 320px–4K),
  `ngbase` enterprise base library (when accessible via `../base/angularbase` — strictly reserved for back-office panel)
- **Frontend Architecture Extras:** Hybrid SSG (Static Site Generation / Prerendering) & SSR (Server-Side Rendering) with Event Replay Client Hydration (`provideClientHydration(withEventReplay(), withIncrementalHydration())`), PWA (Progressive Web App) Enabled, Environment Configurations (`src/environments/`)
- **Performance & Benchmark Target:** 100% Score across all 5 Google Lighthouse Benchmark Categories (Performance 100, Accessibility 100, Best Practices 100, SEO 100, PWA 100 / Installable)
- **SEO & GEO:** Full SEO & GEO (Generative Engine Optimization) Enabled — Dynamic Meta/Title/Canonical tags, JSON-LD Structured Data (Schema.org), Multilingual hreflang alternate links, `sitemap.xml`, and `robots.txt`
- **Maps & WebGIS (When Required):** Leaflet (`leaflet`, `@types/leaflet`) — standard map library for all mapping and WebGIS features; client-side only via `isPlatformBrowser` guard or `@defer (when isBrowser)`
- **Charts & Data Visualization (When Required):** Apache ECharts (`echarts` / `ngx-echarts`) — standard charting library for all analytics, metrics, graphs, and dashboard data visualizations; client-side only via `isPlatformBrowser` guard or `@defer (when isBrowser)`
- **Package Manager:** Yarn (if available; fallback to npm)
- **Assets & Libraries:** Fully self-contained / offline (all JS, CSS, and web
  fonts must be bundled locally in `/frontend` — **NO CDNs**)
- **Database:** PostgreSQL latest version (Installed locally via system service / systemd) — **Single Schema Architecture**, **Strict UTF-8 Encoding** (`ENCODING = 'UTF8'`), and **Database Name Matching Root Directory** (database name MUST match current project directory name, e.g. `demo`)
- **Database Migrations:** Liquibase with YAML syntax (`.yaml`/`.yml`) &
  Liquibase Hibernate Plugin — **Strict One-File-Per-Changeset Architecture** (each new migration changeset MUST reside in its own dedicated, separate file)
- **Universal Encoding Standard:** Full-Stack UTF-8 Encoding — all backend source files, Gradle compile tasks, Spring Boot HTTP servlets, frontend HTML/JSON/i18n assets, and PostgreSQL database storage must strictly use UTF-8.
- **Knowledge Graph & Codebase Intelligence:** Graphify (`graphify-out/`) — AST-based structural knowledge graph for architecture queries, dependency analysis, impact tracing, and god-node inspection

- - -
## Codebase Knowledge Graph (graphify)

This repository maintains an AST-based knowledge graph in `graphify-out/` mapping architecture, symbol relationships, and cross-file dependencies.

### Agent Rules for Graphify:
- **Index Generation & Freshness:**
  - Before starting exploratory code searches, verify that `graphify-out/graph.json` exists.
  - If missing or stale, generate/update it immediately by executing:
    ```bash
    graphify update .
    ```
  - For full re-extraction including AST and semantic dependencies:
    ```bash
    graphify extract . --code-only
    ```
- **Query First Before Scanning:**
  - When investigating codebase structure, cross-component dependencies, or service interactions, query the graph first rather than brute-force grepping:
    - `graphify query "<question>"` — Breadth-first traversal for architectural questions.
    - `graphify path "<SymbolA>" "<SymbolB>"` — Shortest dependency path between two classes or components.
    - `graphify explain "<Symbol>"` — Explanation of a symbol and its immediate callers/callees.
    - `graphify affected "<Symbol>"` — Reverse traversal to discover blast radius before refactoring.
    - `graphify god-nodes` — Identify central architectural hubs.
- **Maintain Index on Code Changes:**
  - After creating, moving, renaming, or refactoring backend Java classes, controllers, services, or frontend Angular components, **ALWAYS run `graphify update .`** to keep the knowledge graph synchronized.

- - -
## 1\. Environment & Configuration Rules

### Strict Directory Separation

- Never mix backend build files or Java classes into `/frontend`.
- Never place frontend assets, node modules, or Angular build artifacts
  directly into `/backend/src`.
- Keep configuration files strictly isolated: Gradle & Spring configuration
  inside `/backend`, package manager & Angular configuration inside `/frontend`.

### Git Initialization & .gitignore Setup

When initializing Git for the monorepo, configure a root `.gitignore` to prevent tracking build artifacts, dependencies, and sensitive credentials:

1. **Initialize Git repository:**
   ```bash
   git init
   ```

2. **Root `.gitignore` Configuration:**
   ```gitignore
   # ---- Backend (Java / Spring Boot / Gradle) ----
   /backend/.gradle/
   /backend/build/
   /backend/bin/
   /backend/out/
   .gradle/
   **/.gradle/
   build/
   **/build/
   bin/
   out/
   !gradle/wrapper/gradle-wrapper.jar
   !**/gradle/wrapper/gradle-wrapper.jar
   .gradletasknamecache
   gradle-app.setting
   *.hprof

   # ---- Sensitive DB Credentials & Secrets (NEVER COMMIT) ----
   /backend/src/main/resources/application-local.properties
   *.env
   *.env.local

   # ---- Frontend (Angular / Node / Yarn) ----
   node_modules/
   **/node_modules/
   /frontend/node_modules/
   /frontend/dist/
   /frontend/.angular/
   dist/
   .angular/

   # ---- Lockfile Rule (Track only ONE package manager lockfile) ----
   # If using yarn:
   package-lock.json
   # If using npm:
   # yarn.lock

   # ---- IDE & OS Metadata ----
   .idea/
   .vscode/
   .apt_generated/
   .classpath
   .project
   .settings/
   .sts4-cache/
   .DS_Store
   Thumbs.db
   ```

3. **Initial Commit:**
   ```bash
   git add .
   git commit -m "chore: initialize repository with monorepo .gitignore"
   ```

### Base Libraries Dependency & Parent Directory Check (Backend & Frontend)

#### 1. Backend Base Library (`../base`)
- Before building or configuring `/backend/build.gradle`, check if a `base` directory exists in the parent directory (`../base`).
- If `../base` exists, it is a shared Gradle subproject containing enterprise architectural primitives, dynamic query utilities, and security filters. Include it as a project dependency:

```groovy
// settings.gradle
include ':base'

// build.gradle
dependencies {
    implementation project(':base')
}
```

- If `../base` does **not** exist, proceed without it. Do NOT create it — it is maintained separately by the platform team.
- **Core Packages & Capabilities Provided by `../base`:**
  - **Dynamic Property Filtering (`com.example.base.propertyfilter`):**
    - `@JsonResponseFilter`: AntPath-based response filtering (`include = {...}`, `exclude = {...}`).
    - `@JsonRequestFilter`: Whitelist/blacklist request body deserialization (`allow = {...}`, `include = {...}`, `exclude = {...}`).
  - **Declarative Endpoint Validation (`com.example.base.validation`):**
    - `@ValidateModel`: AOP-intercepted method-level validator.
    - `@FieldRule`: Declarative field constraints matching `RuleType` (`NOT_BLANK`, `NOT_NULL`, `EMAIL`, `SIZE`, `PATTERN`, `MIN`, `MAX`).
    - Throws `ModelValidationException` with structured field errors.
  - **QueryDSL Dynamic Table & Search Engine (`com.example.base.querydsl`):**
    - `CustomPredicatesJoinBuilderJPA<T>`: Transforms PrimeNG table states into QueryDSL `BooleanBuilder` predicates, dynamic sorting (`resolveOrder`), and multi-field text search (`searchbyFieldsBuild`).
    - Seamlessly resolves nested relational entity paths without manual JPQL join boilerplate.
  - **PrimeNG Backend Models (`com.example.base.primeng`):**
    - `PNTableModel`: Models PrimeNG table requests (`first`, `rows`, `sortField`, `sortOrder`, `globalFilter`, `filters`, `columns`).
    - `FilterMetadata`, `GlobalFilter`, `SortMeta`, `Column`: Strong typing for table query payloads.
  - **Persian & Jalali Calendar Support (`com.example.base.date`):**
    - `ICU4J`, `DateSerializer`, `DateDeserializer`: Seamless conversion and serialization between ISO-8601 strings, Java `LocalDate`/`LocalDateTime`, and Persian Shamsi calendar dates.
  - **Audited Base Entity Model (`com.example.base.entity` / `com.example.base`):**
    - `BaseEntity`: Standardized base class providing UUID primary keys (`@Id @GeneratedValue(strategy = GenerationType.UUID)`), audit timestamps (`createdAt`, `updatedAt`), and creator tracking (`createdBy`, `updatedBy`).
  - **Standardized Exception Handling (`com.example.base.exception`):**
    - `GlobalExceptionHandler` (`@RestControllerAdvice`), `ResourceNotFoundException`, `BadRequestException`, `UnauthorizedException`, `CustomException`, `HttpResponse`.
  - **Embedded WAF & Rate Limiting (`com.example.base.waf`):**
    - `EmbeddedWafFilter`, `RateLimiterService`, `WafRuleEngine`: In-memory IP/token rate limiting and request payload sanitization.
  - **File & Storage Utilities (`com.example.base.file`):**
    - `StorageService`, `FileSystemStorageService`, `S3StorageService`, `TransientFileSaveAspect`.
  - **Spring Security & JWT Authentication (`com.example.base.security`):**
    - `JwtAuthenticationFilter`: Pre-built `OncePerRequestFilter` component handling stateless Bearer token extraction, HMAC signature validation, claim parsing, and `SecurityContextHolder` population.
    - `JwtAuthenticationEntryPoint` & `JwtAccessDeniedHandler`: Standardized RFC-compliant JSON responses for 401 Unauthorized and 403 Forbidden errors.
    - `SecurityConstant`: Standard token prefixes (`Bearer `), header names (`Jwt-Token`, `Authorization`), and authorities claim keys.

#### 2. Frontend Base Library (`ngbase`)
- Before configuring `/frontend/package.json`, check if the Angular base library exists in the parent `base` directory (`../base/angularbase` or `../base/angularbase/dist/ngbase`).
- If `../base/angularbase` exists:
  - Add `ngbase` as a local package dependency inside `/frontend/package.json`:
    ```json
    "dependencies": {
      "ngbase": "file:../base/angularbase/dist/ngbase"
    }
    ```
    *(Note: If the frontend directory is nested deeper, adjust the relative path accordingly, e.g., `file:../../base/angularbase/dist/ngbase`).*
  - Build the library from `../base/angularbase` if `dist/ngbase` is absent: `yarn build ngbase` (or `npm run build ngbase`).
  - Run `yarn install` (or `npm install`) inside `/frontend` to link the package.
- If `../base/angularbase` does **not** exist, proceed without it. Do NOT create it — it is maintained separately by the platform team.
- **Architectural Division of Labor (Backend `base` <-> Frontend `ngbase`):**
  - `<app-table>` (`ngbase`) sends pagination and column filter state as `PNTableModel` -> Spring Boot backend resolves it via `CustomPredicatesJoinBuilderJPA<T>` -> returns `Page<T>` shaped by `@JsonResponseFilter`.
  - `<dynamic-form>` (`ngbase`) submits structured model payloads -> Spring Boot backend binds permitted fields via `@JsonRequestFilter` -> validates constraints via `@ValidateModel`.
  - `<p-persian-datePicker>` (`ngbase`) renders Jalali calendar UI -> formats dates as ISO strings -> Spring Boot deserializes via `DateDeserializer`.
  - `<app-loader>` (`ngbase`) synchronizes with backend REST calls via `loaderInterceptor`.
- **Mandatory Usage Rule (Back Office Panel Only):** When `ngbase` is accessible, you **MUST use `ngbase` library public components** (`DynamicFormComponent`, `TableComponent`, `NestedtableComponent`, `TreeComponent`, `SortableListComponent`, `PersianDatePicker`, `LoaderComponent`, `TabComponent`, `AppMenuComponent`, `AppMenuitemComponent`, `FormButtonComponent`, `FormTextComponent`, `FormTreeSelectComponent`, `FormCodeComponent`) **exclusively within the back-office / admin panel** for building data tables, forms, calendars, trees, navigation, and workspace layouts instead of handcrafting manual forms or raw PrimeNG tables.
- **Public & Customer-Facing Restriction:** `ngbase` enterprise components **MUST NOT** be used in public-facing portals, landing pages, or customer-facing views. Public views must use lightweight bespoke components, Tailwind CSS, and standard Angular reactive forms / PrimeNG primitives to preserve maximum design flexibility, minimal bundle footprint, and 100% Google Lighthouse performance scores.
- **Fallback Policy:** If `ngbase` is unavailable (or when building non-back-office interfaces), implement equivalent UI using standard PrimeNG components (`p-table`, `p-dialog`, `p-select`) and Angular Reactive Forms (`FormGroup`, `FormControl`).
### Custom Annotations (Provided by `../base` Library)

The following annotations are **custom annotations provided by the `../base` library** (`com.example.base.propertyfilter` and `com.example.base.validation`). They eliminate the need for boilerplate DTO classes while guaranteeing strict security, request payload binding restrictions, and declarative validation.

| Annotation | Purpose & Capabilities | Fallback if `base` unavailable |
|---|---|---|
| `@JsonResponseFilter` | Dynamically filters serialized response JSON using AntPath pattern matching (`include` / `exclude`). Strips sensitive entity fields (`password`, `internalNotes`) without DTOs. | Use `@JsonView` or custom Jackson serializers |
| `@JsonRequestFilter` | Restricts which JSON fields can bind to the entity during deserialization (`allow` / `include` / `exclude`). Protects against mass assignment vulnerabilities. | Use `@JsonIgnoreProperties(ignoreUnknown = true)` + `@JsonProperty` |
| `@ValidateModel` | Method-level declarative validation using an array of `@FieldRule` definitions. Evaluated automatically via AOP before method execution. | Use `@Valid` + Jakarta Bean Validation annotations (`@NotNull`, `@Size`) |

#### 1. `@JsonResponseFilter` AntPath Pattern Syntax
- **Exact Field:** `"name"` — includes or excludes the exact property `name` on the top-level entity.
- **Direct Children:** `"project.*"` — includes all direct primitive/object child properties of `project`.
- **Recursive Children:** `"project.**"` — includes all nested properties under `project` at any depth.
- **Top-Level Field Across Objects:** `"*.id"` — includes the `id` field for all top-level objects in collections.
- **Deep Nesting:** `"**.id"` — includes the `id` field at any nesting depth.
- **Exclude Syntax:** `@JsonResponseFilter(include = {"id", "name", "roles.*"}, exclude = {"roles.permissions"})`.
- **Strict Security Rule:** NEVER omit the filter or use wildcards (`include = "*"`) on entity-returning endpoints. Always specify explicit allowed fields.

#### 2. `@JsonRequestFilter` Payload Binding Syntax
- **Whitelist Syntax:** `@JsonRequestFilter(allow = {"name", "email", "phone", "addresses.*"})`.
- **Shorthand Syntax:** `@JsonRequestFilter({"name", "email", "birthDate"})`.
- **Exclude Syntax:** `@JsonRequestFilter(include = {"*"}, exclude = {"id", "createdAt", "roles"})`.

#### 3. `@ValidateModel` & `@FieldRule` Syntax
Declarative method-level validation applied to the `@RequestBody` parameter:
- **`RuleType.NOT_BLANK`:** Validates non-empty string: `@FieldRule(field = "name", rule = RuleType.NOT_BLANK, message = "Name is required")`.
- **`RuleType.NOT_NULL`:** Validates non-null object: `@FieldRule(field = "status", rule = RuleType.NOT_NULL, message = "Status cannot be null")`.
- **`RuleType.EMAIL`:** Validates email format: `@FieldRule(field = "email", rule = RuleType.EMAIL, message = "Invalid email format")`.
- **`RuleType.SIZE`:** Validates string length boundaries: `@FieldRule(field = "password", rule = RuleType.SIZE, min = 8, max = 64, message = "Password must be 8-64 chars")`.
- **`RuleType.MIN` / `RuleType.MAX`:** Validates numeric ranges: `@FieldRule(field = "age", rule = RuleType.MIN, value = 18, message = "Must be 18+")`.
- **`RuleType.PATTERN`:** Validates custom regular expression: `@FieldRule(field = "phone", rule = RuleType.PATTERN, pattern = "^09\\d{9}$", message = "Invalid mobile number")`.

**Comprehensive Controller Example (Clean Entities, NO DTOs):**

```java
package com.example.controller;

import java.util.UUID;
import org.springframework.web.bind.annotation.*;
import com.example.base.annotation.JsonResponseFilter;
import com.example.base.annotation.JsonRequestFilter;
import com.example.base.validation.ValidateModel;
import com.example.base.validation.FieldRule;
import com.example.base.validation.RuleType;
import com.example.entity.User;
import com.example.service.UserService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    @JsonResponseFilter(include = {"id", "name", "email", "status", "department.title", "createdAt"})
    public User getUser(@PathVariable UUID id) {
        return userService.findById(id);
    }

    @PostMapping
    @ValidateModel({
        @FieldRule(field = "name", rule = RuleType.NOT_BLANK, message = "Name is required"),
        @FieldRule(field = "name", rule = RuleType.SIZE, min = 2, max = 100),
        @FieldRule(field = "email", rule = RuleType.NOT_BLANK, message = "Email is required"),
        @FieldRule(field = "email", rule = RuleType.EMAIL, message = "Invalid email format")
    })
    @JsonRequestFilter(allow = {"name", "email", "password", "birthDate", "active"})
    @JsonResponseFilter(include = {"id", "name", "email", "active", "createdAt"})
    public User createUser(@RequestBody User user) {
        return userService.create(user);
    }
}
```

### Standard Enterprise REST Contract 

| HTTP Method & Path | Controller Method Signature | Purpose & Frontend Component Mapping |
|---|---|---|
| `POST /getListTable` | `Page<T> getListTable(@RequestBody PNTableModel event)` | Server-side lazy pagination, filtering, and sorting for `<app-table>`. Resolved via `CustomPredicatesJoinBuilderJPA<T>`. |
| `GET /getList` | `List<T> getList()` | Returns all records without pagination (for small reference catalogs, dropdown options, and exports). |
| `GET /get/{id}` | `T get(@PathVariable ID id)` | Fetches a single entity by primary key for details or edit form hydration in `<dynamic-form>`. |
| `POST /create` | `T create(@RequestBody T item, @RequestParam(required = false) MultipartFile file)` | Creates a new record. Supports multipart upload with automatic AVIF conversion. |
| `POST /update` | `T update(@RequestBody T item, @RequestParam(required = false) MultipartFile file)` | Updates an existing record. Validates payload via `@ValidateModel` and filters via `@JsonRequestFilter`. |
| `GET /del/{id}` | `void del(@PathVariable ID id)` | Deletes a record by ID. Triggered by inline delete button on `<app-table>`. |
| `POST /delAll` | `void delAll(@RequestBody List<T> items)` | Bulk deletion of multiple selected records. Triggered by header delete button on `<app-table>`. |
| `GET /query/{query}` | `List<T> query(@PathVariable String query)` | Live asynchronous autocomplete search for `<dynamic-form>` `type: 'autocomplete'` controls. |
| `GET /search/{q}` | `List<T> search(@PathVariable String q)` | Quick search bar lookup across primary entity attributes. |

#### Automatic File Uploads & AVIF Optimization (`TransientFileSaveAspect`)
- **Zero-Boilerplate Media Handling:** When an entity has a `@Transient private MultipartFile itemPic;` or document field, do not write manual file storage logic in controllers or services.
- **Aspect Interception:** `TransientFileSaveAspect` in `../base` intercepts Spring Data `save()` and `saveAndFlush()` calls:
  1. Detects transient multipart files.
  2. Converts raster images to modern `.avif` using `AvifConverter` (preserving aspect ratio and metadata).
  3. Uploads the file via `StorageService` (`FileSystemStorageService` or `S3StorageService`).
  4. Binds the resulting storage URL / path into the entity's persistent file path field before database insertion.

### RTL / LTR Internationalization & Directionality

- The application **MUST support both RTL (Right-to-Left) and LTR (Left-to-Right)**
  layout directions dynamically.
- The root HTML or component container must dynamically manage the `dir="rtl"`
  or `dir="ltr"` attribute based on active locale/language selection.
- Ensure PrimeNG component directional features react correctly to the current 
  `dir` attribute.

### Tailwind CSS 4.x & Bidirectional Styling Rules

- Must use **Tailwind CSS latest version** inside `/frontend`.
- Configure Tailwind using CSS-first setup in `/frontend/src/styles.css` using `@import "tailwindcss";` and `@theme` directives. Do NOT generate legacy `tailwind.config.js`.
- **Bidirectional Class Enforcement (Logical Properties):**
  - All spacing, positioning, alignment, and border utilities **MUST use
    logical/bidirectional classes** (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`).
  - **NEVER** use physical directional classes: `ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`, `text-left`, `text-right`.

### Package & Asset Bundling (Offline First & PWA)

- All third-party libraries, icons, utility scripts, and stylesheets must be
  installed via Yarn/npm inside `/frontend`.
- Web fonts **must be downloaded and stored locally** in `/frontend/src/assets/fonts/` and imported via `@font-face` in CSS with `font-display: swap`.
- **Zero-CLS Font Preloading:** Preload critical font files in `/frontend/src/index.html` using `<link rel="preload" href="assets/fonts/Vazirmatn-Regular.woff2" as="font" type="font/woff2" crossorigin>` to prevent Flash of Invisible Text (FOIT) and eliminate layout shifts (CLS = 0).
- **Local Modern Media Assets:** All images must be stored locally in modern formats (`.webp`, `.avif`) or optimized vector `.svg` inside `/frontend/src/assets/images/`.
- **PWA Asset Suite:** Must include 192x192 and 512x512 maskable application icons with `purpose: "any maskable"`, plus an `apple-touch-icon.png` (180x180) in `/frontend/src/assets/icons/`.
- Check for Yarn availability (`yarn --version`). If Yarn is available, use it
  exclusively and maintain `yarn.lock`. If Yarn is NOT available, use `npm` and
  maintain `package-lock.json` — do NOT create both.

### Build Configuration (`/backend/build.gradle`)

- Configure the Java toolchain for **Java 25**:

### Build Configuration (`/backend/build.gradle`)

- Configure the Java toolchain for **Java 25**:

```groovy
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

tasks.withType(JavaCompile).configureEach {
    options.encoding = 'UTF-8'
}

tasks.withType(Javadoc).configureEach {
    options.encoding = 'UTF-8'
}
```

- All Gradle scripts **must** use Groovy syntax (`build.gradle`, `settings.gradle`). Do NOT create Kotlin DSL (`.kts`) files.
- Enforce **UTF-8 encoding** explicitly on all Java compilation and test execution tasks.
- Include and configure the **Liquibase Gradle Plugin** along with the Liquibase Hibernate extension.

### Spring Boot Properties (`/backend/src/main/resources/application.properties`)

- Application configuration **must** be maintained in `application.properties`
  (or `application-local.properties`). Do NOT create `.yml` or `.yaml` files for
  Spring Boot configuration.
- Format properties using standard key-value notation:

- **Database Name Rule:** The database name in `spring.datasource.url` **MUST match the current project root directory name** (e.g. `demo` if root is `/workspace/demo`). Do NOT use generic names like `mydb` or `test`.

```properties
# spring.application.name and database name match current project directory (e.g. 'demo')
spring.application.name=demo-service
spring.datasource.url=jdbc:postgresql://localhost:5432/${DB_NAME:demo}?characterEncoding=UTF-8
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:}

# UTF-8 HTTP & Character Encoding
server.servlet.encoding.charset=UTF-8
server.servlet.encoding.force=true
server.servlet.encoding.enabled=true

# Liquibase Settings (Master Changelog)
spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml
spring.liquibase.enabled=true
```

- **NEVER** commit plain-text production credentials. Reference environment variables or keep local overrides in non-tracked `.properties` files.
- - -
## 2\. System Architecture & Boundaries

### Backend Architecture (`/backend`)

Follow a layered architecture strictly: `Controller Layer` ➔ `Service Layer` ➔ `Repository Layer (Spring Data JPA + QueryDSL)` ➔ `PostgreSQL`


#### Request / Response Filtering & Validations (NO DTOs)

- **DO NOT create DTO classes** for API request and response payload
  transformations.
- Use `@JsonResponseFilter` on controller endpoints to dynamically shape,
  filter, or serialize response entity attributes.
- Use `@JsonRequestFilter` on controller parameters to filter, bind, or
  deserialize incoming payload attributes directly to entity models.
- Use `@ValidateModel` for validating request payloads and entity models instead
  of standard manual DTO validations.
- **Security Rule:** When using `@JsonResponseFilter`, you MUST explicitly list
  the fields to include. Never use `include = "*"` or omit the filter — this
  prevents accidental exposure of sensitive fields like `password`, `passwordHash`
  , `internalNotes`, etc.

#### Entity Primary Keys (UUID)

- All JPA Entities **MUST use `java.util.UUID`** as their Primary Key identifier
  type.
- Map primary keys using `@Id` and `@GeneratedValue(strategy = GenerationType.UUID)`.
- Do NOT use numerical/auto-incrementing primary keys (`Long`, `Integer`, `BIGINT`
  , `IDENTITY`, or `SEQUENCE`).

#### Spring Data JPA & QueryDSL Architecture

- ALL Spring Data JPA interfaces **must extend `QuerydslPredicateExecutor<T>`** alongside `JpaRepository<T, UUID>`.
- Interfaces extending `JpaRepository` **MUST NOT** be annotated with `@Repository`.
- **NO Spring Data Query Methods:** Do NOT define derived query methods on
  interfaces (e.g., `findByLastNameAndStatus(String name, Status status)`).
- Use QueryDSL `Predicate` objects constructed in a **dedicated Predicate builder
  class** (see below), and evaluate them via the repository's `findAll(Predicate predicate, Pageable pageable)` or `findOne(Predicate predicate)`.

#### Predicate Builder Layer (Required for Complex Queries)

To keep Controllers thin, all non-trivial QueryDSL predicates MUST be built in
dedicated builder classes:

```
/backend/src/main/java/com/example/predicate/

├── UserPredicateBuilder.java

├── OrderPredicateBuilder.java

└── ProductPredicateBuilder.java

// Example: UserPredicateBuilder.java
public class UserPredicateBuilder {
    
    public static Predicate build(String name, String email, UserStatus status) {
        QUser user = QUser.user;
        BooleanBuilder builder = new BooleanBuilder();
        
        if (StringUtils.hasText(name)) {
            builder.and(user.name.containsIgnoreCase(name));
        }
        if (StringUtils.hasText(email)) {
            builder.and(user.email.containsIgnoreCase(email));
        }
        if (status != null) {
            builder.and(user.status.eq(status));
        }
        return builder.getValue();
    }
}
```
Controller remains thin:

```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    @JsonResponseFilter(include = {"id", "name", "email", "status"})
    public Page<User> searchUsers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) UserStatus status,
            Pageable pageable) {
        Predicate predicate = UserPredicateBuilder.build(name, email, status);
        return userRepository.findAll(predicate, pageable);
    }
}
```

#### Backend Table Query Architecture for `<app-table>` (`CustomPredicatesJoinBuilderJPA<T>`)

When serving enterprise data to the frontend `ngbase` `<app-table>` component (`itemListURL: /admin/.../getListTable`), backend controllers must integrate with `CustomPredicatesJoinBuilderJPA<T>` provided by the `base` project (`com.example.base.querydsl.CustomPredicatesJoinBuilderJPA`):

- **Request Contract:** The controller endpoint receives PrimeNG table state mapped to `PNTableModel` (`com.example.base.primeng.PNTableModel`), including pagination (`first`, `rows`), global search, column filters, and sorting.
- **Dynamic QueryDSL Transformation:**
  - `CustomPredicatesJoinBuilderJPA<T>` automatically converts table filters and global searches into QueryDSL predicates.
  - Generates QueryDSL `BooleanBuilder` via `cpb.getPredicateResult(event, Entity.class)`.
  - Supports combining with additional server-side predicates via `cpb.getPredicateResult(event, additionalPredicate, Entity.class)`.
  - Resolves sort ordering via `cpb.resolveOrder(event, Entity.class)`.
  - Alternatively, executes dynamic queries directly via `cpb.getResult(event, Entity.class)`.
- **Response Format:** Return Spring Data `Page<Entity>` directly, filtered with `@JsonResponseFilter(include = {...})`. Never wrap in `ResponseEntity`.

**Example Controller Implementation for `<app-table>`:**

```java
package com.example.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.base.annotation.JsonResponseFilter;
import com.example.base.primeng.PNTableModel;
import com.example.base.querydsl.CustomPredicatesJoinBuilderJPA;
import com.example.entity.User;
import com.example.repository.UserRepository;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;
    private final CustomPredicatesJoinBuilderJPA<User> cpb;

    @PostMapping("/getListTable")
    @JsonResponseFilter(include = {"id", "name", "email", "status", "createdAt"})
    public Page<User> getListTable(@RequestBody PNTableModel event) {
        return cpb.getPredicateResult(event, User.class);
    }
}
```

#### Lombok Usage

- Use `@Getter`, `@Setter`, `@NoArgsConstructor`, and `@AllArgsConstructor` on
  JPA Entities.
- Use `@RequiredArgsConstructor` for constructor-based dependency injection in `@Service` and `@RestController` classes.
- Use `@Slf4j` for logger instantiation across services.
- Avoid using `@Data` on JPA Entities to prevent infinite recursion in `hashCode()`, `equals()`, and `toString()`.

#### Controllers

Keep thin. Responsible for:

- **Mandatory `/api/` Prefix Rule:** Every `@RestController` class **MUST** declare a class-level `@RequestMapping` that starts with `"/api/"` (e.g., `@RequestMapping("/api/users")`, `@RequestMapping("/api/admin/users")`, `@RequestMapping("/api/media")`). Controller endpoints must NEVER be mapped at the root (`/`) or without the `"/api/"` prefix.
- Binding incoming requests using `@JsonRequestFilter` and `@ValidateModel`
- Delegating predicate construction to PredicateBuilder classes
- Returning responses filtered with `@JsonResponseFilter`
- **NO `ResponseEntity` Wrappers:** Do NOT return `ResponseEntity` or `ResponseEntity<T>` from controller methods. Endpoints must return domain entities, `Page<T>`, `List<T>`, or `void` directly. Use `@ResponseStatus` (e.g. `@ResponseStatus(HttpStatus.CREATED)`) for non-200 success codes and handle errors via `@RestControllerAdvice`.

#### Spring Security & JWT Authentication (`JwtAuthenticationFilter`)

When securing API endpoints with JWT authentication in Spring Boot, **MUST use `JwtAuthenticationFilter` provided by the `base` library** (`com.example.base.security.JwtAuthenticationFilter`) whenever `../base` is accessible. Do NOT handcraft redundant JWT filter implementations.

- **Capabilities & Behavior:**
  - Extends `OncePerRequestFilter` to validate Bearer tokens on incoming requests.
  - Automatically extracts tokens from `Authorization: Bearer <token>` or `Jwt-Token: Bearer <token>` headers.
  - Validates cryptographic signature and expiration against `${jwt.secret}` and `${jwt.expireTime}` properties.
  - Extracts subject username and authorities/roles, binding a validated `UsernamePasswordAuthenticationToken` to `SecurityContextHolder`.
  - Supports custom URL whitelisting via a `@Qualifier("whitelistUrls") String[]` Spring Bean.
  - Automatically skips CORS `OPTIONS` preflight requests.
- **Configuration Properties (`application.properties`):**
  ```properties
  jwt.enabled=true
  jwt.secret=${JWT_SECRET:defaultSecretKeyThatIsVeryLongAndSecureEnoughForHS512Algorithm}
  jwt.expireTime=432000000
  ```
- **Standard `SecurityConfig.java` Integration:**

```java
package com.example.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.example.base.security.JwtAuthenticationFilter;
import com.example.base.security.JwtAuthenticationEntryPoint;
import com.example.base.security.JwtAccessDeniedHandler;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;

    @Bean(name = "whitelistUrls")
    public String[] whitelistUrls() {
        return new String[] {
            "/api/auth/**",
            "/api/public/**",
            "/v3/api-docs/**",
            "/swagger-ui/**"
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .accessDeniedHandler(jwtAccessDeniedHandler)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

- **Fallback Policy:** If `../base` is unavailable, implement an equivalent standard Spring Security 6 `OncePerRequestFilter` using JJWT (`io.jsonwebtoken:jjwt-api`).

#### Exception Handling

- Handle all exceptions explicitly via `@RestControllerAdvice`.
- Define a standard error response structure (e.g., `ApiError` record with `timestamp`, `status`, `message`, `path`).

#### Unit Testing Policy

- **DO NOT generate unit test files (`*Test.java`, `*Tests.java`, etc.) for backend code.**

- - -
### Frontend Architecture (`/frontend`)

#### Component File Structure (Strict Multi-File Rule)

- **EVERY Angular component MUST be split into exactly 3 separate files:**
  - TypeScript file: `[name].component.ts`
  - Template file: `[name].component.html` (referenced via `templateUrl`)
  - Styles file: `[name].component.scss` (referenced via `styleUrl`)
- **NEVER write inline templates (`template: '...'`) or inline styles (`styles: [...]`).**
- **DO NOT generate unit test files (`*.spec.ts`) for Angular components or frontend code.**

**Component template in `.ts` file:**

```typescript
// ✅ CORRECT — references external files
@Component({
  selector: 'app-user-list',
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent { }
// ❌ WRONG — inline template and styles
@Component({
  selector: 'app-user-list',
  template: `<div>User List</div>`,
  styles: [`div { color: red; }`]
})
export class UserListComponent { }
```
**File naming examples:**

```
components/user/

├── user-list.component.ts          # Component class + logic

├── user-list.component.html        # Template only (HTML)

├── user-list.component.scss        # Styles only (SCSS)

│

├── user-detail.component.ts

├── user-detail.component.html

├── user-detail.component.scss

│

├── user-form.component.ts

├── user-form.component.html

└── user-form.component.scss

```
**This rule applies to ALL Angular components including:**

- Page/route components
- Shared/reusable components
- Layout components (header, sidebar, footer)
- Dialog/modal components
- Even small utility components (a badge, a tag, a separator)

#### Hybrid SSG & SSR Rendering Architecture (Prerendering & Hydration)

- **Hybrid SSG + SSR Delivery:**
  - Angular applications MUST use hybrid rendering:
    - **SSG Prerendering:** All public, marketing, documentation, and static catalog routes MUST be prerendered at build time (`"prerender": true` in `angular.json` / `routes.txt`) to guarantee sub-second LCP and instantaneous TTFB.
    - **Dynamic SSR:** Authenticated routes, real-time dashboards, and dynamic search result pages use on-demand Server-Side Rendering (`@angular/ssr`).
- **Hydration Setup:**
  - Configure modern event-replay client hydration in `app.config.ts`:
  ```typescript
  import { provideClientHydration, withEventReplay, withIncrementalHydration } from '@angular/platform-browser';

  export const appConfig: ApplicationConfig = {
    providers: [
      provideClientHydration(withEventReplay(), withIncrementalHydration())
    ]
  };
  ```
- **Zero Hydration Mismatch & DOM Shift:**
  - Never alter initial DOM structure conditionally based on browser-only state before hydration completes.
  - Eliminate layout shifts (CLS = 0) by reserving exact container dimensions for dynamically rendered widgets.
- **Mandatory SSR Guards:** Every usage of browser-only globals (`window`, `document`, `localStorage`, `sessionStorage`, `navigator`) MUST be wrapped:

```typescript
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

export class BaseComponent {
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);

  executeBrowserAction(): void {
    if (this.isBrowser) {
      // Safe to use window, document, localStorage, sessionStorage
    }
  }
}
```

**Common SSR pitfalls to avoid:**
- `localStorage.getItem()` → crash on server
- `document.getElementById()` → crash on server
- `window.scrollTo()` → crash on server
- Direct DOM manipulation → crash on server
- `new Date().toLocaleTimeString()` without explicit locale → hydration mismatch

- **SSR HTTP Status Codes & Response Headers:**
  - Provide proper HTTP status codes for crawlers on the server:
  ```typescript
  import { inject, Optional } from '@angular/core';
  import { RESPONSE } from '@angular/ssr';

  export class NotFoundComponent {
    private response = inject(RESPONSE, { optional: true });

    constructor() {
      if (this.response) {
        this.response.status(404);
      }
    }
  }
  ```

#### PWA (Progressive Web App) & Offline Architecture

- Progressive Web App support must be configured via `@angular/pwa` (`ngsw-config.json` and `manifest.webmanifest`).
- **Lighthouse PWA 100% Checklist:**
  - Web App Manifest MUST include:
    - `name` and `short_name`
    - `start_url: "/"`
    - `display: "standalone"`
    - `background_color: "#ffffff"` and matching `theme_color`
    - High-resolution maskable icons: `192x192` and `512x512` with `purpose: "any maskable"`
    - Apple touch icon: `<link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png">`
    - Viewport meta with `viewport-fit=cover`
- **Offline Shell & Fallback Page:**
  - In `ngsw-config.json`, configure caching groups:
    - `app` asset group with `prefetch` installMode for static assets and shell.
    - `assets` asset group for fonts and images (`prefetch` with `maxAge: 30d`).
    - `dataGroups` for API calls using `freshness` (network-first, timeout 3s) or `performance` (cache-first for static catalogues).
  - Provide a dedicated offline component/route (`/offline`) that displays seamlessly when connectivity drops.
- **PWA + SSR Interaction:**
  - Service workers only execute in the browser. Service worker registration must use `withFetch()` or wait until the application is stable (`RegistrationStrategy: 'registerWhenStable:30000'`) so it never delays initial SSR rendering or hydration.

#### Search Engine Optimization (SEO) & GEO (Generative Engine Optimization)

To achieve maximum discoverability across traditional search engines (Google, Bing) and AI generative engines (ChatGPT, Claude, Perplexity):

1. **Centralized `SeoService` (`src/app/services/seo.service.ts`):**
   - Manage all document metadata dynamically on route changes:
     - Document `<title>`: 50–60 characters, front-loading primary keyword.
     - Document `<meta name="description">`: 150–160 characters, descriptive, action-oriented.
     - Document `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">`.
     - Open Graph tags: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`.
     - Twitter Card tags: `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`, `twitter:image`.
     - Canonical Link: Inject and update `<link rel="canonical" href="...">` per route to eliminate duplicate content indexing.

2. **Multilingual SEO & Bidirectional Alternate Links (`hreflang`):**
   - When supporting LTR and RTL locales (e.g., English and Persian), dynamically inject `hreflang` alternate links:
   ```html
   <link rel="alternate" hreflang="en" href="https://example.com/en/page" />
   <link rel="alternate" hreflang="fa" href="https://example.com/fa/page" />
   <link rel="alternate" hreflang="x-default" href="https://example.com/en/page" />
   ```
   - Automatically sync `<html lang="..." dir="...">` attributes with the active language state.

3. **Structured Data & JSON-LD Schemas (`SchemaService`):**
   - Inject structured, Schema.org-compliant JSON-LD `<script type="application/ld+json">` tags to enable Google Rich Results and structured AI entity citations:
     - `WebSite` & `Organization`: Site-wide branding, logo, search action.
     - `BreadcrumbList`: Structural hierarchy for search snippets.
     - `Article` / `Product`: Detailed content metadata with dates, author, and schema properties.
     - `FAQPage`: Question & Answer blocks for rich SERP accordions and direct AI engine quoting.

4. **Crawling Assets (`sitemap.xml` & `robots.txt`):**
   - Maintain a compliant `robots.txt` in `/frontend/src/robots.txt`:
   ```txt
   User-agent: *
   Allow: /
   Disallow: /api/
   Disallow: /admin/
   Sitemap: https://example.com/sitemap.xml
   ```
   - Maintain or auto-generate `sitemap.xml` in `/frontend/src/sitemap.xml` detailing all indexable URLs, `lastmod`, `changefreq`, and `priority`.

#### 100% Lighthouse Benchmark Architecture (The 5 Pillars)

Every frontend feature, component, and route must be engineered to achieve a **100/100 score** across all five Google Lighthouse benchmark audits:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   LIGHTHOUSE 100% BENCHMARK SUITE                       │
├─────────────┬─────────────────┬────────────────┬──────────┬────────────┤
│ Performance │  Accessibility  │ Best Practices │   SEO    │    PWA     │
│   100/100   │     100/100     │    100/100     │ 100/100  │  100/100   │
└─────────────┴─────────────────┴────────────────┴──────────┴────────────┘
```

##### 1. Performance Pillar (100/100) — Core Web Vitals
- **Core Web Vitals Thresholds:**
  - **LCP (Largest Contentful Paint):** < 1.2s (Good threshold is < 2.5s; 100% benchmark requires < 1.2s).
  - **INP (Interaction to Next Paint):** < 100ms (Good threshold is < 200ms).
  - **CLS (Cumulative Layout Shift):** Strictly `0.000` (Zero layout shifts).
  - **TBT (Total Blocking Time):** < 150ms.
- **Image Optimization with `NgOptimizedImage`:**
  - **NEVER use bare `<img>` tags.** ALWAYS import `NgOptimizedImage` from `@angular/common` and use `ngSrc`:
  ```html
  <!-- Below-the-fold image: lazy loaded by default with explicit aspect ratio -->
  <img [ngSrc]="'assets/images/product.webp'" width="400" height="300" alt="Detailed product preview" class="rounded-xl object-cover" />

  <!-- Above-the-fold / Hero image: prioritize to eliminate LCP delay -->
  <img [ngSrc]="'assets/images/hero-banner.webp'" width="1200" height="600" priority alt="Platform dashboard overview" class="w-full h-auto" />
  ```
  - Always specify explicit `width` and `height` (or `fill` with a sized container) to completely eliminate CLS.
  - Use modern image formats (`.webp`, `.avif`) only.
- **Font Optimization & Zero CLS:**
  - Preload critical `.woff2` fonts with `<link rel="preload" as="font" type="font/woff2" crossorigin>` in `index.html`.
  - Always use `font-display: swap` in `@font-face`.
  - Provide fallback font metrics override (`ascent-override`, `descent-override`, `size-adjust`) to prevent layout shifts during font swap.
- **Deferrable Views (`@defer`):**
  - Use Angular deferrable views for all below-the-fold components, heavy widgets, and PrimeNG modals:
  ```html
  @defer (on viewport) {
    <app-heavy-chart [data]="chartData()" />
  } @placeholder {
    <div class="h-64 w-full animate-pulse rounded-xl bg-surface-100 dark:bg-surface-800"></div>
  }
  ```
- **Code Splitting & Bundle Budget:**
  - All routes must be lazy-loaded using `loadComponent`:
  ```typescript
  {
    path: 'users',
    loadComponent: () => import('./components/user/user-list.component').then(m => m.UserListComponent)
  }
  ```
  - Maintain initial bundle size < 200 KB in `angular.json` build budgets.

##### 2. Accessibility (A11y) Pillar (100/100) — WCAG 2.1 AA/AAA
- **Accessible Names for All Interactive Elements:**
  - Every `<button>`, `<a>`, and `<input>` must have a computable accessible name.
  - Icon-only buttons MUST include an `aria-label`:
  ```html
  <!-- ✅ Accessible Icon Button -->
  <button pButton type="button" icon="pi pi-search" aria-label="Search users" class="p-button-rounded"></button>
  ```
- **Strict Color Contrast:**
  - Text to background contrast must be at least **4.5:1** for regular text and **3.0:1** for large text / UI component borders.
  - Verify both light mode and dark mode palettes against WCAG AA standards.
- **Semantic Heading Hierarchy:**
  - Exactly **ONE `<h1>` per page** representing the primary topic.
  - Never skip heading levels (e.g., never jump from `<h1>` directly to `<h3>` or `<h4>`).
- **Form Accessibility:**
  - Every form input must have a programmatically linked `<label for="inputId">` or `aria-labelledby`.
  - Error states must link error messages via `aria-describedby` and indicate `aria-invalid="true"`.
- **Keyboard Navigation & Logical Focus Rings:**
  - All interactive elements must be reachable and actionable via keyboard (`Tab`, `Enter`, `Space`).
  - Never suppress outline without providing a visible focus ring: use Tailwind `focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none`.
- **PrimeNG Accessibility Config:**
  - Ensure PrimeNG component ARIA pass-through options (`[ariaLabel]`, `[ariaExpanded]`) are populated on tables, selects, and dialogs.

##### 3. Best Practices Pillar (100/100)
- **Zero Console Errors & Warnings:** The production console must be 100% clean of runtime errors, deprecation warnings, or 404 resource requests.
- **Secure External Links:** All external links must include `rel="noopener noreferrer"` and `target="_blank"`.
- **HTTPS & Content Security Policy (CSP):** Serve all assets over secure protocols; define strong CSP meta headers preventing unsafe inline script execution.
- **Modern Standards:** Valid HTML5 doctype (`<!DOCTYPE html>`), UTF-8 encoding (`<meta charset="utf-8">`), and correct viewport definition.

##### 4. SEO Pillar (100/100)
- **Viewport Configuration:** `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- **Valid Title & Description:** Title (50–60 chars) and meta description (150–160 chars) present on every routed page.
- **Crawlable Navigation:** All links must use valid anchor tags `<a [routerLink]="['/path']">` with descriptive anchor text (never "click here" or empty tags).
- **Legible Tap Targets & Font Sizes:** All tap targets must be >= 48px by 48px; base font size must be >= 16px to prevent mobile zooming.
- **Descriptive Image Alt Text:** Every image has meaningful `alt` text describing the image content for screen readers and search bots.

##### 5. Progressive Web App (PWA) Pillar (100/100)
- **Installability & Manifest Validation:** Valid web app manifest linked in `index.html` with required icon sizes, scope, start URL, theme color, and display mode.
- **Offline Resilience:** App shell and static resources served reliably offline via Angular Service Worker (`ngsw-worker.js`).

#### Zero CDN Policy

- Do NOT reference external CDN URLs in `/frontend/src/index.html`.
- Configure `/frontend/angular.json` to bundle all CSS, JavaScript, and asset
  fonts locally so the application functions 100% offline.

#### Angular CLI Build & Cache Policy

- **Persistent Disk Cache MUST be Disabled:** Ensure persistent disk caching is disabled in `/frontend/angular.json` under `"cli": { "cache": { "enabled": false } }` (or via `ng cache disable`) to guarantee clean, deterministic builds and prevent stale artifact re-use.

#### Angular Standards & Directionality

- Use modern Angular reactivity (Signals, Signal Inputs/Outputs, 
  `linkedSignal()`, `resource()` API).
- Implement a Signal-based language/direction service managing current locale
  and direction (`dir="rtl"` | `dir="ltr"`).
- Use standalone components exclusively (`standalone: true`). Do NOT create `@NgModule`.
- Inject services using the `inject()` function.

#### PrimeNG & `ngbase` Enterprise Library Integration

The frontend architecture utilizes **PrimeNG** as the core foundational component system and **`ngbase`** as the enterprise abstraction layer whenever accessible.

##### `ngbase` Enterprise Component Library Integration (When Accessible — Back Office Panel Only)

> [!IMPORTANT]
> **Strict Back Office Scope:** `ngbase` enterprise components are **exclusively restricted to the back-office / admin panel** (`/admin`, `/backoffice`, internal management views). They **MUST NOT** be used in public-facing portals, landing pages, customer stores, or public authentication routes. For public routes, use lightweight custom components, Tailwind CSS, and standard PrimeNG primitives to preserve maximum design flexibility, minimal bundle footprint, and 100% Google Lighthouse benchmark scores.

When `ngbase` is present in dependencies (from `../base/angularbase` or `node_modules/ngbase`), **ALWAYS prefer `ngbase` components within the back-office panel** over building custom forms, manual dialogs, or raw PrimeNG tables from scratch. `ngbase` encapsulates PrimeNG with declarative configuration interfaces (`IForm`, `ITable`), automated server-side QueryDSL pagination, Jalali/Gregorian date handling, global loaders, and responsive grid layouts.

###### 1. Dynamic Forms (`DynamicFormComponent` — `<dynamic-form>`)
- Use `<dynamic-form [config]="config"></dynamic-form>` for all entity creation, editing, and details views.
- Eliminates manual HTML form boilerplate and custom control binding.
- Add `DynamicFormComponent` to the standalone component's `imports: [DynamicFormComponent, ...]`.
- Define configuration using the `IForm` interface and fields using `FieldConfig[]`:

```typescript
// user-form.component.ts
import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { DynamicFormComponent, IForm } from 'ngbase';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-form',
  imports: [DynamicFormComponent],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  config!: IForm;

  ngOnInit(): void {
    this.config = {
      horizontal: false,
      pcol: 6, // 6 out of 12 grid columns for standard two-column layout
      fieldsconfig: [
        { name: 'id', type: 'hidden', value: null },
        {
          name: 'name',
          label: 'نام و نام خانوادگی',
          type: 'text',
          pcol: 12,
          validation: [Validators.required]
        },
        {
          name: 'email',
          label: 'ایمیل',
          type: 'text',
          validation: [Validators.required, Validators.email]
        },
        {
          name: 'birthDate',
          label: 'تاریخ تولد',
          type: 'datepicker',
          calendar: 'jalali', // 'jalali' | 'georgian'
          validation: [Validators.required]
        },
        {
          name: 'department',
          label: 'دپارتمان',
          type: 'autocomplete',
          showType: 'simple',
          dataURL: `${environment.apiUrl}/admin/departments/query/`,
          text: 'title',
          multiple: false
        },
        {
          name: 'active',
          label: 'وضعیت فعال',
          type: 'checkbox',
          value: true
        },
        {
          name: 'submit',
          type: 'submit',
          url: `${environment.apiUrl}/admin/users/create`,
          redirectURL: '/users',
          showBackButton: true
        }
      ]
    };
  }
}
```

Template (`user-form.component.html`):
```html
<dynamic-form [config]="config"></dynamic-form>
```

###### 2. Dynamic Enterprise Tables (`TableComponent` — `<app-table>`)
- Use `<app-table #dt [config]="config" (buttonClicked)="onButtonClicked($event)"></app-table>` for entity lists, search grids, and data catalogs.
- Add `TableComponent` to `imports: [TableComponent, ...]`.
- Integrate directly with Spring Boot QueryDSL backend endpoints (`srv`, `entity`, `itemListURL`):
  - `itemListURL`: Target URL for server-side pagination, sorting, and QueryDSL filtering — handled on backend using `CustomPredicatesJoinBuilderJPA<T>` and `PNTableModel`.
  - `persistLink`: Navigation route to create/edit form component.
  - `headerButtons`: Standard global actions `['add', 'edit', 'delete', 'export', 'import', 'refresh']`.
  - `inlineButtons`: Per-row actions `['edit', 'delete']`.
  - `configButtons`: Custom action buttons with custom icons, handlers, or URLs.
  - `globalFields`: Array of searchable attributes matching QueryDSL `PredicateBuilder` / entity fields.
  - `configData`: Array of `FieldConfig` defining column headers, fields, formats, and cell links.

```typescript
// user-list.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { ITable, TableComponent } from 'ngbase';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-list',
  imports: [TableComponent],
  template: '<app-table #dt [config]="config"></app-table>',
})
export class UserListComponent {
  @ViewChild('dt') dt!: TableComponent;

  config: ITable = {
    headerTitle: 'مدیریت کاربران',
    entity: 'users',
    srv: `${environment.apiUrl}/admin/`,
    itemListURL: `${environment.apiUrl}/admin/users/getListTable`,
    persistLink: '/users/form',
    exportURL: `${environment.apiUrl}/admin/users/export`,
    importURL: `${environment.apiUrl}/admin/users/import`,
    rownum: true,
    inlineButtons: ['edit', 'delete'],
    headerButtons: ['add', 'edit', 'delete', 'export', 'import', 'refresh'],
    globalFields: ['name', 'email', 'phone'],
    configData: [
      { name: 'id', type: 'hidden' },
      { name: 'name', label: 'نام کامل', type: 'text', href: '/users/form/' },
      { name: 'email', label: 'ایمیل', type: 'text' },
      { name: 'createdAt', label: 'تاریخ ثبت‌نام', type: 'datetime', dateLocale: 'fa-IR' }
    ]
  };

}
```

###### 3. Persian & Gregorian Date Picker (`PersianDatePicker`)
`ngbase` provides full Jalali (Persian / Shamsi) calendar support out-of-the-box:
- **Within Dynamic Forms:** Configure `{ type: 'datepicker', calendar: 'jalali' }` or `{ type: 'datepicker', calendar: 'georgian' }` in `fieldsconfig`.
- **Standalone Component Usage:**
  ```typescript
  import { Component } from '@angular/core';
  import { PersianDatePicker } from 'ngbase';

  @Component({
    selector: 'app-date-demo',
    imports: [PersianDatePicker],
    template: `
      <p-persian-datePicker
        [(ngModel)]="selectedDate"
        [calendar]="'jalali'"
        [dateFormat]="'yy/mm/dd'"
        [showTime]="true"
        [showIcon]="true">
      </p-persian-datePicker>
    `
  })
  export class DateDemoComponent {
    selectedDate: string;
  }
  ```

###### 4. Global HTTP Loader (`LoaderComponent` & `loaderInterceptor`)
- **App Shell Integration (`app.component.html`):**
  Place `<app-loader></app-loader>` at the root shell level. It listens to `LoaderService` state.
- **HTTP Interceptor Configuration (`app.config.ts`):**
  ```typescript
  import { provideHttpClient, withInterceptors } from '@angular/common/http';
  import { loaderInterceptor } from 'ngbase';

  export const appConfig: ApplicationConfig = {
    providers: [
      provideHttpClient(withInterceptors([loaderInterceptor]))
    ]
  };
  ```
- **Silent Background Requests:** For background polling or analytics calls that should not trigger the visual progress spinner, set the `X-Skip-Loading: true` HTTP request header.

###### 5. Dynamic Tabs & Navigation Menus (`TabComponent`, `AppMenuComponent`, `AppMenuitemComponent`, `MenuService`)
- **`TabComponent` (`<app-tab [defaultRoute]="'/admin'" [(activeTabIndex)]="activeTab">`):** Multi-tab workspace manager allowing opening, closing, switching, and routing dynamic feature tabs with signals.
- **`AppMenuComponent` (`<app-menu [label]="'منوی اصلی'" [url]="'/api/admin/menu'" [logoutButton]="true" (logoutEvent)="onLogout()">`):** Application sidebar navigation menu rendered dynamically from hierarchical menu structures or server APIs.
- **`AppMenuitemComponent` (`<li app-menuitem [item]="item" [index]="i" [root]="true">`):** Recursive navigation menu item element handling submenus, PrimeIcons, badges, tooltips, active states, and routing.
- **`MenuService` & `TabItem`:** Angular service providing programmatic tab manipulation:
  ```typescript
  import { inject } from '@angular/core';
  import { MenuService, TabItem } from 'ngbase';

  export class OrderController {
    private menuService = inject(MenuService);

    openOrderTab(orderId: string, orderNumber: string) {
      const tab: TabItem = {
        title: `سفارش #${orderNumber}`,
        routerLink: `/admin/orders/${orderId}`,
        closable: true
      };
      this.menuService.addTab(tab);
    }
  }
  ```

###### 6. Hierarchical & Advanced Grids (`NestedtableComponent`, `TreeComponent`, `SortableListComponent`)

- **Nested Master-Detail Table (`NestedtableComponent` — `<app-nestedtable [data]="data">`):**
  Used to render hierarchical or relational records (such as order line items, transaction logs, or user addresses) directly within expandable table rows:
  ```html
  <app-nestedtable [data]="order.items"></app-nestedtable>
  ```

- **Enterprise Tree Hierarchy (`TreeComponent` — `<app-tree [config]="config">`):**
  Complete tree view with drag-and-drop reorganization, context menus, and inline modal CRUD:
  ```typescript
  import { Component } from '@angular/core';
  import { ITree, TreeComponent } from 'ngbase';
  import { environment } from '../../../environments/environment';

  @Component({
    selector: 'app-department-tree',
    imports: [TreeComponent],
    template: `<app-tree [config]="treeConfig"></app-tree>`
  })
  export class DepartmentTreeComponent {
    treeConfig: ITree = {
      header: 'ساختار درختی دپارتمان‌ها',
      loadURL: `${environment.apiUrl}/admin/departments/tree`,
      saveURL: `${environment.apiUrl}/admin/departments/tree/save`,
      treeCrudButtons: true,
      selectionMode: 'single',
      filter: true,
      newNodeLabel: 'افزودن زیرمجموعه',
      editNodeLabel: 'ویرایش نود',
      deleteNodeLabel: 'حذف نود'
    };
  }
  ```

- **Drag-and-Drop Reorderable List (`SortableListComponent` — `<app-sortablelist>`):**
  Backed by `@angular/cdk/drag-drop` and REST endpoints for visual reordering of items:
  ```html
  <app-sortablelist
    [loadURL]="'/api/admin/categories/list'"
    [saveURL]="'/api/admin/categories/reorder'"
    [field]="'title'"
    [header]="'ترتیب نمایش دسته‌بندی‌ها'">
  </app-sortablelist>
  ```

###### 7. Standalone & Specialized Form Field Components
While `DynamicFormComponent` dynamically instantiates these controls based on `FieldConfig`, they are also exported as standalone public components for fine-grained form composition:
- **`FormButtonComponent` (`<form-button [config]="config" [group]="group" (onClick)="handleClick($event)">`):** Dynamic form action button control supporting icons, variants, loading states, and callback handlers.
- **`FormTextComponent` (`<form-text [config]="config" [group]="group" (onChange)="handleChange($event)">`):** Form text input control integrating with Reactive Forms, masks, formatting, and validation styling.
- **`FormTreeSelectComponent` (`<form-treeselect [config]="config" [group]="group" (onChange)="onChange($event)">`):** Tree dropdown selection input control for selecting single or multiple tree nodes inside forms.
- **`FormCodeComponent` (`<form-code [config]="config" [group]="group">`):** Verification / OTP / digit code input component for entering two-factor authentication or verification codes.

###### 8. Complete Reference Table: All 14 Available `ngbase` Public Components

| # | Component Class | Selector | Export / Tag | Category | Purpose & Key Inputs / Outputs |
|---|-----------------|----------|--------------|----------|--------------------------------|
| 1 | `DynamicFormComponent` | `dynamic-form` | `exportAs: 'dynamicForm'` | Form Engine | Core dynamic form generator based on `IForm` and `FieldConfig[]`. Inputs: `[config]`, `[hideShowCancelBtn]`, `[state]`. Outputs: `(process)`, `(handler)`, `(patch)`, `(submit)`, `(close)`, `(formEvent)`, `(configChange)`, `(buttonClicked)`. |
| 2 | `TableComponent` | `app-table` | `<app-table #dt>` | Data Grid | Enterprise server-side table based on `ITable`. Integrates with Spring Data / QueryDSL endpoints. Inputs: `[config]`, `[items]`, `[selectedRow]`. Outputs: `(onSelection)`, `(onRowSelect)`, `(onRowUnselect)`, `(onClick)`, `(onDbClick)`, `(buttonClicked)`. |
| 3 | `NestedtableComponent` | `app-nestedtable` | `<app-nestedtable>` | Data Grid | Expandable nested / master-detail table for relational record views. Inputs: `[data]`. |
| 4 | `TreeComponent` | `app-tree` | `<app-tree>` | Hierarchy | Tree hierarchy visualization and node management based on `ITree`. Inputs: `[config]`. |
| 5 | `SortableListComponent` | `app-sortablelist` | `<app-sortablelist>` | List Reordering | Reorderable drag-and-drop list connected to REST URLs. Inputs: `[loadURL]`, `[saveURL]`, `[field]`, `[type]`, `[header]`. |
| 6 | `PersianDatePicker` | `p-persian-datePicker`, `p-persian-datepicker`, `p-persian-date-picker` | `<p-persian-datePicker>` | Date & Time | Shamsi (Jalali) and Gregorian date/time picker with animations, ranges, and multi-month views. Also importable via `PersianDatePickerModule`. |
| 7 | `LoaderComponent` | `app-loader` | `<app-loader>` | Feedback | Global application loading indicator synchronized with HTTP calls via `loaderInterceptor` and `LoaderService`. |
| 8 | `TabComponent` | `app-tab` | `<app-tab>` | Navigation | Multi-tab dynamic workspace manager. Inputs: `[defaultRoute]`, `[(activeTabIndex)]`, `[closeCustomTab]`. Outputs: `(activeTabIndexChange)`, `(onCloseTab)`, `(onOpenTab)`. |
| 9 | `AppMenuComponent` | `app-menu` | `<app-menu>` | Navigation | Sidebar application menu bar. Inputs: `[label]`, `[url]`, `[logoutButton]`. Outputs: `(logoutEvent)`. |
| 10 | `AppMenuitemComponent` | `[app-menuitem]` | `<li app-menuitem>` | Navigation | Recursive individual menu item element. Inputs: `[item]`, `[index]`, `[root]`, `[parentKey]`, `[multiple]`. |
| 11 | `FormButtonComponent` | `form-button` | `<form-button>` | Form Control | Configurable button field control implementing `Field`. Inputs: `[config]`, `[group]`. Outputs: `(onClick)`. |
| 12 | `FormTextComponent` | `form-text` | `<form-text>` | Form Control | Form text input control implementing `Field`. Inputs: `[config]`, `[group]`. Outputs: `(onChange)`. |
| 13 | `FormTreeSelectComponent` | `form-treeselect` | `<form-treeselect>` | Form Control | Tree dropdown selection input control implementing `Field`. Inputs: `[config]`, `[formConfig]`, `[group]`. Outputs: `(onChange)`, `(onClick)`, `(onNodeSelect)`, `(onNodeUnSelect)`, `(onNodeExpand)`, `(onNodeCollapse)`, `(onNodeDoubleClick)`, `(onShow)`, `(onHide)`. |
| 14 | `FormCodeComponent` | `form-code` | `<form-code>` | Form Control | Verification / OTP code input control implementing `Field`. Inputs: `[config]`, `[group]`. |

###### 10. Additional `ngbase` Utilities, Modules, Pipes & Services
- **Module:** `PersianDatePickerModule` (alternative to standalone component import).
- **Pipes & Helpers:** `PIconPipe` (`{{ iconName | picon }}`), `cleanIcon()` utility function.
- **Interceptors:** `loaderInterceptor` (HTTP interceptor for automatic global loading states).
- **Core Services:**
  - `ConfigService`: Application configuration and theming service.
  - `FormService`: Programmatic form validation and manipulation.
  - `GridService`: Grid calculation, column sizing, and layout utilities.
  - `JSONService`: JSON serialization, parsing, and payload transforms.
  - `LoaderService`: Manual trigger for loading states (`loading` signal).
  - `MenuService`: Navigation and dynamic tab event bus (`TabItem`).
  - `PersianNumberService`: Persian digit conversion, number-to-words, and currency formatting.
  - `PageResolver`: Route-level data preloading and resolving.
  - `ScrollService`: Smooth programmatic scroll controls.
  - `ServerService`: Generic HTTP REST wrapper for enterprise APIs.
  - `SubjectService`: Shared RxJS state management and cross-component messaging.
- **Dynamic Field Types (Used in `DynamicFormComponent.fieldsconfig`):**
  `text`, `password`, `hidden`, `textarea`, `datepicker`, `autocomplete`, `checkbox`, `tristatecheckbox`, `radio`, `select`, `selectbutton`, `multiselect`, `crop`, `digit`, `editor`, `file`, `files`, `gallery`, `image`, `inputgroup`, `map`, `multi`, `multiple`, `nestedtable`, `table`, `tree`, `treeselect`, `signature`, `slider`, `speeddial`, `submit`, `button`, `controlbuttons`, `time`, `datetime`, `title`, `togglebutton`, `toggleswitch`, `breadcrumb`, `code`, `userpermissions`, `fieldset`, `raw`, `readonly`.

##### Panel Architecture: Back Office vs. Public-Facing UI
- **Back-Office Panel (`/admin`, `/backoffice`, Internal Dashboards):**
  - Designed for internal enterprise operations, CRUD workflows, and administrative dashboards.
  - When `ngbase` is available, all data tables, forms, trees, tabs, and navigation **MUST** use `ngbase` components (`TableComponent`, `DynamicFormComponent`, `AppMenuComponent`, `NestedtableComponent`, etc.).
  - Standardizes administrative workflows, reduces form/table boilerplate, and provides built-in Jalali calendar and QueryDSL pagination.
- **Public-Facing Portal & Customer Interfaces:**
  - Designed for end-users, landing pages, marketing, catalog browsing, and customer checkout/portals.
  - **MUST NOT** use `ngbase` enterprise components in public routes.
  - Handcraft responsive, accessible UI using Tailwind CSS v4, Angular Signals, and native PrimeNG primitives (`p-table`, `p-select`, `p-dialog`, etc.) or standard Angular Reactive Forms.
  - Ensures ultra-lightweight client bundles, zero unnecessary hydration overhead, and pristine 100% Google Lighthouse scores across all metrics.

##### Fallback Strategy (When `ngbase` is NOT Accessible)
- If `../base/angularbase` is not available:
  - Do NOT import from `ngbase`.
  - In back-office views, implement equivalent UI using standard PrimeNG components (`p-table`, `p-dialog`, `p-select`) and Angular Reactive Forms (`FormGroup`, `FormControl`, `Validators`).
  - Connect `p-table` lazy loading events directly to QueryDSL backend endpoints manually.


#### Styling & Layout (Tailwind CSS 4.x & Bidirectional Rules)

- Use **Tailwind CSS v4** utility classes exclusively with logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`).
- Structure theme customizations inside CSS files using `@theme` rather than
  JavaScript config files.
- Only use custom CSS/SCSS when Tailwind classes cannot achieve the desired
  effect (e.g., PrimeNG component overrides, complex animations, RTL fixes).

#### Tailwind CSS Complete Setup

**Step 1: Install Tailwind CSS**

```bash
# From /frontend
yarn add tailwindcss @tailwindcss/postcss postcss autoprefixer
```
**Step 2: Configure PostCSS**

```json
// /frontend/.postcssrc.json
{
  "plugins": {
    "@tailwindcss/postcss": {},
    "autoprefixer": {}
  }
}
```
**Step 3: Global Styles — `styles.css`**

```css
/* /frontend/src/styles.css */

/* Import Tailwind CSS 4 (CSS-first — NO tailwind.config.js) */
@import "tailwindcss";

/* ---- Custom Theme ---- */
@theme {
  /* Colors */
  --color-primary-50: #f0f9ff;
  --color-primary-100: #e0f2fe;
  --color-primary-200: #bae6fd;
  --color-primary-300: #7dd3fc;
  --color-primary-400: #38bdf8;
  --color-primary-500: #0ea5e9;
  --color-primary-600: #0284c7;
  --color-primary-700: #0369a1;
  --color-primary-800: #075985;
  --color-primary-900: #0c4a6e;
  --color-primary-950: #082f49;

  /* Font Family */
  --font-sans: 'Vazirmatn', 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  /* Spacing Scale */
  --spacing-18: 4.5rem;
  --spacing-88: 22rem;
  --spacing-128: 32rem;

  /* Border Radius */
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;

  /* Breakpoints */
  --breakpoint-xs: 20rem;
}

/* ---- Font Faces ---- */
@font-face {
  font-family: 'Vazirmatn';
  src: url('./assets/fonts/Vazirmatn-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Vazirmatn';
  src: url('./assets/fonts/Vazirmatn-Medium.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Vazirmatn';
  src: url('./assets/fonts/Vazirmatn-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

/* ---- Dark Mode ---- */
@custom-variant dark (&:where(.dark, .dark *));

.dark {
  color-scheme: dark;
}

/* ---- PrimeNG License Banner Suppression ---- */
#p-license-host {
  display: none !important;
}
```
**Step 4: Verify Tailwind is Working**

```bash
# From /frontend
yarn ng build
# Check that output CSS contains Tailwind utility classes
```

**Tailwind 4 — Classes to NEVER Use (Physical Directionals):**

| ❌ Never Use | ✅ Always Use | Purpose |
|---|---|---|
| `ml-*`, `mr-*` | `ms-*`, `me-*` | Margin start/end |
| `pl-*`, `pr-*` | `ps-*`, `pe-*` | Padding start/end |
| `left-*`, `right-*` | `start-*`, `end-*` | Position start/end |
| `text-left`, `text-right` | `text-start`, `text-end` | Text alignment |
| `border-l-*`, `border-r-*` | `border-s-*`, `border-e-*` | Border start/end |
| `rounded-l-*`, `rounded-r-*` | `rounded-s-*`, `rounded-e-*` | Border radius |
| `scroll-ml-*`, `scroll-mr-*` | `scroll-ms-*`, `scroll-me-*` | Scroll margin |
| `origin-left`, `origin-right` | `origin-start`, `origin-end` | Transform origin |

**Tailwind 4 — Custom Utility Examples:**

```html
<!-- RTL-aware layout -->
<div class="flex items-center justify-between gap-4">
  <span class="text-start text-sm text-surface-500">Label</span>
  <button class="ms-auto rounded-lg bg-primary-500 px-4 py-2 text-white">
    Submit
  </button>
</div>

<!-- Responsive + RTL -->
<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  <div class="rounded-xl border border-surface-200 p-6">
    Card content
  </div>
</div>
```

#### Fully Responsive UI Architecture (Mobile-First & Adaptive Breakpoints)

Every frontend view, layout, component, table, dialog, and form **MUST be 100% responsive**, providing an optimized experience across all viewports from small mobile screens (320px) up to ultra-wide displays (4K):

1. **Mobile-First Design Principle:**
   - Always author base utility classes for mobile viewports first (`<640px`).
   - Layer responsive enhancements progressively with Tailwind breakpoint prefixes:
     - `sm:` (>= 640px) — Large phones / small tablets
     - `md:` (>= 768px) — Tablets portrait / landscape
     - `lg:` (>= 1024px) — Laptops / standard desktop displays
     - `xl:` (>= 1280px) — Large desktops
     - `2xl:` (>= 1536px) — High-resolution / ultrawide monitors
2. **Zero Horizontal Overflow:**
   - The root application shell, route views, and components **MUST NEVER** produce horizontal scrollbars on mobile (`overflow-x-clip` or strict container bounds).
   - **NEVER** use fixed pixel widths on layout containers or cards (e.g., `w-[800px]`, `min-w-[1200px]`). Use fluid widths (`w-full`, `max-w-screen-xl`, `min-w-0 flex-1`).
3. **Adaptive Grid & Form Layouts:**
   - Grid systems and form rows must stack into a single column on mobile and scale to multi-column layouts on larger viewports:
     ```html
     <!-- Mobile 1-col -> Tablet 2-col -> Desktop 3-col -->
     <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">...</div>
     ```
   - In dynamic forms (`DynamicFormComponent`), ensure field column allocations adapt (`pcol: 12` on mobile, `pcol: 6` on desktop).
4. **Responsive Navigation & Sidebars:**
   - Application navigation bars and sidebars must collapse into an off-canvas drawer / overlay on mobile viewports (`<lg`) with a visible hamburger toggle button.
   - On desktop viewports (`>=lg`), navigation expands into a persistent sidebar or full navigation bar.
5. **Responsive Data Tables & Lists:**
   - PrimeNG `p-table` and `ngbase` `<app-table>` must be wrapped in scroll-safe containers (`overflow-x-auto` or `responsiveLayout="scroll"`).
   - On mobile screens, prefer stacked cards or ensure tables scroll smoothly within their container without breaking outer viewport width.
6. **Adaptive Modals & Dialogs:**
   - Modals (`p-dialog`) must be full-width or near-screen-width on mobile (`style="width: 95vw; max-width: 100%;"` or responsive CSS classes) and constrained on desktop (`md:max-w-2xl`).
7. **Touch & Tap Target Ergonomics:**
   - All interactive controls (buttons, links, select dropdowns, inputs) must maintain a minimum touch target size of **48×48px** with adequate padding on touch viewports to meet WCAG AA standards.

#### TypeScript Strictness

- Do NOT use `any` type. Maintain strict type safety with interfaces/types
  matching backend entities/models.
- Define model interfaces in a dedicated `/frontend/src/app/models/` directory:

```
/frontend/src/app/models/

├── user.model.ts

├── order.model.ts

└── index.ts

```

#### Environment Configuration (`/frontend/src/environments/`)

- The Angular application **MUST maintain environment configuration files** in `/frontend/src/environments/`:
  - `environment.ts` — Default development environment configuration
  - `environment.prod.ts` (or `environment.development.ts`) — Production / deployment overrides
- Configure `fileReplacements` in `/frontend/angular.json` under `architect.build.configurations.production`:

```json
"configurations": {
  "production": {
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.prod.ts"
      }
    ]
  }
}
```

- **Environment Structure & Properties:**
  - `production` (boolean): `false` in development, `true` in production.
  - `apiUrl` (string): API base URL (e.g., `'http://localhost:8080/api'` in local dev, `'/api'` in production).
  - Any environment-specific keys, feature toggles, or endpoint paths.

- **Mandatory Service Usage (NO Hardcoded URLs):**
  - All Angular services making HTTP requests MUST import `environment` from `src/environments/environment`:

```typescript
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
}
```

- **NEVER hardcode API base URLs, ports, or backend hosts** directly in services, components, or interceptors.

#### Maps & WebGIS Architecture (Leaflet)

When a feature requires interactive maps, geographic data visualization, spatial analysis, or WebGIS capabilities:

- **Library Standard:** Always use **Leaflet** (`leaflet` and `@types/leaflet`). Do NOT introduce alternative mapping libraries (OpenLayers, Mapbox GL, Google Maps) unless explicitly instructed.
- **SSR & Hydration Safety:** Leaflet depends strictly on DOM globals (`window`, `document`).
  - **NEVER** instantiate or import Leaflet on the server during SSR.
  - Guard initialization using `isPlatformBrowser(this.platformId)` inside `afterNextRender()` or lifecycle hooks:
    ```typescript
    import { Component, inject, PLATFORM_ID, afterNextRender } from '@angular/core';
    import { isPlatformBrowser } from '@angular/common';
    import * as L from 'leaflet';

    @Component({
      selector: 'app-map',
      templateUrl: './map.component.html',
      styleUrl: './map.component.scss'
    })
    export class MapComponent {
      private platformId = inject(PLATFORM_ID);
      private map?: L.Map;

      constructor() {
        if (isPlatformBrowser(this.platformId)) {
          afterNextRender(() => {
            this.initMap();
          });
        }
      }

      private initMap(): void {
        this.map = L.map('map-container').setView([35.6892, 51.3890], 12);
        L.tileLayer('/tiles/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.map);
      }
    }
    ```
  - Or wrap map components with Angular deferrable views: `@defer (when isBrowser) { <app-map /> }`.
- **Offline & Bundling Policy:**
  - Import Leaflet CSS locally: `@import "leaflet/dist/leaflet.css";` in `styles.css` or component SCSS.
  - Configure default marker icon asset paths locally (via `assets/` or `L.Icon.Default.imagePath`) to avoid broken images or external CDN fetches.
  - Tile layer URLs must be configurable via `environment.ts` pointing to local/proxy tile endpoints — zero external CDN dependencies.

#### Charts & Data Visualization Architecture (Apache ECharts)

When a feature requires analytics dashboards, metrics charts, statistical graphs, financial diagrams, or data visualizations:

- **Library Standard:** Always use **Apache ECharts** (`echarts` and `ngx-echarts` if applicable). Do NOT introduce Chart.js, Highcharts, D3, or other charting libraries unless explicitly instructed.
- **SSR & Hydration Safety:** ECharts depends strictly on DOM canvas/SVG rendering and browser globals (`window`, `document`, `HTMLDivElement`).
  - **NEVER** instantiate or render ECharts on the server during SSR.
  - Guard initialization using `isPlatformBrowser(this.platformId)` inside `afterNextRender()` or lifecycle hooks, or wrap chart components with Angular deferrable views:
    ```html
    @defer (when isBrowser) {
      <app-sales-chart [data]="salesData()" />
    } @placeholder {
      <div class="h-80 w-full animate-pulse rounded-xl bg-surface-100 dark:bg-surface-800"></div>
    }
    ```
- **Component Pattern & Lifecycle Management:**
  - Always clean up ECharts instances in `ngOnDestroy()` via `chartInstance.dispose()` to prevent memory leaks.
  - Automatically resize charts on window or container changes (`window.addEventListener('resize', ...)` or `ResizeObserver`).
  - Example Standalone Component:
    ```typescript
    import { Component, ElementRef, ViewChild, inject, PLATFORM_ID, afterNextRender, OnDestroy } from '@angular/core';
    import { isPlatformBrowser } from '@angular/common';
    import * as echarts from 'echarts';

    @Component({
      selector: 'app-sales-chart',
      templateUrl: './sales-chart.component.html',
      styleUrl: './sales-chart.component.scss'
    })
    export class SalesChartComponent implements OnDestroy {
      @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef<HTMLDivElement>;
      private platformId = inject(PLATFORM_ID);
      private chartInstance?: echarts.ECharts;
      private resizeHandler = () => this.chartInstance?.resize();

      constructor() {
        if (isPlatformBrowser(this.platformId)) {
          afterNextRender(() => {
            this.initChart();
          });
        }
      }

      private initChart(): void {
        if (!this.chartContainer?.nativeElement) return;
        this.chartInstance = echarts.init(this.chartContainer.nativeElement);
        this.chartInstance.setOption({
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'] },
          yAxis: { type: 'value' },
          series: [{ data: [150, 230, 224, 218, 135, 147], type: 'line', smooth: true }]
        });
        window.addEventListener('resize', this.resizeHandler);
      }

      ngOnDestroy(): void {
        if (isPlatformBrowser(this.platformId)) {
          window.removeEventListener('resize', this.resizeHandler);
          this.chartInstance?.dispose();
        }
      }
    }
    ```
- **Offline & Bundling Policy:**
  - Fully bundle locally via Yarn/npm: `yarn add echarts` (zero external CDN scripts).
  - For optimized production builds, use tree-shakeable core imports (`echarts/core`, `echarts/charts`, `echarts/components`, `echarts/renderers`).
- - -
## 3\. Database Rules (PostgreSQL & Liquibase with YAML)

### Single Schema Database Design Rule

- **Strict Single Schema Architecture:** The PostgreSQL database MUST use a single database schema (the default `public` schema or a single designated application schema).
- All entity tables, join tables, views, sequences, indices, and Liquibase tracking tables (`databasechangelog`, `databasechangeloglock`) MUST reside exclusively within this single schema.
- **NO Multi-Schema Segregation:** Do NOT create, configure, or split domain entities across multiple database schemas (e.g., no separate `auth`, `core`, `orders`, `users`, or tenant-specific schemas).
- **JPA & Liquibase Compliance:**
  - JPA entities MUST NOT specify custom schemas in `@Table(schema = "...")` or `@JoinTable(schema = "...")` unless explicitly bound to the single designated application schema.
  - Liquibase changesets MUST NOT define varying `schemaName` attributes and must target the single application schema uniformly.

### PostgreSQL Requirements, Directory-Based Naming & UTF-8 Encoding

- Local installation running PostgreSQL (v16+).
- **Mandatory Database Naming Rule (Current Directory Name):**
  - The PostgreSQL database name **MUST strictly match the current project root directory name** (e.g., if working in `/home/rasool/workspace/demo`, the database name is `demo`; if in `shop`, the database is `shop`).
  - Derive dynamically: `DB_NAME=$(basename "$PWD")` (or name of the project folder).
  - Never use arbitrary or generic database names such as `mydb`, `testdb`, `app_db`, or `postgres`.
- **Mandatory UTF-8 Database Encoding:**
  - Every application database must be created with explicit `UTF8` encoding, matching directory name, and matching UTF-8 collation:
    ```bash
    createdb -E UTF8 -O app_user $(basename "$PWD")
    # or SQL:
    # CREATE DATABASE demo WITH ENCODING 'UTF8' OWNER app_user LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8';
    ```
  - Verify database encoding: `SELECT pg_encoding_to_char(encoding) FROM pg_database WHERE datname = current_database();` (must return `UTF8`).
  - Ensure client connection encoding defaults to UTF8: `SET client_encoding = 'UTF8';`.
- Leverage PostgreSQL-native JSON/JSONB functions, indexing optimizations, and query capabilities where appropriate via JPA/QueryDSL.
- Verify version with `SELECT version();`

### Liquibase Schema Control (YAML Syntax in `/backend`)

- All Liquibase changelogs **MUST use YAML syntax (`.yaml` / `.yml`)**. Do NOT
  use XML, JSON, or SQL formats for Liquibase changesets.
- Primary key columns in PostgreSQL must be defined as `UUID` (`type: UUID`).

#### Strict One-File-Per-Changeset Mandate
- **Isolated Changeset Files:** Every new migration or schema change **MUST be placed in its own dedicated, separate YAML file** under `/backend/src/main/resources/db/changelog/changes/`.
- **NO Multiple Changesets in a Single File:** Do NOT group multiple independent changesets into a single YAML file. Each file must represent exactly one logical, atomic migration.
- **Immutability of Committed Migration Files:** NEVER append new changesets to or alter existing, already-committed migration files. Once a changeset file is created and executed, it is immutable.
- **Master Changelog Orchestration Only:** The master changelog at `/backend/src/main/resources/db/changelog/db.changelog-master.yaml` MUST NEVER contain raw changesets. It exists solely to orchestrate and include individual changeset files in deterministic execution order:

```yaml
databaseChangeLog:
  - include:
      file: db/changelog/changes/001-initial-schema.yaml
  - include:
      file: db/changelog/changes/002-add-user-table.yaml
  - include:
      file: db/changelog/changes/20261001210000-add-user-status.yaml
```

#### File Naming & Versioning Conventions
- Every individual changeset file MUST follow an ordered, descriptive naming convention:
  - **Timestamp-Based (Recommended):** `YYYYMMDDHHMMSS_<description>.yaml` (e.g., `20261001210000_create_users_table.yaml`, `20261001213000_add_user_email_index.yaml`).
  - **Sequential (Alternative):** `001-initial-schema.yaml`, `002-create-orders-table.yaml`, `003-add-discount-column.yaml`.
- Changeset `id` and `author` attributes within the file must uniquely identify the migration and match the file name.

#### Liquibase Hibernate Plugin & `diffChangelog` Generation Rule
- When using the **Liquibase Hibernate Plugin** to generate migration scripts from entity diffs (`diffChangelog`), you **MUST ALWAYS target a brand-new, uniquely named file** for each generation run.
- **NEVER** run `diffChangelog` targeting an existing file or the master changelog.
- Provide a dynamic timestamped filename or property to ensure a separate file is produced each time:
  ```bash
  ./gradlew diffChangelog -PdiffChangeLogFile=src/main/resources/db/changelog/changes/$(date +%Y%m%d%H%M%S)_migration.yaml
  ```
- Workflow after diff generation:
  1. Inspect and clean up the generated YAML changeset (ensure types, constraints, and strict single-schema compliance).
  2. Register the newly generated file as an `- include: file: ...` entry in `db.changelog-master.yaml`.
  3. Validate the migration via `./gradlew liquibaseUpdate`.
- **NEVER** alter existing database tables directly without creating a dedicated Liquibase YAML changeset file.
### Naming Conventions

- Database tables: `snake_case`, plural (e.g., `users`, `order_items`).
- Columns: `snake_case` (e.g., `created_at`, `first_name`).
- Use io.hypersistence.utils.hibernate.naming.CamelCaseToSnakeCaseNamingStrategy from The Hypersistence Utils library (https://github.com/vladmihalcea/hypersistence-utils)
### Audit Columns

Base entities must include:

- `created_at` (TIMESTAMP, NOT NULL, default `NOW()`)
- `updated_at` (TIMESTAMP, NOT NULL, default `NOW()`)
- `created_by` (VARCHAR, nullable)
- `updated_by` (VARCHAR, nullable)

Consider using Hibernate Envers

- - -
## 4\. Coding Conventions & Quality

### DO:

- Generate every Angular component with separate `.ts`, `.html`, and style files
  (`.scss`/`.css`), skipping all unit test files (`*.spec.ts`).
- Skip generating unit test files for both frontend (`*.spec.ts`) and backend (`*Test.java`, `*Tests.java`).
- Ensure Angular SSR and PWA service worker configurations are present and
  operational in `/frontend`.
- Check parent directory for `../base` and include the `base` library as a
  dependency in `/backend/build.gradle` if present.
- Check parent directory for `../base/angularbase` and include `ngbase` as a
  dependency in `/frontend/package.json` if present.
- Use `ngbase` enterprise components (`DynamicFormComponent`, `TableComponent`,
  `NestedtableComponent`, `TreeComponent`, `SortableListComponent`, `PersianDatePicker`,
  `LoaderComponent`, `TabComponent`, `AppMenuComponent`, `AppMenuitemComponent`,
  `FormButtonComponent`, `FormTextComponent`, `FormTreeSelectComponent`, `FormCodeComponent`) **exclusively within the back-office / admin panel** whenever `ngbase` is available.
- Keep public-facing portal and customer views free of `ngbase` components, using lightweight bespoke UI with Tailwind CSS and standard Angular/PrimeNG controls.
- Use `@JsonResponseFilter` for filtering API responses (with explicit field
  lists, never wildcard).
- Use `@JsonRequestFilter` for binding and filtering API requests.
- Use `@ValidateModel` for validating entity models and payloads.
- Return domain entities, collections, or `Page<T>` directly from Spring controllers (never wrap with `ResponseEntity`).
- Support seamless dynamic switching between **RTL** and **LTR** layout modes
  across all UI views and components.
- Use bidirectional Tailwind classes (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`) for all frontend layout and spacing.
- Use `UUID` exclusively for all entity primary keys and foreign key references (`JpaRepository<Entity, UUID>`).
- Ensure all Spring Data repositories extend `QuerydslPredicateExecutor<Entity>`.
- Build QueryDSL `Predicate` instances in **dedicated PredicateBuilder classes**,
  not directly in controllers.
- Keep `/backend` and `/frontend` cleanly separated into their designated root
  folders.
- Run frontend commands strictly from `/frontend` and backend commands strictly
  from `/backend`.
- Use Tailwind CSS (`@import "tailwindcss";`) for styling inside `/frontend`.
- Store and bundle all font files, stylesheets, and third-party JS scripts
  inside `/frontend`.
- Maintain all Liquibase changelogs strictly in YAML format (`.yaml` or `.yml`)
  inside `/backend`.
- Enforce the **one-file-per-changeset rule**: place every new migration changeset into its own dedicated, separate YAML file under `/backend/src/main/resources/db/changelog/changes/`.
- Target a new, uniquely named (timestamped or sequential) file whenever generating migration diffs via `diffChangelog`.
- Register each new changeset file explicitly in `db.changelog-master.yaml` via `- include: file: ...`.
- Use Yarn when available; use npm as fallback (never both simultaneously).
- Ensure the local database environment is running PostgreSQL 16 or higher.
- Maintain a strict single-schema architecture in PostgreSQL (all tables, entities, views, and Liquibase migrations reside in one schema).
- Use the Liquibase Hibernate plugin to auto-generate baseline schema diffs into a new separate YAML changelog file when JPA entities are updated.
- Use Lombok's `@Slf4j` for logger instantiation across services.
- Run `./gradlew compileJava` inside `/backend` whenever JPA Entity attributes
  change so QueryDSL Q-Classes update properly.
- Handle all exceptions explicitly via `@RestControllerAdvice`.
- Guard all browser-only APIs with `isPlatformBrowser` checks in Angular
  components.
- Maintain Angular environment files (`src/environments/environment.ts` and `src/environments/environment.prod.ts`) with `fileReplacements` configured in `angular.json`.
- Import API URLs and environment-dependent configuration from `src/environments/environment` across all frontend services instead of hardcoding URLs.
- Use `NgOptimizedImage` (`ngSrc`) with explicit `width` and `height` (or `fill`) on all images to eliminate layout shifts (CLS = 0).
- Mark above-the-fold / hero images with `priority` attribute to accelerate LCP (< 1.2s).
- Maintain exactly one `<h1>` per view and enforce strict heading hierarchy (`h1` -> `h2` -> `h3`).
- Assign accessible names (`aria-label` or visible text) to all interactive elements, buttons, and links.
- Enforce WCAG 2.1 AA/AAA color contrast ratios (>= 4.5:1 for regular text, >= 3.0:1 for large text/borders).
- Associate all form controls programmatically with `<label for="...">` or `aria-labelledby`.
- Update document `<title>`, `<meta name="description">`, Open Graph, and Twitter Cards dynamically per route via `SeoService`.
- Inject structured JSON-LD Schema.org data (`Organization`, `BreadcrumbList`, `Article`, `FAQPage`) via `SchemaService`.
- Inject `<link rel="canonical">` and `hreflang` alternate links dynamically on route changes.
- Preload critical `.woff2` fonts with `<link rel="preload">` in `index.html` and specify `font-display: swap`.
- Use Angular `@defer (on viewport)` and `@defer (on idle)` for below-the-fold content and heavy PrimeNG components.
- Maintain compliant `robots.txt` and `sitemap.xml` in `/frontend/src/`.
- Ensure web app manifest has complete metadata, maskable icons (192x192, 512x512), and offline fallback page.
- Use Leaflet (`leaflet`) for map, spatial, or WebGIS capabilities, guarded with `isPlatformBrowser` or `@defer (when isBrowser)` for SSR safety.
- Use Apache ECharts (`echarts`) for all charting, dashboard analytics, and data visualization requirements, guarded with `isPlatformBrowser` or `@defer (when isBrowser)` for SSR safety and with auto-resize and `dispose()` cleanup.
- Suppress PrimeNG license banner by including `#p-license-host { display: none !important; }` in `styles.css` or `styles.scss`.
- Ensure Angular CLI persistent disk cache is disabled in `/frontend/angular.json` (`"cli": { "cache": { "enabled": false } }`).
- Set the PostgreSQL database name to strictly match the current project root directory name (e.g. `demo` for `/workspace/demo`) across `application.properties`, connection strings, and database creation scripts.
- Enforce UTF-8 encoding across all layers: backend (`options.encoding = 'UTF-8'` in Gradle, `server.servlet.encoding.charset=UTF-8` in Spring), frontend (`<meta charset="utf-8">`, UTF-8 without BOM for all TS/JSON/i18n files), and database (PostgreSQL `ENCODING 'UTF8'`).
- Build 100% fully responsive, mobile-first UI across all views, data tables, dialogs, and components (adaptive breakpoints `sm:`, `md:`, `lg:`, `xl:`, fluid containers, zero horizontal overflow on mobile viewports down to 320px, touch targets >= 48px).
- Ensure all Spring Boot `@RestController` classes declare a class-level `@RequestMapping` starting with `"/api/"` (e.g., `@RequestMapping("/api/...")`).
- Use `JwtAuthenticationFilter`, `JwtAuthenticationEntryPoint`, and `JwtAccessDeniedHandler` from `../base` (`com.example.base.security`) for Spring Security stateless token validation whenever the `base` library is accessible.
- Use `CustomPredicatesJoinBuilderJPA<T>` and `PNTableModel` from the `base` library in Spring Boot controllers when handling server-side table requests (`/getListTable`) from frontend `<app-table>` components.
- Maintain `graphify-out/` knowledge graph index by running `graphify update .` after adding, removing, or refactoring backend classes or frontend components.
- Use `graphify query`, `graphify path`, and `graphify explain` to navigate architecture and symbol relationships before performing broad codebase searches.

### DON'T:

- **DON'T write inline templates (`template: ...`) or inline styles (`styles: [...]`)** in Angular components.
- **DON'T generate unit test files** for frontend (`*.spec.ts`) or backend (`*Test.java`, `*Tests.java`).
- **DON'T create DTO classes** — use `@JsonResponseFilter`, `@JsonRequestFilter`
  , and `@ValidateModel` directly with entities and models.
- **DON'T** expose `@RestController` endpoints without a class-level `@RequestMapping` starting with `"/api/"` — all REST endpoints must reside under `/api/`.
- **DON'T** handcraft redundant or custom JWT authentication filters from scratch when `JwtAuthenticationFilter` is available in `../base`.
- **DON'T use `ResponseEntity` or `ResponseEntity<T>` in Spring Boot controllers** — return domain entities, `Page<T>`, collections, or `void` directly.
- **DON'T** use `@JsonResponseFilter(include = "*")` or omit the filter on
  endpoints returning entities — always specify allowed fields explicitly.
- **DON'T** hardcode LTR-only layout assumptions; ensure all templates adapt when `dir="rtl"`.
- **DON'T** use directional Tailwind classes (`ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`, `text-left`, `text-right`) or physical CSS properties (`margin-left`, `padding-right`, `left`, `right`).
- **DON'T** use `Long`, `Integer`, `BIGINT`, or sequence-generated IDs for
  entity primary keys — use `UUID` exclusively.
- **DON'T** write traditional Spring Data Query Methods (e.g., `findByFirstNameAndLastName`) — use QueryDSL predicates instead.
- **DON'T** annotate Spring Data JPA interfaces with `@Repository`.
- **DON'T** place backend and frontend code in a single unified directory
  structure without separate `/backend` and `/frontend` folders.
- **DON'T** use legacy Tailwind 3.x patterns (`tailwind.config.js`, `@tailwind base;`).
- **DON'T** use any external CDN URLs in HTML, CSS, or JS files.
- **DON'T** create Liquibase changelogs in XML (`.xml`), SQL (`.sql`), or JSON (`.json`) formats — use YAML exclusively.
- **DON'T** combine multiple independent changesets into a single YAML file or append new changesets to existing, already-committed changelog files.
- **DON'T** write raw changesets directly into `db.changelog-master.yaml` (master changelog must only include individual migration files).
- **DON'T** run `diffChangelog` without specifying a new unique target file, or overwrite/append to existing migration files.
- **DON'T** partition tables, JPA entities, or Liquibase migrations across multiple PostgreSQL schemas (e.g., separate schemas for `auth`, `billing`, `users`) — enforce a single-schema design.
- **DON'T** specify arbitrary or multiple `schema = "..."` attributes on `@Table`, `@Entity`, or Liquibase changeset definitions.
- **DON'T** create both `yarn.lock` and `package-lock.json` — use one package
  manager exclusively.
- **DON'T** write manual SQL migration scripts when Liquibase Hibernate plugin
  diffs can accurately generate the YAML changeset.
- **DON'T** write plain CSS/SCSS stylesheets when Tailwind CSS 4.x classes can
  achieve the layout.
- **DON'T** use Kotlin DSL (`build.gradle.kts`) or YAML (`application.yml`)
  configuration files for Spring Boot (Spring Boot configuration must use `application.properties`).
- **DON'T** use `@Autowired` field injection in Spring Boot; use Lombok `@RequiredArgsConstructor`.
- **DON'T** write raw SQL strings when QueryDSL or Spring Data JPA methods can
  express the query safely.
- **DON'T** use `any` type in Angular/TypeScript. Maintain strict type safety
  with interfaces/types matching backend entities/models.
- **DON'T** introduce external third-party libraries without explicit approval.
- **DON'T** access `window`, `document`, `localStorage`, or other browser
  globals in Angular components without `isPlatformBrowser` guard.
- **DON'T** hardcode backend URLs, API hostnames, or environment-dependent constants directly in Angular services, components, or interceptors — always reference `src/environments/environment`.
- **DON'T** use standard unoptimized `<img>` tags without `ngSrc` or omit explicit `width` and `height`.
- **DON'T** create icon-only buttons, interactive links, or actionable UI controls without accessible labels (`aria-label` or inner text).
- **DON'T** skip semantic heading levels in HTML templates (e.g., jumping from `<h1>` directly to `<h3>`).
- **DON'T** leave images without meaningful `alt` text (or `alt="" aria-hidden="true"` for purely decorative elements).
- **DON'T** hardcode static title or meta tags in `index.html` for routed pages — dynamically manage them via `SeoService`.
- **DON'T** omit canonical link tags or hreflang alternate tags on indexable routes.
- **DON'T** use non-crawlable links (e.g., `<a href="javascript:void(0)">` or `<div (click)="...">` without router navigation and accessible roles).
- **DON'T** introduce layout shifts (CLS > 0) with unreserved image/banner containers or unstabilized font swaps.
- **DON'T** allow any of the 5 Google Lighthouse benchmark audit scores (Performance, Accessibility, Best Practices, SEO, PWA) to drop below 100%.
- **DON'T** use `ngbase` components in public-facing routes or customer portal views — `ngbase` is strictly designated for the back-office / admin panel.
- **DON'T** manually handcraft boilerplate form HTML or raw PrimeNG tables from scratch in back-office views when `ngbase` is available — utilize `DynamicFormComponent` and `TableComponent`.
- **DON'T** create `ngbase` if `../base/angularbase` is missing — fall back cleanly to native PrimeNG components and Angular reactive forms.
- **DON'T** use generic, hardcoded, or mismatched database names (e.g., `mydb`, `test`, `app_db`, `postgres`) — always name the database after the current project root directory.
- **DON'T** use non-UTF-8 character encodings (e.g., ISO-8859-1, Windows-1256, ASCII) in backend configurations, source files, HTTP servlet filters, frontend assets, or PostgreSQL databases.
- **DON'T** use alternative mapping libraries (OpenLayers, Mapbox, Google Maps) when map or WebGIS features are required — use Leaflet.
- **DON'T** initialize Leaflet maps during SSR or access Leaflet DOM APIs without `isPlatformBrowser` guards.
- **DON'T** use Chart.js, Highcharts, or alternative charting libraries when charts or data visualizations are required — use Apache ECharts (`echarts`).
- **DON'T** initialize Apache ECharts instances during SSR or without proper `isPlatformBrowser` guards and `chart.dispose()` cleanup.
- **DON'T** leave `graphify-out/` stale after making structural code changes — always run `graphify update .`.
- **DON'T** leave Angular CLI persistent disk cache enabled in `/frontend/angular.json` (`.angular/cache`).
- **DON'T** design desktop-only views or hardcode fixed pixel widths on layout containers (`w-[800px]`, `min-w-[1200px]`) causing mobile horizontal scrolling.
- **DON'T** allow data tables, dialogs, or forms to bleed past screen boundaries or produce horizontal page overflow on mobile devices.
- **DON'T** handcraft manual filter/pagination parsers for `<app-table>` requests when `CustomPredicatesJoinBuilderJPA<T>` and `PNTableModel` are available in the `base` project.

- - -
## 5\. Definition of Done (Closure Criteria)

Before declaring a feature or bugfix complete, verify the following:


|\#|Criterion                                                                                      |How to Verify                                     |
|--|-----------------------------------------------------------------------------------------------|--------------------------------------------------|
|1 |Every Angular component has distinct `.ts`, `.html`, and `.scss` files — zero inline templates/styles|Search for `template:` and `styles:` in `.ts` files|
|2 |Angular SSR and PWA builds compile cleanly                                                     |`yarn build` in `/frontend`                       |
|3 |`../base` directory checked and included in `build.gradle` if present                          |Manual review                                     |
|3a|`../base/angularbase` checked and `ngbase` included in `/frontend/package.json` if present    |File check in `/frontend/package.json`            |
|3b|`ngbase` public components used exclusively in back-office panel when library available (all 14 components documented in guide); public views use tailored UI|Code review                                       |
|4 |No custom DTO classes; uses `@JsonResponseFilter`, `@JsonRequestFilter`, `@ValidateModel`      |Code search for `class.\*DTO`                     |
|5 |`@JsonResponseFilter` always has explicit field list (no wildcards)                            |Code review                                       |
|6 |Frontend supports full RTL and LTR layout modes                                                |Toggle `dir` attribute in browser                 |
|7 |All Tailwind classes use logical bidirectional properties                                      |Search for `ml-`, `mr-`, `pl-`, `pr-`             |
|8 |All JPA Entities use UUID primary keys                                                         |Code review                                       |
|9 |All repositories extend `JpaRepository<T, UUID>` + `QuerydslPredicateExecutor<T>`             |Code review                                       |
|10|QueryDSL predicates built in PredicateBuilder classes, not controllers                         |Code review                                       |
|11|No `@Repository` annotations on JPA interfaces                                                 |Code search                                       |
|12|All files in `/backend` or `/frontend` with no cross-contamination                             |Directory check                                   |
|13|Tailwind CSS 4.x configured via `@import "tailwindcss";` in `styles.css`                       |File check                                        |
|14|Tailwind `.postcssrc.json` exists with `@tailwindcss/postcss` plugin                           |File check                                        |
|15|`@theme` block defines custom colors, fonts, spacing in `styles.css`                           |File check                                        |
|16|`tailwind.config.js` does NOT exist (Tailwind 4 is CSS-first)                                  |File check                                        |
|17|Zero external CDN references                                                                   |Search for `cdn`, `https://` in HTML/CSS/JS       |
|18|All Liquibase changelogs in YAML format with strict one-file-per-changeset structure           |File extension & directory check in `db/changelog/changes/` |
|19|Single package manager (Yarn OR npm, not both)                                                 |Check for `yarn.lock` XOR `package-lock.json`     |
|20|Local PostgreSQL 16+ accessible on port 5432                                                   |`psql -c "SELECT version();"`                     |
|21|PostgreSQL database created matching current directory name with UTF8                          |`psql -h localhost -U app_user -d $(basename $PWD)` connects|
|22|`application-local.properties` exists with DB credentials (not committed)                      |File check + `.gitignore` check                   |
|23|Java 25 toolchain configured                                                                   |`./gradlew javaToolchains` in `/backend`          |
|24|Backend compiles and tests pass                                                                |`./gradlew test` in `/backend`                    |
|25|Liquibase migrations run cleanly                                                               |`./gradlew liquibaseUpdate` in `/backend`         |
|26|Angular frontend compiles                                                                      |`yarn ng build` in `/frontend`                    |
|27|All Gradle builds use Groovy syntax                                                            |File check (no `.kts`)                            |
|28|Spring Boot config in `application.properties`                                                 |File check (no `.yml`)                            |
|29|Browser globals guarded with `isPlatformBrowser`                                               |Code search for `window.`, `document.`, `localStorage.`|
|30|PredicateBuilder classes exist for complex queries                                             |Code review                                       |
|31|PrimeNG theme configured (Aura preset in `app.config.ts`)                                      |Code review                                       |
|32|PrimeNG CSS variables customized in `styles.css`                                               |File check                                        |
|33|PrimeNG component imports are explicit in standalone components                                |Code review                                       |
|34|Font files stored locally in `assets/fonts/` \+ `@font-face` in CSS                            |File check                                        |
|35|Dark mode support via `.dark` class (if applicable)                                            |Code review                                       |
|36|Angular environment files exist (`src/environments/environment.ts`, `environment.prod.ts`) with `fileReplacements` in `angular.json`|File check in `src/environments/` and `angular.json`|
|37|PostgreSQL database design is strictly single schema (no multi-schema fragmentation)           |Code review of JPA entities and Liquibase changesets|
|38|Lighthouse Performance score >= 95–100 (LCP < 1.2s, INP < 100ms, CLS = 0.000)               |Run Lighthouse CI / DevTools Audit on production build|
|39|Lighthouse Accessibility score = 100 (WCAG 2.1 AA/AAA, contrast, ARIA names, form labels)   |Run Lighthouse CI / axe DevTools                       |
|40|Lighthouse Best Practices score = 100 (HTTPS, zero console errors/warnings, CSP headers)     |Run Lighthouse CI Audit                                |
|41|Lighthouse SEO score = 100 (Meta tags, crawlable links, canonical, robots.txt, sitemap.xml)  |Run Lighthouse CI Audit                                |
|42|Lighthouse PWA score = 100 / Installable (Manifest complete, maskable icons, offline fallback)|Run Lighthouse PWA Audit                              |
|43|Zero bare `<img>` tags; all images use `NgOptimizedImage` with explicit `width` & `height`   |Search for `<img(?!.*ngSrc)` in HTML templates         |
|44|Dynamic Title, Meta Description, Canonical, and JSON-LD structured data validated per route  |Verify page source and Schema.org rich results test    |
|45|Valid `robots.txt` and `sitemap.xml` present in `/frontend/src/`                             |File check in `/frontend/src/`                         |
|46|Zero layout shift during client hydration                                                    |Verify CLS = 0 during hydration in Chrome DevTools     |
|47|Maps & WebGIS use Leaflet, client-side only (isPlatformBrowser/@defer), zero CDN assets|Code review of map components                          |
|48|PrimeNG license host banner suppressed (`#p-license-host { display: none !important; }` in `styles.css`/`styles.scss`)|File check in `/frontend/src/`|
|49|Angular CLI persistent disk cache disabled (`cli.cache.enabled = false` in `angular.json`)|`yarn ng cache info` or file check in `angular.json`|
|50|Zero `ResponseEntity` usage in Spring controllers (methods return entity/Page/collection directly)|Code search for `ResponseEntity` in `/backend/src/main/java/**/controller/`|
|51|Knowledge graph up-to-date (`graphify update .` executed cleanly; `graphify-out/graph.json` present)|Run `graphify update .` and verify `graphify-out/graph.json`|
|52|UI is 100% responsive across viewports (tested at Mobile 320px–375px, Tablet 768px, Desktop 1024px+; zero horizontal overflow; touch targets >= 48px)|Test responsive viewport emulation in browser / DevTools|
|53|Backend endpoint for `<app-table>` uses `CustomPredicatesJoinBuilderJPA<T>` with `PNTableModel`|Code review of controller `/getListTable` endpoint|
|54|Charts & analytics visualizations use Apache ECharts (`echarts`), client-side guarded, auto-resizing, and zero CDN|Code review of chart components|
|55|Full-stack UTF-8 encoding enforced across backend (Gradle/Spring), frontend (<meta charset="utf-8">, JSON/i18n), and PostgreSQL (database encoding UTF8)|Verify with file encoding, response headers, and `SHOW server_encoding;` in psql|
|56|All backend `@RestController` classes define class-level `@RequestMapping` starting with `"/api/"`|Code search for `@RestController` in `/backend/src/main/java/` and verify `@RequestMapping("/api/...")`|
|57|JWT security uses `JwtAuthenticationFilter` from `base` library (added before `UsernamePasswordAuthenticationFilter` in `SecurityConfig`)|Code review of `SecurityConfig` and filter imports|

- - -
## Appendix: Technology Version Matrix


|Technology  |Version |Notes                                                     |
|------------|--------|----------------------------------------------------------|
|Java        |25 (LTS)|Records, sealed classes, pattern matching, virtual threads|
|Spring Boot |4.x.x   |Latest stable 3.x release                                 |
|Angular     |22      |Signals, standalone components, SSR                       |
|PrimeNG     |22      |Compatible with Angular 19                                |
|Tailwind CSS|4.x     |CSS-first config, logical properties                      |
|Leaflet     |1.9.x+  |Standard map & WebGIS library (client-side only)          |
|Apache ECharts|5.x+  |Standard charts & visualization library (client-side only) |
|Graphify    |CLI     |AST & structural knowledge graph for codebase navigation  |
|PostgreSQL  |18+     |Latest stable release                                     |
|Liquibase   |4.x     |YAML changelogs + Hibernate plugin                        |
|QueryDSL    |5.x     |JPA annotation processor                                  |
|Lombok      |1.18.x  |Latest stable                                             |
|Node.js     |22+     |LTS version                                               |
|Yarn        |1.22+   |Classic Yarn (or Yarn Berry if configured)                |

- - -
## Appendix: Recommended Project Structure

```
project-root/

├── backend/

│   ├── build.gradle

│   ├── settings.gradle

│   └── src/

│       └── main/

│           ├── java/com/example/

│           │   ├── controller/

│           │   │   └── UserController.java

│           │   ├── service/

│           │   │   └── UserService.java

│           │   ├── repository/

│           │   │   └── UserRepository.java

│           │   ├── entity/

│           │   │   └── User.java

│           │   ├── predicate/

│           │   │   └── UserPredicateBuilder.java

│           │   └── config/

│           │       └── SecurityConfig.java

│           └── resources/

│               ├── application.properties

│               ├── application-local.properties   # DB credentials (git-ignored)

│               └── db/

│                   └── changelog/

│                       ├── db.changelog-master.yaml

│                       └── changes/

│                           └── 001-initial-schema.yaml

├── frontend/

│   ├── angular.json

│   ├── package.json

│   ├── yarn.lock

│   ├── tsconfig.json
│   ├── .postcssrc.json              # Tailwind 4 PostCSS config
│   ├── lighthouserc.json            # Lighthouse CI configuration (100% benchmark thresholds)
│   └── src/
│       ├── environments/
│       │   ├── environment.ts               # Base / Development environment configuration
│       │   └── environment.prod.ts          # Production environment overrides
│       ├── index.html               # Font preloading, meta viewport, PWA manifest link
│       ├── robots.txt               # Search bot crawling rules
│       ├── sitemap.xml              # Search engine indexable URL map
│       ├── styles.css               # Tailwind @import + PrimeNG theme + @theme + @font-face + #p-license-host
│       ├── main.ts
│       ├── main.server.ts
│       ├── ngsw-config.json         # PWA service worker config
│       ├── manifest.webmanifest     # PWA manifest (maskable icons, theme colors)
│       ├── app/
│       │   ├── app.component.ts
│       │   ├── app.component.html
│       │   ├── app.component.scss
│       │   ├── app.routes.ts
│       │   ├── app.config.ts        # PrimeNG + provideClientHydration() config
│       │   ├── models/
│       │   │   ├── user.model.ts
│       │   │   ├── metadata.model.ts    # SEO & Open Graph interfaces
│       │   │   └── index.ts
│       │   ├── services/
│       │   │   ├── user.service.ts
│       │   │   ├── seo.service.ts       # Dynamic Title, Meta, OG, Twitter, Canonical
│       │   │   ├── schema.service.ts    # JSON-LD Structured Data (Organization, Breadcrumbs, etc.)
│       │   │   ├── i18n.service.ts
│       │   │   ├── direction.service.ts
│       │   │   └── theme.service.ts   # Dark mode toggle
│       │   ├── components/
│       │   │   ├── offline-fallback/    # PWA offline fallback shell
│       │   │   │   ├── offline-fallback.component.ts
│       │   │   │   ├── offline-fallback.component.html
│       │   │   │   └── offline-fallback.component.scss
│       │   │   └── user/
│       │   │       ├── user-list.component.ts
│       │   │       ├── user-list.component.html
│       │   │       ├── user-list.component.scss

│       │   │       ├── user-detail.component.ts

│       │   │       ├── user-detail.component.html

│       │   │       ├── user-detail.component.scss

│       │   │       ├── user-form.component.ts

│       │   │       ├── user-form.component.html

│       │   │       └── user-form.component.scss

│       │   └── guards/

│       │       └── browser.guard.ts

│       └── assets/

│           ├── fonts/

│           │   ├── Vazirmatn-Regular.woff2

│           │   ├── Vazirmatn-Medium.woff2

│           │   └── Vazirmatn-Bold.woff2

│           ├── icons/

│           └── i18n/

│               ├── en.json

│               └── fa.json

└── base/                           # Optional shared library

    ├── build.gradle

    ├── src/

        └── main/java/com/example/base/

            ├── annotation/

            │   ├── JsonResponseFilter.java

            │   ├── JsonRequestFilter.java

            │   └── ValidateModel.java

            ├── entity/

            │   └── BaseEntity.java

            └── exception/

                └── ResourceNotFoundException.java

    └── angularbase/                # Shared Angular base library (ngbase)

        ├── package.json

        ├── projects/

        │   └── ngbase/

        └── dist/

            └── ngbase/             # Built package referenced by /frontend

```
## Appendix: Quick Start Checklist

```bash
# 0. Git Initialization
git init
git add .
git commit -m "chore: initial project commit"

# 1. PostgreSQL Setup (UTF-8 & Database Name Matching Directory)
# Set DB_NAME to the project folder name (e.g., 'demo')
DB_NAME=$(basename "$PWD")
sudo systemctl start postgresql
sudo -i -u postgres
createuser --interactive --pwprompt app_user
createdb -E UTF8 -O app_user "$DB_NAME"
exit

# 2. Backend Setup
cd backend
./gradlew build
./gradlew liquibaseUpdate      # run first migration
./gradlew bootRun               # start Spring Boot on :8080

# 3. Frontend Setup
cd frontend
yarn install                    # install dependencies
yarn ng build                   # verify build
yarn ng serve                   # start Angular on :4200

# 4. Generate / Refresh Knowledge Graph
graphify update .

# 5. Verify Everything
psql -h localhost -U app_user -d "$(basename "$PWD")" -c "SELECT version();"
curl http://localhost:8080/actuator/health
open http://localhost:4200
```

