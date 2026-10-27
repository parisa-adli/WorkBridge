# WorkBridge

A freelancing platform that connects project owners with freelancers. Owners post projects, freelancers send proposals, and admins manage users and categories. Login is by phone number with an SMS one-time password (OTP).

## Features

- OTP login by phone number, then profile completion with a role
- **Owner**: create, edit, delete and open/close projects; accept or reject proposals
- **Freelancer**: browse projects and submit proposals
- **Admin**: manage users (verify/block) and view all projects and proposals
- Dark mode, Persian (RTL) numbers and dates

## Tech stack

| Part | Stack |
|------|-------|
| Client (`client/`) | React 18, Vite, Tailwind CSS, React Router, TanStack Query, React Hook Form, Axios |
| Server (`server/`) | Node.js, Express, MongoDB (Mongoose), JWT cookies, Joi, Kavenegar (SMS) |

## Getting started

Requirements: Node.js 18+ and a MongoDB database.

```bash
git clone https://github.com/parisa-adli/WorkBridge.git
cd WorkBridge
npm install
npm install --prefix client
npm install --prefix server
```

Create `server/.env` (start from `server/.env.example`):

```env
APP_DB=mongodb://localhost:27017/workbridge
PORT=5000
KAVENEGAR_API_KEY=
ACCESS_TOKEN_SECRET_KEY=
REFRESH_TOKEN_SECRET_KEY=
COOKIE_PARSER_SECRET_KEY=
TOKEN_SECRET_KEY=
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000
ALLOW_CORS_ORIGIN=http://localhost:3000
DOMAIN=localhost
NODE_ENV=development
ZARINPAL_CALLBACK_URL=
```

The client talks to `http://localhost:5000/api` by default. To use another API, set `VITE_BASE_URL` in `client/.env` (see `client/.env.example`).

Run client and server together from the root:

```bash
npm run dev
```

## Project structure

```
client/src/
  features/   # domain code (auth, projects, proposals, admin, ...)
  pages/      # route pages
  services/   # API calls
  ui/         # shared components
  hooks/, context/, utils/
server/
  app/router/        # /user, /category, /project, /proposal, /admin
  app/http/          # controllers, middlewares, validators
  app/models/        # Mongoose models
```
