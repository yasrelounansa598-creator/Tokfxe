package com.fextok.app.ui.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

// Tok Fxe Official Neon Brand Colors
val TokFxeBackground = Color(0xFF05070B)
val TokFxeDarkNavy = Color(0xFF0E1424)
val TokFxeCyan = Color(0xFF00D9FF)
val TokFxePurple = Color(0xFF8A2BFF)
val TokFxePink = Color(0xFFFF00A8)
val TokFxeWhite = Color(0xFFFFFFFF)
val TokFxeMuted = Color(0xFF94A3B8)
val TokFxeSurface = Color(0xFF131B2E)

// Backwards compatibility aliases
val FexTokBackground = TokFxeBackground
val FexTokDarkNavy = TokFxeDarkNavy
val FexTokCyan = TokFxeCyan
val FexTokPurple = TokFxePurple
val FexTokPink = TokFxePink
val FexTokWhite = TokFxeWhite
val FexTokMuted = TokFxeMuted
val FexTokSurface = TokFxeSurface

val TokFxeNeonGradient = Brush.horizontalGradient(
    colors = listOf(TokFxeCyan, TokFxePurple, TokFxePink)
)

val FexTokNeonGradient = TokFxeNeonGradient

val FexTokLiveGradient = Brush.verticalGradient(
    colors = listOf(Color.Transparent, Color(0xCC05070B), Color(0xF205070B))
)
