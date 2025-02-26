'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

interface DocumentUploadAreaProps {
  title: string;
  description: string;
}

export function DocumentUploadArea({ title, description }: DocumentUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);

    const supabase = createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUploading(false);
      return;
    }

    // Get client_id
    const { data: clientUser } = await supabase
      .from('client_users')
      .select('client_id')
      .eq('user_id', user.id)
      .single();

    if (!clientUser) {
      setUploading(false);
      return;
    }

    const clientId = clientUser.client_id;
    const category = title.toLowerCase().replace(/\s/g, '_');
    const newUploadedFiles: string[] = [];

    // Upload each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${clientId}/${category}/${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('client-documents').upload(fileName, file);

      if (!uploadError) {
        newUploadedFiles.push(file.name);
      }

      // Update progress
      setProgress(((i + 1) / files.length) * 100);
    }

    setUploadedFiles([...uploadedFiles, ...newUploadedFiles]);
    setUploading(false);
    setProgress(100);

    // Refresh the page to see the new documents
    setTimeout(() => {
      router.refresh();
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? 'border-primary bg-primary/10' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input ref={fileInputRef} type="file" multiple onChange={handleFileInputChange} className="hidden" />

          {uploading ? (
            <div className="space-y-4">
              <p>Uploading...</p>
              <Progress value={progress} className="w-full" />
            </div>
          ) : (
            <>
              <p className="mb-4">Drag and drop your files here, or click to select files</p>
              <Button onClick={handleButtonClick}>Select Files</Button>
            </>
          )}

          {uploadedFiles.length > 0 && (
            <div className="mt-6 text-left">
              <h4 className="font-medium mb-2">Uploaded Files:</h4>
              <ul className="list-disc list-inside">
                {uploadedFiles.map((file, index) => (
                  <li key={index} className="text-sm">
                    {file}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
