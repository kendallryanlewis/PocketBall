export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    username?: string;
    phone?: string;
    avatarUrl?: string;
    roles?: string[];
    createdAt?: Date;
    updatedAt?: Date;
    onboardingCompleted: boolean;
    platforms: UserPlatform[];
}

export interface UserPlatform {
    id: string;
    name: string;
    url: string;
    defaultUserEmail: string;
    company?: string;
    dateCreated: Date;
    dateUpdated: Date;
    description?: string;
    platformType?: string;
    status?: string;
    // Add more fields as needed for site/platform details
}
