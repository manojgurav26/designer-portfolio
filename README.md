# Designer Portfolio & CV Website

A modern, professional portfolio website built with Next.js 16, Firebase, and Tailwind CSS. Features a dynamic admin dashboard for managing projects, enquiries, and site settings.

## Features

### 🎨 For Visitors
- **Professional Portfolio** - Showcase design projects with beautiful animations
- **Contact Form** - Get enquiries with name, email, phone, and message
- **Dynamic Content** - All site content managed from admin panel
- **Responsive Design** - Works seamlessly on all devices
- **Project Detail Pages** - Individual pages for each portfolio project

### 🛠️ Admin Dashboard
- **Project Management** - Add, edit, delete portfolio projects with images
- **Settings Management** - Update designer name, tagline, description, contact info, logo, and social links
- **Enquiries Dashboard** - View all contact enquiries with:
  - Seen/Unseen status tracking
  - Phone number and email links
  - Pagination (10 per page)
  - Source and project information
- **Session Timeout** - Auto-logout after 30 minutes of inactivity with warning
- **Logo Upload** - Upload custom logo via server-side API (uses Firebase Admin SDK)

## Tech Stack

- **Frontend**: Next.js 16.1.3, React 19.2.3, TypeScript
- **Styling**: Tailwind CSS, Framer Motion (animations)
- **Backend**: Firebase (Firestore, Storage, Authentication)
- **Admin API**: Next.js API Routes with Firebase Admin SDK
- **Deployment**: Firebase Hosting, Vercel (optional)

## Project Structure

```
designer-portfolio/
├── app/
│   ├── page.tsx                 # Home page
│   ├── contact/page.tsx         # Contact page
│   ├── project/[slug]/page.tsx  # Project detail page
│   ├── login/page.tsx           # Admin login
│   ├── admin/
│   │   ├── page.tsx             # Admin dashboard (projects & settings)
│   │   └── enquiries/page.tsx   # Enquiries dashboard
│   └── api/
│       └── admin/upload-logo/   # Server-side logo upload API
├── components/
│   ├── Navbar.tsx               # Navigation with dynamic logo
│   ├── EnquiryForm.tsx          # Contact form component
│   ├── SessionWarningModal.tsx  # Session timeout warning
│   └── WhatsAppButton.tsx       # WhatsApp contact button
├── lib/
│   ├── firebase.js              # Firebase client config
│   ├── firebase.ts              # Firebase Admin SDK (server-side)
│   ├── sessionTimeout.ts        # Session timeout logic
│   ├── settingsHelper.ts        # Fetch settings from Firestore
│   └── siteConfig.ts            # Default site configuration
├── firestore.rules              # Firestore security rules
├── storage.rules                # Firebase Storage security rules
└── serviceAccountKey.json       # Firebase service account (not committed)
```

## Getting Started

### 1. Prerequisites
- Node.js 18+ and npm
- Firebase project
- Service account key (for server-side logo uploads)

### 2. Installation

```bash
git clone <your-repo-url>
cd designer-portfolio
npm install
npm install firebase-admin  # For server-side API
```

### 3. Environment Setup

Create a `.env.local` file (already configured in Firebase client library):

```
# No environment variables needed - Firebase config is in lib/firebase.js
```

**Important**: Place `serviceAccountKey.json` in the repo root for server-side API to work:
- Download from Firebase Console → Project Settings → Service Accounts → Generate Key
- **DO NOT commit this file** (already in `.gitignore`)

### 4. Deploy Firestore & Storage Rules

```bash
firebase login
firebase use <project-id>
firebase deploy --only firestore:rules,storage
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### First-Time Setup

1. **Sign up** on the login page with your email
2. **Set Admin User** (backend only - requires Firebase Admin SDK):
   ```bash
   node scripts/set-admin.js YOUR_USER_UID
   ```
   _Note: Custom claims setup is currently manual. Alternative is to use server-side admin operations (implemented for logo upload)._

3. **Update Settings** - Go to Admin → Settings to add:
   - Designer name, tagline, description
   - Contact info (email, phone, location)
   - Logo (uploaded to Firebase Storage)
   - Social media links (Instagram, LinkedIn, Behance, Twitter)

4. **Add Projects** - Add portfolio projects with title, slug, category, description, and image

5. **View Enquiries** - Monitor incoming contact form submissions with status tracking

### Admin Features

**Dashboard** (`/admin`)
- Add/Edit/Delete projects
- Manage site settings
- View enquiry count
- Session timeout with warning

**Enquiries** (`/admin/enquiries`)
- List all enquiries with pagination
- Mark as seen/unseen
- Click email/phone to contact
- Filter by seen status (upcoming feature)

## Firestore Data Structure

### Collections

**designs**
```json
{
  "title": "Project Title",
  "slug": "project-title",
  "category": "Branding",
  "description": "Project details...",
  "image": "https://...",
  "featured": false,
  "position": 1234567890
}
```

**enquiries**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-1234",
  "message": "I'd like to work with you...",
  "project": "project-slug (optional)",
  "source": "contact-form",
  "seen": false,
  "createdAt": Timestamp
}
```

**settings** (single document: `main`)
```json
{
  "name": "Designer Name",
  "tagline": "Creative Designer",
  "description": "About me...",
  "email": "designer@example.com",
  "phone": "+1-555-1234",
  "location": "City, Country",
  "logo": "https://storage.googleapis.com/...",
  "domain": "https://yoursite.com",
  "socials": {
    "instagram": "https://instagram.com/...",
    "linkedin": "https://linkedin.com/...",
    "behance": "https://behance.net/...",
    "twitter": "https://twitter.com/..."
  }
}
```

## Security

### Firestore Rules
- Public read access to designs, settings
- Only authenticated admins can write
- Public can create enquiries (contact form)
- Only admins can read/update/delete enquiries

### Storage Rules
- Public read access to all images
- Only admins can upload/write

### Session Management
- 30-minute session timeout
- 5-minute warning before expiry
- Auto-logout on inactivity
- Activity resets timeout (mouse, keyboard, scroll, touch)

## Deployment

### Firebase Hosting

```bash
firebase deploy
```

### Vercel (Recommended)

```bash
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

## Known Issues & Limitations

- Custom claims setup requires Node.js script (alternative: server-side admin operations for critical features)
- Enquiry deletion/archiving not yet implemented
- Filter by seen status in enquiries dashboard (coming soon)

## Future Enhancements

- [ ] Filter enquiries by status (seen/unseen)
- [ ] Archive/delete enquiries
- [ ] Email notifications for new enquiries
- [ ] Multiple admin users with roles
- [ ] SEO optimization
- [ ] Blog/articles section
- [ ] CMS integration for richer content

## Contributing

Contributions are welcome! Please feel free to submit pull requests.

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
