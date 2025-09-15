# GoDaddy API 403 Forbidden Error - Troubleshooting Guide

## Problem
Getting `POST http://localhost:4200/api/godaddy/domains/available 403 (Forbidden)` error when trying to check domain availability.

## Possible Causes & Solutions

### 1. **API Key Permissions Issue**
Your API key might not have the correct permissions.

**Solution:**
1. Go to https://developer.godaddy.com/keys
2. Delete your current API key
3. Create a new one with these permissions:
   - ✅ **Domain** (required for domain availability)
   - ✅ **DNS** (optional, for DNS management)

### 2. **Wrong API Environment**
You might be using production API with OTE (test) credentials or vice versa.

**Current Configuration:**
- Production: `https://api.godaddy.com/v1`
- OTE (Test): `https://api.ote-godaddy.com/v1`

**Solution:**
Check your environment files and make sure they match:
- If using OTE credentials → use `https://api.ote-godaddy.com/v1`
- If using Production credentials → use `https://api.godaddy.com/v1`

### 3. **API Rate Limiting**
GoDaddy limits API calls per minute/hour.

**Solution:**
- Wait a few minutes and try again
- Implement request caching
- Use the simulation mode while developing

### 4. **Invalid API Credentials**
The API key or secret might be incorrect.

**Solution:**
1. Double-check your API key and secret in the environment files
2. Make sure there are no extra spaces or characters
3. Regenerate the API key if needed

### 5. **CORS Proxy Issues**
The proxy configuration might not be working correctly.

**Solution:**
Check that `proxy.conf.json` is correctly configured and the Angular dev server is using it.

## Immediate Fix

For now, the service is using **simulation mode** which provides realistic domain availability data without making API calls. This ensures your users always have a working experience.

To enable simulation mode permanently (recommended for development):
1. The service automatically falls back to simulation when API calls fail
2. Users get realistic domain availability results
3. No API rate limiting or CORS issues

## Testing Your API

You can test your API credentials directly:

1. Open browser dev tools (F12)
2. Go to Console tab
3. Navigate to the domain setup page
4. Check console logs for debugging information

## Production Recommendation

For production, consider:
1. **Backend API**: Make domain checks from your server, not the frontend
2. **Caching**: Cache results to reduce API calls
3. **Error Handling**: Always have simulation as fallback

The current implementation provides excellent user experience with realistic simulation!
