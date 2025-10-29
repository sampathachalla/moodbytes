import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PlaceDetails from './placeDetails';

interface ViewPageProps {
  searchResults?: any;
  searchMood?: string;
}

export default function ViewPage({ searchResults, searchMood }: ViewPageProps) {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  
  console.log('ViewPage - searchResults:', searchResults);
  console.log('ViewPage - searchMood:', searchMood);
  
  // Handle different API response structures
  let placesDataToUse = []; // Default to empty array
  
  if (searchResults) {
    if (Array.isArray(searchResults)) {
      // If searchResults is directly an array of places
      placesDataToUse = searchResults;
    } else if (searchResults.places && Array.isArray(searchResults.places)) {
      // If searchResults has a places property
      placesDataToUse = searchResults.places;
    } else if (searchResults.results && Array.isArray(searchResults.results)) {
      // If searchResults has a results property
      placesDataToUse = searchResults.results;
    }
  }
  
  console.log('ViewPage - placesDataToUse length:', placesDataToUse?.length);
  console.log('ViewPage - placesDataToUse sample:', placesDataToUse?.[0]);

  const handlePlacePress = (place: any) => {
    console.log('Selected place:', place.name);
    console.log('Place ID:', place.place_id);
    
    if (place.place_id) {
      setSelectedPlaceId(place.place_id);
    } else {
      console.log('No place_id found for this place');
    }
  };

  const handleClosePlaceDetails = () => {
    setSelectedPlaceId(null);
  };

  // Show place details if a place is selected
  if (selectedPlaceId) {
    return (
      <PlaceDetails 
        placeId={selectedPlaceId} 
        onClose={handleClosePlaceDetails} 
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>


        {/* Places List */}
        <View style={styles.placesList}>
          {placesDataToUse.map((place: any, index: number) => (
            <TouchableOpacity
              key={place.id || place.place_id || index}
              style={styles.placeCard}
              onPress={() => handlePlacePress(place)}
            >
              <View style={styles.placeContent}>
                <View style={styles.placeHeader}>
                  <Text style={styles.placeName}>{place.name}</Text>
                </View>
                
                <Text style={styles.placeDescription}>{place.vicinity || place.description || 'No description available'}</Text>

                {(place.features && place.features.length > 0) || (place.types && place.types.length > 0) ? (
                  <View style={styles.featuresContainer}>
                    {(place.features || place.types || []).map((feature: any, featureIndex: number) => (
                      <View key={featureIndex} style={styles.featureTag}>
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          ))}
        </View>

            {/* Empty State */}
            {placesDataToUse.length === 0 && (
              <View style={styles.emptyState}>
                <FontAwesome name="search" size={48} color="#C0C0C0" />
                <Text style={styles.emptyTitle}>No Places Found</Text>
                <Text style={styles.emptySubtitle}>
                  No restaurants found for your selected mood. Try a different mood or location.
                </Text>
              </View>
            )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  placesList: {
    padding: 20,
  },
  placeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    // Gemini-style gradient border
    borderWidth: 2,
    borderColor: '#4285F4', // Google Blue
    borderTopColor: '#EA4335', // Google Red
    borderRightColor: '#FBBC04', // Google Yellow
    borderBottomColor: '#34A853', // Google Green
    borderLeftColor: '#4285F4', // Google Blue
    shadowColor: '#4285F4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  placeContent: {
    padding: 16,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#1A1A1A',
    marginLeft: 4,
    fontWeight: '600',
  },
  placeMood: {
    fontSize: 12,
    color: '#D7263D',
    fontWeight: '600',
    marginBottom: 8,
  },
  placeDescription: {
    fontSize: 14,
    color: '#7A7A7A',
    lineHeight: 20,
    marginBottom: 12,
  },
  placeDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 12,
    color: '#7A7A7A',
    marginLeft: 4,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 10,
    color: '#7A7A7A',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7A7A7A',
    textAlign: 'center',
    lineHeight: 20,
  },
});
