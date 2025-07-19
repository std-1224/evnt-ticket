import { type NextRequest, NextResponse } from "next/server";
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return NextResponse.json(
        {
          message: "Failed to fetch user profile",
          error: error.message,
        },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: user, status: 200 });
  } catch (error: any) {
    console.error('Error in profile GET:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, phone, avatar_url } = body;

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate input data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { message: "Name must be a non-empty string" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (phone !== undefined) {
      if (phone && typeof phone !== 'string') {
        return NextResponse.json(
          { message: "Phone must be a string" },
          { status: 400 }
        );
      }
      updateData.phone = phone ? phone.trim() : null;
    }

    if (avatar_url !== undefined) {
      if (avatar_url && typeof avatar_url !== 'string') {
        return NextResponse.json(
          { message: "Avatar URL must be a string" },
          { status: 400 }
        );
      }
      updateData.avatar_url = avatar_url ? avatar_url.trim() : null;
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      return NextResponse.json(
        {
          message: "Failed to update user profile",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      data: updatedUser, 
      message: "Profile updated successfully",
      status: 200 
    });
  } catch (error: any) {
    console.error('Error in profile PUT:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
