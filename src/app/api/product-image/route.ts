import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.redirect('https://presumart.netlify.app/icon-512.svg');
  }

  try {
    let imageSrc = '';

    // Check Supabase if configured
    if (supabase) {
      const { data } = await supabase.from('products').select('image, images').eq('id', id).single();
      if (data) {
        imageSrc = (data.images && data.images.length > 0) ? data.images[0] : (data.image || '');
      }
    }

    if (!imageSrc) {
      return NextResponse.redirect('https://presumart.netlify.app/icon-512.svg');
    }

    // If imageSrc is external HTTP/HTTPS URL
    if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
      return NextResponse.redirect(imageSrc);
    }

    // If imageSrc is relative static path (e.g., /images/presu_merch_hoodie.jpg)
    if (imageSrc.startsWith('/')) {
      return NextResponse.redirect(`https://presumart.netlify.app${imageSrc}`);
    }

    // If imageSrc is Base64 Data URI (e.g. data:image/jpeg;base64,/9j/4AAQSk...)
    if (imageSrc.startsWith('data:image/')) {
      const parts = imageSrc.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const contentType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const base64Data = parts[1];
      const buffer = Buffer.from(base64Data, 'base64');

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
      });
    }

    return NextResponse.redirect('https://presumart.netlify.app/icon-512.svg');
  } catch (e) {
    return NextResponse.redirect('https://presumart.netlify.app/icon-512.svg');
  }
}
