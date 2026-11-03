package com.fextok.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fextok.app.ui.screens.FeedScreen
import com.fextok.app.ui.screens.LiveScreen
import com.fextok.app.ui.theme.*

enum class FexTokTab {
    FEED, EXPLORE, CREATE, INBOX, PROFILE
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            FexTokTheme(isRtl = true) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = FexTokBackground
                ) {
                    FexTokAppRoot()
                }
            }
        }
    }
}

@Composable
fun FexTokAppRoot() {
    var currentTab by remember { mutableStateOf(FexTokTab.FEED) }
    var isLiveBroadcastActive by remember { mutableStateOf(false) }

    Box(modifier = Modifier.fillMaxSize().background(FexTokBackground)) {
        if (isLiveBroadcastActive) {
            LiveScreen(onClose = { isLiveBroadcastActive = false })
        } else {
            Scaffold(
                bottomBar = {
                    FexTokBottomNavBar(
                        selectedTab = currentTab,
                        onTabSelected = { tab ->
                            if (tab == FexTokTab.CREATE) {
                                isLiveBroadcastActive = true
                            } else {
                                currentTab = tab
                            }
                        }
                    )
                },
                containerColor = FexTokBackground
            ) { paddingValues ->
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(bottom = paddingValues.calculateBottomPadding())
                ) {
                    when (currentTab) {
                        FexTokTab.FEED -> FeedScreen(onGoLive = { isLiveBroadcastActive = true })
                        FexTokTab.EXPLORE -> DummyScreen(title = "صفحة الاكتشاف والبحث")
                        FexTokTab.CREATE -> Unit
                        FexTokTab.INBOX -> DummyScreen(title = "الرسائل والمكالمات")
                        FexTokTab.PROFILE -> DummyScreen(title = "الملف الشخصي وإعادة البث")
                    }
                }
            }
        }
    }
}

@Composable
fun FexTokBottomNavBar(
    selectedTab: FexTokTab,
    onTabSelected: (FexTokTab) -> Unit
) {
    NavigationBar(
        containerColor = Color(0xF507090E),
        tonalElevation = 0.dp,
        modifier = Modifier
            .fillMaxWidth()
            .navigationBarsPadding()
            .height(56.dp)
    ) {
        val items = listOf(
            Triple(FexTokTab.FEED, "الرئيسية", Icons.Filled.Home to Icons.Outlined.Home),
            Triple(FexTokTab.EXPLORE, "اكتشف", Icons.Filled.Explore to Icons.Outlined.Explore),
            Triple(FexTokTab.CREATE, "", Icons.Filled.Add to Icons.Filled.Add),
            Triple(FexTokTab.INBOX, "الرسائل", Icons.Filled.ChatBubble to Icons.Outlined.ChatBubbleOutline),
            Triple(FexTokTab.PROFILE, "صفحتي", Icons.Filled.Person to Icons.Outlined.Person)
        )

        items.forEach { (tab, label, icons) ->
            val isSelected = selectedTab == tab
            if (tab == FexTokTab.CREATE) {
                // FexTok Neon Create (+) Button with Cyan & Pink borders
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight(),
                    contentAlignment = Alignment.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(width = 44.dp, height = 30.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(FexTokNeonGradient)
                            .clickable { onTabSelected(tab) },
                        contentAlignment = Alignment.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .size(width = 38.dp, height = 26.dp)
                                .clip(RoundedCornerShape(6.dp))
                                .background(Color.White),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Add,
                                contentDescription = "إنشاء",
                                tint = Color.Black,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }
            } else {
                NavigationBarItem(
                    selected = isSelected,
                    onClick = { onTabSelected(tab) },
                    icon = {
                        Icon(
                            imageVector = if (isSelected) icons.first else icons.second,
                            contentDescription = label,
                            tint = if (isSelected) Color.White else FexTokMuted,
                            modifier = Modifier.size(22.dp)
                        )
                    },
                    label = {
                        Text(
                            text = label,
                            fontSize = 10.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            color = if (isSelected) Color.White else FexTokMuted
                        )
                    },
                    colors = NavigationBarItemDefaults.colors(
                        indicatorColor = Color.Transparent
                    )
                )
            }
        }
    }
}

@Composable
fun DummyScreen(title: String) {
    Box(
        modifier = Modifier.fillMaxSize().background(FexTokBackground),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = title,
            color = Color.White,
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold
        )
    }
}
