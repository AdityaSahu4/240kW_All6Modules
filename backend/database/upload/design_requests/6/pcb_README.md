# TECHLINK Frontend

A modern, dynamic, and visually stunning React-based frontend for TECHLINK - an AI platform for electronic product testing, simulation, and certification.

## ✨ Features

### Pages
- 🏠 **Landing Page** - Animated hero section with live dashboard visualization
- 🔧 **Services Page** - Interactive service cards with hover animations
- 💰 **Pricing Page** - Beautiful pricing cards with feature lists
- 📝 **Blog Page** - Blog posts with images and metadata
- 👤 **Authentication** - Smooth animated Login and Sign Up pages
- 📋 **Product Details** - Comprehensive product submission form
- 📞 **Contact Page** - Interactive contact form with validation
- ℹ️ **About Page** - Company information with stats and features

### Animations & Interactions
- ✨ **Framer Motion** - Smooth page transitions and component animations
- 🎯 **Hover Effects** - Interactive elements throughout the site
- 📊 **Live Dashboard** - Animated charts and data visualizations on homepage
- 🎨 **Gradient Backgrounds** - Modern gradient designs
- 💫 **Scroll Animations** - Elements animate as you scroll
- 🔄 **Smooth Transitions** - Page-to-page transitions

### Design Features
- 🎨 **Modern UI** - Clean, sleek, and immersive design
- 📱 **Fully Responsive** - Works on all devices
- 🌈 **Gradient Themes** - Beautiful color gradients
- 🎭 **Glass Effects** - Modern glassmorphism elements
- 💎 **Shadow Effects** - Depth and dimension
- 🎪 **Icon Integration** - Lucide React icons throughout

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing with animated transitions
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Beautiful icon library

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 🚀 Deployment

### Netlify Deployment

The project is configured for easy deployment on Netlify:

1. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket)

2. **Connect to Netlify**:
   - Go to [Netlify](https://www.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository

3. **Build Settings** (automatically configured via `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

4. **Environment Variables** (if needed):
   - If your app requires a backend API, add `VITE_API_URL` in Netlify's site settings:
     - Go to Site settings → Environment variables
     - Add `VITE_API_URL` with your API URL (e.g., `https://api.yourdomain.com`)

5. **Deploy**: Netlify will automatically build and deploy your site!

The `netlify.toml` file includes:
- Build configuration
- SPA routing redirects (all routes redirect to `index.html` for React Router)
- Node.js version specification

**Note**: The app uses mock data by default. For production, ensure your backend API is deployed and configure the `VITE_API_URL` environment variable.

## 📁 Project Structure

```
src/
├── components/       # Reusable components
│   ├── Header.jsx   # Animated navigation header
│   └── Footer.jsx   # Enhanced footer with social links
├── pages/           # Page components
│   ├── Home.jsx     # Landing page with animated dashboard
│   ├── Services.jsx # Services with hover animations
│   ├── Pricing.jsx  # Pricing cards with features
│   ├── Blog.jsx     # Blog posts with images
│   ├── About.jsx    # About page with stats
│   ├── Contact.jsx  # Contact form
│   ├── Login.jsx    # Animated login form
│   ├── SignUp.jsx   # Animated signup form
│   └── ProductDetails.jsx # Product submission form
├── App.jsx          # Main app with page transitions
├── main.jsx         # Entry point
└── index.css        # Global styles with animations
```

## 🎯 Pages & Routes

- `/` - Home/Landing page with animated dashboard
- `/services` - Services overview with interactive cards
- `/pricing` - Pricing information with feature lists
- `/blog` - Blog posts with images and metadata
- `/about` - About page with company stats
- `/contact` - Contact form with validation
- `/login` - Login page with smooth animations
- `/signup` - Sign up page with form animations
- `/product-details` - Product submission form

## 🎨 Customization

### Colors
The color scheme can be customized in `tailwind.config.js`. The primary color is set to blue (`#2563EB`).

### Animations
Animation timings and effects can be adjusted in:
- `tailwind.config.js` - Custom animation keyframes
- Individual components - Framer Motion variants

### Images
Blog post images use Unsplash placeholders. Replace with your own images in `src/pages/Blog.jsx`.

## 🎭 Animation Features

- **Page Transitions**: Smooth fade and slide transitions between pages
- **Hover Effects**: Scale, lift, and color transitions on interactive elements
- **Scroll Animations**: Elements animate into view as you scroll
- **Form Interactions**: Input fields scale and highlight on focus
- **Button Animations**: Press and hover effects on all buttons
- **Dashboard Animations**: Live updating charts and data visualizations

## 📝 Notes

- All forms are functional and ready for backend integration
- Images use placeholder URLs (Unsplash) - replace with your own
- All animations are optimized for performance
- The site is fully responsive and works on all screen sizes

## 📄 License

MIT

---

Built with ❤️ using React, Vite, and Framer Motion
