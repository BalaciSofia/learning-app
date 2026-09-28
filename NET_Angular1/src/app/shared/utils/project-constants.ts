import { InjectionToken } from '@angular/core';

export class ProjectConstants {
  static readonly TOKEN_KEY = 'accessToken';
}

export const TOKEN_KEY = new InjectionToken<string>('TOKEN_KEY', {
  providedIn: 'root',
  factory: () => ProjectConstants.TOKEN_KEY
});
