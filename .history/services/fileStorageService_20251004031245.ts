import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  getMetadata 
} from 'firebase/storage';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { storage, db } from '../firebaseConfig';

export interface UploadedFile {
  id?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  downloadURL: string;
  storagePath: string;
  uploadedAt: Timestamp;
  description?: string;
  tags: string[];
}

class FileStorageService {
  private storageRef = 'uploaded-cvs';
  private collectionName = 'uploaded_files';

  // Upload a file to Firebase Storage and save metadata to Firestore
  async uploadFile(file: File, description?: string, tags: string[] = []): Promise<string> {
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storagePath = `${this.storageRef}/${fileName}`;
      
      // Upload file to Storage
      const fileRef = ref(storage, storagePath);
      const uploadResult = await uploadBytes(fileRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      // Save metadata to Firestore
      const docRef = await addDoc(collection(db, this.collectionName), {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        downloadURL,
        storagePath,
        uploadedAt: Timestamp.now(),
        description: description || '',
        tags
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  // Get all uploaded files
  async getAllUploadedFiles(): Promise<UploadedFile[]> {
    try {
      const q = query(collection(db, this.collectionName), orderBy('uploadedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UploadedFile[];
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
      throw new Error('Failed to fetch uploaded files');
    }
  }

  // Delete a file from both Storage and Firestore
  async deleteFile(fileId: string, storagePath: string): Promise<void> {
    try {
      // Delete from Storage
      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef);
      
      // Delete from Firestore
      const docRef = doc(db, this.collectionName, fileId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  // Download a file
  async downloadFile(downloadURL: string, fileName: string): Promise<void> {
    try {
      const response = await fetch(downloadURL);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error('Failed to download file');
    }
  }

  // Get file metadata
  async getFileMetadata(storagePath: string) {
    try {
      const fileRef = ref(storage, storagePath);
      return await getMetadata(fileRef);
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw new Error('Failed to get file metadata');
    }
  }

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file type icon
  getFileTypeIcon(fileType: string): string {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('text')) return '📃';
    return '📁';
  }
}

export const fileStorageService = new FileStorageService();
