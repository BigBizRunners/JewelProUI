import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur'; // Import BlurView for the glassy effect

const BottomNavBar = ({ state, descriptors, navigation }: any) => {
  const activeTab = state.index;

  const tabIcons = {
    Orders: { active: 'clipboard-list', inactive: 'clipboard-list-outline' },
    Repair: { active: 'wrench', inactive: 'wrench-outline' },
    Settings: { active: 'cog', inactive: 'cog-outline' },
  };

  return (
      <BlurView tint="light" intensity={50} style={styles.container}>
        {state.routes.map((route: any, index: number) => {
          const isActive = activeTab === index;
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || route.name;

          // @ts-ignore
          const icon = tabIcons[route.name];

          return (
              <TouchableOpacity
                  key={route.key}
                  onPress={() => navigation.navigate(route.name)}
                  style={[styles.tabItem, isActive && styles.activeTabItem]}
              >
                <MaterialCommunityIcons
                    name={isActive ? icon.active : icon.inactive}
                    size={24}
                    color={isActive ? '#ff5c5c' : '#888'}
                />
                <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>{label}</Text>
              </TouchableOpacity>
          );
        })}
      </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Slight transparency
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)', // Subtle border for separation
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  activeTabItem: {
    borderTopWidth: 3,
    borderTopColor: '#ff5c5c',
  },
  tabLabel: {
    fontSize: 12,
    color: '#888',
  },
  activeTabLabel: {
    color: '#ff5c5c',
    fontWeight: 'bold',
  },
});

export default BottomNavBar;
