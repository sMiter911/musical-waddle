#!/usr/bin/env bash
# =============================================================================
# init.sh — Bootstrap a Next.js project with TypeScript, Tailwind CSS v4,
#           Prisma 6 (PostgreSQL), and Better-Auth 1.4+
#
# Usage:
#   chmod +x init.sh && ./init.sh
#   Or: bash init.sh
#
# Compatible with: Linux, macOS, Windows Git Bash
# =============================================================================

set -e

# -----------------------------------------------------------------------------
# Color helpers (gracefully degrade if terminal doesn't support them)
# -----------------------------------------------------------------------------
if [ -t 1 ] && command -v tput &>/dev/null && tput colors &>/dev/null 2>&1; then
  GREEN=$(tput setaf 2)
  YELLOW=$(tput setaf 3)
  RED=$(tput setaf 1)
  CYAN=$(tput setaf 6)
  BOLD=$(tput bold)
  RESET=$(tput sgr0)
else
  GREEN=""
  YELLOW=""
  RED=""
  CYAN=""
  BOLD=""
  RESET=""
fi

log_info()    { echo "${GREEN}[INFO]${RESET}  $*"; }
log_warn()    { echo "${YELLOW}[WARN]${RESET}  $*"; }
log_error()   { echo "${RED}[ERROR]${RESET} $*" >&2; }
log_step()    { echo ""; echo "${CYAN}${BOLD}==> $*${RESET}"; }
log_success() { echo "${GREEN}${BOLD}$*${RESET}"; }

# -----------------------------------------------------------------------------
# Step 1 — Prerequisite checks
# -----------------------------------------------------------------------------
log_step "Step 1 — Checking prerequisites"

check_command() {
  if ! command -v "$1" &>/dev/null; then
    log_error "'$1' is required but not found in PATH."
    log_error "Please install Node.js (https://nodejs.org) and ensure npm/npx are available."
    exit 1
  fi
  log_info "Found: $1"
}

check_command node
check_command npm
check_command npx
check_command git

NODE_MAJOR=$(node -e "process.stdout.write(String(parseInt(process.version.slice(1))))")
if [ "$NODE_MAJOR" -lt 18 ]; then
  log_warn "Node.js >= 18 is recommended for Next.js 15+. You have: $(node --version)"
fi

# -----------------------------------------------------------------------------
# Step 2 — Prompt for project name
# -----------------------------------------------------------------------------
log_step "Step 2 — Project configuration"

read -r -p "${CYAN}Enter project name${RESET} [default: my-app]: " PROJECT_NAME
PROJECT_NAME="${PROJECT_NAME:-my-app}"

if ! echo "$PROJECT_NAME" | grep -qE '^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$'; then
  log_error "Project name must be lowercase, start/end with alphanumeric, and only contain letters, digits, or hyphens."
  exit 1
fi

if [ -d "$PROJECT_NAME" ]; then
  log_warn "Directory './$PROJECT_NAME' already exists."
  read -r -p "${YELLOW}Continue anyway? [y/N]: ${RESET}" CONFIRM
  case "$CONFIRM" in
    [yY][eE][sS]|[yY]) log_warn "Proceeding into existing directory." ;;
    *) log_info "Aborted."; exit 0 ;;
  esac
fi

log_info "Project: ${BOLD}$PROJECT_NAME${RESET}"

# -----------------------------------------------------------------------------
# Step 3 — Create Next.js app
# -----------------------------------------------------------------------------
log_step "Step 3 — Creating Next.js app"

npx create-next-app@latest "$PROJECT_NAME" \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --no-eslint \
  --import-alias "@/*"

PROJECT_DIR="$(pwd)/$PROJECT_NAME"
cd "$PROJECT_DIR"

# -----------------------------------------------------------------------------
# Step 4 — Install dependencies
# -----------------------------------------------------------------------------
log_step "Step 4 — Installing dependencies"

log_info "Production: better-auth, @prisma/client, prisma, lucide-react"
npm install better-auth @prisma/client prisma lucide-react

log_info "Dev: tsx"
npm install --save-dev tsx

# -----------------------------------------------------------------------------
# Step 5 — Write source files
# -----------------------------------------------------------------------------
log_step "Step 5 — Writing source files"

