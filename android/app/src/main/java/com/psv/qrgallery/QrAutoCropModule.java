package com.psv.qrgallery;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Rect;

import com.facebook.react.bridge.*;

import java.io.File;
import java.io.FileOutputStream;

public class QrAutoCropModule extends ReactContextBaseJavaModule {

    public QrAutoCropModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "QrAutoCrop";
    }

    @ReactMethod
    public void cropImage(String imagePath, ReadableMap box, Promise promise) {
        try {
            if (box == null) {
                promise.reject("INVALID_BOX", "Bounding box missing");
                return;
            }

            String cleanPath = imagePath.replace("file://", "");

            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inSampleSize = 2; // 🔥 prevent OOM

            Bitmap original = BitmapFactory.decodeFile(cleanPath, options);
            if (original == null) {
                promise.reject("BITMAP_ERROR", "Unable to load image");
                return;
            }

            int padding = 16; // 🔥 improves QR decode success

            int left = Math.max(0, box.getInt("left") - padding);
            int top = Math.max(0, box.getInt("top") - padding);
            int right = Math.min(
                original.getWidth(),
                left + box.getInt("width") + padding * 2
            );
            int bottom = Math.min(
                original.getHeight(),
                top + box.getInt("height") + padding * 2
            );

            int width = right - left;
            int height = bottom - top;

            if (width <= 0 || height <= 0) {
                promise.reject("INVALID_CROP", "Invalid crop dimensions");
                return;
            }

            Bitmap cropped = Bitmap.createBitmap(
                original,
                left,
                top,
                width,
                height
            );

            File outFile = new File(
                getReactApplicationContext().getCacheDir(),
                "qr_crop_" + System.currentTimeMillis() + ".jpg"
            );

            FileOutputStream fos = new FileOutputStream(outFile);
            cropped.compress(Bitmap.CompressFormat.JPEG, 95, fos);
            fos.flush();
            fos.close();

            // 🔥 clean memory
            original.recycle();
            cropped.recycle();

            promise.resolve(outFile.getAbsolutePath());

        } catch (Exception e) {
            promise.reject("CROP_FAILED", e.getMessage());
        }
    }
}
