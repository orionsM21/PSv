package com.psv.qrgallery;

import android.app.Activity;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableMap;
import com.google.mlkit.vision.barcode.common.Barcode;
import com.google.mlkit.vision.codescanner.GmsBarcodeScanner;
import com.google.mlkit.vision.codescanner.GmsBarcodeScannerOptions;
import com.google.mlkit.vision.codescanner.GmsBarcodeScanning;

public class UpiQrScannerModule extends ReactContextBaseJavaModule {

    private Promise pendingPromise;

    public UpiQrScannerModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "UpiQrScanner";
    }

    @ReactMethod
    public void scanQr(Promise promise) {
        Activity activity = getCurrentActivity();

        if (activity == null) {
            promise.reject(
                "ACTIVITY_UNAVAILABLE",
                "Unable to launch the QR scanner because no activity is available."
            );
            return;
        }

        if (pendingPromise != null) {
            promise.reject(
                "SCAN_IN_PROGRESS",
                "A QR scan is already running."
            );
            return;
        }

        pendingPromise = promise;

        UiThreadUtil.runOnUiThread(() -> {
            try {
                GmsBarcodeScannerOptions options =
                    new GmsBarcodeScannerOptions.Builder()
                        .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
                        .enableAutoZoom()
                        .build();

                GmsBarcodeScanner scanner =
                    GmsBarcodeScanning.getClient(activity, options);

                scanner.startScan()
                    .addOnSuccessListener(barcode -> {
                        Promise currentPromise = pendingPromise;
                        pendingPromise = null;

                        if (currentPromise == null) {
                            return;
                        }

                        WritableMap result = Arguments.createMap();
                        String rawValue = barcode.getRawValue();
                        String displayValue = barcode.getDisplayValue();

                        if (rawValue != null) {
                            result.putString("value", rawValue);
                        }

                        if (displayValue != null) {
                            result.putString("displayValue", displayValue);
                        }

                        result.putInt("format", barcode.getFormat());
                        currentPromise.resolve(result);
                    })
                    .addOnCanceledListener(() -> {
                        Promise currentPromise = pendingPromise;
                        pendingPromise = null;

                        if (currentPromise != null) {
                            currentPromise.reject(
                                "SCAN_CANCELLED",
                                "QR scan was cancelled."
                            );
                        }
                    })
                    .addOnFailureListener(error -> {
                        Promise currentPromise = pendingPromise;
                        pendingPromise = null;

                        if (currentPromise != null) {
                            currentPromise.reject(
                                "SCAN_FAILED",
                                error.getMessage() != null
                                    ? error.getMessage()
                                    : "Unable to scan the QR code."
                            );
                        }
                    });
            } catch (Exception error) {
                Promise currentPromise = pendingPromise;
                pendingPromise = null;

                if (currentPromise != null) {
                    currentPromise.reject(
                        "SCAN_FAILED",
                        error.getMessage() != null
                            ? error.getMessage()
                            : "Unable to start the QR scanner."
                    );
                }
            }
        });
    }
}
