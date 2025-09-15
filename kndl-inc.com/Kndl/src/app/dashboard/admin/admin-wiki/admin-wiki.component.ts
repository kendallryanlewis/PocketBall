import { Component } from '@angular/core';

export interface WikiPage {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdDate: string;
  lastModified: string;
  author: string;
  views: number;
  isPublished: boolean;
  slug: string;
}

export interface WikiPage {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdDate: string;
  lastModified: string;
  author: string;
  views: number;
  isPublished: boolean;
  slug: string;
}

export interface WikiCategory {
  name: string;
  icon: string;
  count: number;
  color: string;
}

@Component({
  selector: 'app-admin-wiki',
  templateUrl: './admin-wiki.component.html',
  styleUrls: ['./admin-wiki.component.scss']
})
export class AdminWikiComponent {

  // Current view state
  currentView: 'list' | 'page' | 'edit' | 'create' = 'list';
  selectedPage: WikiPage | null = null;
  searchTerm = '';
  selectedCategory = 'All';

  // Modal states
  showCreateModal = false;
  showDeleteModal = false;

  // Form data
  newPage: Partial<WikiPage> = {
    title: '',
    content: '',
    category: '',
    tags: [],
    isPublished: true
  };

  // Categories
  categories: WikiCategory[] = [
    { name: 'Documentation', icon: 'fa-file-text', count: 12, color: '#3498db' },
    { name: 'Tutorials', icon: 'fa-graduation-cap', count: 8, color: '#e74c3c' },
    { name: 'How-to Guides', icon: 'fa-wrench', count: 15, color: '#2ecc71' },
    { name: 'Processes', icon: 'fa-cogs', count: 6, color: '#9b59b6' },
    { name: 'Templates', icon: 'fa-file-code-o', count: 4, color: '#f39c12' },
    { name: 'Resources', icon: 'fa-database', count: 7, color: '#e67e22' },
    { name: 'FAQ', icon: 'fa-question-circle', count: 9, color: '#34495e' }
  ];

