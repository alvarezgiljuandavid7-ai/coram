import { Outlet } from 'react-router-dom';
import { AuthLayoutV2 } from '../pages/auth/AuthLayoutV2';

export function AuthLayout() {
  return <AuthLayoutV2><Outlet /></AuthLayoutV2>;
}
