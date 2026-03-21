# Hirfati — Project Structure Reference

> **Last Updated:** March 2026  
> A comprehensive map of every directory and key file in the Hirfati codebase.

---

## Root Directory

```
hirfati/
├── app/                    # Backend application logic (Laravel)
├── bootstrap/              # Laravel bootstrap & cache
├── config/                 # Configuration files
├── database/               # Migrations, seeders, factories
├── node_modules/           # Node.js dependencies (gitignored)
├── public/                 # Web-accessible files, compiled assets
├── resources/              # Frontend source code + views
├── routes/                 # All route definitions
├── storage/                # Logs, cache, uploaded files
├── tests/                  # PHPUnit tests
├── vendor/                 # Composer dependencies (gitignored)
│
├── .env                    # Environment config (gitignored)
├── .env.example            # Environment template
├── .prettierrc             # Prettier formatting config
├── artisan                 # Laravel CLI entry point
├── composer.json           # PHP dependencies
├── components.json         # ShadCN/Radix component config
├── eslint.config.js        # ESLint config
├── package.json            # Node.js dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite bundler config
└── README.md               # Project documentation
```

---

## `app/` — Backend Application

### `app/Actions/` — Single-Responsibility Action Classes
```
Actions/
├── Auth/
│   ├── LoginUserAction.php               # Handle user login logic
│   ├── LogoutUserAction.php              # Handle logout
│   ├── RegisterStoreAction.php           # Store new registrations
│   ├── ResendRegistrationCodeAction.php  # Resend verification OTP
│   ├── ResetPasswordAction.php           # Execute password reset
│   ├── SendEmailVerificationCodeAction.php
│   ├── SendResetCodeAction.php           # Send password reset code
│   ├── VerifyEmailCodeAction.php         # Verify email OTP
│   ├── VerifyRegistrationCodeAction.php  # Verify registration OTP
│   └── VerifyResetCodeAction.php         # Verify reset OTP
├── Fortify/
│   ├── CreateNewUser.php                 # Fortify user creation
│   ├── PasswordValidationRules.php       # Password rules trait
│   └── ResetUserPassword.php             # Fortify password reset
└── Location/
    ├── FindNearByProvidersAction.php      # Geolocation search
    └── UpdateUserLocationAction.php       # Update user coordinates
```

### `app/Http/Controllers/Api/` — API Controllers
```
Api/
├── Admin/
│   └── CraftsmanApprovalController.php   # Approve/reject provider apps
├── Auth/
│   ├── EmailVerificationController.php   # OTP email verification
│   ├── ForgotPasswordController.php      # Password recovery flow
│   ├── LoginController.php               # Login / token generation
│   └── RegisterController.php            # Multi-step registration
├── Client/
│   ├── CustomerAddressController.php     # CRUD customer addresses
│   ├── DashboardSummaryController.php    # Client dashboard data
│   ├── OrderController.php               # List/show/cancel orders
│   ├── ProviderDiscoveryController.php   # Search & browse providers
│   ├── ServiceOrderController.php        # Create booking orders
│   └── UpdateUserInfoController.php      # Update customer profile
├── Messages/
│   └── MessageController.php             # Real-time chat (send/receive)
├── Provider/
│   ├── DashboardSummaryController.php    # Provider dashboard data
│   ├── ProviderAddressController.php     # Provider address mgmt
│   ├── ProviderController.php            # Provider profile CRUD
│   ├── ProviderJobRequestController.php  # View & manage incoming jobs
│   ├── ProviderPostController.php        # Portfolio post CRUD
│   ├── ProviderScheduleController.php    # Schedule view & status updates
│   └── ResubmitApplicationController.php # Re-apply after rejection
├── LocationController.php                # Shared location endpoints
└── UserController.php                    # Generic user info
```

### `app/Http/Middleware/`
```
Middleware/
├── CheckRole.php                 # Gate: ensure user has required role
├── HandleAppearance.php          # Theme/appearance middleware
├── HandleInertiaRequests.php     # Share Inertia props (user, flash, etc.)
└── Provider/
    ├── CheckProviderStatus.php   # Only approved providers pass
    ├── EnsureProviderPending.php # Redirect if not pending
    └── EnsureProviderRejected.php# Redirect if not rejected
```

### `app/Models/` — Eloquent Models
```
Models/
├── User.php              # Central user (roles: customer/provider/admin)
├── Customer.php          # Customer profile (belongs to User)
├── Provider.php          # Provider profile (status: pending/approved/rejected)
├── CustomerAddress.php   # Saved customer addresses
├── ProviderAddress.php   # Saved provider addresses
├── CustomerOrder.php     # Booking orders (status machine)
├── Message.php           # Chat messages (polymorphic sender)
├── ProviderPost.php      # Provider portfolio posts
├── ProviderPostImage.php # Images attached to posts
└── Portfolio.php         # Legacy portfolio model
```

### `app/Policies/`
```
Policies/
└── ProviderPostPolicy.php  # Authorization for post update/delete
```

### `app/Traits/`
```
Traits/
└── ApiResponses.php  # Standardized JSON response helpers (ok, error)
```

---

## `resources/js/` — Frontend Application

