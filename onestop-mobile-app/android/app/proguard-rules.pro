# Stripe rules for R8 / ProGuard
# These suppress warnings about missing PushProvisioning classes which are optional
-dontwarn com.stripe.android.pushProvisioning.**
-keep class com.stripe.android.pushProvisioning.** { *; }
