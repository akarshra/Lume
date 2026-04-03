# Lumé - Handmade Ribbon Roses Boutique

**Lumé** is a modern, full-stack e-commerce web application dedicated to showcasing and selling custom handmade ribbon roses. Built with bleeding-edge web technologies, it features an interactive storefront, bespoke order flows, secure payment processing, and a comprehensive admin dashboard.

---

## 🌟 Key Features

* **Interactive Storefront:** Browse a carefully curated gallery of ribbon roses with 3D bouquet visualization and hover effects.
* **Customer Portals:** Users can track their orders, save favorites to a wishlist, and leave reviews.
* **Custom Bespoke Orders:** A dedicated flow for users to request and customize unique bouquet arrangements.
* **Secure Payments:** Fully integrated **Stripe** payment processing for safe and seamless checkouts, complete with webhook event listening.
* **Automated Email Notifications:** Transactional emails sent to customers regarding order status updates via **Resend API**.
* **Admin Dashboard:** A secured area for store owners to manage inventory, update order statuses, generate promo codes, and analyze sales data.

---

## 🏗️ Architecture & Security

Lumé utilizes a hybrid Backend-as-a-Service (BaaS) architecture:
* **Client-Side Data Fetching:** The React frontend interacts directly with the Supabase PostgreSQL database for standard CRUD operations (managing inventory, products, promos, etc.).
* **Secure Micro-Backend:** Sensitive operations are isolated in an Express.js server (`api/index.js`). This server is responsible for Stripe Payment Intent generation, Stripe Webhook validation, and triggering secure Resend emails.
* **Row Level Security (RLS):** Because the frontend queries the database directly, database security relies heavily on strict PostgreSQL Row Level Security (RLS) policies configured in the Supabase dashboard.

---

## 💻 Technology Stack

* **Frontend:** React 19, Vite, React Router DOM
* **Backend:** Express.js (configured for serverless deployment on Vercel)
* **Database & Auth:** Supabase (PostgreSQL, Authentication)
* **Payments:** Stripe (`@stripe/react-stripe-js`, `stripe` node SDK)
* **Transactional Emails:** Resend API
* **UI/UX:** Lucide React (Icons), Recharts (Data Visualization), React Parallax Tilt (Hover Effects)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18+) and **npm** installed on your machine. You will also need active accounts for **Supabase**, **Stripe**, and **Resend** to configure the backend and payment systems.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/akarshra/lume.git](https://github.com/akarshra/lume.git)
    cd lume
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env.local` file in the root directory and configure your essential API keys:
    ```env
    # Supabase (Frontend & Backend)
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

    # Stripe (Payments)
    VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
    STRIPE_SECRET_KEY=your_stripe_secret_key
    STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

    # Resend (Emails)
    RESEND_API_KEY=your_resend_api_key
    PORT=5001
    ```

4.  **Start the Development Server:**
    The project uses `concurrently` to run both the Vite frontend and Express backend simultaneously.
    ```bash
    npm run dev
    ```
    * Frontend runs typically on `http://localhost:5173`
    * Secure API server runs locally on `http://localhost:5001`

---

## 🗄️ Database Structure

The application utilizes Supabase for data management. Ensure the following tables are set up and protected with RLS:

* `products`: Stores item details, pricing, and image URLs.
* `inventory`: Manages stock levels and availability for products.
* `orders`: Tracks customer purchases, current fulfillment statuses, and tracking IDs.
* `promocodes`: Handles active discount campaigns and codes.
* `wishlist`: Links authenticated users to their favorited products.
* `reviews`: Stores user feedback, ratings, and testimonials.

---

## 💳 Stripe Webhook Setup

To test the payment lifecycle locally, you must forward Stripe webhook events to your local API:
1. Install the Stripe CLI.
2. Run the following command to forward events to the Express server:
   ```bash
   stripe listen --forward-to localhost:5001/api/webhook

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute to the codebase.
