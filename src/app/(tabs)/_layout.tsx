import { Tabs } from 'expo-router';

import { TabBar } from '@/components/layout/TabBar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="accounts" />
      <Tabs.Screen name="transactions" />
      <Tabs.Screen name="analytics" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
