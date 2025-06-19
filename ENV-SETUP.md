# Environment Variables Setup

## Required Environment Variables

This application requires the following environment variables to connect to Supabase:

```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Fixing the "Invalid API key" Error

The application is encountering an authentication error ("Invalid API key") during signup. This happens because:

1. The Supabase environment variables are missing
2. The application cannot properly authenticate with the Supabase API

## Setup Instructions

### Using the Setup Script (Easiest Method)

We've added a helper script to make setting up your environment variables easy:

```bash
# Run the environment setup helper
npm run setup-env
```

This interactive script will:
1. Prompt you for your Supabase URL and anon key
2. Create a `.env.local` file with these values
3. Guide you through the process

### Manual Setup

If you prefer to set up the environment manually:

1. Create a `.env.local` file in the root of your project:

```bash
# Windows PowerShell
New-Item -Path .\.env.local -ItemType File

# Windows Command Prompt
type nul > .env.local

# macOS/Linux
touch .env.local
```

2. Add your Supabase credentials to the `.env.local` file:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Get your actual Supabase credentials:
   - Log in to your [Supabase Dashboard](https://app.supabase.io)
   - Select your project
   - Go to Project Settings > API
   - Copy the "Project URL" for `VITE_SUPABASE_URL`
   - Copy the "anon public" key for `VITE_SUPABASE_ANON_KEY`

4. Restart your development server after adding the environment variables:

```bash
npm run dev
```

### Production Deployment

For production environments (like Vercel, Netlify, etc.), add these environment variables in your hosting platform's dashboard.

## Troubleshooting

If you encounter any issues:

1. Make sure the .env.local file is in the root directory of your project
2. Verify that your Supabase credentials are correct
3. Restart your development server after making changes
4. Check that the Supabase project is active and the API keys are not expired

For more information, refer to the [Supabase documentation](https://supabase.com/docs/guides/getting-started/local-development)

## Temporary Solution

For development purposes, we've temporarily hardcoded fallback values in the Supabase client. This is not recommended for production use.

To properly set up your environment:

```bash
# Create .env.local file
echo "VITE_SUPABASE_URL=https://your-project-id.supabase.co" > .env.local
echo "VITE_SUPABASE_ANON_KEY=your-anon-key" >> .env.local
```

You can find your Supabase URL and anon key in your Supabase project dashboard under Project Settings > API. 