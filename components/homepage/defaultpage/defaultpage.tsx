import * as Location from 'expo-location';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getCurrentUser } from '../../../services/auth';
import { saveSearchToHistory } from '../../../services/searchHistory';

interface HomepageBodyProps {
  onSearchResults?: (results: any, mood: string) => void;
  onSearchStart?: () => void;
}

export default function HomepageBody({ onSearchResults, onSearchStart }: HomepageBodyProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Mood options
  const moodOptions = [
    'Happy & Social',
    'Romantic',
    'Relaxed & Chill',
    'Adventurous / Curious',
    'Comfort & Cozy',
    'Energetic / Party',
    'Mindful / Nature-Lover',
    'Healthy & Fresh'
  ];
  

  // Image sources
  const images = [
    require('../../../assets/images/section-1.png'),
    require('../../../assets/images/section-2.png'),
    require('../../../assets/images/section-3.png'),
    require('../../../assets/images/section-4.png'),
    require('../../../assets/images/section-5.png'),
    require('../../../assets/images/section-6.png'),
    require('../../../assets/images/section-7.png'),
    require('../../../assets/images/section-8.png'),
  ];

  // Default image
  const defaultImage = require('../../../assets/images/default.png');

  // Map moods to their corresponding images
  const moodToImageMap: { [key: string]: any } = {
    'Happy & Social': images[0], // section-1.png
    'Romantic': images[1], // section-2.png
    'Relaxed & Chill': images[2], // section-3.png
    'Adventurous / Curious': images[3], // section-4.png
    'Comfort & Cozy': images[4], // section-5.png
    'Energetic / Party': images[5], // section-6.png
    'Mindful / Nature-Lover': images[6], // section-7.png
    'Healthy & Fresh': images[7], // section-8.png
  };

  // Debug: Log the mapping
  console.log('Mood to Image Mapping:', moodToImageMap);

  const handleMoodSelection = (mood: string) => {
    console.log('Selected mood:', mood);
    console.log('Mapped image:', moodToImageMap[mood]);
    setSelectedMood(mood);
  };

  const handleSearch = async () => {
    if (!selectedMood) {
      Alert.alert('No Mood Selected', 'Please select a mood before searching');
      return;
    }

    // Check if user is authenticated
    const user = getCurrentUser();
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to save your search history');
      return;
    }

    console.log('User authenticated for search:', user.uid, user.email);

    // Start searching animation
    if (onSearchStart) {
      onSearchStart();
    }

    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to find nearby places');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      console.log('Current location:', { latitude, longitude });
      console.log('Selected mood:', selectedMood);

      // Make API call
      const apiUrl = 'https://placefetcher-197302493927.us-central1.run.app';
      const requestBody = {
        request_type: 'nearby_search',
        lat: latitude,
        lng: longitude,
        radius: 3000,
        mood: selectedMood
      };

      console.log('Making API call with:', requestBody);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      // Save search to history
      try {
        console.log('Attempting to save search to history...');
        const historyId = await saveSearchToHistory(selectedMood, latitude, longitude, data);
        if (historyId) {
          console.log('Search saved to history successfully with ID:', historyId);
        } else {
          console.log('Failed to save search to history - no user logged in or error occurred');
        }
      } catch (historyError) {
        console.error('Error saving search to history:', historyError);
        // Don't block the search flow if history save fails
      }
      
      // Pass results to parent component to navigate to view page
      if (onSearchResults) {
        onSearchResults(data, selectedMood);
      } else {
        Alert.alert('Success', `Found ${data.results?.length || 0} places for ${selectedMood} mood!`);
      }
      
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Failed', 'Unable to find places. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Part 1: Heading at top */}
        <View style={styles.headingSection}>
          <Text style={styles.sectionTitle}>How are you feeling?</Text>
        </View>

        {/* Part 2: Images from assets folder - Default or Selected display */}
        <View style={styles.imageSection}>
          {selectedMood ? (
            <View style={styles.selectedImageContainer}>
              <Image
                source={moodToImageMap[selectedMood] || images[0]}
                style={styles.selectedMoodImage}
                resizeMode="cover"
                onError={(error) => console.log('Image load error:', error)}
              />
            </View>
          ) : (
            <View style={styles.defaultImageContainer}>
              <Image
                source={defaultImage}
                style={styles.defaultImage}
                resizeMode="cover"
                onError={(error) => console.log('Default image load error:', error)}
              />
            </View>
          )}
        </View>

        {/* Part 3: Mood selection - Buttons only */}
        <View style={styles.moodSection}>
          <View style={styles.moodGrid}>
            {moodOptions.map((mood, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.moodButton,
                  selectedMood === mood && styles.selectedMoodButton
                ]}
                onPress={() => handleMoodSelection(mood)}
              >
                <Text style={[
                  styles.moodText,
                  selectedMood === mood && styles.selectedMoodText
                ]}>
                  {mood}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

          {/* Part 3: Search button - Fixed at bottom */}
          <View style={styles.searchSection}>
            <TouchableOpacity
              style={[
                styles.searchButton,
                !selectedMood && styles.disabledSearchButton
              ]}
              onPress={handleSearch}
              disabled={!selectedMood}
            >
              <Text style={[
                styles.searchButtonText,
                !selectedMood && styles.disabledSearchButtonText
              ]}>
                Find My Perfect Spot
              </Text>
            </TouchableOpacity>
          </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 100, // Space for fixed search button
  },
  // Part 1: Heading Section Styles
  headingSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 0,
  },
  // Part 1: Image Section Styles
  imageSection: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    marginBottom: 0,
    minHeight: 150, // For cluster view
  },
  imageCluster: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clusterImageContainer: {
    width: '22%',
    aspectRatio: 1,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedClusterImage: {
    borderColor: '#D7263D',
    borderWidth: 3,
  },
  clusterImage: {
    width: '100%',
    height: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 15,
    textAlign: 'center',
  },
  imageScrollView: {
    marginTop: 10,
  },
  moodImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
  },
  selectedImageContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    flex: 1,
    justifyContent: 'center',
  },
  selectedMoodImage: {
    width: 180,
    height: 180,
    borderRadius: 16,
  },
  defaultImageContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    flex: 1,
    justifyContent: 'center',
  },
  defaultImage: {
    width: 250,
    height: 250,
    borderRadius: 20,
  },
  // Part 2: Mood Selection Styles
  moodSection: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    marginBottom: 100, // Reduced space since cluster is smaller
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodButton: {
    backgroundColor: '#F8F8F8',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  selectedMoodButton: {
    backgroundColor: '#D7263D',
    borderColor: '#D7263D',
  },
  moodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7A7A7A',
    textAlign: 'center',
  },
  selectedMoodText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Part 3: Search Button Styles
  searchSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    marginTop: 0,
  },
  searchButton: {
    backgroundColor: '#D7263D',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#D7263D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledSearchButton: {
    backgroundColor: '#E5E5E5',
    shadowOpacity: 0,
    elevation: 0,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledSearchButtonText: {
    color: '#B0B0B0',
  },
});
