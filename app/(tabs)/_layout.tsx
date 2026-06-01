import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, useColorScheme } from "react-native";
import { HapticTab }  from "@/components/haptic-tab";

const TabLayout = () => {
  const colorScheme = useColorScheme();
  return (
   <Tabs
   screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
    tabBarButton: HapticTab
   }}
   >
   
    <Tabs.Screen
    name="lessons"
    options={{
      title: "Lessons",
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="school" color={color} size={28} />
      ),
    }}
    />
    <Tabs.Screen
    name="conversations"
    options={{
      title: "Conversations",
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="chatbubbles-sharp" color={color} size={28} />
      ),
    }}
    />
    <Tabs.Screen
    name="profile"
    options={{
      title: "Profile",
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="person-circle-outline" color={color} size={28} />
      ),
    }}
    />
   </Tabs>
  );
};

export default TabLayout;

const styles = StyleSheet.create({});
