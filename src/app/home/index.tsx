import { Button } from "@/components/Button"
import { storage } from "@/services/storage"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import MapView from "react-native-maps"
import { SafeAreaView } from "react-native-safe-area-context"

const HEADER_BG = "#F2F1FA"
const SEARCH_BG = "#E8E4F0"
const PRIMARY = "#15104D"

const REGIAO_INICIAL = {
    latitude: -23.5505,
    longitude: -46.6333,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
}

export default function MapaScreen() {
    const router = useRouter()
    const [search, setSearch] = useState("")
    const [isAnonymous, setIsAnonymous] = useState(false)
    const canGoBack = router.canGoBack?.() ?? false

    useEffect(() => {
        let mounted = true
        storage.getUser().then((user: unknown) => {
            if (mounted) {
                setIsAnonymous(Boolean((user as { anonimo?: boolean })?.anonimo))
            }
        })
        return () => {
            mounted = false
        }
    }, [])

    const handleLogout = async () => {
        await storage.clear()
        router.replace("/login")
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <View style={styles.searchRow}>
                    <View style={styles.searchWrapper}>
                        <Ionicons
                            name="search"
                            size={20}
                            color="#9E9E9E"
                            style={styles.searchIcon}
                        />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search"
                            placeholderTextColor="#9E9E9E"
                            value={search}
                            onChangeText={setSearch}
                            returnKeyType="search"
                        />
                    </View>
                    {canGoBack && (
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => router.back()}
                            activeOpacity={0.8}
                            accessibilityLabel="Voltar"
                        >
                            <Ionicons name="arrow-back" size={22} color={PRIMARY} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={handleLogout}
                        activeOpacity={0.8}
                        accessibilityLabel="Sair"
                    >
                        <Ionicons name="log-out-outline" size={22} color={PRIMARY} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.mapContainer}>
                {Platform.OS === "web" ? (
                    <View style={styles.mapPlaceholder}>
                        <Ionicons name="map-outline" size={64} color="#9E9E9E" />
                        <Text style={styles.mapPlaceholderText}>
                            Mapa disponível no app (iOS/Android)
                        </Text>
                    </View>
                ) : (
                    <MapView
                        style={styles.map}
                        initialRegion={REGIAO_INICIAL}
                        showsUserLocation
                        showsMyLocationButton
                    />
                )}
            </View>

            {!isAnonymous && (
                <View style={styles.footer}>
                    <Button
                        label="Procurar ONGs"
                        onPress={() => {
                            // TODO: navegar para busca de ONGs ou filtrar no mapa
                        }}
                    />
                </View>
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: HEADER_BG,
    },
    header: {
        backgroundColor: HEADER_BG,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    searchWrapper: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: SEARCH_BG,
        borderRadius: 12,
        paddingHorizontal: 12,
        minHeight: 44,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#000",
        paddingVertical: 10,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: SEARCH_BG,
        alignItems: "center",
        justifyContent: "center",
    },
    mapContainer: {
        flex: 1,
        marginHorizontal: 0,
    },
    map: {
        width: "100%",
        height: "100%",
    },
    mapPlaceholder: {
        flex: 1,
        backgroundColor: "#D9D9D9",
        alignItems: "center",
        justifyContent: "center",
    },
    mapPlaceholderText: {
        marginTop: 12,
        fontSize: 14,
        color: "#6B6B6B",
    },
    footer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        paddingBottom: 24,
        backgroundColor: HEADER_BG,
    },
})