mkdir -p "$PROJECT_DIR/src/lib"

# --- src/lib/db.ts ---
log_info "Writing src/lib/db.ts"
cat > "$PROJECT_DIR/src/lib/db.ts" << 'EOF'
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
EOF

# --- src/lib/auth.ts ---
log_info "Writing src/lib/auth.ts"
cat > "$PROJECT_DIR/src/lib/auth.ts" << 'EOF'
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ["google"],
            allowDifferentEmails: true,
        },
    },
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? {
                  google: {
                      clientId: process.env.GOOGLE_CLIENT_ID!,
                      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                  },
              }
            : {}),
        ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
            ? {
                  facebook: {
                      clientId: process.env.FACEBOOK_CLIENT_ID!,
                      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
                  },
              }
            : {}),
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "user",
            },
        },
    },
});
EOF

# --- src/lib/auth-client.ts ---
log_info "Writing src/lib/auth-client.ts"
cat > "$PROJECT_DIR/src/lib/auth-client.ts" << 'EOF'
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
EOF

# --- src/app/api/auth/[...all]/route.ts ---
log_info "Writing src/app/api/auth/[...all]/route.ts"
mkdir -p "$PROJECT_DIR/src/app/api/auth/[...all]"
cat > "$PROJECT_DIR/src/app/api/auth/[...all]/route.ts" << 'EOF'
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Force Node.js runtime — Edge runtime is incompatible with Prisma
export const runtime = "nodejs";

export const { GET, POST } = toNextJsHandler(auth);
EOF

# --- src/middleware.ts ---
log_info "Writing src/middleware.ts"
cat > "$PROJECT_DIR/src/middleware.ts" << 'EOF'
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    url.pathname = "/api/auth/get-session";

    const response = await fetch(url, {
        headers: {
            cookie: request.headers.get("cookie") || "",
        },
    });

    const session = await response.json().catch(() => null);

    const { pathname } = request.nextUrl;

    // Protect Admin routes — requires role === "admin"
    if (pathname.startsWith("/admin")) {
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // Protect authenticated-only routes
    if (pathname.startsWith("/dashboard")) {
        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/dashboard/:path*",
    ],
};
EOF

# -----------------------------------------------------------------------------
# Step 6 — Write Prisma schema
# -----------------------------------------------------------------------------
log_step "Step 6 — Writing Prisma schema"

mkdir -p "$PROJECT_DIR/prisma"
log_info "Writing prisma/schema.prisma"
cat > "$PROJECT_DIR/prisma/schema.prisma" << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Better-Auth Required Models ──────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  role          String    @default("user") // "user" | "admin"
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sessions Session[]
  accounts Account[]
}

model Session {
  id        String   @id @default(cuid())
  expiresAt DateTime
  token     String   @unique
  ipAddress String?
  userAgent String?

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Account {
  id                    String    @id @default(cuid())
  accountId             String
  providerId            String
  userId                String
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ─── Your Domain Models (add below) ───────────────────────────────────────
EOF

# -----------------------------------------------------------------------------
# Step 7 — Write .env.local
# -----------------------------------------------------------------------------
log_step "Step 7 — Writing .env.local"

ENV_FILE="$PROJECT_DIR/.env.local"

if [ -f "$ENV_FILE" ]; then
  log_warn ".env.local already exists — skipping to avoid overwriting secrets."
else
  # Note: unquoted heredoc delimiter so $PROJECT_NAME is expanded
  cat > "$ENV_FILE" << EOF
# ──────────────────────────────────────────────────────────
# Database
# ──────────────────────────────────────────────────────────
DATABASE_URL=postgresql://postgres:password@localhost:5432/${PROJECT_NAME}?schema=public

# ──────────────────────────────────────────────────────────
# Better-Auth
# Generate a strong secret: openssl rand -base64 32
# ──────────────────────────────────────────────────────────
BETTER_AUTH_SECRET=change-this-to-a-secure-random-string-in-production
BETTER_AUTH_URL=http://localhost:3000

# ──────────────────────────────────────────────────────────
# Public App URL (used by auth-client.ts)
# ──────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ──────────────────────────────────────────────────────────
# Optional OAuth Providers (uncomment and fill to enable)
# ──────────────────────────────────────────────────────────
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# FACEBOOK_CLIENT_ID=
# FACEBOOK_CLIENT_SECRET=
EOF
  log_info ".env.local written."
fi

# Ensure .env.local is in .gitignore
GITIGNORE="$PROJECT_DIR/.gitignore"
if [ -f "$GITIGNORE" ]; then
  if ! grep -q "\.env\.local" "$GITIGNORE"; then
    echo ".env.local" >> "$GITIGNORE"
    log_info "Added .env.local to .gitignore"
  else
    log_info ".env.local already in .gitignore"
  fi
fi

# -----------------------------------------------------------------------------
# Step 8 — Add db:* scripts to package.json
# Uses node -e for cross-platform JSON editing (avoids sed/awk portability issues)
# -----------------------------------------------------------------------------
log_step "Step 8 — Adding db:* scripts to package.json"

node -e "
const fs = require('fs');
const path = '$PROJECT_DIR/package.json'.replace(/\\\\/g, '/');
const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));

