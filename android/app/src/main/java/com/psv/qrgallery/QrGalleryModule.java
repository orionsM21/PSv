package com.psv.qrgallery;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Rect;

import com.facebook.react.bridge.*;

import com.google.mlkit.vision.barcode.common.Barcode;
import com.google.mlkit.vision.barcode.BarcodeScanner;
import com.google.mlkit.vision.barcode.BarcodeScannerOptions;
import com.google.mlkit.vision.barcode.BarcodeScanning;
import com.google.mlkit.vision.common.InputImage;

import java.io.File;
import java.util.List;

public class QrGalleryModule extends ReactContextBaseJavaModule {

    QrGalleryModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "QrGallery";
    }

    @ReactMethod
    public void scanFromFile(String filePath, Promise promise) {
        try {
            String cleanPath = filePath.replace("file://", "");
            File file = new File(cleanPath);

            if (!file.exists()) {
                promise.reject("FILE_NOT_FOUND", "Image file not found");
                return;
            }

            // ✅ Safe bitmap decode (OOM protection)
            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inSampleSize = 2;

            Bitmap bitmap = BitmapFactory.decodeFile(cleanPath, options);
            if (bitmap == null) {
                promise.reject("BITMAP_ERROR", "Failed to decode bitmap");
                return;
            }

            InputImage image = InputImage.fromBitmap(bitmap, 0);

            BarcodeScannerOptions scannerOptions =
                new BarcodeScannerOptions.Builder()
                    .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
                    .build();

            BarcodeScanner scanner =
                BarcodeScanning.getClient(scannerOptions);

            scanner.process(image)
                .addOnSuccessListener(barcodes -> {
                    if (barcodes == null || barcodes.isEmpty()) {
                        promise.resolve(null);
                        return;
                    }

                    Barcode qr = barcodes.get(0);
                    Rect box = qr.getBoundingBox();

                    WritableMap result = Arguments.createMap();
                    result.putString("value", qr.getRawValue());

                    if (box != null) {
                        WritableMap bbox = Arguments.createMap();
                        bbox.putInt("left", box.left);
                        bbox.putInt("top", box.top);
                        bbox.putInt("width", box.width());
                        bbox.putInt("height", box.height());
                        result.putMap("boundingBox", bbox);
                    }

                    // 🔥 Heuristic confidence
                    double confidence = box != null ? 0.9 : 0.6;
                    result.putDouble("confidence", confidence);

                    // 🔮 Future hook (blur detection placeholder)
                    result.putBoolean("isBlurry", false);

                    promise.resolve(result);
                })
                .addOnFailureListener(e ->
                    promise.reject("SCAN_FAILED", e.getMessage())
                );

        } catch (Exception e) {
            promise.reject("UNEXPECTED_ERROR", e.getMessage());
        }
    }
}
