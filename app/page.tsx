import { loadTournament } from '@/lib/storage';
import PublicBracket from './PublicBracket';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const tournament = await loadTournament();
  return <PublicBracket initialData={tournament} />;
}
