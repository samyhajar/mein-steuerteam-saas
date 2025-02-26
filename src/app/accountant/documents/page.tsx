'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';
import { ChevronLeft, Download, FileIcon, FolderIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AccountantDocumentsPage() {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clientNames, setClientNames] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load client names on initial load
  useEffect(() => {
    async function fetchClientNames() {
      console.log('🔄 FETCH: Loading client names from database...');
      const supabase = createClient();

      // Add a timestamp to see when this happens
      console.log('⏱️ Start client name fetch:', new Date().toISOString());

      const { data, error } = await supabase.from('clients').select('id, first_name, last_name, name');

      if (error) {
        console.error('❌ ERROR: Failed to fetch client names:', error);
        return;
      }

      console.log(`✅ SUCCESS: Fetched ${data?.length || 0} clients`);

      if (data) {
        // Log each client's data for debugging
        console.log('📜 RAW CLIENT DATA:', data);

        const namesMap: Record<string, string> = {};
        data.forEach((client) => {
          let displayName = '';

          // Log the available fields for this client
          console.log(`🧐 Client ${client.id} fields:`, {
            name: client.name || '<empty>',
            first_name: client.first_name || '<empty>',
            last_name: client.last_name || '<empty>',
          });

          if (client.name) {
            displayName = client.name;
          } else if (client.first_name || client.last_name) {
            displayName = `${client.first_name || ''} ${client.last_name || ''}`.trim();
          } else {
            displayName = client.id;
          }

          namesMap[client.id] = displayName;
          console.log(`✏️ Map: ${client.id} → "${displayName}"`);
        });

        console.log('📝 FINAL CLIENT NAMES MAP:', namesMap);
        setClientNames(namesMap);
      }
    }

    fetchClientNames();
  }, []);

  // Load items for the current path
  useEffect(() => {
    async function fetchItems() {
      setIsLoading(true);
      console.log('🔍 Fetching items for path:', currentPath);

      try {
        const supabase = createClient();
        const pathString = currentPath.join('/');
        console.log('📁 Full path string:', pathString);

        if (currentPath.length === 0) {
          // Root level - show clients
          console.log('👥 Fetching all clients...');
          const { data: clientsData, error: clientsError } = await supabase
            .from('clients')
            .select('id, name, first_name, last_name');

          if (clientsError) {
            console.error('❌ Error fetching clients:', clientsError);
            return;
          }

          console.log('👥 Found clients:', clientsData);

          if (clientsData) {
            // Get a list of client IDs that have folders in storage
            console.log('🔍 Checking storage for client folders...');
            const { data: storageData, error: storageError } = await supabase.storage.from('client-documents').list();

            if (storageError) {
              console.error('❌ Error listing storage:', storageError);
              return;
            }

            console.log('📁 Storage root contents:', storageData);
            const clientsWithStorage = storageData?.map((item) => item.name) || [];
            console.log('📂 Clients with storage folders:', clientsWithStorage);

            // Filter clients to only those with storage folders
            const clientItems = clientsData
              .filter((client) => clientsWithStorage.includes(client.id))
              .map((client) => {
                const displayName = clientNames[client.id] || client.id;
                console.log(`📂 Client ${client.id} will display as: ${displayName}`);
                return {
                  id: client.id,
                  name: client.id, // Keep original ID as name for folder navigation
                  displayName: displayName, // Use display name from existing state
                  type: 'folder',
                  isClient: true,
                };
              });

            console.log('📂 Final client folders to display:', clientItems);
            setItems(clientItems);
          }
        } else if (currentPath.length === 1) {
          // We're viewing a client - should show years
          console.log(`🔍 Checking storage for client: ${currentPath[0]}`);
          const { data, error } = await supabase.storage.from('client-documents').list(pathString);

          if (error) {
            console.error('❌ Error listing client folder:', error);
            return;
          }

          console.log('📁 Client folder contents (direct):', data);

          if (data && data.length > 0) {
            // If there are items in client folder, format and display
            console.log('📂 Processing client folder contents...');
            const formattedItems = data.map((item) => {
              const isFolder = !item.metadata?.mimetype;
              console.log(`  - Item: ${item.name}, Is Folder: ${isFolder}, Metadata:`, item.metadata);
              return {
                ...item,
                type: isFolder ? 'folder' : 'file',
                displayName: item.name.match(/^\d{4}$/) ? item.name : item.name,
              };
            });

            console.log('📂 Formatted items:', formattedItems);
            setItems(formattedItems);
          } else {
            // No direct items - check database for this client's documents
            console.log(`🔎 No direct folders - checking database for client ${currentPath[0]}...`);
            const { data: documents, error: dbError } = await supabase
              .from('documents')
              .select('file_path')
              .eq('client_id', currentPath[0]);

            if (dbError) {
              console.error('❌ Error fetching client documents:', dbError);
              return;
            }

            console.log('📄 Client documents from DB:', documents);

            if (documents && documents.length > 0) {
              // Extract years from file paths
              console.log('🗓️ Extracting years from document paths...');
              const years = new Set<string>();
              documents.forEach((doc) => {
                console.log(`  - Analyzing path: ${doc.file_path}`);
                const parts = doc.file_path.split('/');
                console.log(`  - Path parts:`, parts);
                if (parts.length >= 2) {
                  // Check if second part is a year (after client ID)
                  if (parts[1].match(/^\d{4}$/)) {
                    console.log(`  - Found year: ${parts[1]}`);
                    years.add(parts[1]);
                  } else {
                    console.log(`  - Not a year: ${parts[1]}`);
                  }
                }
              });

              console.log('🗓️ Extracted years:', Array.from(years));

              // Create year folders based on documents
              const yearFolders = Array.from(years).map((year) => ({
                name: year,
                displayName: year,
                type: 'folder',
                id: `year-${year}`,
              }));

              console.log('📂 Generated year folders:', yearFolders);
              setItems(yearFolders.length > 0 ? yearFolders : []);
            } else {
              // No documents found for this client
              console.log('❌ No documents found for this client');
              setItems([]);
            }
          }
        } else if (currentPath.length === 2) {
          // We're viewing a year - should show months
          const { data } = await supabase.storage.from('client-documents').list(pathString);
          console.log('Year folder contents:', data);

          if (data && data.length > 0) {
            // Format month folders
            const formattedItems = data.map((item) => {
              const isDirectory = !item.metadata?.mimetype;

              // Format month folders to display their names
              if (isDirectory && item.name.match(/^(0[1-9]|1[0-2])$/)) {
                const monthIndex = parseInt(item.name) - 1;
                const monthName = new Date(2000, monthIndex, 1).toLocaleString('default', { month: 'long' });
                return {
                  ...item,
                  displayName: monthName,
                  type: 'folder',
                };
              }

              return {
                ...item,
                type: isDirectory ? 'folder' : 'file',
              };
            });

            setItems(formattedItems);
          } else {
            // If no direct folder, check database
            const { data: documents } = await supabase
              .from('documents')
              .select('file_path')
              .eq('client_id', currentPath[0]);

            if (documents && documents.length > 0) {
              // Extract months from file paths for this year
              const months = new Set<string>();
              documents.forEach((doc) => {
                const parts = doc.file_path.split('/');
                if (parts.length >= 3 && parts[1] === currentPath[1]) {
                  months.add(parts[2]);
                }
              });

              // Create month folders
              const monthFolders = Array.from(months).map((month) => {
                let displayName = month;
                if (month.match(/^(0[1-9]|1[0-2])$/)) {
                  const monthIndex = parseInt(month) - 1;
                  displayName = new Date(2000, monthIndex, 1).toLocaleString('default', { month: 'long' });
                }

                return {
                  name: month,
                  displayName,
                  type: 'folder',
                  id: `month-${month}`,
                };
              });

              setItems(monthFolders.length > 0 ? monthFolders : []);
            } else {
              setItems([]);
            }
          }
        } else if (currentPath.length === 3) {
          // We're viewing a month - should show document types/categories
          console.log('🔍 Checking month folder for categories:', pathString);
          const { data, error } = await supabase.storage.from('client-documents').list(pathString);

          if (error) {
            console.error('❌ Error listing month folder:', error);
            return;
          }

          console.log('📁 Month folder contents:', data);

          if (data && data.length > 0) {
            // First, identify folders vs. files
            const folders = data.filter((item) => !item.metadata?.mimetype);
            const files = data.filter((item) => item.metadata?.mimetype);

            console.log('📂 Found folders:', folders);
            console.log('📄 Found files:', files);

            // Create items array with folders first (categories), then files
            let formattedItems = [...folders, ...files].map((item) => {
              const isFolder = !item.metadata?.mimetype;

              // Format category folders with nice display names
              if (isFolder) {
                return {
                  ...item,
                  type: 'folder',
                  displayName: item.name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
                };
              }

              // It's a direct file in the month folder
              return {
                ...item,
                type: 'file',
              };
            });

            // If no folders found, check if there are any documents in the database with categories
            if (folders.length === 0 && files.length === 0) {
              console.log('🔍 No direct folders or files - checking database for categories...');
              // Check database for document categories
              const { data: documents } = await supabase
                .from('documents')
                .select('file_path, category')
                .eq('client_id', currentPath[0])
                .filter('file_path', 'like', `${currentPath[0]}/${currentPath[1]}/${currentPath[2]}/%`);

              if (documents && documents.length > 0) {
                console.log('📄 Found documents in database:', documents);

                // Extract unique categories
                const categories = new Set<string>();
                documents.forEach((doc) => {
                  if (doc.category) {
                    categories.add(doc.category);
                  } else {
                    // Try to extract category from file path
                    const parts = doc.file_path.split('/');
                    if (parts.length >= 4) {
                      categories.add(parts[3]);
                    }
                  }
                });

                console.log('🗂️ Extracted categories:', Array.from(categories));

                // Create virtual category folders
                formattedItems = Array.from(categories).map((category) => ({
                  name: category,
                  displayName: category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
                  type: 'folder',
                  id: `category-${category}`,
                }));
              }
            }

            console.log('📂 Final formatted items for month view:', formattedItems);
            setItems(formattedItems);
          } else {
            // No direct folders/files in the month - check DB as above
            // (same code as in the if block above for checking DB)
          }
        } else {
          // Rest of the navigation (month or category level)
          // The existing code for this part is fine
          const { data } = await supabase.storage.from('client-documents').list(pathString);
          console.log(`Path level ${currentPath.length} contents:`, data);

          if (data) {
            // Format items as before
            const formattedItems = data.map((item) => {
              const isDirectory = !item.metadata?.mimetype;

              // Format categories to be title case
              if (currentPath.length === 3 && isDirectory) {
                return {
                  ...item,
                  displayName: item.name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
                  type: 'folder',
                };
              }

              return {
                ...item,
                type: isDirectory ? 'folder' : 'file',
              };
            });

            setItems(formattedItems);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching items:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchItems();
  }, [currentPath]);

  // Navigate to a folder
  const navigateToFolder = (path: string[]) => {
    setCurrentPath(path);
  };

  // Navigate up one level
  const navigateUp = () => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  // Handle clicking a folder
  const handleFolderClick = (item: any) => {
    console.log('📂 Clicked folder:', item);
    console.log('📂 Current path:', currentPath);
    console.log('📂 Navigating to:', [...currentPath, item.name]);
    navigateToFolder([...currentPath, item.name]);
  };

  // Handle file download
  const handleDownload = async (item: any) => {
    const supabase = createClient();
    const fullPath = [...currentPath, item.name].join('/');

    const { data } = await supabase.storage.from('client-documents').createSignedUrl(fullPath, 60);

    if (data) {
      window.open(data.signedUrl, '_blank');
    }
  };

  // Get the display name for a path segment
  const getPathSegmentDisplay = (segment: string, index: number) => {
    // If it's a client ID and we're at the first level
    if (index === 0) {
      // Get the client name from our already-cached map
      return clientNames[segment] || segment;
    }

    // Month display
    if (index === 2 && segment.match(/^(0[1-9]|1[0-2])$/)) {
      const monthIndex = parseInt(segment) - 1;
      return new Date(2000, monthIndex, 1).toLocaleString('default', { month: 'long' });
    }

    // Category display
    if (index === 3) {
      return segment.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    }

    return segment;
  };

  const createTestDocument = async (clientId: string) => {
    try {
      setIsLoading(true);

      const supabase = createClient();
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const folderPath = `${clientId}/${year}/${month}/einzahlungen`;
      const fileName = `test_document_${Date.now()}.txt`;
      const filePath = `${folderPath}/${fileName}`;

      console.log('Creating test structure:', filePath);

      // Create a simple text file
      const fileContent = new Blob(['This is a test document'], { type: 'text/plain' });

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('client-documents')
        .upload(filePath, fileContent);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        setErrorMessage(`Error uploading file: ${uploadError.message}`);
        return;
      }

      console.log('Upload successful:', uploadData);

      // Create document record in database
      const { error: dbError } = await supabase.from('documents').insert({
        client_id: clientId,
        file_path: filePath,
        filename: fileName,
        file_type: 'text/plain',
        category: 'einzahlungen',
        size_bytes: fileContent.size,
        uploaded_at: new Date().toISOString(),
      });

      if (dbError) {
        console.error('Database error:', dbError);
        setErrorMessage(`Error creating document record: ${dbError.message}`);
        return;
      }

      console.log('Document record created successfully');
      alert('Test document created successfully. Refreshing...');

      // Force reload the current folder view
      if (currentPath.length > 0) {
        navigateToFolder([...currentPath]);
      } else {
        navigateToFolder([]);
      }
    } catch (error) {
      console.error('Error creating test document:', error);
      setErrorMessage(`Unexpected error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Add a useEffect for fetching individual client names when needed
  useEffect(() => {
    // Only run this if we have a client ID in the path and it's not in our clientNames map
    if (currentPath.length > 0 && !clientNames[currentPath[0]]) {
      async function fetchSingleClient() {
        console.log(`🔍 Fetching single client: ${currentPath[0]}`);

        const supabase = createClient();
        const { data, error } = await supabase
          .from('clients')
          .select('id, name, first_name, last_name')
          .eq('id', currentPath[0])
          .single();

        if (error) {
          console.error(`❌ Error fetching single client: ${error.message}`);
          return;
        }

        if (data) {
          console.log(`✅ Found single client data:`, data);
          let displayName = '';

          if (data.name) {
            displayName = data.name;
          } else if (data.first_name || data.last_name) {
            displayName = `${data.first_name || ''} ${data.last_name || ''}`.trim();
          } else {
            displayName = data.id;
          }

          console.log(`🔄 Updating single client name: ${data.id} → ${displayName}`);

          // Update the clientNames map with this new entry
          setClientNames((prev) => ({
            ...prev,
            [data.id]: displayName,
          }));
        }
      }

      fetchSingleClient();
    }
  }, [currentPath, clientNames]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Document Library</h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigateToFolder([])}>Documents</BreadcrumbLink>
              </BreadcrumbItem>

              {currentPath.map((segment, index) => {
                // For breadcrumbs, we'll use synchronous lookup from the cached map
                const displayName = getPathSegmentDisplay(segment, index);

                return (
                  <div key={index} className="flex items-center">
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink onClick={() => navigateToFolder(currentPath.slice(0, index + 1))}>
                        {displayName}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </div>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>

          {currentPath.length > 0 && (
            <Button variant="ghost" size="sm" className="mt-2" onClick={navigateUp}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {currentPath.length === 0
                ? 'Clients'
                : (() => {
                    const segment = currentPath[currentPath.length - 1];
                    const index = currentPath.length - 1;
                    return getPathSegmentDisplay(segment, index);
                  })()}
            </CardTitle>

            {/* Add debug buttons */}
            <div className="flex gap-2">
              {currentPath.length === 1 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Create Test Document
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Create Test Document</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will create a test document in the current client folder with the proper structure. Use
                        this to verify the document browser is working correctly.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => createTestDocument(currentPath[0])}>Create</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Show debug info in console
                  console.log('DEBUG INFO:');
                  console.log('Current Path:', currentPath);
                  console.log('Client Names:', clientNames);
                  console.log('Current Items:', items);
                  alert('Debug info logged to console. Open browser dev tools to view.');
                }}
              >
                Debug Info
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No items found in this folder.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <div
                  key={item.id || item.name}
                  className={`p-4 rounded-lg border flex flex-col items-center text-center cursor-pointer transition-colors ${
                    item.type === 'folder'
                      ? 'border-blue-300 bg-blue-100 text-blue-900 hover:bg-opacity-80'
                      : currentPath.length >= 3
                        ? 'border-gray-200 bg-transparent hover:bg-gray-50/30'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => (item.type === 'folder' ? handleFolderClick(item) : handleDownload(item))}
                >
                  {item.type === 'folder' ? (
                    <FolderIcon className="h-12 w-12 text-blue-600 mb-2" />
                  ) : (
                    <FileIcon className="h-12 w-12 text-gray-500 mb-2" />
                  )}
                  <span className="font-medium truncate w-full">{item.displayName || item.name}</span>
                  {item.type === 'file' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(item);
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
