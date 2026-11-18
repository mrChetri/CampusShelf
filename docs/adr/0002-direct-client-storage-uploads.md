# 0002: Direct Client Upload to Supabase Storage for Listing Images

Listing photos (up to 5 per book) are uploaded directly from the browser client to an authenticated bucket in Supabase Storage using the client-side Supabase SDK. The client passes the resulting public storage URLs to the Express API during listing creation. The API validates image URL format, domain origin, and image count via Zod.

## Considered Options

- **Server-proxied multipart upload via Express**: Express API handles multipart form parsing and streams files to Supabase using backend service keys. Rejected because the API runs on Render Free Web Service (512MB RAM, ephemeral filesystem, cold starts), making large multipart streaming memory-intensive and prone to timeout errors during image uploads.
- **Direct browser-to-bucket upload**: Offloads file bandwidth and payload processing directly to Supabase Storage CDN, keeping the Express API stateless and lightweight. Accepted.

## Consequences

- Express API memory overhead remains minimal and fast.
- Supabase Storage requires bucket RLS policies configured to allow authenticated users to upload to their own user-scoped folders.