### `resources/js/pages/auth/` — Authentication Pages
```
auth/
├── login.tsx               # Login form with validation
├── register.tsx            # Multi-step registration wizard
├── Onboarding.tsx          # Post-registration onboarding
├── forgot-password.tsx     # Enter email for recovery
├── verify-reset-code.tsx   # OTP verification for reset
├── new-reset-password.tsx  # Set new password form
├── verify-email.tsx        # Email OTP verification
├── confirm-password.tsx    # Confirm before sensitive actions
├── two-factor-challenge.tsx# 2FA challenge page
├── pending-approval.tsx    # Waiting screen for pending providers
├── rejected-approval.tsx   # Rejection notice + resubmit option
└── account-suspended.tsx   # Suspended account notice
```

### `resources/js/pages/client/` — Customer Pages
```
client/
├── Dashboard.tsx       # Customer home — stats, recent orders, quick actions
├── FindPros.tsx        # Browse & search verified providers
├── BookService.tsx     # Book a service (date, time, address, budget)
├── MyOrders.tsx        # Order history with status tracking
├── OrderDetails.tsx    # Single order detail view
├── OrderSuccess.tsx    # Post-booking success confirmation
├── ExplorePosts.tsx    # Browse provider portfolio posts
├── ProviderPosts.tsx   # Individual provider portfolio gallery
├── Messages.tsx        # Real-time chat with providers
├── Profile.tsx         # Customer profile editor
├── AddressCreate.tsx   # Add new saved address (with map)
└── AddressEdit.tsx     # Edit existing address
```

### `resources/js/pages/worker/` — Provider Pages
```
worker/
├── Dashboard.tsx         # Provider workspace — earnings, activity, stats
├── JobRequests.tsx       # Manage incoming bookings (accept/decline/start/complete)
├── Schedule.tsx          # Calendar schedule with day/week views
├── MyPosts.tsx           # Portfolio post management (CRUD)
├── Messages.tsx          # Chat with customers
├── Profile.tsx           # Provider profile editor (skills, bio, rates)
├── CompleteProfile.tsx   # First-time profile completion wizard
├── AddressCreate.tsx     # Provider address creation
└── AddressEdit.tsx       # Provider address editing
```

### `resources/js/pages/admin/` — Admin Pages
```
admin/
├── craftsmen.tsx          # Provider list with approval controls
└── craftsman-detail.tsx   # Provider detail view + document verification
```

### `resources/js/layouts/`
```
layouts/
└── DashboardLayout.tsx   # Shared sidebar layout (role-aware nav)
```

### `resources/js/components/`
```
components/
└── PostCard.tsx          # Reusable provider post / portfolio card
    ...                   # Additional shared UI components
```

---

## `routes/` — Route Definitions

```
routes/
├── Auth/
│   └── auth.php                   # Login, register, verify, reset
├── Customer/
│   ├── api_customer.php           # Customer API (orders, addresses, discovery)
│   └── Customer_web.php           # Customer Inertia pages
├── Provider/
│   ├── api_provider.php           # Provider API (posts, schedule, job requests)
│   └── provider_web.php           # Provider Inertia pages
├── Admin/
│   ├── admin_api.php              # Admin API (approvals)
│   └── admin_web.php              # Admin Inertia pages
├── web.php                        # Global routes (landing, home redirect)
├── channels.php                   # Broadcasting channel auth
├── console.php                    # Artisan commands
└── settings.php                   # Settings routes
```

### Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login & get token |
| `GET` | `/api/client/orders` | List customer orders |
| `POST` | `/api/client/orders` | Create booking |
| `GET` | `/api/client/find-providers` | Search providers |
| `GET` | `/api/provider/job-requests` | Provider's incoming jobs |
| `PATCH` | `/api/provider/job-requests/{id}/status` | Update job status |
| `GET` | `/api/provider/schedule` | Provider schedule |
| `GET` | `/api/provider/posts` | Provider portfolio |
| `POST` | `/api/client/messages/initialize` | Start conversation |
| `POST` | `/api/admin/craftsmen/{id}/approve` | Approve provider |

---

## `database/` — Database Layer

```
database/
├── migrations/          # Schema definitions (users, providers, orders, etc.)
├── seeders/             # Test data generators
└── factories/           # Model factories for testing
```

### Core Tables

| Table | Purpose |
|-------|---------|
| `users` | All users (name, email, role, 2FA) |
| `customers` | Customer profiles (linked to users) |
| `providers` | Provider profiles (status, profession, documents) |
| `customer_orders` | Bookings with status machine |
| `customer_addresses` | Saved customer locations |
| `provider_addresses` | Saved provider locations |
| `messages` | Chat messages |
| `provider_posts` | Portfolio posts |
| `provider_post_images` | Post image attachments |

---

## `public/` — Public Assets

```
public/
├── screenshots/         # App screenshots for documentation
│   ├── Posts.png
│   ├── admin_page.png
│   ├── chat.png
│   ├── find_provider.png
│   ├── jobrequest.png
│   ├── profile.png
│   ├── providerdashboard.png
│   ├── schedule.png
│   └── verficaiton_documant_check.png
├── storage/             # Symlink to storage/app/public
├── build/               # Compiled Vite assets (production)
└── index.php            # Application entry point
```

---

## Order Status Flow

```
pending ──→ confirmed ──→ in_progress ──→ completed
   │             │
   └── cancelled └── cancelled
```

**Transitions enforced by `ProviderJobRequestController`:**
- `pending` → `confirmed` or `cancelled`
- `confirmed` → `in_progress` or `cancelled`
- `in_progress` → `completed`

---

## Provider Approval Flow

```
registered → email_verified → profile_completed → pending_review → approved
                                                                 → rejected → can_resubmit
```