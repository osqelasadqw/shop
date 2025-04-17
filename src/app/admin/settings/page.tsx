'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getSettings, updateSettings } from '@/lib/firebase-service';
import { toast } from 'sonner';

interface SiteSettings {
  address: string;
  email: string;
  phone: string;
  aboutUsContent: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({ address: '', email: '', phone: '', aboutUsContent: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const fetchedSettings = await getSettings();
        if (fetchedSettings) {
          setSettings(fetchedSettings as SiteSettings);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        toast.error("პარამეტრების ჩატვირთვისას მოხდა შეცდომა");
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateSettings(settings);
      toast.success("პარამეტრები წარმატებით განახლდა");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("პარამეტრების შენახვისას მოხდა შეცდომა");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">საიტის პარამეტრები</h1>
        
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">საკონტაქტო ინფორმაცია (Footer)</h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="address">მისამართი</Label>
              <Input 
                id="address"
                name="address"
                value={settings.address}
                onChange={handleInputChange}
                placeholder="მაგ: თბილისი, საქართველო"
              />
            </div>
            <div>
              <Label htmlFor="email">ელ-ფოსტა</Label>
              <Input 
                id="email"
                name="email"
                type="email"
                value={settings.email}
                onChange={handleInputChange}
                placeholder="მაგ: info@example.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">ტელეფონის ნომერი</Label>
              <Input 
                id="phone"
                name="phone"
                value={settings.phone}
                onChange={handleInputChange}
                placeholder="მაგ: +995 555 123 456"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">&quot;ჩვენს შესახებ&quot; გვერდის ტექსტი</h2>
          <div>
            <Label htmlFor="aboutUsContent">ტექსტი</Label>
            <Textarea
              id="aboutUsContent"
              name="aboutUsContent"
              value={settings.aboutUsContent}
              onChange={handleInputChange}
              placeholder="შეიყვანეთ ტექსტი, რომელიც გამოჩნდება &apos;ჩვენს შესახებ&apos; გვერდზე"
              rows={10}
            />
            <p className="text-xs text-muted-foreground mt-1">შეგიძლიათ გამოიყენოთ მარტივი ტექსტი.</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'მიმდინარეობს შენახვა...' : 'ცვლილებების შენახვა'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
} 