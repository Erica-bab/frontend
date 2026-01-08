import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  AppState,
  AppStateStatus,
  ActivityIndicator,
  FlatList,
  TextInput,
  RefreshControl,
  Animated,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError } from "axios";
import AdBanner from "@/components/ui/AdBanner";
import RouletteModal from "@/components/ui/RouletteModal";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useRestaurantListV2,
  useRestaurantSearch,
} from "@/api/restaurants/useRestaurant";
import {
  RestaurantListParams,
  SearchResultItem,
} from "@/api/restaurants/types";
import Icon from "@/components/Icon";
import { calculateDistance } from "@/utils/calculateDistance";
import {
  isRestaurantOpenAt,
  hasOperatingHoursOnDay,
} from "@/utils/operatingStatus";
import { getSafeErrorMessage } from "@/utils/errorHandler";
import { formatCategory } from "@/utils/formatCategory";
import { useRatingStats } from "@/api/restaurants/useRating";

const SORT_OPTIONS = ["위치순", "별점순", "가격순"];
const STICKY_THRESHOLD = 30;

// 검색 결과 아이템 컴포넌트
function SearchResultCard({ item }: { item: SearchResultItem }) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  if (item.type === "restaurant" && item.restaurant) {
    const restaurant = item.restaurant;
    const rawId = restaurant.id;
    const restaurantId =
      typeof rawId === "number" && !isNaN(rawId) && rawId > 0
        ? rawId
        : typeof rawId === "string"
          ? Number(rawId)
          : NaN;
    const isValidId = !isNaN(restaurantId) && restaurantId > 0;

    const { data: ratingStats } = useRatingStats(
      isValidId ? restaurantId : 0,
      isValidId,
      {
        refetchInterval: isValidId ? 60000 : undefined,
      }
    );

    const currentRating =
      ratingStats?.average ?? restaurant.average_rating ?? 0;
    const currentRatingCount =
      ratingStats?.count ?? restaurant.rating_count ?? 0;

    const statusLabels = {
      open: "영업중",
      break_time: "브레이크타임",
      order_end: "주문마감",
      closed: "영업종료",
    };
    const statusText = restaurant.operating_status
      ? statusLabels[restaurant.operating_status.current.type]
      : null;

    return (
      <Pressable
        className="p-4 border-b border-gray-100 bg-white"
        onPress={() =>
          navigation.navigate("RestaurantDetail", {
            restaurantId: restaurant.id,
          })
        }
      >
        <View className="flex-row items-center">
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-semibold">{restaurant.name}</Text>
              <Text className="text-xs text-gray-500">
                {formatCategory(restaurant.category)}
              </Text>
            </View>
            <Text className="text-sm text-gray-500 mt-1">
              {restaurant.location.address}
            </Text>
            <View className="flex-row items-center gap-2 mt-1">
              {statusText && (
                <Text className="text-sm text-gray-600">{statusText}</Text>
              )}
              <Text className="text-sm text-blue-500">
                ★ {(currentRating || 0).toFixed(1)}
              </Text>
              <Text className="text-sm text-gray-400">
                ({currentRatingCount})
              </Text>
            </View>
            {restaurant.average_price && (
              <Text className="text-sm text-gray-500 mt-1">
                평균 {Math.round(restaurant.average_price).toLocaleString()}원
              </Text>
            )}
          </View>
          <Icon name="rightAngle" size={16} color="#9CA3AF" />
        </View>
      </Pressable>
    );
  }

  if (item.type === "menu" && item.menu && item.restaurant) {
    const restaurant = item.restaurant;
    const rawId = restaurant.id;
    const restaurantId =
      typeof rawId === "number" && !isNaN(rawId) && rawId > 0
        ? rawId
        : typeof rawId === "string"
          ? Number(rawId)
          : NaN;
    const isValidId = !isNaN(restaurantId) && restaurantId > 0;

    const { data: ratingStats } = useRatingStats(
      isValidId ? restaurantId : 0,
      isValidId,
      {
        refetchInterval: isValidId ? 60000 : undefined,
      }
    );

    const currentRating =
      ratingStats?.average ?? restaurant.average_rating ?? 0;
    const currentRatingCount =
      ratingStats?.count ?? restaurant.rating_count ?? 0;

    const statusLabels = {
      open: "영업중",
      break_time: "브레이크타임",
      order_end: "주문마감",
      closed: "영업종료",
    };
    const statusText = restaurant.operating_status
      ? statusLabels[restaurant.operating_status.current.type]
      : null;

    return (
      <Pressable
        className="p-4 border-b border-gray-100 bg-white"
        onPress={() =>
          navigation.navigate("RestaurantDetail", {
            restaurantId: restaurant.id,
          })
        }
      >
        <View className="flex-row items-center">
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                메뉴
              </Text>
              <Text className="text-base font-semibold">{item.menu.name}</Text>
            </View>
            <Text className="text-sm text-gray-500 mt-1">
              {restaurant.name}
            </Text>
            {item.menu.price && (
              <Text className="text-sm text-gray-600 mt-1">
                {item.menu.price.toLocaleString()}원
              </Text>
            )}
            <View className="flex-row items-center gap-2 mt-1">
              {statusText && (
                <Text className="text-sm text-gray-600">{statusText}</Text>
              )}
              <Text className="text-sm text-blue-500">
                ★ {(currentRating || 0).toFixed(1)}
              </Text>
              <Text className="text-sm text-gray-400">
                ({currentRatingCount})
              </Text>
            </View>
          </View>
          <Icon name="rightAngle" size={16} color="#9CA3AF" />
        </View>
      </Pressable>
    );
  }

  return null;
}

