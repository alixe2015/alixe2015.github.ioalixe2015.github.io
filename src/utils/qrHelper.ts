import QRCode from 'qrcode';

/**
 * Generate a scannable QR code data URL for a given postcard ID.
 * The QR code URL points to the listening link with #listen={id}
 * so that when someone scans with their phone, it opens the exact listening room!
 */
export async function generatePostcardQR(postcardId: string, currentUrl?: string): Promise<string> {
  const baseUrl = currentUrl || (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://embodied-echo.app');
  const targetUrl = `${baseUrl}?listen=${postcardId}#listen-room`;
  
  try {
    const dataUrl = await QRCode.toDataURL(targetUrl, {
      width: 256,
      margin: 1,
      color: {
        dark: '#2d2822',
        light: '#fbf8f2',
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return '';
  }
}