  // Sample wiki pages
  pages: WikiPage[] = [
    {
      id: 'WIKI-001',
      title: 'Getting Started Guide',
      content: `# Welcome to Our Wiki

This comprehensive guide will help you get started with our platform and understand the basic concepts.

## What is This Platform?

Our platform is designed to help you manage your digital presence effectively. It includes tools for:

- **Website Management**: Create and maintain professional websites
- **Domain Administration**: Register, transfer, and manage domain names
- **Content Creation**: Build engaging content with our editor tools
- **Analytics**: Track performance and user engagement

## Quick Start Steps

### 1. Set Up Your Account
Before you begin, make sure your account is properly configured:
- Verify your email address
- Complete your profile information
- Set up two-factor authentication for security

### 2. Choose Your Plan
Select the plan that best fits your needs:
- **Starter**: Perfect for small websites and personal projects
- **Professional**: Ideal for business websites and portfolios
- **Enterprise**: Comprehensive solution for large organizations

### 3. Create Your First Website
Follow these steps to create your first website:

\`\`\`bash
# Navigate to the website builder
cd /dashboard/websites
# Click "Create New Website"
# Choose a template or start from scratch
\`\`\`

## Need Help?

If you run into any issues, check out our other documentation pages or contact support.`,
      category: 'Documentation',
      tags: ['getting-started', 'beginner', 'setup'],
      createdDate: '2025-01-15',
      lastModified: '2025-02-01',
      author: 'Admin Team',
      views: 245,
      isPublished: true,
      slug: 'getting-started-guide'
    },
    {
      id: 'WIKI-002',
      title: 'Domain Transfer Process',
      content: `# How to Transfer a Domain

This guide explains the complete process of transferring a domain from one registrar to another.

## Before You Start

**Important Requirements:**
- Domain must be at least 60 days old
- Domain lock must be disabled
- You need the authorization (EPP) code
- Administrative contact email must be accessible

## Transfer Process

### Step 1: Unlock Your Domain
Log into your current registrar and:
1. Go to domain management
2. Find the "Domain Lock" or "Registrar Lock" setting
3. Disable the lock
4. Wait for confirmation email

### Step 2: Get Authorization Code
The EPP (Extensible Provisioning Protocol) code is required:
- Request it from your current registrar
- This code is usually sent to the administrative contact email
- Keep this code secure - treat it like a password

### Step 3: Initiate Transfer
At the new registrar:
1. Start the domain transfer process
2. Enter your domain name
3. Provide the authorization code
4. Complete payment for the transfer

### Step 4: Approve the Transfer
- Check emails from both old and new registrars
- Follow approval instructions promptly
- **Note**: You typically have 5 days to approve

## Timeline and Expectations

| Stage | Duration | What Happens |
|-------|----------|-------------|
| Initiation | Immediate | Transfer request submitted |
| Approval Period | 5 days | Waiting for owner approval |
| Registry Processing | 2-7 days | Official transfer processing |
| Completion | Up to 7 days total | Domain active at new registrar |

## Troubleshooting

**Common Issues:**
- **Transfer Denied**: Check if domain is locked or too new
- **No Approval Email**: Check spam folder, verify contact info
- **Authorization Failed**: Double-check the EPP code

**Contact Support** if you encounter persistent issues.`,
      category: 'How-to Guides',
      tags: ['domain', 'transfer', 'registrar', 'dns'],
      createdDate: '2025-01-20',
      lastModified: '2025-01-25',
      author: 'Technical Team',
      views: 189,
      isPublished: true,
      slug: 'domain-transfer-process'
    },
    {
      id: 'WIKI-003',
      title: 'Website Creation Workflow',
      content: `# Complete Website Creation Workflow

This document outlines our standard process for creating professional websites from concept to launch.

## Phase 1: Planning & Discovery

### Client Consultation
- **Initial Meeting**: Understand client goals, target audience, and requirements
- **Scope Definition**: Define project scope, timeline, and deliverables
- **Technical Requirements**: Identify hosting, domain, and special functionality needs

### Content Strategy
1. **Sitemap Creation**: Map out all pages and navigation structure
2. **Content Audit**: Review existing content or plan new content creation
3. **SEO Planning**: Research keywords and plan SEO strategy

## Phase 2: Design & Development

### Design Process
\`\`\`
Wireframes → Mockups → Interactive Prototypes → Final Design
\`\`\`

**Tools Used:**
- Figma for design and prototyping
- Adobe Creative Suite for graphics
- Browser testing tools for compatibility

### Development Workflow
\`\`\`bash
# 1. Set up development environment
git clone project-repo
npm install

# 2. Create feature branches
git checkout -b feature/homepage-design

# 3. Develop and test
npm run dev
npm run test

# 4. Deploy to staging
git push origin feature/homepage-design
# Create pull request for review
\`\`\`

## Phase 3: Content & Testing

### Content Management
- Import or create all written content
- Optimize images and media files
- Set up SEO meta tags and descriptions
- Configure analytics tracking

### Quality Assurance
**Testing Checklist:**
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness on various devices
- [ ] Page load speed optimization
- [ ] Form functionality testing
- [ ] Contact forms and email delivery
- [ ] SSL certificate installation
- [ ] 404 error page setup

## Phase 4: Launch & Handoff

### Pre-Launch
1. **Final Review**: Client approval of staging site
2. **DNS Configuration**: Point domain to production server
3. **SSL Setup**: Ensure secure HTTPS connection
4. **Backup System**: Configure automated backups

### Post-Launch
- **Training**: Provide client training on content management
- **Documentation**: Deliver user manuals and technical docs
- **Support Plan**: Establish ongoing maintenance agreement
- **Performance Monitoring**: Set up uptime and performance monitoring

## Tools & Resources

### Development Tools
- **Code Editor**: VS Code with extensions
- **Version Control**: Git with GitHub/GitLab
- **Task Runner**: npm scripts or Gulp
- **Testing**: Jest, Cypress for end-to-end testing

### Design Resources
- **Stock Photos**: Unsplash, Pexels
- **Icons**: Font Awesome, Feather Icons
- **Fonts**: Google Fonts, Adobe Fonts
- **Color Palettes**: Coolors, Adobe Color

## Project Timeline

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| Planning | 1-2 weeks | Sitemap, wireframes, content strategy |
| Design | 2-3 weeks | Visual designs, interactive prototypes |
| Development | 3-4 weeks | Functional website on staging server |
| Testing & Launch | 1 week | Live website with full functionality |

*Note: Timeline may vary based on project complexity and client feedback cycles.*`,
      category: 'Processes',
      tags: ['website', 'workflow', 'development', 'design', 'process'],
      createdDate: '2025-01-10',
      lastModified: '2025-01-30',
      author: 'Project Management',
      views: 156,
      isPublished: true,
      slug: 'website-creation-workflow'
    }
  ];

