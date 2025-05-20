
import type { Product } from '@/types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Celestial Silk Scarf',
    description: 'A luxurious silk scarf woven with threads of starlight. Soft, elegant, and timeless.',
    price: 75.00,
    imageUrl: 'https://placehold.co/600x600.png', // Standard square
    stock: 10,
    category: 'Accessories',
    aiHint: 'silk scarf',
  },
  {
    id: '2',
    name: 'Moonstone Pendant',
    description: 'An enigmatic moonstone pendant that captures the essence of the night sky. Glows faintly in the dark.',
    price: 120.00,
    imageUrl: 'https://placehold.co/500x600.png', // Portrait
    stock: 5,
    category: 'Jewelry',
    aiHint: 'moonstone jewelry',
  },
  {
    id: '3',
    name: 'Dreamweaver\'s Journal',
    description: 'A handcrafted leather-bound journal for your deepest thoughts and dreams. Pages made from recycled stardust.',
    price: 45.00,
    imageUrl: 'https://placehold.co/600x500.png', // Landscape
    stock: 15,
    category: 'Stationery',
    aiHint: 'leather journal',
  },
  {
    id: '4',
    name: 'Elixir of Serenity Tea',
    description: 'A calming blend of ethereal herbs that promotes peace and tranquility. Handpicked under a blue moon.',
    price: 25.00,
    imageUrl: 'https://placehold.co/550x550.png', // Slightly smaller square
    stock: 30,
    category: 'Consumables',
    aiHint: 'herbal tea',
  },
  {
    id: '5',
    name: 'Stardust Bath Bombs (Set of 3)',
    description: 'Transform your bath into a galaxy with these shimmering, fragrant bath bombs. Infused with cosmic dust.',
    price: 30.00,
    imageUrl: 'https://placehold.co/600x450.png', // Wider landscape
    stock: 20,
    category: 'Bath & Body',
    aiHint: 'bath bombs',
  },
  {
    id: '6',
    name: 'Oracle Reading Cards',
    description: 'A beautifully illustrated deck of oracle cards to guide your intuition. Comes with a velvet pouch.',
    price: 55.00,
    imageUrl: 'https://placehold.co/450x600.png', // Taller portrait
    stock: 8,
    category: 'Spiritual',
    aiHint: 'oracle cards',
  },
];
