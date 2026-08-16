import { redirect } from 'next/navigation';

/** Superseded by the marketing home page at "/". Kept so old links still resolve. */
export default function WelcomeRedirect() {
  redirect('/');
}
