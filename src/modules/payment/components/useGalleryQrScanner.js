import { useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import ImageResizer from 'react-native-image-resizer';
import { scanBarcodes } from '@react-native-ml-kit/barcode-scanning';

/**
 * RN-safe UPI QR parser
 */
const parseUpiQr = (data) => {
  try {
    if (!data || typeof data !== 'string') return null;
    if (!data.startsWith('upi://pay')) return null;

    const query = data.split('?')[1];
    if (!query) return null;

    const params = {};
    query.split('&').forEach(part => {
      const [key, value] = part.split('=');
      params[key] = decodeURIComponent(value || '');
    });

    if (!params.pa) return null;

    return {
      upiId: params.pa,
      name: params.pn || '',
      amount: params.am || '',
      currency: params.cu || 'INR',
    };
  } catch {
    return null;
  }
};

export const useGalleryQrScanner = () => {
  const [loading, setLoading] = useState(false);

  const scanFromGallery = useCallback(async () => {
    try {
      setLoading(true);

      // 1️⃣ Pick & crop (critical)
      const image = await ImagePicker.openPicker({
        width: 800,
        height: 800,
        cropping: true,
        cropperToolbarTitle: 'Crop QR Code',
        mediaType: 'photo',
        compressImageQuality: 1,
      });

      const imagePath =
        Platform.OS === 'android'
          ? image.path
          : image.path.replace('file://', '');

      // 2️⃣ Resize for ML performance
      const resized = await ImageResizer.createResizedImage(
        imagePath,
        1000,
        1000,
        'JPEG',
        100
      );

      // 3️⃣ Native ML Kit scan
      const barcodes = await scanBarcodes(resized.uri, ['QR_CODE']);

      if (!barcodes?.length || !barcodes[0]?.rawValue) {
        Alert.alert(
          'QR Not Detected',
          'Try adjusting the crop or scan using camera'
        );
        return null;
      }

      const rawValue = barcodes[0].rawValue;
      const parsed = parseUpiQr(rawValue);

      if (!parsed) {
        Alert.alert('Invalid QR', 'Unsupported QR format');
        return null;
      }

      return parsed;
    } catch (e) {
      console.log('Gallery QR error:', e);
      Alert.alert('Error', 'Failed to scan QR from gallery');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    scanFromGallery,
    loading,
  };
};
