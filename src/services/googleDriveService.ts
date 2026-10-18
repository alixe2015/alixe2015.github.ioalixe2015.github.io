import { PostcardEntry } from '../types';

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
}

const FOLDER_NAME = '具身回响 · Embodied Echo 备份';

/**
 * Locate or create the dedicated app folder in Google Drive
 */
export async function findOrCreateAppFolder(accessToken: string): Promise<string> {
  const query = `mimeType='application/vnd.google-apps.folder' and name='${FOLDER_NAME}' and trashed=false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;

  const res = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Drive folder search failed: ${err}`);
  }

  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  // Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: '具身回响（Embodied Echo）生活切片与原声记忆云端备份',
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create Google Drive folder: ${err}`);
  }

  const newFolder = await createRes.json();
  return newFolder.id;
}

/**
 * List all backup files in the app folder
 */
export async function listBackupFiles(accessToken: string, folderId: string): Promise<DriveFileInfo[]> {
  const query = `'${folderId}' in parents and trashed=false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,modifiedTime,size,webViewLink)&orderBy=modifiedTime desc`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to list files from Google Drive: ${err}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Backup postcards to Google Drive as a JSON snapshot with multipart upload
 */
export async function backupPostcardsToDrive(
  postcards: PostcardEntry[],
  accessToken: string,
  folderId: string,
  backupName?: string
): Promise<DriveFileInfo> {
  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = backupName || `embodied_echoes_backup_${dateStr}.json`;

  const backupData = {
    app: 'Embodied Echo · 具身回响',
    version: '2.0.0',
    exportDate: now.toISOString(),
    totalEntries: postcards.length,
    postcards,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    parents: [folderId],
    description: `包含 ${postcards.length} 张具身明信片与录音心潮的完整云端备份`,
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(backupData, null, 2) +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,size,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Drive upload failed: ${err}`);
  }

  return await res.json();
}

/**
 * Download and parse a backup file from Google Drive
 */
export async function downloadBackupFile(
  fileId: string,
  accessToken: string
): Promise<{ postcards: PostcardEntry[]; exportDate?: string }> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to download backup file from Drive: ${err}`);
  }

  const data = await res.json();
  if (Array.isArray(data.postcards)) {
    return { postcards: data.postcards, exportDate: data.exportDate };
  } else if (Array.isArray(data)) {
    return { postcards: data };
  } else {
    throw new Error('云端备份文件格式不符合具身明信片规范');
  }
}

/**
 * Delete a backup file from Google Drive
 * (Note: Caller MUST request explicit confirmation from user before calling)
 */
export async function deleteDriveFile(fileId: string, accessToken: string): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.text();
    throw new Error(`Failed to delete Google Drive file: ${err}`);
  }
}
