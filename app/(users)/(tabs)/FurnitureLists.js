import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Animated,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DB from '../../../database/firebaseConfig';
import { getDocs,collection,doc, deleteDoc, where ,query} from 'firebase/firestore';
import { useFocusEffect } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { useUser } from "@clerk/clerk-expo";
import Spinner from "react-native-loading-spinner-overlay";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Chip } from 'react-native-paper';
import {
    GestureHandlerRootView,
  RefreshControl,
  Swipeable,
  } from "react-native-gesture-handler";
import { router } from "expo-router";

const { width } = Dimensions.get("window");
const CARD_MARGIN = 16;
const CARD_WIDTH = width - CARD_MARGIN *5;

const FurnitureLists = () => {
    const { user } = useUser();
    const [refreshing, setRefreshing] = useState(false);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollY = new Animated.Value(0);
  
    const fetchListings = async () => {
      setLoading(true);
      try {
        const q = query(collection(DB, "furnitureOrders"), where("userId", "==", user.id));
        const querySnapshot = await getDocs(q);
        const inventoryData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched Inventory Data:", inventoryData);
        setListings(inventoryData);
      } catch (error) {
        console.error("Error fetching Furnitures:", error);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchListings();
    }, []);
  
    if (loading) {
      return <Spinner loading={loading}/>
    }
  
const handleProceed=(id)=>{
      router.push({pathname:'ListCompanies',params:{id:id}})
    }

    const DeleteOrder=async(id) => {
        try {
          await deleteDoc(doc(DB,"furnitureOrders",id))
          console.log("Success")
          fetchInventory()
        } catch (error) {
          console.log(error);
        }
  
      }
    
      const onRefresh = async () => {
        setRefreshing(true);
        await fetchListings()
        setRefreshing(false);
      };

    const ListingCard = ({ item }) => {
        console.log(item.id);
      if (!item) return null;
      const renderRightActions = (progress, dragX) => (
        <TouchableOpacity
          onPress={()=>DeleteOrder(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash" size={24} color={"#fff"}></Ionicons>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      );
    
      const renderLeftActions = (progress, dragX) => (
        <TouchableOpacity 
         onPress={()=>EditOrder(item.id)}
             style={styles.editButton}>
          {/* <FontAwesome name="ban" size={24} color="white" /> */}
          <MaterialIcons name="edit" size={24} color="white" />
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
      );
      return (
        <Swipeable
              renderRightActions={renderRightActions}
              renderLeftActions={renderLeftActions}
            >

        <TouchableOpacity style={styles.card} activeOpacity={0.95}   onPress={() => {
                        router.push({
                          pathname: "ListingDetails",
                          params: { listingId: item.id },
                        });
                      }}>
          <View style={styles.cardImageContainer}>
                      
            <Image source={{ uri: item?.imageUrls[0] || "default-image-url" }} style={styles.cardImage} />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              style={styles.cardGradient}
            >
              <View style={styles.cardContent}>
                <View style={styles.priceTag}>
                  
                  <Text style={styles.price}>{item?.orderName|| "N/A"}</Text>
                      <Chip  onPress={() => console.log('Pressed')} style={{height:40,borderRadius:100,justifyContent:'center',backgroundColor:'#213a33'}}><Text style={{color:'#74d687',textTransform:'capitalize'}}>{item.status}</Text></Chip>
                </View>
              </View>
                
            </LinearGradient>
          </View>
  
          <View style={styles.cardBody}>
          <View style={styles.buttonContainer}>
             {item?.paymentInfo.paymentStatus !== 'paid' && (
              <TouchableOpacity style={styles.buyButton} onPress={()=>handleProceed(item.id)}>
                <Text style={styles.buyButtonText}>Proceed</Text>
              </TouchableOpacity>
             )
             }
            </View>
            {/* <Text style={styles.cardTitle}>email:<Text style={{color:'green'}}>{item?.email || "Untitled"}</Text></Text>
            
                <Text>
            Description:
            <Text numberOfLines={2} style={styles.description}>

              {item?.description || "No description available."} 
              </Text>
                </Text>

            <Text>
            Pickup Address :
            <Text numberOfLines={2} style={styles.description}>
             {item.pickupLocation.address}
            </Text>
              </Text>
            <Text>
            DropOff Address :
            <Text numberOfLines={2} style={styles.description}>
             {item.dropoffLocation.address}
            </Text>
              </Text> */}

         
          </View>
          
        </TouchableOpacity>
            </Swipeable>
      );
    };
  
    return (
      <View style={styles.container}>
        <Animated.FlatList
          data={listings}
          renderItem={({ item }) => <ListingCard item={item} />}
          keyExtractor={(item) => item.id || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
           refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh} // Call the onRefresh function when user pulls to refresh
                    />
                  }
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        />
      </View>
    );
  };
const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: "#F8F9FA",
    },
    header: {
        backgroundColor: "rgba(255,255,255,0.9)",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.1)",
        zIndex: 1000,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: -1,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: CARD_MARGIN,
    gap: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    overflow: "hidden",
    elevation: 3,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    
    
  },
  deleteButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 75,
    // height: '100%',
    marginVertical: 10,
  },
  editButton: {
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
    width: 75,
    // height: '100%',
    marginVertical: 10,
  },
  cardImageContainer: {
    height: 220,
    backgroundColor: "#F0F0F0",
    // position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cardGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: "flex-end",
    padding: 16,
  },
  userInfoOverlay: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 8,
    borderRadius: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

  },
  buyButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#3662e3",
    paddingVertical: 10,
    // paddingHorizontal:28,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buyButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    textTransform: "capitalize",
    fontWeight: "600",
    color: "#1A1A1A",
  },
  timeAgo: {
    fontSize: 12,
    color: "#666",
  },
  cardBody: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  priceTag: {
    flexDirection: "column",
    alignItems: "baseline",
  },
  currency: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginRight: 4,
  },
  price: {
    fontSize: 42,
    fontWeight: "700",
    color: "white",
  },
  cardStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: "#666",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    borderRadius: 28,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  fabGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  fabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  skeletonCard: {
    backgroundColor: "white",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 16,
    height: 360,
  },
  skeletonImage: {
    width: "100%",
    height: 220,
    backgroundColor: "#F0F0F0",
  },
  skeletonContent: {
    padding: 16,
  },
  skeletonTitle: {
    width: "60%",
    height: 24,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    marginBottom: 12,
  },
  skeletonDescription: {
    width: "90%",
    height: 16,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  skeletonStat: {
    width: 80,
    height: 16,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
  },
  shimmer: {
    opacity: 0.5,
  },
  badge: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  refreshButton: {
    position: "absolute",
    top: 24,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginRight: 16,
  },
  sortButtonText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  filterContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  priceRangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  priceInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: "#2196F3",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  resetButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 16,
    color: "#666",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
    gap: 4,
  },
  chipText: {
    fontSize: 14,
    color: "#666",
  },
  removeChip: {
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  distanceSlider: {
    marginTop: 16,
  },
  distanceLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  distanceLabel: {
    fontSize: 12,
    color: "#999",
  },
});

export default FurnitureLists;