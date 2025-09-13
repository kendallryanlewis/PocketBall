import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'User' | 'Manager';
  status: 'Active' | 'Deleted' | 'Invited';
  joinDate?: Date;
  lastLogin?: Date;
  location?: string; // Added location property
  bio?: string;
  fullBio?: string; // Detailed biography
  certificates?: string[]; // List of certificate names
  internships?: string[]; // List of internship names
}

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit, OnChanges {
  @Input() selectedTab: any = 'current-users';
  showInviteModal: boolean = false;
  openDetails: boolean = false;
  selectedUser: User | null = null;
  profileTab: string = 'experience'; // For profile navigation
  // Add these properties to your component class
  searchQuery: string = '';
  filteredCurrentUsers: User[] = [];
  filteredDeletedUsers: User[] = [];
  filteredInvitedUsers: User[] = [];

  currentUsers: User[] = [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice@kndl-inc.com',
      role: 'Admin',
      status: 'Active',
      joinDate: new Date('2024-01-15'),
      lastLogin: new Date('2024-12-01')
    },
    {
      id: 2,
      name: 'Bob Smith',
      email: 'bob@kndl-inc.com',
      role: 'Manager',
      status: 'Active',
      joinDate: new Date('2024-02-20'),
      lastLogin: new Date('2024-11-28')
    },
    {
      id: 3,
      name: 'Charlie Lee',
      email: 'charlie@kndl-inc.com',
      role: 'User',
      status: 'Active',
      joinDate: new Date('2024-03-10'),
      lastLogin: new Date('2024-12-02')
    },
    {
      id: 4,
      name: 'Dana White',
      email: 'dana@kndl-inc.com',
      role: 'User',
      status: 'Active',
      joinDate: new Date('2024-04-05'),
      lastLogin: new Date('2024-11-30')
    },
    {
      id: 5,
      name: 'Emily Chen',
      email: 'emily@kndl-inc.com',
      role: 'User',
      status: 'Active',
      joinDate: new Date('2024-05-12'),
      lastLogin: new Date('2024-12-01')
    }
  ];

  deletedUsers: User[] = [
    {
      id: 6,
      name: 'Eve Black',
      email: 'eve@kndl-inc.com',
      role: 'User',
      status: 'Deleted',
      joinDate: new Date('2024-01-08')
    },
    {
      id: 7,
      name: 'Frank Green',
      email: 'frank@kndl-inc.com',
      role: 'User',
      status: 'Deleted',
      joinDate: new Date('2024-02-14')
    }
  ];

  invitedUsers: User[] = [
    {
      id: 8,
      name: 'Grace Hopper',
      email: 'grace@kndl-inc.com',
      role: 'Manager',
      status: 'Invited'
    },
    {
      id: 9,
      name: 'Henry Ford',
      email: 'henry@kndl-inc.com',
      role: 'User',
      status: 'Invited'
    },
    {
      id: 10,
      name: 'Iris Watson',
      email: 'iris@kndl-inc.com',
      role: 'User',
      status: 'Invited'
    }
  ];

  constructor() { }

  onUserClick(user: User) {
    this.selectedUser = user;
    this.openDetails = true;
  }

  ngOnInit(): void {
    // Initialize filtered arrays
    this.filteredCurrentUsers = [...this.currentUsers];
    this.filteredDeletedUsers = [...this.deletedUsers];
    this.filteredInvitedUsers = [...this.invitedUsers];

    // Existing ngOnInit code...
    const validTabs = ['current-users', 'deleted-users', 'invited-users'];
    const initialTab = validTabs.includes(this.selectedTab) ? this.selectedTab : validTabs[0];
    this.selectTab(initialTab);
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedTab']) {
      this.selectTab(changes['selectedTab'].currentValue);
    }
  }

  onSearchChange(): void {
    const query = this.searchQuery.toLowerCase();

    this.filteredCurrentUsers = this.currentUsers.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );

    this.filteredDeletedUsers = this.deletedUsers.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );

    this.filteredInvitedUsers = this.invitedUsers.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }

  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
  }

  getRelativeTime(date: Date): string {
    if (!date) return 'Never';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return date.toLocaleDateString();
  }

  getUserExperience(user: User): Array<{ title: string, company: string, period: string, location: string, description: string, color: string }> {
    // Mock data for demonstration
    return [
      {
        title: 'Lead Consultant',
        company: 'HotelPro',
        period: '2022 - Present',
        location: 'New York, USA',
        description: 'Leading rebranding and digital transformation projects for hospitality clients.',
        color: '#667eea'
      },
      {
        title: 'Brand Strategist',
        company: 'Brandify',
        period: '2020 - 2022',
        location: 'Remote',
        description: 'Developed brand strategies for startups and SMBs.',
        color: '#764ba2'
      }
    ];
  }

  getUserSkills(user: User): Array<{ name: string, skills: string[] }> {
    // Mock data for demonstration
    return [
      { name: 'Design', skills: ['Branding', 'Logo Design', 'UI/UX'] },
      { name: 'Business', skills: ['Consulting', 'Strategy', 'Project Management'] },
      { name: 'Tech', skills: ['Angular', 'TypeScript', 'HTML', 'CSS'] }
    ];
  }

  viewPublicProfile(user: User): void {
    // Replace with actual navigation logic as needed
    window.open(`/public-profile/${user.id}`, '_blank');
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.onSearchChange();
  }

  // Tab management
  selectTab(tab: string): void {
    this.selectedTab = tab;
  }

  // User actions
  editUser(user: User): void {
    console.log('Edit user:', user);
    // TODO: Implement edit user modal/form
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      // Move user from current to deleted
      this.currentUsers = this.currentUsers.filter(u => u.id !== user.id);
      user.status = 'Deleted';
      this.deletedUsers.push(user);
      console.log('User deleted:', user);
    }
  }

  restoreUser(user: User): void {
    if (confirm(`Are you sure you want to restore ${user.name}?`)) {
      // Move user from deleted to current
      this.deletedUsers = this.deletedUsers.filter(u => u.id !== user.id);
      user.status = 'Active';
      user.lastLogin = new Date();
      this.currentUsers.push(user);
      console.log('User restored:', user);
    }
  }

  cancelInvite(user: User): void {
    if (confirm(`Are you sure you want to cancel the invitation for ${user.name}?`)) {
      this.invitedUsers = this.invitedUsers.filter(u => u.id !== user.id);
      console.log('Invitation cancelled for:', user);
    }
  }

  resendInvite(user: User): void {
    console.log('Resending invitation to:', user);
    // TODO: Implement resend invite functionality
    alert(`Invitation resent to ${user.email}`);
  }

  // Invite new user
  openInviteModal(): void {
    this.showInviteModal = true;
  }

  closeInviteModal(): void {
    this.showInviteModal = false;
  }

  inviteNewUser(name: string, email: string, role: 'Admin' | 'User' | 'Manager'): void {
    const newUser: User = {
      id: Math.max(...this.currentUsers.map(u => u.id), ...this.deletedUsers.map(u => u.id), ...this.invitedUsers.map(u => u.id)) + 1,
      name,
      email,
      role,
      status: 'Invited'
    };

    this.invitedUsers.push(newUser);
    this.closeInviteModal();
    console.log('New user invited:', newUser);
  }

  // Utility methods
  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'Admin': return 'role-admin';
      case 'Manager': return 'role-manager';
      case 'User': return 'role-user';
      default: return 'role-user';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Active': return 'status-active';
      case 'Deleted': return 'status-deleted';
      case 'Invited': return 'status-invited';
      default: return 'status-active';
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Never';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Profile helper methods
  closeDetails(): void {
    this.openDetails = false;
    this.selectedUser = null;
  }

  switchProfileTab(tab: string): void {
    this.profileTab = tab;
  }

  getUserAvatar(user: User): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=007bff&color=ffffff&size=120`;
  }

  getYearsExperience(user: User): string {
    if (!user.joinDate) return '0';
    const years = Math.floor((Date.now() - user.joinDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return years.toString();
  }

  getUserStats(user: User): { experience: string, certificates: string, internships: string } {
    // Mock data - in real app this would come from user profile
    return {
      experience: this.getYearsExperience(user),
      certificates: '3',
      internships: '2'
    };
  }

}