  // Get filtered pages
  get filteredPages(): WikiPage[] {
    return this.pages.filter(page => {
      const matchesSearch = !this.searchTerm ||
        page.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        page.content.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        page.tags.some((tag: string) => tag.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesCategory = this.selectedCategory === 'All' || page.category === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }

  // Get all category names
  get categoryNames(): string[] {
    return ['All', ...this.categories.map(cat => cat.name)];
  }

  // View methods
  viewPage(page: WikiPage): void {
    this.selectedPage = page;
    this.currentView = 'page';
    page.views++;
  }

  editPage(page: WikiPage): void {
    this.selectedPage = page;
    this.newPage = { ...page };
    this.currentView = 'edit';
  }

  backToList(): void {
    this.currentView = 'list';
    this.selectedPage = null;
    this.resetNewPage();
  }

  // Modal methods
  openCreateModal(): void {
    this.showCreateModal = true;
    this.resetNewPage();
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetNewPage();
  }

  openDeleteModal(page: WikiPage): void {
    this.selectedPage = page;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedPage = null;
  }

  // Page management
  createPage(): void {
    if (this.newPage.title && this.newPage.content) {
      const page: WikiPage = {
        id: 'WIKI-' + String(this.pages.length + 1).padStart(3, '0'),
        title: this.newPage.title!,
        content: this.newPage.content!,
        category: this.newPage.category!,
        tags: this.newPage.tags || [],
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        author: 'Current User',
        views: 0,
        isPublished: this.newPage.isPublished || true,
        slug: this.generateSlug(this.newPage.title!)
      };

      this.pages.push(page);
      this.closeCreateModal();
    }
  }

  updatePage(): void {
    if (this.selectedPage && this.newPage.title && this.newPage.content) {
      const index = this.pages.findIndex(p => p.id === this.selectedPage!.id);
      if (index !== -1) {
        this.pages[index] = {
          ...this.selectedPage,
          ...this.newPage,
          lastModified: new Date().toISOString().split('T')[0],
          slug: this.generateSlug(this.newPage.title!)
        } as WikiPage;
        this.backToList();
      }
    }
  }

  deletePage(): void {
    if (this.selectedPage) {
      this.pages = this.pages.filter(p => p.id !== this.selectedPage!.id);
      this.closeDeleteModal();
      this.backToList();
    }
  }

  // Utility methods
  resetNewPage(): void {
    this.newPage = {
      title: '',
      content: '',
      category: '',
      tags: [],
      isPublished: true
    };
  }

  generateSlug(title: string): string {
    return title.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  getCategoryIcon(categoryName: string): string {
    const category = this.categories.find(c => c.name === categoryName);
    return category ? category.icon : 'fa-file-text';
  }

  getCategoryColor(categoryName: string): string {
    const category = this.categories.find(c => c.name === categoryName);
    return category ? category.color : '#6c757d';
  }

  // Handle tags input
  updateTags(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.newPage.tags = input.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  }

  // Simple markdown parser for rendering content
  parseMarkdown(markdown: string): string {
    if (!markdown) return '';

    let html = markdown;

    // Escape HTML characters first
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Code blocks (must be done before inline code)
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers (must be done before other processing)
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

    // Bold text (must be done before italic)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic text
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Blockquotes
    html = html.replace(/^> (.*$)/gm, '<blockquote><p>$1</p></blockquote>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr>');

    // Lists - handle ordered and unordered
    const lines = html.split('\n');
    const processedLines: string[] = [];
    let inList = false;
    let listType = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextLine = i + 1 < lines.length ? lines[i + 1] : '';

      // Check for unordered list
      if (line.match(/^- (.+)/)) {
        if (!inList || listType !== 'ul') {
          if (inList) processedLines.push(`</${listType}>`);
          processedLines.push('<ul>');
          inList = true;
          listType = 'ul';
        }
        processedLines.push(`<li>${line.replace(/^- /, '')}</li>`);
      }
      // Check for ordered list
      else if (line.match(/^\d+\. (.+)/)) {
        if (!inList || listType !== 'ol') {
          if (inList) processedLines.push(`</${listType}>`);
          processedLines.push('<ol>');
          inList = true;
          listType = 'ol';
        }
        processedLines.push(`<li>${line.replace(/^\d+\. /, '')}</li>`);
      }
      // Not a list item
      else {
        if (inList) {
          processedLines.push(`</${listType}>`);
          inList = false;
          listType = '';
        }
        processedLines.push(line);
      }
    }

    // Close any remaining list
    if (inList) {
      processedLines.push(`</${listType}>`);
    }

    html = processedLines.join('\n');

    // Convert line breaks to paragraphs
    const paragraphs = html.split('\n\n').filter(p => p.trim());
    const processedParagraphs = paragraphs.map(paragraph => {
      paragraph = paragraph.trim();

      // Skip if it's already a block element
      if (paragraph.match(/^<(h[1-6]|ul|ol|blockquote|pre|hr)/)) {
        return paragraph;
      }

      // Convert single line breaks to <br> within paragraphs
      paragraph = paragraph.replace(/\n/g, '<br>');

      // Wrap in paragraph tags if not empty
      if (paragraph) {
        return `<p>${paragraph}</p>`;
      }

      return '';
    }).filter(p => p);

    html = processedParagraphs.join('\n');

    // Clean up extra line breaks and spaces
    html = html.replace(/\n+/g, '\n').trim();

    return html;
  }

  // Text formatting helpers for rich text editing
  formatText(command: string, value?: string): void {
    document.execCommand(command, false, value);
  }

  insertText(text: string): void {
    const textarea = document.querySelector('.content-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = this.newPage.content || '';

      this.newPage.content = currentContent.substring(0, start) + text + currentContent.substring(end);

      // Move cursor to end of inserted text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      });
    }
  }

  // Markdown-style formatting shortcuts
  insertMarkdown(type: string): void {
    const textarea = document.querySelector('.content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let replacement = '';

    switch (type) {
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`;
        break;
      case 'code':
        replacement = `\`${selectedText || 'code'}\``;
        break;
      case 'codeblock':
        replacement = `\`\`\`\n${selectedText || 'code block'}\n\`\`\``;
        break;
      case 'heading1':
        replacement = `# ${selectedText || 'Heading 1'}`;
        break;
      case 'heading2':
        replacement = `## ${selectedText || 'Heading 2'}`;
        break;
      case 'heading3':
        replacement = `### ${selectedText || 'Heading 3'}`;
        break;
      case 'list':
        replacement = `- ${selectedText || 'List item'}`;
        break;
      case 'numberlist':
        replacement = `1. ${selectedText || 'Numbered item'}`;
        break;
      case 'link':
        replacement = `[${selectedText || 'link text'}](url)`;
        break;
      case 'quote':
        replacement = `> ${selectedText || 'Quote'}`;
        break;
    }

    this.insertText(replacement);
  }
}
