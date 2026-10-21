import { TAB_BAR_GAP, TAB_BAR_HEIGHT } from "@/constants/tabBar";
import { useExploreStore } from "@/stores/exploreStore";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const tabIcon = (active: IconName, inactive: IconName) => {
  const TabIcon = ({ color, focused }: { color: string; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} size={22} color={color} />
  );

  TabIcon.displayName = "TabIcon";

  return TabIcon;
};

const TabsLayout = () => {
  const { bottom } = useSafeAreaInsets();

  useEffect(() => () => useExploreStore.getState().reset(), []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0061FF",
        tabBarInactiveTintColor: "#8C8E98",
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontFamily: "Rubik-Medium", fontSize: 11 },
        tabBarItemStyle: { paddingVertical: 8 },
        tabBarStyle: {
          position: "absolute",
          bottom: bottom + TAB_BAR_GAP,
          height: TAB_BAR_HEIGHT,
          paddingVertical: 0,
          borderRadius: TAB_BAR_HEIGHT / 2,
          borderTopWidth: 0,
          backgroundColor: "#FFFFFF",
          elevation: 10,
          marginHorizontal: 24,

          // ios
          shadowColor: "#191d31",
          shadowOpacity: 0.12,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
        },
      }}

      screenListeners={({ route }) => ({
        tabPress: () => {
          if (route.name !== "explore") useExploreStore.getState().reset();
        },
      })}
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
          title: "Favorites",
          tabBarIcon: tabIcon("heart", "heart-outline"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: tabIcon("person", "person-outline"),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
