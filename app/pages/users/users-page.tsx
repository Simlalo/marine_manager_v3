import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table } from '../../components/ui/table';
import { UserRole } from '../../types/auth';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastLogin?: Date;
}

export const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data - replace with actual user data from your store
  const users: User[] = [
    { id: '1', name: 'Admin User', email: 'admin@example.com', role: UserRole.ADMIN, lastLogin: new Date() },
    { id: '2', name: 'Regular User', email: 'user@example.com', role: UserRole.USER, lastLogin: new Date() },
  ];

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
        <Button>Ajouter un Utilisateur</Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Rechercher un utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Users Table */}
      <div className="rounded-md border">
        <Table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Dernière Connexion</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  {user.lastLogin?.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </td>
                <td>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Éditer
                    </Button>
                    <Button size="sm" variant="destructive">
                      Supprimer
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default UsersPage;