const dbScripts = {
  'db:generate': 'npx prisma generate',
  'db:push':     'npx prisma db push',
  'db:migrate':  'npx prisma migrate dev',
  'db:studio':   'npx prisma studio',
};

let changed = false;
for (const [key, value] of Object.entries(dbScripts)) {
  if (!pkg.scripts[key]) {
    pkg.scripts[key] = value;
    changed = true;
  }
}

if (changed) {
  fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
  console.log('  db:* scripts added.');
} else {
  console.log('  db:* scripts already present — skipping.');
}
"

# -----------------------------------------------------------------------------
# Step 9 — Run prisma generate
# -----------------------------------------------------------------------------
log_step "Step 9 — Generating Prisma client"

if [ -z "${DATABASE_URL:-}" ]; then
  log_warn "DATABASE_URL not set in shell — Prisma will read it from .env.local at runtime."
fi

npx prisma generate --schema="$PROJECT_DIR/prisma/schema.prisma"

# -----------------------------------------------------------------------------
# Success summary
# -----------------------------------------------------------------------------
echo ""
log_success "============================================================"
log_success " '$PROJECT_NAME' bootstrapped successfully!"
log_success "============================================================"
echo ""
echo "${BOLD}Files created:${RESET}"
echo "  src/lib/db.ts                        Prisma singleton"
echo "  src/lib/auth.ts                      Better-Auth server config"
echo "  src/lib/auth-client.ts               Better-Auth React client"
echo "  src/app/api/auth/[...all]/route.ts   Auth API handler"
echo "  src/middleware.ts                    Route protection middleware"
echo "  prisma/schema.prisma                 DB schema (Better-Auth models)"
echo "  .env.local                           Environment variables"
echo ""
echo "${BOLD}Next steps:${RESET}"
echo ""
echo "  ${CYAN}1. Set your database URL:${RESET}"
echo "     Edit ${YELLOW}.env.local${RESET} → set DATABASE_URL to your PostgreSQL connection string"
echo ""
echo "  ${CYAN}2. Generate a strong auth secret:${RESET}"
echo "     ${YELLOW}openssl rand -base64 32${RESET}"
echo "     Paste the result as BETTER_AUTH_SECRET in .env.local"
echo ""
echo "  ${CYAN}3. Push schema to database:${RESET}"
echo "     ${YELLOW}cd $PROJECT_NAME && npm run db:push${RESET}"
echo ""
echo "  ${CYAN}4. Start the dev server:${RESET}"
echo "     ${YELLOW}cd $PROJECT_NAME && npm run dev${RESET}"
echo ""
echo "  ${CYAN}5. Available db scripts:${RESET}"
echo "     ${YELLOW}npm run db:generate${RESET}   Regenerate Prisma client after schema changes"
echo "     ${YELLOW}npm run db:push${RESET}        Push schema to DB (no migration history)"
echo "     ${YELLOW}npm run db:migrate${RESET}     Run migrations (tracks history)"
echo "     ${YELLOW}npm run db:studio${RESET}      Open Prisma Studio in browser"
echo ""
log_success "Happy coding!"
