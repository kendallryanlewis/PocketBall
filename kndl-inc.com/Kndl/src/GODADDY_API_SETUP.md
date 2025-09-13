# GoDaddy API Setup Instructions

## Getting Your API Credentials

1. **Visit GoDaddy Developer Portal**
   - Go to: https://developer.godaddy.com/
   - Sign in with your GoDaddy account

2. **Create API Keys**
   - Navigate to "My Account" → "API Keys"
   - Click "Create New API Key"
   - Choose "OTE" for testing or "Production" for live use

3. **Configure Permissions**
   - Select "Domain API" for domain availability checking
   - Add "DNS API" if you plan to manage DNS records

4. **Save Your Credentials**
   - Copy the API Key and Secret immediately
   - GoDaddy only shows the secret once!

## Adding Credentials to Your Project

### For Testing (OTE Environment):
1. Open `src/environments/environment.ts`
2. Replace `YOUR_ACTUAL_API_KEY_HERE` with your OTE API key
3. Replace `YOUR_ACTUAL_API_SECRET_HERE` with your OTE API secret

### For Production:
1. Open `src/environments/environment.prod.ts`
2. Replace `YOUR_PRODUCTION_API_KEY_HERE` with your production API key
3. Replace `YOUR_PRODUCTION_API_SECRET_HERE` with your production API secret

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit real API keys to version control**
   - Add `environment*.ts` to your `.gitignore` if they contain real keys
   - Use environment variables in production

2. **Use Backend Proxy** (Recommended for Production)
   - Make API calls from your backend server
   - This avoids CORS issues and keeps credentials secure
   - Frontend should call your backend, not GoDaddy directly

3. **Rate Limiting**
   - GoDaddy has rate limits on API calls
   - Implement caching to avoid excessive requests

## Testing Your Setup

Once you've added your credentials:
1. Search for a domain in the domain setup page
2. Check the browser console for any API errors
3. Verify that real availability data is being returned

## Fallback Behavior

The service will automatically fall back to simulation mode if:
- No API credentials are provided
- API calls fail
- Rate limits are exceeded

This ensures your users always have a functional experience!
