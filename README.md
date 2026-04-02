# Lumé - Handmade Ribbon Roses Boutique

**Lumé** is a modern, full-stack e-commerce web application dedicated to showcasing and selling custom handmade ribbon roses. Built with bleeding-edge web technologies, it features an interactive shopping experience, custom order flows, and a comprehensive admin dashboard.

---

## 🌟 Key Features

* **Interactive Storefront:** Browse a carefully curated gallery of ribbon roses with 3D bouquet visualization.
* **Secure Payments:** Fully integrated **Stripe** payment processing for safe and seamless checkouts.
* **Customer Portals:** Users can create accounts, track their orders, save favorites to a wishlist, and leave reviews.
* **Custom Orders:** Dedicated flow for users to request bespoke bouquet arrangements.
* **Admin Dashboard:** A secured area for store owners to manage inventory, update order statuses, generate promo codes, and view sales data.

---

## 🛠️ Technology Stack

* **Frontend:** React 19, Vite, React Router DOM
* **Backend & Database:** Supabase (PostgreSQL, Authentication, Edge Functions)
* **Payments:** Stripe (@stripe/react-stripe-js)
* **UI/UX:** Lucide React (Icons), Recharts (Data Visualization), React Parallax Tilt (Hover Effects)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18+) and **npm** installed on your machine. You will also need active accounts for **Supabase** and **Stripe** to configure the backend and payment systems.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd lume
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and configure your keys:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
    ```

4.  **Start the Development Server:**
    ```bash
    npm run dev
    ```

---

## 🗄️ Database Structure

The application utilizes Supabase for data management. Ensure the following tables are set up:

* `products`: Stores item details, pricing, and image URLs.
* `inventory`: Manages stock levels and availability for products.
* `orders`: Tracks customer purchases, current fulfillment statuses, and tracking IDs.
* `promocodes`: Handles active discount campaigns and codes.
* `wishlist`: Links authenticated users to their favorited products.
* `reviews`: Stores user feedback, ratings, and testimonials.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute to the codebase.