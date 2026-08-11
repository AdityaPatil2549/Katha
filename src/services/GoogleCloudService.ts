import { gapi } from 'gapi-script';
import { dbService } from '@/db/DatabaseService';

const CLIENT_ID = '528829308172-g5tt6v14japuti0t6gpep6q5rpipvea7.apps.googleusercontent.com';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';

export class GoogleCloudService {
  private isInitialized = false;

  async initGapi() {
    if (this.isInitialized) return;
    
    return new Promise<void>((resolve, reject) => {
      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES,
          });
          this.isInitialized = true;
          resolve();
        } catch (error) {
          console.error("Error initializing GAPI client", error);
          reject(error);
        }
      });
    });
  }

  setAccessToken(token: string) {
    gapi.client.setToken({ access_token: token });
  }

  /**
   * Backup the entire local IndexedDB to Google Drive AppData folder
   */
  async backupToCloud() {
    if (!this.isInitialized) await this.initGapi();

    try {
      // Gather all local data
      const [stories, moments, sessions, knowledge, timeline] = await Promise.all([
        dbService.stories.findAll(),
        dbService.moments.findAll(),
        dbService.sessions.findAll(),
        dbService.knowledge.findAll(),
        dbService.timeline.findAll()
      ]);

      const backupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        stories,
        moments,
        sessions,
        knowledge,
        timeline
      };

      const fileContent = JSON.stringify(backupData);
      const fileMetadata = {
        name: 'katha_backup.json',
        parents: ['appDataFolder']
      };

      // Check if backup already exists
      const searchRes = await gapi.client.drive.files.list({
        spaces: 'appDataFolder',
        fields: 'files(id, name)',
        q: "name='katha_backup.json'"
      });

      const files = searchRes.result.files;
      const fileId = files && files.length > 0 ? files[0].id : null;

      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const close_delim = "\r\n--" + boundary + "--";

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(fileMetadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        fileContent +
        close_delim;

      let request;
      if (fileId) {
        // Update existing file
        request = gapi.client.request({
          path: `/upload/drive/v3/files/${fileId}`,
          method: 'PATCH',
          params: { uploadType: 'multipart' },
          headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
          body: multipartRequestBody
        });
      } else {
        // Create new file
        request = gapi.client.request({
          path: '/upload/drive/v3/files',
          method: 'POST',
          params: { uploadType: 'multipart' },
          headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
          body: multipartRequestBody
        });
      }

      await request;
      console.log('Successfully backed up to Google Drive appDataFolder!');
    } catch (error) {
      console.error('Failed to backup to cloud', error);
      throw error;
    }
  }

  /**
   * Restore the entire local IndexedDB from Google Drive AppData folder
   */
  async restoreFromCloud() {
    if (!this.isInitialized) await this.initGapi();

    try {
      const searchRes = await gapi.client.drive.files.list({
        spaces: 'appDataFolder',
        fields: 'files(id, name)',
        q: "name='katha_backup.json'"
      });

      const files = searchRes.result.files;
      if (!files || files.length === 0) {
        throw new Error("No backup found in Google Drive.");
      }

      const fileId = files[0].id!;
      const downloadRes = await gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
      });

      const backupData = downloadRes.result as any;

      if (backupData.stories) {
        await dbService.stories.bulkUpsert(backupData.stories);
      }
      if (backupData.moments) {
        await dbService.moments.bulkUpsert(backupData.moments);
      }
      if (backupData.sessions) {
        await dbService.sessions.bulkUpsert(backupData.sessions);
      }
      if (backupData.knowledge) {
        await dbService.knowledge.bulkUpsert(backupData.knowledge);
      }
      if (backupData.timeline) {
        await dbService.timeline.bulkUpsert(backupData.timeline);
      }

      console.log('Successfully restored from Google Drive!');
      return true;
    } catch (error) {
      console.error('Failed to restore from cloud', error);
      throw error;
    }
  }
}

export const googleCloudService = new GoogleCloudService();
