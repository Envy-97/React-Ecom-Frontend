# **App Name**: Ethereal Emporium

## Core Features:

- Product Showcase: Display a curated selection of products with high-quality images and detailed descriptions. Each product will be its own component, fetched from the Spring backend.
- Interactive Shopping Cart: Enable users to add products to a virtual cart and view the cart contents. Allow adjustments to quantities with an updated subtotal. Connect with backend service for price and inventory information.
- Secure User Authentication: Provide a secure login using token-based authentication via the Spring Boot backend. The authentication token should be stored locally (session or local storage).
- Product addition for logged-in users.: Allow adding products only for logged-in admin users using the secure session or local storage. This should call an authorized endpoint from the Spring backend, and the authorization token will be attached to this call.

## Style Guidelines:

- Primary color: Deep Indigo (#3F51B5) to evoke trust and sophistication. A versatile color that is inviting and pairs well with neutral tones.
- Background color: Light Gray (#F0F2F5) to provide a clean, modern backdrop that doesn't distract from the products.
- Accent color: Amber (#FFC107) for highlights and calls to action to draw the eye without overwhelming the interface.
- Clean, sans-serif font for readability and a modern feel.
- Use minimalist, line-based icons for a modern, uncluttered look.
- Grid-based layout with a focus on responsive design for optimal viewing on all devices.
- Subtle transitions and hover effects to enhance user experience without being distracting.