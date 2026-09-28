export interface CreateTestRequest {
    readonly title: string;
    readonly description: string | null;
    readonly isRetakeAllowed: boolean;
}
