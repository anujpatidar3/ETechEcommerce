# Deploying Frontend to Vercel

1. Push your code to GitHub, GitLab, or Bitbucket.
2. Go to https://vercel.com/import and import your repository.
3. Set the **Root Directory** to `client` if prompted.
4. Vercel will auto-detect Vite and set up the build command (`npm run build`) and output directory (`dist`).
5. If you use environment variables, add them in the Vercel dashboard.
6. Click **Deploy**.

You can customize the build with the `vercel.json` file in the root directory.
