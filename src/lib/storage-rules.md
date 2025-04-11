# Firebase Storage Rules Setup Instructions

To fix the image upload functionality, you need to set proper Firebase Storage rules. Follow these steps:

1. Go to your Firebase console: https://console.firebase.google.com/
2. Select your project: "onlyne-376bc"
3. Click on "Storage" in the left sidebar
4. Click on the "Rules" tab
5. Update your rules to the following:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // Allow read access to all users
      allow read: if true;
      
      // Allow write access to authenticated users
      allow write: if request.auth != null;
      
      // For testing only - remove this in production!
      // The following rule allows anyone to write to your storage bucket
      // allow write: if true;
    }
  }
}
```

6. Click "Publish" to apply the rules

For testing purposes, if you're still having issues, you can temporarily use the more permissive rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

**Important:** Remember to update these rules to be more restrictive before going to production! 