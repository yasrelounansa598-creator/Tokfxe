package com.fextok.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection

private val DarkColorScheme = darkColorScheme(
    primary = FexTokCyan,
    secondary = FexTokPink,
    tertiary = FexTokPurple,
    background = FexTokBackground,
    surface = FexTokDarkNavy,
    onPrimary = FexTokBackground,
    onSecondary = FexTokWhite,
    onBackground = FexTokWhite,
    onSurface = FexTokWhite
)

@Composable
fun FexTokTheme(
    isRtl: Boolean = true,
    content: @Composable () -> Unit
) {
    CompositionLocalProvider(
        LocalLayoutDirection provides if (isRtl) LayoutDirection.Rtl else LayoutDirection.Ltr
    ) {
        MaterialTheme(
            colorScheme = DarkColorScheme,
            content = content
        )
    }
}
