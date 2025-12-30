## TODOS

- fix image upload ✅
- add image preview ✅
- admin create event time mismatched fix ✅
- ticket download feature (qr code)✅
- automatic mail with event details and booking details (google Calendar linked), ticket qr code, meeting link
- when creating event admin can set what the email should be sent each time when user books the event (mainly for meeting link) (maybe we will have pre template and admin will be able to change only the section which he needs)
- export mail list feature (so that he can manually send mail if needed)✅
- add admin stats feature
- websockets implemented ✅
- add a redis cache layer

future -
- option to allow only booked participants to view the event 
- adding own webinar platform 

# EventBookingSystem

A modern, full-stack event booking platform built with cutting-edge technologies. This monorepo combines a powerful backend API with a beautiful, responsive frontend to deliver a seamless event management experience.

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **React Router** - Client-side routing
- **TanStack Query** - Powerful data fetching
- **React Hook Form** - Performant form handling
- **Zod** - Schema validation

### Backend
- **Hono** - Lightweight, ultra-fast web framework
- **Bun** - Modern JavaScript runtime
- **Drizzle ORM** - TypeScript-first database toolkit
- **PostgreSQL** - Robust relational database
- **Zod** - API validation
- **Bcrypt** - Secure password hashing
- **Cloudinary** - Image management

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Bun](https://bun.sh/) (v1.2.19 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v14 or higher)
- [Git](https://git-scm.com/)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd EventBookingSystem
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:

**Server (.env):**
```bash
cd apps/server
cp .env.example .env
```

Edit `apps/server/.env` with your configuration:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/eventbooking
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Client (.env):**
```bash
cd apps/client
cp .env.example .env
```

Edit `apps/client/.env`:
```env
VITE_API_URL=http://localhost:3000
```

4. Initialize the database:
```bash
# From project root
bun db:push
```

5. (Optional) Seed the database:
```bash
cd apps/server
bun run db:seed
```

## 🚀 Getting Started

### Development Mode

Start all applications:
```bash
bun dev
```

Or start individually:
```bash
# Frontend only (http://localhost:5173)
bun dev:web

# Backend only (http://localhost:3000)
bun dev:server
```

### Production Build

Build all applications:
```bash
bun build
```

Start the production server:
```bash
cd apps/server
bun start
```

## 📁 Project Structure

```
EventBookingSystem/
├── apps/
│   ├── client/          # React frontend application
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── pages/       # Route pages
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── lib/         # Utilities and helpers
│   │   │   └── App.tsx      # Main app component
│   │   └── package.json
│   │
│   └── server/          # Hono backend API
│       ├── src/
│       │   ├── routes/      # API routes
│       │   ├── db/          # Database schema & config
│       │   ├── middleware/  # Custom middleware
│       │   └── index.ts     # Server entry point
│       └── package.json
│
├── package.json         # Root package.json (workspace)
└── README.md
```

## 📜 Available Scripts

### Root Level
- `bun dev` - Start all applications in development mode
- `bun build` - Build all applications for production
- `bun check-types` - Type-check all TypeScript code
- `bun dev:web` - Start frontend only
- `bun dev:server` - Start backend only

### Database
- `bun db:push` - Push schema changes to database
- `bun db:generate` - Generate migration files
- `bun db:migrate` - Run database migrations
- `bun db:studio` - Open Drizzle Studio (database GUI)

### Server Specific
```bash
cd apps/server
bun run db:init      # Initialize database
bun run db:seed      # Seed database with sample data
bun run db:reset     # Reset database
bun run compile      # Compile to standalone executable
```

### Client Specific
```bash
cd apps/client
bun run dev          # Start dev server
bun run build        # Build for production
bun run preview      # Preview production build
bun run lint         # Lint code
```

## 🔧 Configuration

### TypeScript
The project uses a shared TypeScript configuration:
- `tsconfig.base.json` - Base configuration
- `tsconfig.json` - Root configuration
- App-specific configs in each app directory

### Workspace
This is a Bun workspace monorepo. Dependencies are managed at the root level with workspace-specific packages in each app.

## 🌐 API Endpoints

The backend API runs on `http://localhost:3000` by default.

Key endpoints:
- `GET /api/events` - List all events
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event details
- `POST /api/bookings` - Create booking
- And more...

## 🎨 UI Components

The frontend uses shadcn/ui components with Tailwind CSS. All components are fully customizable and accessible.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Check database credentials

### Port Already in Use
- Frontend: Change port in `vite.config.ts`
- Backend: Set PORT environment variable

### Build Errors
- Clear node_modules: `rm -rf node_modules && bun install`
- Clear build cache: `rm -rf apps/*/dist`

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack)
