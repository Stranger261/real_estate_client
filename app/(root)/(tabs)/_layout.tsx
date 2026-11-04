import { useEffect } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TAB_BAR_GAP, TAB_BAR_HEIGHT } from "@/constants/tabBar";
import { useUnreadMessages } from "@/hooks/useChat";
import { useUnreadCount } from "@/hooks/useNotifications";
import { useExploreStore } from "@/stores/exploreStore";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const tabIcon = (active: IconName, inactive: IconName) => {
  const TabIcon = ({ color, focused }: { color: string; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} size={22} color={color} />
  );

  TabIcon.displayName = "TabIcon";

  return TabIcon;
};

const badge = (count: number) => (count > 0 ? Math.min(count, 99) : undefined);

export default function TabsLayout() {
  const { bottom } = useSafeAreaInsets();
  const { data: unreadNotifications = 0 } = useUnreadCount();
  const { data: unreadMessages = 0 } = useUnreadMessages();

  // When the tabs unmount (logging out), drop the filters so the next user starts clean
  useEffect(() => () => useExploreStore.getState().reset(), []);

  return (
    <Tabs
      screenListeners={({ route }) => ({
        tabPress: () => {
          // pressing any tab other than Explore resets Explore's filters
          if (route.name !== "explore") useExploreStore.getState().reset();
        },
      })}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0061FF",
        tabBarInactiveTintColor: "#8C8E98",
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontFamily: "Rubik-Medium", fontSize: 11 },
        tabBarItemStyle: { paddingVertical: 8 },
        tabBarBadgeStyle: { backgroundColor: "#F75555" },
        tabBarStyle: {
          position: "absolute",
          left: 20,
          right: 20,
          bottom: bottom + TAB_BAR_GAP,
          height: TAB_BAR_HEIGHT,
          paddingTop: 0,
          paddingBottom: 0,
          borderRadius: TAB_BAR_HEIGHT / 2,
          borderTopWidth: 0,
          backgroundColor: "#FFFFFF",
          shadowColor: "#191d31",
          shadowOpacity: 0.12,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 10,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: "Home", tabBarIcon: tabIcon("home", "home-outline") }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: tabIcon("search", "search-outline"),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Saved",
          tabBarIcon: tabIcon("heart", "heart-outline"),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: tabIcon(
            "chatbubble-ellipses",
            "chatbubble-ellipses-outline",
          ),
          tabBarBadge: badge(unreadMessages),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: tabIcon("person", "person-outline"),
          tabBarBadge: badge(unreadNotifications),
        }}
      />
    </Tabs>
  );
}
