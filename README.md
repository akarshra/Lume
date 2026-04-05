# Lumé - Handmade Ribbon Roses Boutique

**Lumé** is a modern, full-stack e-commerce web application dedicated to showcasing and selling custom handmade ribbon roses. Operating out of Kishanganj, Bihar, this platform provides a premium, interactive storefront with bespoke order flows, secure payment processing, AI-powered customer support, and automated store management.

---

## 🌟 Key Features

* **Interactive Storefront:** Browse a carefully curated gallery of ribbon roses with 3D bouquet visualisation and hover effects.
* **AI-Powered Customer Support:** An intelligent chatbot (powered by OpenAI GPT-4o) capable of tracking user order statuses and recommending specific bouquets based on customer intent.
* **Smart Marketing & Automation:** * **AI Campaign Generator:** Automatically generate engaging promotional email campaigns and discount codes.
  * **CRON Automations:** Scheduled tasks to recover abandoned carts via email and send immediate low-stock alerts to administrators.
* **Customer Portals:** Users can track their orders, save favourites to a wishlist, explore dedicated wedding collections, and leave reviews.
* **Custom Bespoke Orders:** A dedicated flow for users to request and customise unique bouquet arrangements.
* **Secure Payments:** Fully integrated **Stripe** payment processing for safe and seamless checkouts, complete with webhook event listening.
* **Transactional Emails:** Automated email notifications sent to customers regarding order status updates via the **Resend API**.

---

## 🏗️ Architecture & Security

Lumé utilises a hybrid Backend-as-a-Service (BaaS) architecture:
* **Client-Side Data Fetching:** The React frontend interacts directly with the Supabase PostgreSQL database for standard CRUD operations.
* **Secure Micro-Backend:** Sensitive operations are isolated in an Express.js server (`api/index.js`). This handles Stripe Payment Intents, Webhook validation, OpenAI interactions, secure Resend emails, and cron jobs.
* **Row Level Security (RLS):** Database security relies on strict PostgreSQL Row Level Security (RLS) policies configured in the Supabase dashboard.

---

## 💻 Technology Stack

* **Frontend:** React 19, Vite, React Router DOM, React Three Fiber (3D Elements)
* **Backend:** Express.js (configured for serverless deployment on Vercel)
* **Database & Auth:** Supabase (PostgreSQL, Authentication)
* **Payments:** Stripe (`@stripe/react-stripe-js`, `stripe` node SDK)
* **AI & NLP:** OpenAI API (GPT-4o)
* **Transactional Emails:** Resend API
* **UI/UX:** Lucide React (Icons), Recharts (Data Visualisation), React Parallax Tilt (Hover Effects)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18+) and **npm** installed on your machine. You will also need active accounts for **Supabase**, **Stripe**, **OpenAI**, and **Resend**.

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
    VITE_ADMIN_EMAIL=your_admin_email_address

    # OpenAI (Chatbot & Marketing)
    OPENAI_API_KEY=your_openai_api_key

    # Automation/Security
    CRON_SECRET=your_secure_cron_secret
    PORT=5001
    ```

4.  **Start the Development Server:**
    The project uses `concurrently` to run both the Vite frontend and Express backend simultaneously.
    ```bash
    npm run dev
    ```
    * Frontend runs on `http://localhost:5173`
    * Secure API server runs locally on `http://localhost:5001`

---

## 🗄️ Database Structure

Ensure the following tables are set up in Supabase and protected with RLS:

* `products`: Stores item details, pricing, stock status, and image URLs.
* `inventory`: Manages granular stock levels and availability.
* `orders`: Tracks customer purchases, fulfilment statuses, and tracking IDs.
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

Developed by Akarsh Raj
