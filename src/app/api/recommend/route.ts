import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as fs from 'fs';
import * as path from 'path';

// Load ML models (this is a simplified version - in production you'd want to cache these)
let models: any = null;

async function loadModels() {
  if (models) return models;
  
  try {
    const modelDir = path.join(process.cwd(), 'ml-data/ml-data/models');
    
    // In a real implementation, you'd use a Python subprocess or a Node.js ML library
    // For now, we'll use a rule-based approach that simulates ML predictions
    models = {
      loaded: true,
      predict: (budget: number, purpose: string) => {
        // Rule-based PC component recommendations based on budget and purpose
        const budgetRanges = {
          gaming: [
            { 
              max: 50000, 
              cpu: 'Intel Core i3-10100', 
              cpu_desc: 'Quad-core processor with 4.3GHz boost, great entry-level gaming CPU',
              gpu: 'NVIDIA GTX 1650', 
              gpu_desc: 'NVIDIA GTX 1650 4GB GDDR6 for 1080p gaming at medium settings',
              ram: '8GB DDR4', 
              ram_desc: '8GB DDR4-3200MHz dual-channel memory for gaming performance',
              storage: '480GB SSD', 
              storage_desc: '480GB NVMe SSD for fast game loading times',
              motherboard: 'H410M', 
              motherboard_desc: 'Intel H410M gaming motherboard with PCIe 4.0 support',
              psu: '400W', 
              psu_desc: '400W 80+ Bronze power supply for gaming stability',
              performance: 55 
            },
            { 
              max: 75000, 
              cpu: 'Intel Core i5-10400F', 
              cpu_desc: '6-core processor with 4.3GHz boost, excellent mid-range gaming CPU',
              gpu: 'NVIDIA GTX 1660 Ti', 
              gpu_desc: 'NVIDIA GTX 1660 Ti 6GB GDDR6 for 1080p gaming at high settings',
              ram: '16GB DDR4', 
              ram_desc: '16GB DDR4-3200MHz dual-channel for optimal gaming',
              storage: '1TB NVMe', 
              storage_desc: '1TB NVMe PCIe 4.0 SSD for ultra-fast storage',
              motherboard: 'B560M', 
              motherboard_desc: 'Intel B560M motherboard with enhanced power delivery',
              psu: '500W', 
              psu_desc: '500W 80+ Bronze power supply for reliable gaming performance',
              performance: 70 
            },
            { 
              max: 100000, 
              cpu: 'AMD Ryzen 5 5600X', 
              cpu_desc: '6-core processor with 4.6GHz boost, excellent gaming performance',
              gpu: 'NVIDIA RTX 3060', 
              gpu_desc: 'NVIDIA RTX 3060 12GB GDDR6 for 1440p gaming with ray tracing',
              ram: '16GB DDR4', 
              ram_desc: '16GB DDR4-3600MHz dual-channel optimized for Ryzen 5000',
              storage: '1TB NVMe', 
              storage_desc: '1TB NVMe PCIe 4.0 SSD for lightning-fast storage',
              motherboard: 'B550M', 
              motherboard_desc: 'AMD B550M motherboard with PCIe 4.0 and USB 3.2 Gen 2',
              psu: '650W', 
              psu_desc: '650W 80+ Gold power supply for high efficiency gaming',
              performance: 80 
            },
            { 
              max: 150000, 
              cpu: 'Intel Core i5-12600K', 
              cpu_desc: '6-core processor with 4.9GHz boost, unlocked for overclocking',
              gpu: 'NVIDIA RTX 3060 Ti', 
              gpu_desc: 'NVIDIA RTX 3060 Ti 8GB GDDR6 for high-refresh 1440p gaming',
              ram: '32GB DDR4', 
              ram_desc: '32GB DDR4-3200MHz dual-channel with XMP support',
              storage: '2TB NVMe', 
              storage_desc: '2TB NVMe PCIe 4.0 SSD for premium storage performance',
              motherboard: 'B560M', 
              motherboard_desc: 'Intel B560M motherboard with robust VRM for overclocking',
              psu: '750W', 
              psu_desc: '750W 80+ Gold power supply for stable overclocked performance',
              performance: 88 
            },
            { 
              max: 200000, 
              cpu: 'AMD Ryzen 7 5800X', 
              cpu_desc: '8-core processor with 4.7GHz boost, excellent for gaming and streaming',
              gpu: 'NVIDIA RTX 3070', 
              gpu_desc: 'NVIDIA RTX 3070 8GB GDDR6 for 1440p high-settings gaming',
              ram: '32GB DDR4', 
              ram_desc: '32GB DDR4-3600MHz dual-channel for gaming and content creation',
              storage: '2TB NVMe', 
              storage_desc: '2TB NVMe PCIe 4.0 SSD for premium gaming storage',
              motherboard: 'B550M', 
              motherboard_desc: 'AMD B550M motherboard with premium gaming features',
              psu: '850W', 
              psu_desc: '850W 80+ Gold power supply for high-end gaming components',
              performance: 92 
            },
            { 
              max: Infinity, 
              cpu: 'Intel Core i9-12900K', 
              cpu_desc: '12-core processor with 4.9GHz boost, ultimate gaming performance',
              gpu: 'NVIDIA RTX 3080', 
              gpu_desc: 'NVIDIA RTX 3080 10GB GDDR6 for 4K gaming and content creation',
              ram: '32GB DDR4', 
              ram_desc: '32GB DDR4-3600MHz dual-channel for extreme gaming',
              storage: '4TB NVMe', 
              storage_desc: '4TB NVMe PCIe 4.0 SSD for ultimate gaming storage',
              motherboard: 'Z690M', 
              motherboard_desc: 'Intel Z690M motherboard with DDR5 support and premium features',
              psu: '1000W', 
              psu_desc: '1000W 80+ Gold power supply for flagship gaming components',
              performance: 98 
            }
          ],
          video: [
            { 
              max: 70000, 
              cpu: 'Intel Core i5-11400', 
              cpu_desc: '6-core processor with 4.4GHz boost, good for video editing',
              gpu: 'NVIDIA GTX 1660 Ti', 
              gpu_desc: 'NVIDIA GTX 1660 Ti 6GB GDDR6 for GPU-accelerated video editing',
              ram: '16GB DDR4', 
              ram_desc: '16GB DDR4-3200MHz dual-channel for smooth video editing',
              storage: '1TB NVMe', 
              storage_desc: '1TB NVMe PCIe 4.0 SSD for fast video file access',
              motherboard: 'B560M', 
              motherboard_desc: 'Intel B560M motherboard with enhanced features for editing',
              psu: '550W', 
              psu_desc: '550W 80+ Bronze power supply for stable video editing setup',
              performance: 75 
            },
            { 
              max: 100000, 
              cpu: 'AMD Ryzen 5 5600X', 
              cpu_desc: '6-core processor with 4.6GHz boost, excellent for video editing',
              gpu: 'NVIDIA RTX 3060', 
              gpu_desc: 'NVIDIA RTX 3060 12GB GDDR6 for GPU-accelerated video editing',
              ram: '32GB DDR4', 
              ram_desc: '32GB DDR4-3600MHz dual-channel for smooth video editing',
              storage: '1TB NVMe', 
              storage_desc: '1TB NVMe PCIe 4.0 SSD for fast video file access',
              motherboard: 'B550M', 
              motherboard_desc: 'AMD B550M motherboard with PCIe 4.0 for high-speed storage',
              psu: '650W', 
              psu_desc: '650W 80+ Gold power supply for stable editing workflows',
              performance: 82 
            },
            { 
              max: 150000, 
              cpu: 'Intel Core i7-11700K', 
              cpu_desc: '8-core processor with 5.0GHz boost, powerful for video editing',
              gpu: 'NVIDIA RTX 3060 Ti', 
              gpu_desc: 'NVIDIA RTX 3060 Ti 8GB GDDR6 for professional video editing',
              ram: '32GB DDR4', 
              ram_desc: '32GB DDR4-3200MHz dual-channel for complex video projects',
              storage: '2TB NVMe', 
              storage_desc: '2TB NVMe PCIe 4.0 SSD for large video project storage',
              motherboard: 'B560M', 
              motherboard_desc: 'Intel B560M motherboard with robust power delivery',
              psu: '750W', 
              psu_desc: '750W 80+ Gold power supply for professional editing setup',
              performance: 88 
            },
            { 
              max: 200000, 
              cpu: 'AMD Ryzen 7 5800X', 
              cpu_desc: '8-core processor with 4.7GHz boost, excellent for professional editing',
              gpu: 'NVIDIA RTX 3070', 
              gpu_desc: 'NVIDIA RTX 3070 8GB GDDR6 for 4K video editing and rendering',
              ram: '64GB DDR4', 
              ram_desc: '64GB DDR4-3600MHz dual-channel for demanding video projects',
              storage: '2TB NVMe', 
              storage_desc: '2TB NVMe PCIe 4.0 SSD for high-speed video workflow',
              motherboard: 'B550M', 
              motherboard_desc: 'AMD B550M motherboard with premium features for professionals',
              psu: '850W', 
              psu_desc: '850W 80+ Gold power supply for high-end editing components',
              performance: 92 
            },
            { 
              max: Infinity, 
              cpu: 'Intel Core i9-11900K', 
              cpu_desc: '8-core processor with 5.3GHz boost, ultimate for video editing',
              gpu: 'NVIDIA RTX 3080', 
              gpu_desc: 'NVIDIA RTX 3080 10GB GDDR6 for 8K video editing and rendering',
              ram: '64GB DDR4', 
              ram_desc: '64GB DDR4-3200MHz dual-channel for professional video editing',
              storage: '4TB NVMe', 
              storage_desc: '4TB NVMe PCIe 4.0 SSD for extensive video project storage',
              motherboard: 'Z590', 
              motherboard_desc: 'Intel Z590 motherboard with premium features for professionals',
              psu: '1000W', 
              psu_desc: '1000W 80+ Gold power supply for professional editing workstation',
              performance: 98 
            }
          ],
          office: [
            { 
              max: 40000, 
              cpu: 'Intel Celeron G5905', 
              cpu_desc: 'Dual-core processor with 4.0GHz boost clock, perfect for basic office tasks',
              gpu: 'Integrated Graphics', 
              gpu_desc: 'Intel UHD Graphics 610 integrated graphics for basic display needs',
              ram: '8GB DDR4', 
              ram_desc: '8GB DDR4-2666MHz memory for smooth multitasking',
              storage: '240GB SSD', 
              storage_desc: '240GB SATA SSD for fast boot times and application loading',
              motherboard: 'H410M', 
              motherboard_desc: 'Intel H410M chipset motherboard with essential connectivity',
              psu: '300W', 
              psu_desc: '300W 80+ certified power supply for stable operation',
              performance: 25 
            },
            { 
              max: 60000, 
              cpu: 'Intel Core i3-10100', 
              cpu_desc: 'Quad-core processor with 4.3GHz boost, excellent for office productivity',
              gpu: 'Integrated Graphics', 
              gpu_desc: 'Intel UHD Graphics 630 integrated graphics for enhanced office visuals',
              ram: '8GB DDR4', 
              ram_desc: '8GB DDR4-2666MHz memory for smooth office multitasking',
              storage: '480GB SSD', 
              storage_desc: '480GB SATA SSD for fast office application loading',
              motherboard: 'H410M', 
              motherboard_desc: 'Intel H410M motherboard with essential office connectivity',
              psu: '350W', 
              psu_desc: '350W 80+ Bronze power supply for reliable office computing',
              performance: 40 
            },
            { 
              max: 80000, 
              cpu: 'Intel Core i5-10400', 
              cpu_desc: '6-core processor with 4.3GHz boost, excellent for office productivity',
              gpu: 'Integrated Graphics', 
              gpu_desc: 'Intel UHD Graphics 630 integrated graphics for enhanced office visuals',
              ram: '16GB DDR4', 
              ram_desc: '16GB DDR4-2666MHz dual-channel for smooth office multitasking',
              storage: '1TB NVMe', 
              storage_desc: '1TB NVMe PCIe 4.0 SSD for fast office application loading',
              motherboard: 'B560M', 
              motherboard_desc: 'Intel B560M motherboard with enhanced features for office work',
              psu: '400W', 
              psu_desc: '400W 80+ Bronze power supply for reliable office computing',
              performance: 60 
            },
            { 
              max: Infinity, 
              cpu: 'Intel Core i5-11400', 
              cpu_desc: '6-core processor with 4.4GHz boost, excellent for office productivity',
              gpu: 'NVIDIA GTX 1650', 
              gpu_desc: 'NVIDIA GTX 1650 4GB GDDR6 for enhanced office graphics performance',
              ram: '16GB DDR4', 
              ram_desc: '16GB DDR4-3200MHz dual-channel for smooth office multitasking',
              storage: '1TB NVMe', 
              storage_desc: '1TB NVMe PCIe 4.0 SSD for fast office application loading',
              motherboard: 'B560M', 
              motherboard_desc: 'Intel B560M motherboard with enhanced features for office work',
              psu: '500W', 
              psu_desc: '500W 80+ Bronze power supply for reliable office computing',
              performance: 75 
            }
          ]
        };

        const purposeKey = purpose.toLowerCase().includes('gaming') ? 'gaming' : 
                          purpose.toLowerCase().includes('video') ? 'video' : 'office';
        
        const ranges = budgetRanges[purposeKey as keyof typeof budgetRanges];
        const selected = ranges.find(range => budget <= range.max) || ranges[ranges.length - 1];
        
        // Calculate estimated total cost (slightly less than budget for better value)
        const totalCost = Math.min(budget * 0.95, budget - 2000);
        
        return {
          ...selected,
          totalCost,
          budget,
          purpose,
          cpu_description: selected.cpu_desc,
          gpu_description: selected.gpu_desc,
          ram_description: selected.ram_desc,
          storage_description: selected.storage_desc,
          motherboard_description: selected.motherboard_desc,
          psu_description: selected.psu_desc
        };
      }
    };
    
    return models;
  } catch (error) {
    console.error('Failed to load ML models:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { budget, purpose } = await request.json();
    
    if (!budget || !purpose) {
      return NextResponse.json(
        { error: 'Budget and purpose are required' },
        { status: 400 }
      );
    }

    const models = await loadModels();
    if (!models) {
      return NextResponse.json(
        { error: 'ML models not available' },
        { status: 500 }
      );
    }

    const recommendation = models.predict(Number(budget), purpose);
    
    return NextResponse.json({
      success: true,
      recommendation
    });
    
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendation' },
      { status: 500 }
    );
  }
}