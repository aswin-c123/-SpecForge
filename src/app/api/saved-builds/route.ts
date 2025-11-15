import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all saved builds
export async function GET() {
  try {
    const builds = await db.pCBuild.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({
      success: true,
      builds
    });
    
  } catch (error) {
    console.error('Error fetching saved builds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved builds' },
      { status: 500 }
    );
  }
}

// POST - Save a new build
export async function POST(request: NextRequest) {
  try {
    const { name, budget, purpose, cpu, gpu, ram, storage, motherboard, psu, totalCost, performance } = await request.json();
    
    if (!name || !budget || !purpose || !cpu || !gpu || !ram || !storage || !motherboard || !psu) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const newBuild = await db.pCBuild.create({
      data: {
        name,
        budget: Number(budget),
        purpose,
        cpu,
        gpu,
        ram,
        storage,
        motherboard,
        psu,
        totalCost: Number(totalCost),
        performance: Number(performance)
      }
    });
    
    return NextResponse.json({
      success: true,
      build: newBuild
    });
    
  } catch (error) {
    console.error('Error saving build:', error);
    return NextResponse.json(
      { error: 'Failed to save build' },
      { status: 500 }
    );
  }
}