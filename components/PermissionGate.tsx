
import React, { ReactNode } from 'react';
import { storageService } from '../services/storageService';
import { ResourceType } from '../types';

interface PermissionGateProps {
  children: ReactNode;
  resource: ResourceType;
  action?: 'read' | 'write' | 'delete';
  fallback?: ReactNode;
}

const PermissionGate: React.FC<PermissionGateProps> = ({ 
  children, 
  resource, 
  action = 'read',
  fallback = null 
}) => {
  const [hasPermission, setHasPermission] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkPermission = async () => {
        const role = await storageService.getCurrentUserRole();
        if (!role) {
            setHasPermission(false);
            return;
        }
        const permission = role.permissions[resource];
        if (!permission) {
            setHasPermission(false);
            return;
        }
        
        let allowed = false;
        switch (action) {
            case 'read': allowed = permission.read; break;
            case 'write': allowed = permission.write; break;
            case 'delete': allowed = permission.delete; break;
        }
        setHasPermission(allowed);
    };
    checkPermission();
  }, [resource, action]);

  if (hasPermission === null) return <>{fallback}</>;
  if (!hasPermission) return <>{fallback}</>;

  return <>{children}</>;
};

export default PermissionGate;
