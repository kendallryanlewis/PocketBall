// This file exports the recurring and one-time add-ons arrays for reuse across the app.
// Usage: import { recurringAddons, oneTimeAddons } from './addons.data';

export interface Addon {
    title: string;
    desc: string;
    price: string;
}

export const recurringAddons: Addon[] = [
    { title: 'Reputation Management', desc: 'Monitor and encourage reviews across Google and Yelp to build trust.', price: '$100–$300/mo' },
    { title: 'Social Media Profile Management', desc: 'Create and brand profiles on Facebook, Instagram, LinkedIn, or Twitter.', price: '$150–$300 ($50-$100 custom post)' },
    { title: 'Website Maintenance', desc: 'Monthly updates, backups, and security checks to keep your site running smoothly.', price: '$75–$200/mo' },
    { title: 'Content Updates', desc: 'Quick edits or new sections for your existing website as your business evolves.', price: '$50–$150 per update' },
    { title: 'Email Automation', desc: 'Set up welcome sequences and follow-up campaigns to engage your customers automatically.', price: '$300–$600 setup' },
    { title: 'Domain/Hosting Management', desc: 'Help with domain registration, DNS, or hosting migration for a smooth launch.', price: '$120-350' },
];

export const oneTimeAddons: Addon[] = [
    { title: 'Logo Redesign', desc: 'Modernize your brand with a fresh logo update or a full redesign.', price: '$200–$500' },
    { title: 'Business Cards & Stationery', desc: 'Custom business cards, letterheads, and branded templates for a professional look.', price: '$100–$250 per set' },
    { title: 'Custom T-Shirts & Merch', desc: 'Branded t-shirts, mugs, stickers, and more to help your business stand out.', price: 'Cost + markup' },
    { title: 'Print Materials', desc: 'Flyers, brochures, banners, and signage designed to match your brand.', price: '$100–$300 each' },
    { title: 'Landing Pages', desc: 'High-converting pages for special offers, events, or lead generation.', price: '$250–$600 per page' },
    { title: 'Local SEO Boost', desc: 'Google Business optimization and local keyword targeting to help you get found.', price: '$250–$400' },
    { title: 'Analytics Setup', desc: 'Simple dashboards to track what\'s working and what\'s not.', price: '$200–$500 setup' },
    { title: 'Brand Style Guide', desc: 'Concise PDF with logo usage, colors, fonts, and brand rules for consistency.', price: '$150–$350' },
    { title: 'Social Media Templates', desc: 'Reusable Canva or Figma templates for posts and stories you can update yourself.', price: '$100–$300 per set' },
    { title: 'Email Signature Design', desc: 'Branded, clickable email signatures for you and your team.', price: '$50–$100 each' },
    { title: 'Contact/Booking Forms', desc: 'Custom forms with notifications and spam protection for easy client contact.', price: '$100–$250 each' },
    { title: 'FAQ or Resource Pages', desc: 'Add a helpful FAQ or resource section to your site for your customers.', price: '$150–$300' },
    { title: 'Simple Integrations', desc: 'Connect your site to Mailchimp, Google Analytics, Calendly, and more.', price: '$100–$300 each' },
    { title: 'PDF/Document Design', desc: 'Branded proposals, menus, or info sheets for print or download.', price: '$100–$250 each' },
    { title: 'Mini SEO Audit', desc: 'One-time site checkup with actionable tips to improve your search ranking.', price: '$100–$200' },
    { title: 'Accessibility Improvements', desc: 'Make your site more usable for all visitors with accessibility best practices.', price: '$100–$300' },
    { title: 'Domain/Hosting Setup', desc: 'Help with domain registration, DNS, or hosting migration for a smooth launch.', price: '$75–$200' },
];
