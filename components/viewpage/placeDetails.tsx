import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface PlaceDetailsProps {
  placeId: string;
  onClose: () => void;
}

interface Review {
  author_name: string;
  author_url: string;
  language: string;
  original_language: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
  translated: boolean;
}

interface Photo {
  height: number;
  html_attributions: string[];
  photo_reference: string;
  width: number;
}

interface PlaceDetailsData {
  success: boolean;
  place: {
    lat: number;
    lng: number;
    name: string;
    formatted_address: string;
    rating: number;
    place_id: string;
    price_level?: number | null;
    user_ratings_total: number;
    reviews: Review[];
    photo_urls: string[];
    photos?: Photo[];
    types?: string[];
    vicinity?: string | null;
  };
}

export default function PlaceDetails({ placeId, onClose }: PlaceDetailsProps) {
  const [placeDetails, setPlaceDetails] = useState<PlaceDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  console.log('PlaceDetails component rendered with placeId:', placeId);
  console.log('PlaceDetails current state - loading:', loading, 'error:', error, 'placeDetails:', placeDetails);

  useEffect(() => {
    fetchPlaceDetails();
  }, [placeId]);

  const fetchPlaceDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching place details for place_id:', placeId);
      
      const apiUrl = 'https://placefetcher-197302493927.us-central1.run.app';
      const requestBody = {
        request_type: 'place_details',
        place_id: placeId,
        fields: 'name,formatted_address,rating,user_ratings_total,reviews,photos,geometry'
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
      console.log('Place details API response:', data);
      console.log('API response success:', data.success);
      console.log('API response place:', data.place);
      console.log('API response place name:', data.place?.name);
      
      if (data.success && data.place) {
        console.log('Setting place details state with:', data);
        setPlaceDetails(data);
      } else {
        console.log('API response validation failed - success:', data.success, 'place exists:', !!data.place);
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatPriceLevel = (priceLevel: number | null) => {
    if (priceLevel === null || priceLevel === undefined) {
      return 'Price not available';
    }
    return '$'.repeat(priceLevel);
  };

  const formatTypes = (types: string[]) => {
    return types?.length > 0 ? types.join(', ') : 'No types available';
  };

  const formatRating = (rating: number) => {
    return rating ? rating.toFixed(1) : 'No rating';
  };

  const formatReviewTime = (time: number) => {
    return new Date(time * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return '#34A853';
    if (rating >= 3) return '#FBBC04';
    return '#EA4335';
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    if (hasHalfStar) {
      stars.push('☆');
    }
    return stars.join('');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesome name="times" size={20} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Place Details</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D7263D" />
          <Text style={styles.loadingText}>Loading place details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesome name="times" size={20} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Place Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-triangle" size={48} color="#FF4444" />
          <Text style={styles.errorTitle}>Error Loading Details</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPlaceDetails}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <FontAwesome name="times" size={20} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Place Details</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {(() => {
          console.log('Rendering check - placeDetails:', placeDetails);
          console.log('Rendering check - placeDetails.place:', placeDetails?.place);
          return null;
        })()}
        {placeDetails && placeDetails.place && (
          <View style={styles.detailsContainer}>
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <Text style={styles.placeName}>{placeDetails.place.name}</Text>
              
              {/* Rating Badge */}
              <View style={[styles.ratingBadge, { backgroundColor: getRatingColor(placeDetails.place.rating) }]}>
                <Text style={styles.ratingBadgeText}>
                  {getRatingStars(placeDetails.place.rating)} {formatRating(placeDetails.place.rating)}
                </Text>
                <Text style={styles.ratingBadgeSubtext}>
                  {placeDetails.place.user_ratings_total || 0} reviews
                </Text>
              </View>
            </View>

            {/* Address Card */}
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <FontAwesome name="map-marker" size={18} color="#D7263D" />
                <Text style={styles.cardTitle}>Location</Text>
              </View>
              <Text style={styles.cardContent}>
                {placeDetails.place.formatted_address || placeDetails.place.vicinity || 'Address not available'}
              </Text>
            </View>

            {/* Photos Section */}
            {placeDetails.place.photo_urls && placeDetails.place.photo_urls.length > 0 && (
              <View style={styles.photosSection}>
                <Text style={styles.sectionTitle}>Photos ({placeDetails.place.photo_urls.length})</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScrollView}>
                  {placeDetails.place.photo_urls.slice(0, 8).map((photoUrl, index) => (
                    <View key={index} style={styles.photoCard}>
                      <Image 
                        source={{ uri: photoUrl }} 
                        style={styles.photoImage}
                        resizeMode="cover"
                        onError={() => console.log('Image failed to load:', photoUrl)}
                      />
                      <View style={styles.photoOverlay}>
                        <FontAwesome name="expand" size={16} color="#FFFFFF" />
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Reviews Section */}
            {placeDetails.place.reviews && placeDetails.place.reviews.length > 0 && (
              <View style={styles.reviewsSection}>
                <Text style={styles.sectionTitle}>Customer Reviews ({placeDetails.place.reviews.length})</Text>
                {placeDetails.place.reviews.slice(0, 5).map((review, index) => (
                  <View key={index} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewAuthor}>
                        {review.profile_photo_url ? (
                          <Image source={{ uri: review.profile_photo_url }} style={styles.authorAvatar} />
                        ) : (
                          <View style={styles.authorAvatarPlaceholder}>
                            <FontAwesome name="user" size={16} color="#FFFFFF" />
                          </View>
                        )}
                        <View style={styles.authorInfo}>
                          <Text style={styles.reviewAuthorName}>{review.author_name}</Text>
                          <Text style={styles.reviewTime}>{review.relative_time_description}</Text>
                        </View>
                      </View>
                      <View style={styles.reviewRating}>
                        <Text style={styles.reviewRatingText}>{getRatingStars(review.rating)}</Text>
                        <Text style={styles.reviewRatingNumber}>{review.rating}</Text>
                      </View>
                    </View>
                    <Text style={styles.reviewText}>
                      {review.text}
                    </Text>
                  </View>
                ))}
              </View>
            )}

          </View>
        )}
        
        {/* Debug fallback - show raw data if available */}
        {placeDetails && !placeDetails.place && (
          <View style={styles.detailsContainer}>
            <Text style={styles.placeName}>Debug: Data received but no place object</Text>
            <Text style={styles.cardContent}>{JSON.stringify(placeDetails, null, 2)}</Text>
          </View>
        )}
        
        {/* Debug fallback - show when placeDetails is null */}
        {!placeDetails && !loading && !error && (
          <View style={styles.detailsContainer}>
            <Text style={styles.placeName}>Debug: No place details data</Text>
            <Text style={styles.cardContent}>placeDetails is null or undefined</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  detailsContainer: {
    padding: 20,
  },
  
  // Hero Section
  heroSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  placeName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  ratingBadge: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  ratingBadgeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  ratingBadgeSubtext: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },

  // Info Cards
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  cardContent: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },

  // Photos Section
  photosSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  photosScrollView: {
    paddingLeft: 4,
  },
  photoCard: {
    width: 140,
    height: 140,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    padding: 6,
  },

  // Reviews Section
  reviewsSection: {
    marginBottom: 16,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D7263D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  reviewAuthorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  reviewTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  reviewRating: {
    alignItems: 'center',
  },
  reviewRatingText: {
    fontSize: 16,
    color: '#F59E0B',
    marginBottom: 2,
  },
  reviewRatingNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  reviewText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },


  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#D7263D',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
