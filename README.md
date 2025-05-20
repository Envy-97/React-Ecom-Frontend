
# Ethereal Emporium - A Next.js E-commerce Starter

Welcome to Ethereal Emporium, a modern e-commerce application boilerplate built with Next.js, React, ShadCN UI, Tailwind CSS, and Genkit for potential AI enhancements. This project serves as a starting point for developing sophisticated online stores with a focus on a clean user interface and robust functionality.

![Ethereal Emporium Screenshot](https://placehold.co/1200x600.png?text=Ethereal+Emporium+UI+Showcase)
*<p align="center" style="font-size: 0.9em; color: #666;">(Placeholder image - `data-ai-hint="web application user_interface"`)</p>*

## ✨ Features

*   **Modern Tech Stack**:
    *   **Next.js 15+ (App Router)**: For server-side rendering, static site generation, and optimized performance.
    *   **React 18+**: For building dynamic and interactive user interfaces.
    *   **TypeScript**: For type safety and improved developer experience.
    *   **ShadCN UI**: Beautifully designed, accessible, and customizable UI components.
    *   **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
    *   **Genkit**: Integrated for future AI-powered features (e.g., product recommendations, smart search).
*   **E-commerce Core Functionality**:
    *   Product Listing Page (`/products`)
    *   Individual Product Detail Pages (`/products/[id]`)
    *   Shopping Cart with quantity management and local storage persistence.
    *   Mock User Authentication (Admin & Customer roles).
    *   Admin panel for adding new products (`/admin/add-product`).
    *   Pincode checker on product detail pages (simulated API).
*   **User Experience**:
    *   Responsive design for various screen sizes.
    *   Clean and intuitive navigation.
    *   Toast notifications for user feedback.
    *   Loading skeletons for a smoother perceived performance.
*   **Developer Friendly**:
    *   Well-organized project structure.
    *   Context API for state management (Auth & Cart).
    *   Custom hooks for reusable logic.
    *   Placeholder images with `data-ai-hint` attributes for easy integration with image generation services or stock photo APIs.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18.x or later recommended)
*   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd ethereal-emporium 
    ```
    *(Replace `<your-repository-url>` with the actual URL of your repository)*

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Development Server

To start the development server:

```bash
npm run dev
# or
yarn dev
```

This will start the Next.js development server, typically on `http://localhost:9002`. The Genkit development server can also be started if you intend to work with AI flows:

```bash
npm run genkit:dev
# or (for watching changes)
npm run genkit:watch
```

## 🛠️ Available Scripts

*   `npm run dev`: Starts the Next.js development server (with Turbopack).
*   `npm run build`: Builds the application for production.
*   `npm run start`: Starts the production server.
*   `npm run lint`: Lints the codebase using Next.js's built-in ESLint configuration.
*   `npm run typecheck`: Runs TypeScript to check for type errors.
*   `npm run genkit:dev`: Starts the Genkit development server.
*   `npm run genkit:watch`: Starts the Genkit development server with file watching.

## 🔑 Mock Login Credentials

For demonstration and testing purposes, you can use the following mock credentials:

*   **Admin User**:
    *   Username: `admin`
    *   Password: `password`
*   **Customer User**:
    *   Username: `customer`
    *   Password: `password`

## 📁 Project Structure

Here's a brief overview of the main directories and their purposes:

```
.
├── src/
│   ├── ai/                 # Genkit AI flows and configuration
│   ├── app/                # Next.js App Router (pages, layouts)
│   ├── components/         # Reusable React components (UI, features)
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── layout/
│   │   ├── products/
│   │   └── ui/             # ShadCN UI components
│   ├── contexts/           # React Context API providers (Auth, Cart)
│   ├── hooks/              # Custom React hooks (useAuth, useCart, etc.)
│   ├── lib/                # Utility functions, mock data
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
├── components.json         # ShadCN UI configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Project dependencies and scripts
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## 🖼️ Product Images & Placeholders

This project uses `https://placehold.co` for placeholder images. Each product image component (`next/image`) includes a `data-ai-hint` attribute. This attribute contains one or two keywords (e.g., "silk scarf", "moonstone jewelry") derived from the product's `aiHint` field or its name. This is designed to facilitate integration with AI image generation services or to help find relevant stock photos more easily.

Example:
```html
<Image
  src="https://placehold.co/600x600.png"
  alt="Celestial Silk Scarf"
  data-ai-hint="silk scarf" 
  ...
/>
```

## 💡 Future Enhancements (Ideas)

*   Integrate a real backend (e.g., Firebase, Supabase, or a custom Node.js/Spring Boot API).
*   Implement actual payment gateway integration.
*   Develop AI-powered features using Genkit:
    *   Personalized product recommendations.
    *   Smart search functionality.
    *   Automated product description generation.
*   Expand admin panel functionalities (order management, user management).
*   Add user profile pages.
*   Implement a proper review and rating system.

## 🤝 Contributing

Contributions are welcome! If you have suggestions or want to improve the project, feel free to fork the repository, make your changes, and submit a pull request.

## 📄 License

This project is open-source and available under the MIT License. (Assuming - please update if different)

---

Happy Coding! We hope Ethereal Emporium provides a solid foundation for your next e-commerce venture.
