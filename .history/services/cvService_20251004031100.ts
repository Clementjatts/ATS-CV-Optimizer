import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { UploadedFile } from './fileStorageService';

export interface SavedCV {
  id?: string;
  name: string;
  content: string;
  jobTitle?: string;
  company?: string;
  industry?: string;
  skills: string[];
  experience: string[];
  education: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  tags: string[];
  description?: string;
}

export interface CVSearchFilters {
  jobTitle?: string;
  industry?: string;
  skills?: string[];
  tags?: string[];
}

// Union type for both optimized CVs and uploaded files
export type CVSource = SavedCV | UploadedFile;

class CVService {
  private collectionName = 'saved_cvs';

  // Save a new CV to the database
  async saveCV(cvData: Omit<SavedCV, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...cvData,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving CV:', error);
      throw new Error('Failed to save CV');
    }
  }

  // Get all saved CVs
  async getAllCVs(): Promise<SavedCV[]> {
    try {
      const q = query(collection(db, this.collectionName), orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavedCV[];
    } catch (error) {
      console.error('Error fetching CVs:', error);
      throw new Error('Failed to fetch CVs');
    }
  }

  // Search CVs based on filters
  async searchCVs(filters: CVSearchFilters): Promise<SavedCV[]> {
    try {
      let q = query(collection(db, this.collectionName), orderBy('updatedAt', 'desc'));
      
      // Add filters if provided
      if (filters.jobTitle) {
        q = query(q, where('jobTitle', '==', filters.jobTitle));
      }
      
      if (filters.industry) {
        q = query(q, where('industry', '==', filters.industry));
      }

      const querySnapshot = await getDocs(q);
      let results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavedCV[];

      // Filter by skills and tags on the client side (Firestore has limitations)
      if (filters.skills && filters.skills.length > 0) {
        results = results.filter(cv => 
          filters.skills!.some(skill => 
            cv.skills.some(cvSkill => 
              cvSkill.toLowerCase().includes(skill.toLowerCase())
            )
          )
        );
      }

      if (filters.tags && filters.tags.length > 0) {
        results = results.filter(cv => 
          filters.tags!.some(tag => 
            cv.tags.some(cvTag => 
              cvTag.toLowerCase().includes(tag.toLowerCase())
            )
          )
        );
      }

      return results;
    } catch (error) {
      console.error('Error searching CVs:', error);
      throw new Error('Failed to search CVs');
    }
  }

  // Update an existing CV
  async updateCV(cvId: string, updates: Partial<SavedCV>): Promise<void> {
    try {
      const cvRef = doc(db, this.collectionName, cvId);
      await updateDoc(cvRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating CV:', error);
      throw new Error('Failed to update CV');
    }
  }

  // Delete a CV
  async deleteCV(cvId: string): Promise<void> {
    try {
      const cvRef = doc(db, this.collectionName, cvId);
      await deleteDoc(cvRef);
    } catch (error) {
      console.error('Error deleting CV:', error);
      throw new Error('Failed to delete CV');
    }
  }

  // Get CVs that match a job description (for context)
  async getRelevantCVs(jobDescription: string): Promise<SavedCV[]> {
    try {
      // Extract keywords from job description
      const keywords = this.extractKeywords(jobDescription);
      
      // Search for CVs with matching skills or job titles
      const allCVs = await this.getAllCVs();
      
      // Score CVs based on relevance
      const scoredCVs = allCVs.map(cv => ({
        cv,
        score: this.calculateRelevanceScore(cv, keywords)
      }));

      // Return top 5 most relevant CVs
      return scoredCVs
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(item => item.cv);
    } catch (error) {
      console.error('Error getting relevant CVs:', error);
      return [];
    }
  }

  // Extract keywords from job description
  private extractKeywords(jobDescription: string): string[] {
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an'];
    const words = jobDescription
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word));
    
    return [...new Set(words)]; // Remove duplicates
  }

  // Calculate relevance score for a CV
  private calculateRelevanceScore(cv: SavedCV, keywords: string[]): number {
    let score = 0;
    
    // Check skills
    keywords.forEach(keyword => {
      cv.skills.forEach(skill => {
        if (skill.toLowerCase().includes(keyword)) {
          score += 2;
        }
      });
    });

    // Check job title
    if (cv.jobTitle) {
      keywords.forEach(keyword => {
        if (cv.jobTitle!.toLowerCase().includes(keyword)) {
          score += 3;
        }
      });
    }

    // Check industry
    if (cv.industry) {
      keywords.forEach(keyword => {
        if (cv.industry!.toLowerCase().includes(keyword)) {
          score += 1;
        }
      });
    }

    return score;
  }
}

export const cvService = new CVService();
