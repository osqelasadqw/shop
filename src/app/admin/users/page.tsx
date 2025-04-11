'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layouts/admin-layout';
import { getAllUsers, updateUserRole } from '@/lib/firebase-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, UserCog } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  isAdmin: boolean;
  createdAt: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await getAllUsers();
      setUsers(usersData);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('მომხმარებლების ჩატვირთვა ვერ მოხერხდა');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleAdmin = async (userId: string, email: string, currentValue: boolean) => {
    try {
      setUpdating(userId);
      setError(null);
      setSuccess(null);
      
      // Update in Firestore
      await updateUserRole(userId, !currentValue);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isAdmin: !currentValue } : user
      ));
      
      setSuccess(`${email} ახლა ${!currentValue ? 'არის' : 'აღარ არის'} ადმინისტრატორი`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating user role:', err);
      setError(`მომხმარებლის როლის განახლება ვერ მოხერხდა: ${email}`);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">მომხმარებლების მართვა</h1>
            <Button 
              onClick={fetchUsers}
              disabled={isLoading}
              variant="outline"
            >
              განახლება
            </Button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              {success}
            </div>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                მომხმარებლები და უფლებები
              </CardTitle>
              <CardDescription>
                მართეთ, თუ ვის აქვს ადმინისტრატორის პანელზე წვდომა
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  მომხმარებლები არ მოიძებნა
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ელ-ფოსტა</TableHead>
                      <TableHead>დარეგისტრირების დრო</TableHead>
                      <TableHead>ადმინისტრატორი</TableHead>
                      <TableHead className="text-right">მოქმედებები</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          {user.createdAt ? (
                            format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm')
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          {user.isAdmin ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              დიახ
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              არა
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            <Switch
                              checked={user.isAdmin}
                              onCheckedChange={() => 
                                handleToggleAdmin(user.id, user.email, user.isAdmin)
                              }
                              disabled={updating === user.id}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 