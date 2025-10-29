import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface HomepageFooterProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function HomepageFooter({ onNavigate, currentPage }: HomepageFooterProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconRow}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => onNavigate('history')}
        >
          <FontAwesome 
            name="history" 
            size={24} 
            color={currentPage === 'history' ? '#D7263D' : '#7A7A7A'} 
          />
          <Text style={[
            styles.iconText,
            currentPage === 'history' && styles.activeIconText
          ]}>History</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => onNavigate('home')}
        >
          <FontAwesome 
            name="home" 
            size={24} 
            color={currentPage === 'home' ? '#D7263D' : '#7A7A7A'} 
          />
          <Text style={[
            styles.iconText,
            currentPage === 'home' && styles.activeIconText
          ]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => onNavigate('view')}
        >
          <FontAwesome 
            name="eye" 
            size={24} 
            color={currentPage === 'view' ? '#D7263D' : '#7A7A7A'} 
          />
          <Text style={[
            styles.iconText,
            currentPage === 'view' && styles.activeIconText
          ]}>View Page</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => onNavigate('profile')}
        >
          <FontAwesome 
            name="user" 
            size={24} 
            color={currentPage === 'profile' ? '#D7263D' : '#7A7A7A'} 
          />
          <Text style={[
            styles.iconText,
            currentPage === 'profile' && styles.activeIconText
          ]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '10%',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'android' ? 25 : 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    justifyContent: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  iconButton: {
    alignItems: 'center',
    padding: 10,
  },
  iconText: {
    fontSize: 12,
    color: '#7A7A7A',
    marginTop: 4,
    fontWeight: '500',
  },
  activeIconText: {
    color: '#D7263D',
    fontWeight: '600',
  },
});
