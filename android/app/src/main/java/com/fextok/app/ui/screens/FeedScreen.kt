package com.fextok.app.ui.screens

import androidx.compose.animation.core.*
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
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fextok.app.ui.theme.*

@Composable
fun FeedScreen(
    onGoLive: () -> Unit
) {
    var selectedFeedTab by remember { mutableStateOf("لك") }
    var isLiked by remember { mutableStateOf(false) }
    var likesCount by remember { mutableStateOf(142300) }
    var isBookmarked by remember { mutableStateOf(false) }

    // Vinyl spinning disc animation
    val infiniteTransition = rememberInfiniteTransition(label = "discRotation")
    val angle by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 4000, easing = LinearEasing)
        ),
        label = "rotation"
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
    ) {
        // Video Background simulation / ExoPlayer Surface
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF0A0F1D)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "▶ مشغل الفيديو العمودي FexTok",
                color = Color.White.copy(alpha = 0.4f),
                fontSize = 14.sp
            )
        }

        // Top Gradient Scrim & Tabs Header
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(110.dp)
                .background(
                    androidx.compose.ui.graphics.Brush.verticalGradient(
                        colors = listOf(Color.Black.copy(alpha = 0.85f), Color.Transparent)
                    )
                )
                .statusBarsPadding()
                .padding(horizontal = 16.dp, vertical = 8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Live Button
                Button(
                    onClick = onGoLive,
                    colors = ButtonDefaults.buttonColors(containerColor = FexTokPink),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                    shape = RoundedCornerShape(20.dp),
                    modifier = Modifier.height(28.dp)
                ) {
                    Text("مباشر 🔴", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }

                // SubTabs
                Row(
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    listOf("الأصدقاء", "المتابعون", "لك").forEach { tab ->
                        val isSelected = selectedFeedTab == tab
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.clickable { selectedFeedTab = tab }
                        ) {
                            Text(
                                text = tab,
                                color = if (isSelected) Color.White else FexTokMuted,
                                fontSize = if (isSelected) 15.sp else 13.sp,
                                fontWeight = if (isSelected) FontWeight.ExtraBold else FontWeight.Normal
                            )
                            if (isSelected) {
                                Box(
                                    modifier = Modifier
                                        .padding(top = 2.dp)
                                        .size(width = 24.dp, height = 2.dp)
                                        .clip(RoundedCornerShape(1.dp))
                                        .background(Color.White)
                                )
                            }
                        }
                    }
                }

                // Search Icon
                IconButton(onClick = {}, modifier = Modifier.size(32.dp)) {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "بحث",
                        tint = Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                }
            }
        }

        // Right-Side Action Rail (Likes, Comments, Bookmarks, Share, Vinyl Disc)
        Column(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(end = 12.dp, bottom = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Creator Avatar with Follow (+) badge
            Box(contentAlignment = Alignment.BottomCenter) {
                Box(
                    modifier = Modifier
                        .size(46.dp)
                        .clip(CircleShape)
                        .border(1.5.dp, Color.White, CircleShape)
                        .background(FexTokDarkNavy),
                    contentAlignment = Alignment.Center
                ) {
                    Text("ي", color = Color.White, fontWeight = FontWeight.Bold)
                }
                Box(
                    modifier = Modifier
                        .offset(y = 6.dp)
                        .size(18.dp)
                        .clip(CircleShape)
                        .background(FexTokPink),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "متابعة",
                        tint = Color.White,
                        modifier = Modifier.size(12.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            // Like Action
            ActionRailItem(
                icon = Icons.Default.Favorite,
                tint = if (isLiked) FexTokPink else Color.White,
                count = "${(likesCount / 1000f).toInt()}k",
                onClick = {
                    isLiked = !isLiked
                    if (isLiked) likesCount++ else likesCount--
                }
            )

            // Comment Action
            ActionRailItem(
                icon = Icons.Default.ChatBubble,
                tint = Color.White,
                count = "1,420",
                onClick = {}
            )

            // Bookmark Action
            ActionRailItem(
                icon = Icons.Default.Bookmark,
                tint = if (isBookmarked) Color(0xFFFFD700) else Color.White,
                count = "8.2k",
                onClick = { isBookmarked = !isBookmarked }
            )

            // Share Action
            ActionRailItem(
                icon = Icons.Default.Share,
                tint = Color.White,
                count = "14.5k",
                onClick = {}
            )

            // Rotating Vinyl Sound Disc
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF1E2640))
                    .border(2.dp, Color(0xFF334155), CircleShape)
                    .rotate(angle),
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(14.dp)
                        .clip(CircleShape)
                        .background(FexTokPink)
                )
            }
        }

        // Bottom Creator Info & Sound Ticker
        Column(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .fillMaxWidth(0.78f)
                .padding(start = 16.dp, bottom = 20.dp)
        ) {
            Text(
                text = "@yaser_creatives ✓",
                color = Color.White,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "جولة في شوارع الرياض وتحدي التصوير السينمائي الجديد 🎬✨ #FexTok #Riyadh",
                color = Color.White.copy(alpha = 0.9f),
                fontSize = 12.sp,
                lineHeight = 16.sp
            )
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.MusicNote,
                    contentDescription = "الصوت",
                    tint = Color.White,
                    modifier = Modifier.size(14.dp)
                )
                Text(
                    text = "الصوت الأصلي - ريمكس نيون سيتي 🎵",
                    color = Color.White.copy(alpha = 0.8f),
                    fontSize = 11.sp
                )
            }
        }
    }
}

@Composable
fun ActionRailItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    tint: Color,
    count: String,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.clickable { onClick() }
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = tint,
            modifier = Modifier.size(30.dp)
        )
        Text(
            text = count,
            color = Color.White,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold
        )
    }
}
