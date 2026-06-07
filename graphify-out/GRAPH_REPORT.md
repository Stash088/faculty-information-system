# Graph Report - .  (2026-06-07)

## Corpus Check
- 71 files · ~182,565 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 395 nodes · 539 edges · 24 communities (17 shown, 7 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Frontend API & Token Refresh|Frontend API & Token Refresh]]
- [[_COMMUNITY_Database Models (Sequelize)|Database Models (Sequelize)]]
- [[_COMMUNITY_Middleware & Routes (Express)|Middleware & Routes (Express)]]
- [[_COMMUNITY_Content Controllers (CRUD)|Content Controllers (CRUD)]]
- [[_COMMUNITY_Diploma Actors & Tech Stack|Diploma: Actors & Tech Stack]]
- [[_COMMUNITY_Authentication (Login, Email, JWT)|Authentication (Login, Email, JWT)]]
- [[_COMMUNITY_Express App & Error Handling|Express App & Error Handling]]
- [[_COMMUNITY_Applicant Page Frontend|Applicant Page Frontend]]
- [[_COMMUNITY_Upload Middleware & API Errors|Upload Middleware & API Errors]]
- [[_COMMUNITY_Applicant Content Controller|Applicant Content Controller]]
- [[_COMMUNITY_Database Seeders|Database Seeders]]
- [[_COMMUNITY_Diploma CourseGroupDepartment|Diploma: Course/Group/Department]]
- [[_COMMUNITY_TokenService (Refresh & Reset)|TokenService (Refresh & Reset)]]
- [[_COMMUNITY_Diploma Citations & References|Diploma: Citations & References]]
- [[_COMMUNITY_Admin Use Cases (UC-04..06)|Admin Use Cases (UC-04..06)]]
- [[_COMMUNITY_Admin API Surface|Admin API Surface]]
- [[_COMMUNITY_Applicant Actor & Landing UC|Applicant Actor & Landing UC]]
- [[_COMMUNITY_News Entity & Screenshot|News Entity & Screenshot]]
- [[_COMMUNITY_Methodist Role|Methodist Role]]
- [[_COMMUNITY_Student Role|Student Role]]
- [[_COMMUNITY_Applicant Role|Applicant Role]]
- [[_COMMUNITY_Stats API|Stats API]]
- [[_COMMUNITY_Node.js Tech Stack|Node.js Tech Stack]]

