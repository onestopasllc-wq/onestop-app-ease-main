# Supabase Setup Instructions for Promotional Pop-Ups

## Step 1: Run the Migration

1. Open your Supabase dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `supabase/migrations/20251208000000_add_promotional_popups.sql`
5. Click **Run** to execute the migration

## Step 2: Create Storage Bucket

1. In your Supabase dashboard, navigate to **Storage**
2. Click **New Bucket**
3. Enter the following details:
   - **Name:** `popup-images`
   - **Public bucket:** ✓ (checked)
4. Click **Create bucket**

## Step 3: Configure Storage Policies

After creating the bucket, set up the following policies:

### Policy 1: Public Read Access
- **Policy name:** Allow public read access
- **Allowed operation:** SELECT
- **Policy definition:**
  ```sql
  (bucket_id = 'popup-images'::text)
  ```

### Policy 2: Admin Upload
- **Policy name:** Allow admin upload
- **Allowed operation:** INSERT
- **Policy definition:**
  ```sql
  (bucket_id = 'popup-images'::text) 
  AND 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
  ```

### Policy 3: Admin Update
- **Policy name:** Allow admin update
- **Allowed operation:** UPDATE
- **Policy definition:**
  ```sql
  (bucket_id = 'popup-images'::text) 
  AND 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
  ```

### Policy 4: Admin Delete
- **Policy name:** Allow admin delete
- **Allowed operation:** DELETE
- **Policy definition:**
  ```sql
  (bucket_id = 'popup-images'::text) 
  AND 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
  ```

## Verification

1. Check that the `promotional_popups` table exists in the **Table Editor**
2. Verify the `popup-images` bucket exists in **Storage**
3. Confirm policies are active for both table and storage

## Next Steps

Once the database setup is complete, the frontend components will be able to:
- Read active promotional popups (public access)
- Admin users can upload, update, and delete popup images
- Admin users can manage popup records in the table
