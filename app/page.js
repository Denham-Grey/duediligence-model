import { redirect } from 'next/navigation';

// The prototype opened on the sign-in screen; from M4 the proxy sends signed-in users on.
export default function Home() {
  redirect('/login');
}