## God Nodes (most connected - your core abstractions)
1. `{ Sequelize }` - 13 edges
2. `seedDatabase()` - 13 edges
3. `ApiError` - 12 edges
4. `TokenService` - 10 edges
5. `User` - 8 edges
6. `Diploma thesis v2 (revised, 11 entities, expanded test cases)` - 8 edges
7. `register` - 6 edges
8. `authenticate()` - 6 edges
9. `Role` - 6 edges
10. `Actor: Student (ФТ-С1..С5)` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Figure 02: Dashboard (home page post-login, sidebar nav)` --references--> `Actor: Student (ФТ-С1..С5)`  [INFERRED]
  figures/02_dashboard.png → graphify-out/converted/Кузьминова Диплом 1-2 печать_финал_v2_379d5522.md
- `Figure 05: User profile (personal data + change password)` --references--> `Actor: Student (ФТ-С1..С5)`  [INFERRED]
  figures/05_profile.png → graphify-out/converted/Кузьминова Диплом 1-2 печать_финал_v2_379d5522.md
- `Test PDF: 1780438779416_7146043_test-lecture-v2.pdf (lecture material)` --implements--> `ER entity: Material (учебный материал)`  [INFERRED]
  backend/uploads/1780438779416_7146043_test-lecture-v2.pdf → graphify-out/converted/Кузьминова Диплом 1-2 печать_финал_v2_379d5522.md
- `Test PDF: 1780438981653_436134671_test-pdf.pdf (sample material)` --implements--> `ER entity: Material (учебный материал)`  [INFERRED]
  backend/uploads/1780438981653_436134671_test-pdf.pdf → graphify-out/converted/Кузьминова Диплом 1-2 печать_финал_v2_379d5522.md
- `Figure 01: Login page (email/password form)` --references--> `Use case UC-01: User authentication`  [EXTRACTED]
  figures/01_login.png → graphify-out/converted/Кузьминова Диплом 1-2 печать_финал_v2_379d5522.md

## Hyperedges (group relationships)
- **Three-tier tech stack (Node+Express / React / PostgreSQL)** — diploma_tech_node, diploma_tech_express, diploma_tech_react, diploma_tech_postgres [EXTRACTED 1.00]
- **JWT authentication flow (use case + tech + entity)** — diploma_uc_auth, diploma_tech_jwt, diploma_entity_refresh_token, diploma_entity_password_reset [EXTRACTED 0.95]
- **RBAC roles (5 roles from diploma matching README)** — diploma_actor_admin, diploma_actor_methodist, diploma_actor_teacher, diploma_actor_student, diploma_actor_applicant [EXTRACTED 1.00]

## Communities (24 total, 7 thin omitted)

### Community 0 - "Frontend API & Token Refresh"
Cohesion: 0.06
Nodes (19): api, refreshSubscribers, refreshToken, token, navItems, ForgotPasswordPage(), LoginPage(), ProfilePage() (+11 more)

### Community 1 - "Database Models (Sequelize)"
Cohesion: 0.05
Nodes (37): { Sequelize }, ApplicantContent, { DataTypes }, { sequelize }, Course, { DataTypes }, { sequelize }, { DataTypes } (+29 more)

### Community 2 - "Middleware & Routes (Express)"
Cohesion: 0.06
Nodes (40): authenticate(), logger, optionalAuth(), tokenService, { User, Role }, requireAdmin, requireMaterialOwnerOrAdmin(), requireMethodist (+32 more)

### Community 3 - "Content Controllers (CRUD)"
Cohesion: 0.07
Nodes (37): { ApiError }, { Course, Group }, current, defaultTimes, endDateObj, endDateTime, eventDate, events (+29 more)

### Community 4 - "Diploma: Actors & Tech Stack"
Cohesion: 0.06
Nodes (32): Actor: Guest (ФТ-Г1), Actor: Student (ФТ-С1..С5), Actor: Teacher (ФТ-П1..П4), Testing framework: Jest (18 manual + auto test cases), Tech stack: Express.js 4.18+, Tech stack: helmet + express-rate-limit + express-validator + winston, Tech stack: JWT (jsonwebtoken) + bcryptjs, Tech stack: multer (file upload, 10MB limit) (+24 more)

### Community 5 - "Authentication (Login, Email, JWT)"
Cohesion: 0.08
Nodes (26): { ApiError }, authConfig, bcrypt, crypto, decoded, emailService, errors, expiresAt (+18 more)

### Community 6 - "Express App & Error Handling"
Cohesion: 0.09
Nodes (25): testConnection(), errorHandler(), logger, notFoundHandler(), syncModels(), app, applicantContentRoutes, authRoutes (+17 more)

### Community 7 - "Applicant Page Frontend"
Cohesion: 0.12
Nodes (9): getApplicantContent(), updateApplicantContent(), EMPTY_DOC, EMPTY_FAQ, EMPTY_PROGRAM, EMPTY_TIMELINE, DEFAULT_CONTENT, ICON_KEYS (+1 more)

### Community 8 - "Upload Middleware & API Errors"
Cohesion: 0.11
Nodes (9): ApiError, { ApiError }, config, fs, multer, path, storage, upload (+1 more)

### Community 9 - "Applicant Content Controller"
Cohesion: 0.14
Nodes (14): { ApplicantContent, User }, DEFAULT_CONTENT, ensureContent(), getApplicantContent(), logger, updateApplicantContent(), ApplicantContent, consoleFormat (+6 more)

### Community 10 - "Database Seeders"
Cohesion: 0.25
Nodes (13): isDataSeeded(), logger, { Role, User, Department, Group, Course, News, Material, Schedule, ApplicantContent }, seedApplicantContent(), seedCourses(), seedDatabase(), seedDepartments(), seedGroups() (+5 more)

### Community 11 - "Diploma: Course/Group/Department"
Cohesion: 0.15
Nodes (13): Actor: Methodist (ФТ-М1..М2), ER entity: Course (дисциплина), ER entity: Department (кафедра), ER entity: Group (учебная группа), ER entity: Material (учебный материал), ER entity: PasswordResetToken, ER entity: RefreshToken, ER entity: Role (admin/teacher/methodist/student/applicant) (+5 more)

### Community 13 - "Diploma: Citations & References"
Cohesion: 0.22
Nodes (9): Citation [5]: 1С:Университет ПРОФ, Citation [7]: Blackboard Learn, Citation [8]: Canvas LMS, Citation [1]: Federal project 'Цифровая образовательная среда', Citation [2]: ФГОС ВО (fgos.ru), Citation [6]: Галактика Управление Вузом, Citation [4]: Moodle LMS (docs.moodle.org), Diploma thesis v1 (Кузьминова, диплом 1-2 печать) (+1 more)

### Community 14 - "Admin Use Cases (UC-04..06)"
Cohesion: 0.5
Nodes (4): Actor: Admin (ФТ-А1..А6), Use case UC-06: News management (admin), Use case UC-05: Schedule management (admin), Use case UC-04: User management (admin)

### Community 15 - "Admin API Surface"
Cohesion: 0.67
Nodes (3): Admin content CRUD API (news, courses, schedule, departments, groups), Users API (CRUD, toggle-block, roles, profile), Role admin (full access)

### Community 16 - "Applicant Actor & Landing UC"
Cohesion: 0.67
Nodes (3): Actor: Applicant (ФТ-Аб1), ER entity: ApplicantContent (lending JSONB), Use case UC-07: Landing edit (admin)

## Knowledge Gaps
- **223 isolated node(s):** `navItems`, `EMPTY_PROGRAM`, `EMPTY_TIMELINE`, `EMPTY_DOC`, `EMPTY_FAQ` (+218 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `app` connect `Express App & Error Handling` to `Frontend API & Token Refresh`?**
  _High betweenness centrality (0.225) - this node is a cross-community bridge._
- **Why does `ApiError` connect `Upload Middleware & API Errors` to `Content Controllers (CRUD)`, `Authentication (Login, Email, JWT)`, `Express App & Error Handling`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `TokenService` connect `TokenService (Refresh & Reset)` to `Authentication (Login, Email, JWT)`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `navItems`, `EMPTY_PROGRAM`, `EMPTY_TIMELINE` to the rest of the system?**
  _223 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Frontend API & Token Refresh` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Database Models (Sequelize)` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Middleware & Routes (Express)` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._