############################
# 🔐 CRYPTO (VERY IMPORTANT)
############################
-keep class javax.crypto.** { *; }
-keep class javax.security.** { *; }
-keep class java.security.** { *; }

############################
# 🔐 YOUR CUSTOM ENCRYPTION
############################
-keep class **.secuity.** { *; }

############################
# 🔐 KEEP NATIVE METHODS
############################
-keepclasseswithmembers class * {
    native <methods>;
}

########## REACT NATIVE / HERMES ##########
-keep class com.facebook.crypto.** { *; }
-keep class com.facebook.soloader.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Required for react-native-get-random-values
-keep class com.facebook.react.modules.crypto.** { *; }

########## BOUNCYCASTLE (Correct Library) ##########
-keep class org.bouncycastle.** { *; }
-dontwarn org.bouncycastle.**

# Extra providers (important)
-keep class org.bouncycastle.jcajce.provider.** { *; }
-dontwarn org.bouncycastle.jcajce.provider.**

########## SECURE RANDOM ##########
-keep class java.security.SecureRandom { *; }
-keep class javax.crypto.** { *; }
-keep class sun.security.provider.SecureRandom { *; }

########## SSL PINNING ##########
-keep class com.reactnativesslpinning.** { *; }
-keep class com.toyberman.** { *; }

########## NETWORKING ##########
-keep class okhttp3.** { *; }
-keep class okio.** { *; }

-keep class com.sslpublickeypinning.** { *; }
-dontwarn com.sslpublickeypinning.**

-keep class org.bouncycastle.** { *; }
-dontwarn org.bouncycastle.**

-keep class com.sslpublickeypinning.** { *; }
-dontwarn com.sslpublickeypinning.**


-keep class okhttp3.** { *; }
-keep class com.google.gson.** { *; }
-keepattributes Signature
-keepattributes *Annotation*

-keep class com.google.android.gms.maps.** { *; }
-keep class com.airbnb.android.react.maps.** { *; }
-keep class com.reactnative.imagepicker.** { *; }

-keep class com.ansman.* { *; }
-keep class com.aps.* { *; }
-keep class com.ihsanbal.* { *; }

############################
# 🔥 ML KIT (CRITICAL FIX)
############################
-keep class com.google.mlkit.** { *; }
-keep class com.google.android.gms.internal.mlkit_vision_** { *; }
-dontwarn com.google.mlkit.**
