import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/Button";
import { ErrorState } from "@/components/ErrorState";
import { IconButton } from "@/components/IconButton";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { StarRating } from "@/components/review/StarRating";
import { useFavorite } from "@/hooks/useFavorite";
import { useListing } from "@/hooks/useListing";
import { useMe } from "@/hooks/useMe";
import { errorMessage } from "@/lib/errors";
import { useAuthStore } from "@/stores/authStore";
import {
  formatPrice,
  getAddressLine,
  getFacts,
  getImages,
  getOwnerName,
  getTypeLabel,
  isVerified,
} from "@/utils/listing";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useListingConversation } from "@/hooks/useChat";

const HERO_HEIGHT = 300;
const UNAVAILABLE_TEXT: Record<string, string> = {
  SOLD: "This property has been sold.",
  RENTED: "This property has been rented.",
};

const Property = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const { data: listing, isLoading, error, refetch } = useListing(id);
  const { data: me } = useMe();
  const status = useAuthStore((s) => s.status);
  const favorite = useFavorite(id);
  const [imageIndex, setImageIndex] = useState(0);

  const { data: conversationId } = useListingConversation(
    id,
    status === "authenticated" && !!listing && me?.id !== listing.ownerId,
  );

  const goBack = () =>
    router.canGoBack() ? router.back() : router.replace("/");

  if (isLoading)
    return (
      <View className="flex-1 bg-accent-100">
        <BackButton onGoBack={goBack} insets={insets} />
        <LoadingOverlay />
      </View>
    );
  if (error || !listing) {
    return (
      <View className="flex-1 bg-accent-100">
        <BackButton onGoBack={goBack} insets={insets} />
        <ErrorState
          message={errorMessage(error, "Could not load this listing.")}
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  const images = getImages(listing);
  const facts = getFacts(listing);
  const address = getAddressLine(listing);
  const isRent = listing.listingType === "RENT";
  const isOwner = me?.id === listing.ownerId;
  const unavailable = listing.status !== "PUBLISHED";
  const isFavorited = listing.isFavoritedByViewer;

  const showMessage = !isOwner && (!unavailable || !!conversationId); // an existing chat stays reachable after a sale

  const ctaLabel = isOwner
    ? "This is your listing"
    : unavailable
      ? "No longer available"
      : isRent
        ? "Rent this place"
        : "Buy this place";

  const openChat = () => {
    if (status !== "authenticated") return router.push("/auth-screen");
    if (conversationId)
      router.push({ pathname: "/chat/[id]", params: { id: conversationId } });
    else
      router.push({ pathname: "/chat/new", params: { listingId: listing.id } });
  };

  const handleCta = () => {
    if (status !== "authenticated") return router.push("/auth-screen");
    router.push(`/offer/${listing.id}`);
  };

  return (
    <View className="flex-1 bg-accent-100">
      <BackButton onGoBack={goBack} insets={insets} />
      <View className="absolute right-5 z-10" style={{ top: insets.top + 8 }}>
        <IconButton
          onPress={() => favorite.toggle(isFavorited)}
          className="bg-white/90"
        >
          <Ionicons
            name={isFavorited ? "heart" : "heart-outline"}
            size={22}
            color={isFavorited ? "#F75555" : "#191d31"}
          />
        </IconButton>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {images.length > 0 ? (
          <View className="bg-blue-600">
            <FlatList
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(url) => url}
              onMomentumScrollEnd={(e) =>
                setImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))
              }
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={{ width, height: HERO_HEIGHT }}
                  resizeMode="cover"
                />
              )}
            />
            {images.length > 1 && (
              <View className="absolute bottom-3 right-4 rounded-full bg-black-300/70 px-3 py-1">
                <Text className="font-rubik-medium text-xs text-white">
                  {imageIndex + 1} / {images.length}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View
            style={{ height: HERO_HEIGHT }}
            className="items-center justify-center bg-primary-100"
          >
            <Ionicons name="image-outline" size={40} color="#8C8E98" />
          </View>
        )}
        <View className="gap-5 px-5 pt-5">
          {unavailable && (
            <View className="rounded-xl bg-danger/10 px-4 py-3">
              <Text className="font-rubik-medium text-sm text-danger">
                {UNAVAILABLE_TEXT[listing.status] ??
                  "This listing is no longer available."}
              </Text>
            </View>
          )}

          <View className="gap-2">
            <View className="flex-row flex-wrap items-center gap-2">
              <View className="rounded-full bg-primary-100 px-3 py-1">
                <Text className="font-rubik-medium text-xs text-primary-300">
                  {isRent ? "For rent" : "For sale"} · {getTypeLabel(listing)}
                </Text>
              </View>
              {isVerified(listing) && (
                <View className="flex-row items-center gap-1 rounded-full bg-primary-100 px-3 py-1">
                  <Ionicons name="shield-checkmark" size={12} color="#0061FF" />
                  <Text className="font-rubik-medium text-xs text-primary-300">
                    Verified
                  </Text>
                </View>
              )}
            </View>
            <Text className="font-rubik-bold text-2xl text-black-300">
              {listing.title}
            </Text>

            {!!address && (
              <View className="flex-row items-center gap-1">
                <Ionicons name="location-outline" size={16} color="#8C8E98" />
                <Text className="flex-1 font-rubik text-sm text-black-200">
                  {address}
                </Text>
              </View>
            )}

            <Text className="font-rubik-bold text-2xl text-primary-300">
              {formatPrice(Number(listing.price))}
              {isRent && (
                <Text className="font-rubik text-base text-black-200">
                  {" "}
                  / month
                </Text>
              )}
            </Text>
          </View>

          {facts.length > 0 && (
            <View className="flex-row flex-wrap gap-3">
              {facts.map((f) => (
                <View
                  key={f.label}
                  className="min-w-[30%] flex-1 rounded-xl bg-white px-3 py-3"
                >
                  <Text className="font-rubik text-xs text-black-100">
                    {f.label}
                  </Text>
                  <Text className="mt-1 font-rubik-semibold text-base text-black-300">
                    {f.value}
                  </Text>
                </View>
              ))}
            </View>
          )}
          {!!listing.description && (
            <View className="gap-2">
              <Text className="font-rubik-semibold text-lg text-black-300">
                About this place
              </Text>
              <Text className="font-rubik text-base leading-6 text-black-200">
                {listing.description}
              </Text>
            </View>
          )}
          <View className="flex-row items-center justify-between rounded-xl bg-white px-4 py-3">
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/reviews/[userId]",
                  params: { userId: listing.owner.id },
                })
              }
              className="flex-row items-center justify-between rounded-xl bg-white px-4 py-3"
            >
              <View className="gap-0.5">
                <Text className="font-rubik text-xs text-black-100">
                  Listed by
                </Text>
                <Text className="font-rubik-medium text-base text-black-300">
                  {getOwnerName(listing)}
                </Text>
                {listing.owner.rating.count > 0 ? (
                  <View className="flex-row items-center gap-1.5">
                    <StarRating
                      value={listing.owner.rating.average ?? 0}
                      size={14}
                    />
                    <Text className="font-rubik text-xs text-black-200">
                      {listing.owner.rating.average?.toFixed(1)} (
                      {listing.owner.rating.count})
                    </Text>
                  </View>
                ) : (
                  <Text className="font-rubik text-xs text-black-200">
                    No reviews yet
                  </Text>
                )}
              </View>
              <View className="flex-row items-center gap-3">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="heart" size={14} color="#F75555" />
                  <Text className="font-rubik text-sm text-black-200">
                    {listing.favoriteCount}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#8C8E98" />
              </View>
            </Pressable>
            <View className="flex-row items-center gap-1">
              <Ionicons name="heart" size={14} color="#F75555" />
              <Text className="font-rubik text-sm text-black-200">
                {listing.favoriteCount}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        className="flex-row gap-3 border-t border-primary-200 bg-white px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        {showMessage && (
          <Button
            label={conversationId ? "Open chat" : "Message"}
            onPress={openChat}
            icon={
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={18}
                color="#0061FF"
              />
            }
            className="flex-1 rounded-full border border-primary-300 py-4"
            textClassName="font-rubik-semibold text-primary-300"
          />
        )}
        <Button
          label={ctaLabel}
          onPress={handleCta}
          disabled={isOwner || unavailable}
          className="flex-[1.6] rounded-full bg-primary-300 py-4"
          textClassName="font-rubik-semibold text-white"
        />
      </View>
    </View>
  );
};

export default Property;
