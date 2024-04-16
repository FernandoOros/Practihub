import { CanActivateFn } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthenticationService);
  return authService.isLoggedIn();
};
