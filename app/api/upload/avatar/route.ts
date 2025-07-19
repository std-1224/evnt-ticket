import { type NextRequest, NextResponse } from "next/server";
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { message: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        {
          message: "Failed to upload file",
          error: uploadError.message,
        },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(filePath);

    // Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from('users')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error("Profile update error:", updateError);
      
      // Try to clean up uploaded file if profile update fails
      try {
        await supabase.storage
          .from('user-avatars')
          .remove([filePath]);
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }

      return NextResponse.json(
        {
          message: "Failed to update user profile",
          error: updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Avatar uploaded successfully",
      avatarUrl: publicUrl,
      status: 200
    });

  } catch (error: any) {
    console.error('Error in avatar upload:', error);
    return NextResponse.json(
      { 
        message: "Internal server error",
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');
    const avatarUrl = searchParams.get('avatarUrl');

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Remove avatar URL from user profile
    const { error: updateError } = await supabase
      .from('users')
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json(
        {
          message: "Failed to update user profile",
          error: updateError.message,
        },
        { status: 500 }
      );
    }

    // Delete file from storage if it's from our bucket
    if (avatarUrl && avatarUrl.includes('user-avatars')) {
      try {
        const filePath = avatarUrl.split('/user-avatars/')[1];
        if (filePath) {
          await supabase.storage
            .from('user-avatars')
            .remove([filePath]);
        }
      } catch (deleteError) {
        console.error("File deletion error:", deleteError);
        // Don't fail the request if file deletion fails
      }
    }

    return NextResponse.json({
      message: "Avatar removed successfully",
      status: 200
    });

  } catch (error: any) {
    console.error('Error in avatar deletion:', error);
    return NextResponse.json(
      { 
        message: "Internal server error",
        error: error.message 
      },
      { status: 500 }
    );
  }
}
