import { GalleryPage } from '@/components/gallery/GalleryPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gallery | Apparel Creative Generator',
  description: 'View and manage your saved creatives. Download, edit, or create new social media content for your apparel brand.',
};

/**
 * Gallery Route Page
 *
 * Displays the gallery of all saved creatives with:
 * - Responsive grid layout
 * - Search and filter capabilities
 * - Sort by date or name
 * - Bulk selection and actions
 * - Detail modal with download/edit/delete
 */
export default function Gallery() {
  return <GalleryPage />;
}
