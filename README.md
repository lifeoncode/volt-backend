# 🔒️ Volt

Volt is a secure, modern password manager. This is the backend service powering the Volt ecosystem - including the web app, mobile app, and browser extension. This API handles user authentication, vault storage, encryption, and more.

# 🧭 Table of Contents

- [📦️ Tech Stack](#️-tech-stack)
- [🧮 Architecture](#-architecture)
- [✨ Features](#-features)
- [🚀 Getting Started](#-getting-started)
- [🧪 Environment Variables](#-environment-variables)
- [👨‍🔬 Testing](#-testing)
- [📖 API Documentation](#-api-documentation)
- [🔒 Security](#-security)
- [🧬 Database Schema](#-database-schema)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

### 📦️ Tech Stack

- **Language:** TypeScript
- **Runtime:** Node.js
- **Framework:** Express
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** JWT (Access & Refresh tokens), Cookies
- **Hashing & Encryption:** bcrypt, Crypto (AES-256)
- **Containerization:** Docker (planned)
- **Hosting:** DigitalOcean VPS (planned)

### 🧮 Architecture

Volt follows a modular architecture with a clear separation of concerns:

- **Controller Layer:** Handles request validation and response shaping.
- **Service Layer:** Core business logic and orchestration.
- **Repository Layer (Prisma):** Database access abstraction.
- **Middlewares:** Handles auth, error handling, rate limiting, etc.
- **Utilities:** Encryption, hashing, cookie helpers, etc.

### ✨ Features

Some of the features listed below are planned features that are work in progress

- 🔐 User Authentication (Sign up, login, logout)
- 🧠 Password Vault (CRUD secrets/passwords)
- 🔄 Token Refresh with rotating refresh tokens
- 🧊 End-to-End Encryption for user vaults
- 🛡️ Security Best Practices (Helmet, rate limiting, etc.)
- 🔍 Audit Logs (planned)
- 📊 Password health reports (planned)
- ⚠️ Regular vulnerability scans (planned)

### 🚀 Getting Started

To run this application in your local environment, you're gonna need a few things first:

- A terminal, obviously😌
- Node.js v18+
- PostgreSQL v14+
- npm

Clone the Repository

```
git clone https://github.com/lifeoncode/volt-backend.git
cd volt-backend
npm install
```

Setup the Database

```
npx prisma migrate dev --name init
```

Start the Server

```
npm run dev
```

Server will run on either http://localhost:4000 or http://localhost:8000 by default.

### 🧪 Environment Variables

See [.env.example](.env.example) for all available variables and instructions.

## 👨‍🔬 Testing

Volt backend/API uses [Jest](https://jestjs.io/) and [Supertest](https://github.com/ladjs/supertest) for testing.

To run tests locally:

```
npm run test
```

Tests cover:

- Authentication flows
- Vault CRUD operations
- Error handling
- Security edge case
- Helper functions

## 🤖 Continuous Integration (CI)

Volt uses GitHub Actions for Continuous Integration. All tests are automatically run on every push or pull request to the main branch. Have a look at the [.github/workflows/ci.yml](.github/workflows/ci.yml) for steps included in this process.

### 📖 API Documentation

In Progress: Volt will support full OpenAPI (Swagger) documentation soon.

Basic route overview:

```
POST /volt/api/auth/register
```

Registers a new user

```
POST /volt/api/auth/login
```

Logs in and sets auth cookies

```
GET /volt/api/user
```

Get logged-in user account details

```
PUT /volt/api/user/
```

Update logged-in user account details

```
DELETE /volt/api/user
```

Delete logged-in user account

```
GET /volt/api/password
```

Get all secrets for the logged-in user

```
GET /volt/api/password/:id
```

Get single secret for the logged-in user

```
POST /volt/api/password
```

Add a new password/secret

```
PUT /volt/api/password/:id
```

Update a secret

```
DELETE /volt/api/password/:id
```

Delete a secret

### 🔒 Security

- 🔐 All passwords and secrets are hashed/encrypted using (bcrypt, Crypto, AES-256-GCM).
- 🛡️ Follows OWASP best practices.
- 🧼 Input sanitization & strict validation
- 🕵️ Secure cookies (HttpOnly, SameSite, Short-lived)
- ⚠️ Secrets stored encrypted (decryption performed on authenticated query)

### 🧬 Database Schema

Powered by Prisma.

```prisma

model User {
    id String               @id @default(uuid()) @db.Uuid
    username String         @unique
    email String            @unique
    password String
    secret_key String
    recovery_otp String?
    createdAt DateTime      @default(now())
    updatedAt DateTime      @updatedAt
    PasswordCredential      PasswordCredential[]
}

model PasswordCredential {
    id String           @id @default(uuid()) @db.Uuid
    user_id String      @db.Uuid
    user User           @relation(fields: [user_id], references: [id], onDelete: Cascade)
    service String
    service_user_id String
    password String
    notes String?
    createdAt DateTime  @default(now())
    updatedAt DateTime  @updatedAt
}

```

### 🤝 Contributing

PRs and suggestions welcome! If you’d like to contribute:

- Fork the repo
- Create your feature branch (git checkout -b feature/your-feature)
- Commit your changes (git commit -am 'New feature')
- Push to the branch (git push origin feature/your-feature)
- Open a Pull Request

### 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
