# EventBookingSystem - Frontend

The frontend application for EventBookingSystem, built with React, TypeScript, and modern web technologies.

## 🎨 Tech Stack

- **React 18** - Modern UI library with concurrent features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next-generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible component library
- **React Router v6** - Declarative routing
- **TanStack Query** - Powerful async state management
- **React Hook Form** - Performant form validation
- **Zod** - TypeScript-first schema validation
- **Lucide React** - Beautiful icon library

## 📋 Prerequisites

- [Bun](https://bun.sh/) v1.2.19 or higher
- Backend API running (see main README)

## 🚀 Quick Start

1. Navigate to the client directory:
```bash
cd apps/client
```

2. Install dependencies (if not already installed from root):
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:3000
```

4. Start the development server:
```bash
bun run dev
```

The app will be available at `http://localhost:5173`

## 📜 Available Scripts

- `bun run dev` - Start development server with hot reload
- `bun run build` - Build for production
- `bun run build:dev` - Build in development mode
- `bun run preview` - Preview production build locally
- `bun run lint` - Lint code with ESLint

## 📁 Project Structure

```
apps/client/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── ui/         # shadcn/ui components
│   │   └── ...         # Custom components
│   ├── pages/          # Route pages/views
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and helpers
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
├── tailwind.config.ts  # Tailwind configuration
├── tsconfig.json       # TypeScript configuration
└── package.json
```

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/), a collection of re-usable components built with Radix UI and Tailwind CSS.

### Available Components

- **Forms**: Input, Textarea, Select, Checkbox, Radio, Switch
- **Feedback**: Toast, Alert, Dialog, Alert Dialog
- **Navigation**: Tabs, Accordion, Navigation Menu, Menubar
- **Data Display**: Table, Card, Avatar, Badge, Tooltip
- **Layout**: Separator, Scroll Area, Resizable Panels
- And many more...

### Adding New Components

```bash
bunx shadcn@latest add [component-name]
```

Example:
```bash
bunx shadcn@latest add button
bunx shadcn@latest add card
```

## 🎯 Key Features

- **Responsive Design** - Mobile-first approach
- **Dark Mode** - Theme switching with next-themes
- **Form Validation** - Client-side validation with Zod
- **Data Fetching** - Optimistic updates with TanStack Query
- **Type Safety** - Full TypeScript coverage
- **Accessibility** - WCAG compliant components
- **Code Splitting** - Automatic route-based splitting
- **Hot Module Replacement** - Instant feedback during development

## 🔧 Configuration

### Vite Configuration

The `vite.config.ts` includes:
- React SWC plugin for fast refresh
- Path aliases (`@/` points to `src/`)
- Optimized build settings

### Tailwind Configuration

Custom theme configuration in `tailwind.config.ts`:
- Custom colors and design tokens
- shadcn/ui integration
- Typography plugin
- Animation utilities

### TypeScript Configuration

Multiple config files for different contexts:
- `tsconfig.json` - Base configuration
- `tsconfig.app.json` - App-specific settings
- `tsconfig.node.json` - Node/Vite tooling

## 🌐 Environment Variables

Create a `.env` file with:

```env
# API Configuration
VITE_API_URL=http://localhost:3000

# Optional: Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 🎨 Styling Guide

### Using Tailwind Classes
```tsx
<div className="flex items-center justify-between p-4 bg-background">
  <h1 className="text-2xl font-bold">Title</h1>
</div>
```

### Using shadcn/ui Components
```tsx
import { Button } from "@/components/ui/button";

<Button variant="default" size="lg">
  Click me
</Button>
```

### Custom Styles
Add global styles in `src/index.css` or use CSS modules for component-specific styles.

## 🔌 API Integration

### Using TanStack Query

```typescript
import { useQuery } from "@tanstack/react-query";

function EventList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events`);
      return res.json();
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading events</div>;

  return <div>{/* Render events */}</div>;
}
```

## 🧪 Testing

(Add your testing setup here when implemented)

```bash
# Run tests
bun test

# Run tests in watch mode
bun test --watch
```

## 📦 Building for Production

1. Build the application:
```bash
bun run build
```

2. Preview the build:
```bash
bun run preview
```

The build output will be in the `dist/` directory.

### Build Optimization

- Tree-shaking for smaller bundles
- Code splitting by route
- Asset optimization (images, fonts)
- CSS minification
- Gzip compression ready

## 🚀 Deployment

### Static Hosting (Vercel, Netlify, etc.)

1. Build the project: `bun run build`
2. Deploy the `dist/` folder
3. Set environment variables in your hosting platform

### Docker

```dockerfile
FROM oven/bun:1 as builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
RUN bun run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🐛 Troubleshooting

### Port Already in Use
Change the port in `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    port: 5174
  }
})
```

### Module Not Found
Clear cache and reinstall:
```bash
rm -rf node_modules bun.lockb
bun install
```

### Build Errors
Check TypeScript errors:
```bash
bun run check-types
```

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript for all new files
3. Add proper types, avoid `any`
4. Test your changes locally
5. Update documentation as needed

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query)
- [React Router](https://reactrouter.com/)

## 📝 License

Part of the EventBookingSystem project.

---

For backend setup and full project documentation, see the [main README](../../README.md).
