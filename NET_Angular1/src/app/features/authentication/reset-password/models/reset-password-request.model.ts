export interface ResetPasswordRequest {
    readonly token: string;
    readonly newPassword: string;
    readonly confirmNewPassword: string;
}
