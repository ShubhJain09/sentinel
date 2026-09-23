import { getSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { getAllUsers } from '@/app/lib/db';
import { UsersClient } from './users-client';

export const metadata = {
  title: 'SENTINEL — User Administration',
};

export default async function UsersPage() {
  const session = await getSession();

  if (!session || session.role !== 'owner') {
    redirect('/overview');
  }

  const users = getAllUsers();

  return <UsersClient users={users} session={session} />;
}
