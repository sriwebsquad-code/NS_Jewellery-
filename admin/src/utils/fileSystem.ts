import { get, set } from 'idb-keyval';

const DIRECTORY_HANDLE_KEY = 'receipt_backup_dir_handle';

/**
 * Request the user to select a directory and save its handle to IndexedDB.
 */
export async function selectBackupDirectory(): Promise<FileSystemDirectoryHandle | null> {
  try {
    if (!('showDirectoryPicker' in window)) {
      alert('Your browser does not support the File System Access API. Please use a modern desktop browser like Chrome or Edge.');
      return null;
    }
    
    // @ts-ignore
    const dirHandle = await window.showDirectoryPicker({
      mode: 'readwrite',
      id: 'receipt-backup',
    });
    
    await set(DIRECTORY_HANDLE_KEY, dirHandle);
    return dirHandle;
  } catch (err) {
    console.error('User cancelled directory selection or error occurred:', err);
    return null;
  }
}

/**
 * Get the stored directory handle. Returns null if not set or permission denied.
 */
export async function getBackupDirectory(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const handle = await get(DIRECTORY_HANDLE_KEY);
    if (!handle) return null;
    
    // Verify permission
    // @ts-ignore
    const permission = await handle.queryPermission({ mode: 'readwrite' });
    if (permission !== 'granted') {
      // @ts-ignore
      const requestStatus = await handle.requestPermission({ mode: 'readwrite' });
      if (requestStatus !== 'granted') {
        return null;
      }
    }
    
    return handle as FileSystemDirectoryHandle;
  } catch (err) {
    console.error('Error getting backup directory:', err);
    return null;
  }
}

/**
 * Save a file (Blob) to a subdirectory inside the backup directory.
 * @param baseDirHandle The root directory handle.
 * @param subfolderName The name of the subfolder (e.g., 'digigold').
 * @param fileName The name of the file (e.g., 'Receipt_123.pdf').
 * @param blob The file content.
 */
export async function saveFileToBackup(
  baseDirHandle: FileSystemDirectoryHandle,
  subfolderName: string,
  fileName: string,
  blob: Blob
): Promise<boolean> {
  try {
    // Get or create the subfolder
    // @ts-ignore
    const subfolderHandle = await baseDirHandle.getDirectoryHandle(subfolderName, { create: true });
    
    // Create or open the file
    // @ts-ignore
    const fileHandle = await subfolderHandle.getFileHandle(fileName, { create: true });
    
    // Create a writable stream and write the blob
    // @ts-ignore
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
    
    return true;
  } catch (err) {
    console.error('Error writing file to backup directory:', err);
    return false;
  }
}
