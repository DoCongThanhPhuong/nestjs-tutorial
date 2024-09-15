import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { EMethod } from 'src/constants';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly excludedRoutes: { path: string; method: EMethod }[] = [
    { path: '/auth/login', method: EMethod.POST },
    { path: '/auth/forgot-password', method: EMethod.POST },
    { path: '/auth/reset-password', method: EMethod.PATCH },
    { path: '/auth/refresh-token', method: EMethod.POST },
  ];

  constructor(private readonly roleService: RolesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const apiPath = request.route.path;
    if (this.isExcludedRoute(apiPath, method)) {
      return true;
    }

    const user = request.user;
    if (!user) throw new ForbiddenException('Unauthorized');
    const userRole = await this.roleService.findRoleByIdWithCache(user.roleId);

    const hasPermission = userRole.permissions.some(
      (permission) =>
        permission.method === method && permission.path === apiPath,
    );
    if (!hasPermission) throw new ForbiddenException('Forbidden resource');

    return true;
  }

  private isExcludedRoute(apiPath: string, method: string): boolean {
    return this.excludedRoutes.some(
      (route) => route.path === apiPath && route.method === method,
    );
  }
}
