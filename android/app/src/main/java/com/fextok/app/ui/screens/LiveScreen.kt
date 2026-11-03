package com.fextok.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fextok.app.ui.theme.*

@Composable
fun LiveScreen(
    onClose: () -> Unit
) {
    var isPKBattleActive by remember { mutableStateOf(true) }
    var hostScore by remember { mutableStateOf(1420) }
    var guestScore by remember { mutableStateOf(980) }
    var isMuted by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(FexTokBackground)
    ) {
        // Main Video Area: If PK Battle is active, split dual-screen (Host Top/Left, Guest Bottom/Right)
        if (isPKBattleActive) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Host Screen
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .background(Color(0xFF0F172A))
                        .border(1.dp, FexTokCyan.copy(alpha = 0.5f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        "كاميرا المضيف (أنت)",
                        color = Color.White.copy(alpha = 0.6f),
                        fontSize = 13.sp
                    )
                }

                // Guest Co-Host Screen
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .background(Color(0xFF1E1B4B))
                        .border(1.dp, FexTokPink.copy(alpha = 0.5f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        "كاميرا الضيف (ريما العلي)",
                        color = Color.White.copy(alpha = 0.6f),
                        fontSize = 13.sp
                    )
                }
            }
        } else {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFF0F172A)),
                contentAlignment = Alignment.Center
            ) {
                Text("شاشة البث المباشر الفردي", color = Color.White)
            }
        }

        // PK Battle Gauge Bar
        if (isPKBattleActive) {
            val total = (hostScore + guestScore).coerceAtLeast(1)
            val hostRatio = hostScore.toFloat() / total

            Column(
                modifier = Modifier
                    .align(Alignment.Center)
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "المضيف: $hostScore",
                        color = FexTokCyan,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "تحدي PK ⚔️ 02:45",
                        color = Color.White,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "الضيف: $guestScore",
                        color = FexTokPink,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.height(4.dp))

                // Progress Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .background(Color.DarkGray)
                ) {
                    Box(
                        modifier = Modifier
                            .weight(hostRatio)
                            .fillMaxHeight()
                            .background(FexTokCyan)
                    )
                    Box(
                        modifier = Modifier
                            .weight(1f - hostRatio)
                            .fillMaxHeight()
                            .background(FexTokPink)
                    )
                }
            }
        }

        // Top Stream Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color.Black.copy(alpha = 0.5f))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(FexTokCyan),
                    contentAlignment = Alignment.Center
                ) {
                    Text("ي", color = Color.Black, fontWeight = FontWeight.Bold)
                }
                Column {
                    Text("ياسر العنزي", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Text("4,210 مشاهد", color = FexTokMuted, fontSize = 9.sp)
                }
            }

            IconButton(
                onClick = onClose,
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(Color.Black.copy(alpha = 0.5f))
            ) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "إنهاء البث",
                    tint = Color.White
                )
            }
        }

        // Bottom Controls Rail
        Row(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Chat Input Trigger
            Box(
                modifier = Modifier
                    .weight(1f)
                    .height(40.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color.Black.copy(alpha = 0.5f))
                    .padding(horizontal = 14.dp),
                contentAlignment = Alignment.CenterStart
            ) {
                Text("أرسل تعليقاً في البث...", color = Color.LightGray, fontSize = 12.sp)
            }

            Spacer(modifier = Modifier.width(10.dp))

            // Gift Button
            IconButton(
                onClick = { hostScore += 100 },
                modifier = Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .background(FexTokPink)
            ) {
                Icon(
                    imageVector = Icons.Default.CardGiftcard,
                    contentDescription = "هدية",
                    tint = Color.White
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            // Mute / Unmute
            IconButton(
                onClick = { isMuted = !isMuted },
                modifier = Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .background(Color.Black.copy(alpha = 0.5f))
            ) {
                Icon(
                    imageVector = if (isMuted) Icons.Default.MicOff else Icons.Default.Mic,
                    contentDescription = "ميكروفون",
                    tint = if (isMuted) Color.Red else Color.White
                )
            }
        }
    }
}
