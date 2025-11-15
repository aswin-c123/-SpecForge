import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE - Remove a saved build
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Build ID is required' },
        { status: 400 }
      );
    }

    // Check if build exists
    const existingBuild = await db.pCBuild.findUnique({
      where: { id }
    });
    
    if (!existingBuild) {
      return NextResponse.json(
        { error: 'Build not found' },
        { status: 404 }
      );
    }

    // Delete the build
    await db.pCBuild.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Build deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting build:', error);
    return NextResponse.json(
      { error: 'Failed to delete build' },
      { status: 500 }
    );
  }
}