export default function RestaurantScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [filterParams, setFilterParams] = useState<
    Omit<RestaurantListParams, "sort">
  >({});
  const [operatingTimeFilter, setOperatingTimeFilter] = useState<{
    dayOfWeek?: string;
    hour?: string;
    minute?: string;
  } | null>(null);
  const [sortOption, setSortOption] = useState<string>("위치순");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showRouletteModal, setShowRouletteModal] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);

  // SearchBar 통합: 검색 상태
  const [scrollY] = useState(new Animated.Value(0));
  const [searchText, setSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationText, setLocationText] = useState("현재위치");
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [isLocationRefreshing, setIsLocationRefreshing] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const locationUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastGeocodedLocationRef = useRef<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const geocodeErrorRef = useRef<boolean>(false);
  const isUpdatingLocationRef = useRef<boolean>(false);
  const flatListRef = useRef<FlatList>(null);
  const sortButtonRef = useRef<View>(null);
  const [sortPopupPos, setSortPopupPos] = useState<{
    top: number;
    right: number;
  }>({ top: 0, right: 16 });

  const { data, isLoading, error, refetch } = useRestaurantListV2(filterParams);
  const appState = useRef(AppState.currentState);

  // 검색 API
  const { data: searchData, isLoading: isSearching } = useRestaurantSearch({
    q: searchQuery,
    limit: 20,
    lat: currentLocation.latitude !== 0 ? currentLocation.latitude : undefined,
    lng:
      currentLocation.longitude !== 0 ? currentLocation.longitude : undefined,
  });

  const isSearchMode = searchQuery.length > 0;

  // 두 좌표 간 거리 계산 (미터 단위)
  const calculateDistanceBetweenCoords = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 위치 업데이트 로직
  const updateLocation = useCallback(
    async (showRefreshIndicator = false, forceGeocode = false) => {
      // 중복 실행 방지
      if (isUpdatingLocationRef.current) {
        console.log("Location update already in progress, skipping...");
        return;
      }
      isUpdatingLocationRef.current = true;

      if (showRefreshIndicator) {
        setRefreshing(true);
      }
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          // Android에서 안정적인 위치 확인: lastKnownPosition 먼저 시도 후 fallback
          const location =
            (await Location.getLastKnownPositionAsync()) ??
            (await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            }));
          const coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setCurrentLocation(coords);
          setUserLocation({ lat: coords.latitude, lng: coords.longitude });

          // Android GPS 오차를 고려해 거리 기준을 50m로 완화
          const GEOCODE_DISTANCE_THRESHOLD = 50;
          let shouldGeocode =
            forceGeocode ||
            !lastGeocodedLocationRef.current ||
            calculateDistanceBetweenCoords(
              coords.latitude,
              coords.longitude,
              lastGeocodedLocationRef.current.latitude,
              lastGeocodedLocationRef.current.longitude
            ) > GEOCODE_DISTANCE_THRESHOLD;

          if (geocodeErrorRef.current && !forceGeocode) {
            shouldGeocode = false;
          }

          if (shouldGeocode && !geocodeErrorRef.current) {
            try {
              const [address] = await Location.reverseGeocodeAsync({
                latitude: coords.latitude,
                longitude: coords.longitude,
              });

              if (address) {
                let addressText = "";

                if (address.formattedAddress) {
                  const parts = address.formattedAddress.split(" ");
                  const uniqueParts: string[] = [];
                  const seen = new Set<string>();

                  for (const part of parts) {
                    const trimmedPart = part.trim();
                    if (trimmedPart && !seen.has(trimmedPart)) {
                      seen.add(trimmedPart);
                      uniqueParts.push(trimmedPart);
                    }
                  }

                  addressText = uniqueParts.join(" ");
                } else {
                  const addressParts = [
                    address.region,
                    address.city,
                    address.district,
                    address.subregion,
                    address.street,
                    address.streetNumber,
                  ].filter(Boolean);

                  const uniqueParts: string[] = [];
                  const seen = new Set<string>();

                  for (const part of addressParts) {
                    if (part && !seen.has(part)) {
                      seen.add(part);
                      uniqueParts.push(part);
                    }
                  }

                  addressText = uniqueParts.join(" ");
                }

                if (addressText.length > 20) {
                  addressText = addressText.substring(0, 20) + "...";
                }

                setLocationText(addressText || "현재위치");
                lastGeocodedLocationRef.current = coords;
                geocodeErrorRef.current = false;
              }
            } catch (geocodeError: any) {
              // Rate limit인 경우에만 차단 (Android에서의 일시적 오류는 무시)
              if (
                geocodeError?.message?.includes("rate limit") ||
                geocodeError?.message?.includes("too many requests")
              ) {
                console.warn(
                  "Geocoding rate limit exceeded. Skipping geocode for 5 minutes."
                );
                geocodeErrorRef.current = true;
                setTimeout(
                  () => {
                    geocodeErrorRef.current = false;
                  },
                  5 * 60 * 1000
                );
              } else {
                // 일반 오류는 그냥 로그만 찍고 계속 진행
                console.warn(
                  "Temporary geocode error (will retry):",
                  geocodeError?.message || geocodeError
                );
                geocodeErrorRef.current = false;
              }
            }
          }
        }
      } catch (error) {
        // 위치 권한이 없거나 위치를 가져올 수 없는 경우 조용히 처리
        // console.log('Location not available:', error);
      } finally {
        isUpdatingLocationRef.current = false;
        if (showRefreshIndicator) {
          setRefreshing(false);
        }
      }
    },
    []
  );

  const refreshLocation = useCallback(async () => {
    // 에러 플래그 리셋 후 강제 geocode
    setIsLocationRefreshing(true);
    geocodeErrorRef.current = false;
    try {
      // 타임아웃 설정 (10초)
      await Promise.race([
        updateLocation(false, true),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Location update timeout")), 10000)
        ),
      ]);
    } catch (error) {
      console.error("Location refresh error:", error);
    } finally {
      setIsLocationRefreshing(false);
    }
  }, [updateLocation]);

  useEffect(() => {
    (async () => {
      let currentSort = "위치순";
      try {
        const savedSort = await AsyncStorage.getItem("restaurantSortOption");
        if (savedSort && SORT_OPTIONS.includes(savedSort)) {
          currentSort = savedSort;
          setSortOption(savedSort);
        }
      } catch (error) {
        console.error("Failed to load sort option:", error);
      }

      await updateLocation(false);

      if (currentSort === "위치순" && !userLocation) {
        setSortOption("별점순");
        await AsyncStorage.setItem("restaurantSortOption", "별점순");
      }
    })();

    locationUpdateIntervalRef.current = setInterval(() => {
      updateLocation(false);
    }, 60 * 1000);

    return () => {
      if (locationUpdateIntervalRef.current) {
        clearInterval(locationUpdateIntervalRef.current);
      }
    };
  }, [updateLocation]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          await updateLocation(false);
        }
        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [updateLocation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // 데이터 새로고침을 먼저 실행 (더 빠른 응답성)
      await refetch();
      // 위치 업데이트는 백그라운드로 실행
      refreshLocation().catch((err) =>
        console.error("Location refresh error:", err)
      );
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshLocation, refetch]);

  const handleSearch = useCallback(() => {
    if (searchText.trim()) {
      setSearchQuery(searchText.trim());
    }
  }, [searchText]);

  const handleClearSearch = useCallback(() => {
    setSearchText("");
    setSearchQuery("");
  }, []);

  const handleFilterPress = () => {
    navigation.navigate("Filter", {
      currentFilter: {
        filterParams,
        operatingTimeFilter,
      },
      onApply: (params: RestaurantListParams) => {
        const {
          sort,
          lat,
          lng,
          is_open_only,
          day_of_week,
          time,
          ...filterOnly
        } = params;

        if (day_of_week) {
          const [hour, minute] = time
            ? time.split(":")
            : [undefined, undefined];
          setOperatingTimeFilter({
            dayOfWeek: day_of_week,
            hour,
            minute,
          });
        } else {
          setOperatingTimeFilter(null);
        }

        const hasOtherFilters =
          Object.keys(filterOnly).length > 0 &&
          Object.values(filterOnly).some((value) => {
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === "string") return value.length > 0;
            return value !== undefined && value !== null;
          });

        const hasOperatingTimeFilter = !!day_of_week;
        const hasAnyFilter = hasOtherFilters || hasOperatingTimeFilter;

        if (hasAnyFilter) {
          const newFilterParams: any = {};

          if (filterOnly.categories) {
            newFilterParams.categories = filterOnly.categories;
          }

          if (filterOnly.affiliations) {
            newFilterParams.affiliations = filterOnly.affiliations;
          }

          if (filterOnly.sub_category) {
            newFilterParams.sub_category = filterOnly.sub_category;
          }

          setFilterParams(newFilterParams);
        } else {
          setFilterParams({});
          setOperatingTimeFilter(null);
          AsyncStorage.removeItem("restaurantFilter").catch((error) => {
            console.error("Failed to remove filter from storage:", error);
          });
        }
      },
    });
  };

  const isFilterApplied = useMemo(() => {
    const hasOtherFilters = Object.keys(filterParams).some(
      (key) => key !== "sort"
    );
    const hasOperatingTimeFilter = operatingTimeFilter !== null;
    return hasOtherFilters || hasOperatingTimeFilter;
  }, [filterParams, operatingTimeFilter]);

  useEffect(() => {
    setDisplayCount(20);
  }, [filterParams, operatingTimeFilter, sortOption]);

  const sortedRestaurants = useMemo(() => {
    if (!data?.restaurants) return [];

    let restaurants = [...data.restaurants];

    if (operatingTimeFilter?.dayOfWeek) {
      if (operatingTimeFilter.hour && operatingTimeFilter.minute) {
        const filterTime = `${operatingTimeFilter.hour}:${operatingTimeFilter.minute}`;
        restaurants = restaurants.filter((restaurant) => {
          return isRestaurantOpenAt(
            restaurant.business_hours,
            operatingTimeFilter.dayOfWeek!,
            filterTime
          );
        });
      } else {
        restaurants = restaurants.filter((restaurant) => {
          return hasOperatingHoursOnDay(
            restaurant.business_hours,
            operatingTimeFilter.dayOfWeek!
          );
        });
      }
    }

    if (sortOption === "위치순" && userLocation) {
      return restaurants.sort((a, b) => {
        const aDistance =
          a.location.latitude && a.location.longitude
            ? calculateDistance(
                userLocation.lat,
                userLocation.lng,
                a.location.latitude,
                a.location.longitude
              )
            : Infinity;
        const bDistance =
          b.location.latitude && b.location.longitude
            ? calculateDistance(
                userLocation.lat,
                userLocation.lng,
                b.location.latitude,
                b.location.longitude
              )
            : Infinity;
        return aDistance - bDistance;
      });
    } else if (sortOption === "별점순") {
      return restaurants.sort((a, b) => {
        if (a.average_rating === b.average_rating) {
          return b.rating_count - a.rating_count;
        }
        return b.average_rating - a.average_rating;
      });
    } else if (sortOption === "가격순") {
      return restaurants.sort((a, b) => {
        const aPrice = a.average_price ?? null;
        const bPrice = b.average_price ?? null;
        if (aPrice === null && bPrice === null) return 0;
        if (aPrice === null) return 1;
        if (bPrice === null) return -1;
        return aPrice - bPrice;
      });
    }

    return restaurants;
  }, [data?.restaurants, sortOption, userLocation, operatingTimeFilter]);

  const displayedRestaurants = useMemo(() => {
    return sortedRestaurants.slice(0, displayCount);
  }, [sortedRestaurants, displayCount]);

  const hasMore = sortedRestaurants.length > displayCount;

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setDisplayCount((prev) => prev + 20);
    }
  }, [hasMore, isLoading]);

  // 스크롤 위치 추적 (위로가기 버튼 표시용) - scrollY 값 모니터링
  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      const shouldShow = value > 200;
      // 값이 실제로 변경될 때만 state 업데이트 (불필요한 리렌더링 방지)
      setShowScrollToTop((prev) => (prev !== shouldShow ? shouldShow : prev));
    });
    return () => {
      scrollY.removeListener(listenerId);
    };
  }, [scrollY]);

  // 위로 스크롤
  const scrollToTop = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  // FlatList 렌더 함수
  const renderRestaurantItem = useCallback(
    ({ item }: any) => {
      const distance =
        userLocation && item.location.latitude && item.location.longitude
          ? calculateDistance(
              userLocation.lat,
              userLocation.lng,
              item.location.latitude,
              item.location.longitude
            )
          : null;

      return (
        <RestaurantCard
          key={item.id}
          name={item.name}
          category={item.category}
          businessHours={item.business_hours}
          rating={item.average_rating}
          onStatusExpired={() => {}}
          restaurantId={item.id.toString()}
          thumbnailUrls={item.thumbnail_urls}
          comment={item.popular_comment?.content}
          distance={distance}
        />
      );
    },
    [userLocation]
  );

  const renderSearchItem = useCallback(({ item, index }: any) => {
    return <SearchResultCard key={`${item.type}-${index}`} item={item} />;
  }, []);

  const renderListInfoRow = useCallback(() => {
    if (isSearchMode || sortedRestaurants.length === 0) return null;

    return (
      <View className="flex-row justify-between items-center px-4 py-2 bg-white">
        {/* 식당 N개 */}
        <Text className="text-gray-600 text-sm">
          식당 {sortedRestaurants.length}개
        </Text>

        {/* 정렬 버튼 */}
        <Pressable
          ref={sortButtonRef}
          className="flex-row items-center gap-1 p-2"
          onPress={() => {
            sortButtonRef.current?.measureInWindow((x, y, width, height) => {
              setSortPopupPos({
                top: y + height, // 버튼 바로 밑
                right: 16,
              });
              setIsSortOpen(true);
            });
          }}
        >
          <Text>{sortOption}</Text>
          <Icon name="dropdown" width={10} height={13} />
        </Pressable>
      </View>
    );
  }, [isSearchMode, sortedRestaurants.length, sortOption]);

  const renderHeader = useCallback(() => {
    if (isSearchMode) {
      return null;
    }

    return (
      <>
        <AdBanner onRoulettePress={() => setShowRouletteModal(true)} />
      </>
    );
  }, [isSearchMode]);

  const renderSearchHeader = useCallback(() => {
    if (!isSearchMode || !searchData) return null;

    return (
      <View className="px-4 py-3 bg-gray-50">
        <Text className="text-sm text-gray-600">
          "{searchData.query}" 검색 결과 {searchData.total}개
          {searchData.restaurants_count > 0 &&
            ` (식당 ${searchData.restaurants_count}개`}
          {searchData.menus_count > 0 && `, 메뉴 ${searchData.menus_count}개`}
          {(searchData.restaurants_count > 0 || searchData.menus_count > 0) &&
            ")"}
        </Text>
      </View>
    );
  }, [isSearchMode, searchData]);

  const renderFooter = useCallback(() => {
    if (isSearchMode) return null;

    if (isLoading) {
      return (
        <View className="py-6 items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      );
    }

    if (hasMore) {
      return (
        <View className="items-center py-6">
          <Pressable
            onPress={handleLoadMore}
            className="bg-blue-500 px-8 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold text-base">
              더 보기 ({sortedRestaurants.length - displayCount}개 더 있음)
            </Text>
          </Pressable>
        </View>
      );
    }

    return null;
  }, [
    isSearchMode,
    isLoading,
    hasMore,
    sortedRestaurants.length,
    displayCount,
    handleLoadMore,
  ]);

  const renderEmpty = useCallback(() => {
    if (isSearchMode) {
      if (isSearching) {
        return (
          <View className="p-8 items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-500 mt-2">검색 중...</Text>
          </View>
        );
      }
      return (
        <View className="p-8 items-center">
          <Text className="text-gray-500">검색 결과가 없습니다</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 items-center justify-center py-20 px-4">
          <Icon name="warnning" width={64} height={64} color="#EF4444" />
          <Text className="text-gray-900 font-semibold text-lg mt-4 text-center">
            {(() => {
              const axiosError = error as AxiosError;
              if (
                axiosError?.code === "NETWORK_ERROR" ||
                axiosError?.message?.includes("Network") ||
                !axiosError?.response
              ) {
                return "네트워크 연결 오류";
              }
              if (axiosError?.response?.status === 500) {
                return "서버 오류가 발생했습니다";
              }
              return "데이터를 불러오는데 실패했습니다";
            })()}
          </Text>
          <Text className="text-gray-500 text-sm mt-2 text-center">
            {getSafeErrorMessage(error, "잠시 후 다시 시도해주세요")}
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="mt-6 bg-blue-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">다시 시도</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center py-20 px-4">
        <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
          <Icon name="search" width={32} height={32} color="#9CA3AF" />
        </View>
        <Text className="text-gray-400 text-lg mt-2 text-center font-medium">
          {isFilterApplied
            ? "필터 조건에 맞는 식당이 없습니다"
            : "등록된 식당이 없습니다"}
        </Text>
        <Text className="text-gray-400 text-sm mt-2 text-center">
          {isFilterApplied
            ? "다른 조건으로 검색해보세요"
            : "첫 번째 식당을 등록해보세요"}
        </Text>
        {isFilterApplied && (
          <Pressable
            onPress={handleFilterPress}
            className="mt-6 bg-gray-100 px-6 py-3 rounded-lg"
          >
            <Text className="text-gray-700 font-semibold">필터 수정하기</Text>
          </Pressable>
        )}
      </View>
    );
  }, [isSearchMode, isSearching, error, isFilterApplied, refetch]);

  const listData = isSearchMode
    ? searchData?.results || []
    : displayedRestaurants;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      {/* 위치 헤더 - 스크롤 시 사라지는 애니메이션 */}
      <Animated.View
        className="w-full px-5 py-1 bg-white"
        style={{
          opacity: scrollY.interpolate({
            inputRange: [0, STICKY_THRESHOLD],
            outputRange: [1, 0],
            extrapolate: "clamp",
          }),
          height: scrollY.interpolate({
            inputRange: [0, STICKY_THRESHOLD],
            outputRange: [40, 0],
            extrapolate: "clamp",
          }),
        }}
      >
        <View className="w-full flex-row justify-between items-center h-full">
          <Pressable
            className="flex-row items-center justify-center h-full gap-2"
            onPress={refreshLocation}
            disabled={isLocationRefreshing}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isLocationRefreshing ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <>
                <Text
                  className="text-md font-semibold text-neutral-900"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {locationText.length > 40
                    ? `${locationText.substring(0, 40)}...`
                    : locationText}
                </Text>
                <Icon name="dropdown" width={10} height={13} />
              </>
            )}
          </Pressable>
          <Pressable
            onPress={handleFilterPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name={isFilterApplied ? "filterSelected" : "filter"} />
          </Pressable>
        </View>
      </Animated.View>

      {/* 검색 바 - Sticky */}
      <View className="w-full px-5 py-2 bg-white border-b border-b-gray-100">
        <View className="w-full rounded-full flex-row justify-between items-center px-4 py-2 bg-gray-100">
          <TextInput
            placeholder="찾아라! 에리카의 맛집"
            className="flex-1 text-base"
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            style={{ lineHeight: 16, paddingVertical: 8, paddingHorizontal: 4 }}
            editable={true}
          />
          {searchText.length > 0 ? (
            <Pressable
              onPress={handleClearSearch}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Icon name="cancel" size={15} color="#9CA3AF" />
            </Pressable>
          ) : (
            <Pressable
              onPress={handleSearch}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Icon name="search" width={35} />
            </Pressable>
          )}
        </View>
      </View>

      {/* FlatList - 메인 콘텐츠 */}
      <FlatList
        ref={flatListRef}
        data={listData as any}
        renderItem={isSearchMode ? renderSearchItem : renderRestaurantItem}
        keyExtractor={(item: any, index) =>
          isSearchMode ? `search-${index}` : `restaurant-${item.id}`
        }
        ListHeaderComponent={
          <>
            {renderSearchHeader()}
            {renderHeader()}
            {renderListInfoRow()}
          </>
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
            colors={["#3B82F6"]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        className="flex-1 bg-[rgba(248, 250, 252, 1)]"
      />

      {/* 위로가기 버튼 */}
      {showScrollToTop && (
        <Pressable
          onPress={scrollToTop}
          className="absolute bottom-6 right-6 w-10 h-10 bg-white rounded-full items-center justify-center shadow-lg"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Icon name="upAngle" width={20} height={20} color="#FFFFFF" />
        </Pressable>
      )}

      {/* 정렬 모달 - Modal로 완전 분리하여 Android 레이어링 문제 해결 */}
      <Modal
        transparent
        animationType="fade"
        visible={isSortOpen}
        onRequestClose={() => setIsSortOpen(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)" }}
          onPress={() => setIsSortOpen(false)}
        >
          <View
            style={{
              position: "absolute",
              top: sortPopupPos.top,
              right: sortPopupPos.right,
              backgroundColor: "white",
              borderRadius: 12,
              elevation: 10,
              shadowColor: "#000",
              minWidth: 100,
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <Pressable
                key={option}
                onPress={async () => {
                  setSortOption(option);
                  setIsSortOpen(false);

                  try {
                    await AsyncStorage.setItem("restaurantSortOption", option);
                  } catch (error) {
                    console.error("Failed to save sort option:", error);
                  }

                  if (option === "위치순") {
                    let coords = userLocation;
                    if (!coords) {
                      const { status } =
                        await Location.requestForegroundPermissionsAsync();
                      if (status === "granted") {
                        const location = await Location.getCurrentPositionAsync(
                          {}
                        );
                        coords = {
                          lat: location.coords.latitude,
                          lng: location.coords.longitude,
                        };
                        setUserLocation(coords);
                      }
                    }
                    if (!coords) {
                      Alert.alert(
                        "위치 권한 필요",
                        "위치순 정렬을 사용하려면 위치 권한이 필요합니다."
                      );
                      setSortOption("별점순");
                      await AsyncStorage.setItem(
                        "restaurantSortOption",
                        "별점순"
                      );
                    }
                  }
                }}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#F1F5F9",
                }}
              >
                <Text
                  style={{
                    fontWeight: sortOption === option ? "700" : "400",
                    color: sortOption === option ? "#2563EB" : "#000",
                  }}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* 룰렛 모달 */}
      <RouletteModal
        visible={showRouletteModal}
        onClose={() => setShowRouletteModal(false)}
      />
    </SafeAreaView>
  );
}
