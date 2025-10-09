# **Guide: Fixing the Cloudflare Build Failure**

The build log you provided shows a specific error related to the fontkit library, a dependency of @react-pdf/renderer. This is a known issue with Vite's production build process.

The fix is to explicitly tell Vite which fontkit file to use by adding a resolve.alias to your vite.config.ts file. This will resolve the import conflict and allow the build to succeed on Cloudflare.

### **Step 1: Update vite.config.ts**

Replace the entire content of your vite.config.ts file with the following code. This adds the necessary resolve section to your configuration.

// vite.config.ts

import { defineConfig } from 'vite'  
import react from '@vitejs/plugin-react'

// \[https://vitejs.dev/config/\](https://vitejs.dev/config/)  
export default defineConfig({  
  plugins: \[react()\],  
  // Add this 'resolve' section to fix the fontkit build error  
  resolve: {  
    alias: {  
      fontkit: 'fontkit/js/fontkit.js'  
    }  
  }  
})

### **Step 2: Commit and Redeploy**

1. **Save** the updated vite.config.ts file.  
2. **Commit** this change to your GitHub repository.  
3. **Push** the commit to GitHub.

This new push should automatically trigger a new deployment on Cloudflare. Since you have already set your environment variables, this build should now complete successfully. If automatic deployments are still paused, you can manually trigger the latest commit from your Cloudflare Pages dashboard as described in the previous guide.