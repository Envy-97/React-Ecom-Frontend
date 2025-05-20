import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] py-12"> {/* Adjust min-height based on navbar/footer */}
      <LoginForm />
    </div>
  );
}
