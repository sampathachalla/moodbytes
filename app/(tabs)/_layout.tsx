import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#D7263D',
        tabBarInactiveTintColor: '#7A7A7A',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E5E5',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          borderBottomColor: '#E5E5E5',
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: '#1A1A1A',
        },
      }}
    >
      <Tabs.Screen
        name="homepage"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}
