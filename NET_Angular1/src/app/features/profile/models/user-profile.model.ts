export interface UserProfile {
    readonly id: number;
    readonly email: string;
    readonly role: string;
    readonly permissions: readonly string[];
    readonly firstName: string;
    readonly lastName: string;
    readonly institutionName: string | null;
}
