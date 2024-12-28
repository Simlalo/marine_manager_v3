import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/header';
import { Sidebar } from '../components/layout/sidebar';

export default function Root() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
